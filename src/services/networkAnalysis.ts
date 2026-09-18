import Graph from 'graphology';
import betweenness from 'graphology-metrics/centrality/betweenness';
import louvain from 'graphology-communities-louvain';
import { 
  Entity, 
  Relationship, 
  NodeXRayMetrics, 
  CommunityCluster, 
  NetworkXRayReport, 
  EntityType 
} from '../types';

export interface NetworkAnalysisConfig {
  minimumBridgeDegree: number;
  influencerDegreeThreshold: number;
  influencerBetweennessThreshold: number;
  influencerPercentileThreshold: number;
  isolatedDegreeThreshold: number;
}

export const DEFAULT_NETWORK_ANALYSIS_CONFIG: NetworkAnalysisConfig = {
  minimumBridgeDegree: 2,
  influencerDegreeThreshold: 3,
  influencerBetweennessThreshold: 0.12,
  influencerPercentileThreshold: 85,
  isolatedDegreeThreshold: 0,
};

const CLUSTER_PALETTE = [
  '#06b6d4', // Cyan
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#38bdf8', // Sky
  '#eab308', // Yellow
  '#f97316', // Orange
  '#14b8a6', // Teal
  '#a855f7', // Purple
];

/**
 * Calculates betweenness centrality percentiles across all nodes in the graph
 */
function calculatePercentiles(values: number[]): number[] {
  const n = values.length;
  if (n === 0) return [];
  if (n === 1) return [100];

  const sorted = [...values].sort((a, b) => a - b);
  return values.map(val => {
    // Count how many values are <= val
    let count = 0;
    for (let i = 0; i < n; i++) {
      if (sorted[i] <= val) count++;
    }
    return Math.round((count / n) * 100);
  });
}

/**
 * Executes dynamic, graph-algorithmic analysis using Graphology, Louvain community detection,
 * and Betweenness Centrality.
 * 
 * LAW-ENFORCEMENT INTEGRITY RULE:
 * All findings are strictly classified as "Network Importance" (NEVER criminality/guilt score).
 * Every metric is strictly calculated from the current case data without hardcoded entity names/IDs.
 */
export function analyzeNetworkXRay(
  entities: Entity[],
  relationships: Relationship[],
  config: NetworkAnalysisConfig = DEFAULT_NETWORK_ANALYSIS_CONFIG
): NetworkXRayReport {
  if (entities.length === 0) {
    return {
      metricsByNodeId: {},
      influencers: [],
      bridges: [],
      clusters: [],
      isolatedEntities: [],
      graphDensity: 0,
      totalNodes: 0,
      totalEdges: 0,
    };
  }

  // 1. Construct Undirected Graphology Graph
  const graph = new Graph({ type: 'undirected', allowSelfLoops: false });

  // Add all entities as nodes
  entities.forEach(ent => {
    if (!graph.hasNode(ent.id)) {
      graph.addNode(ent.id, {
        label: ent.label,
        type: ent.type,
      });
    }
  });

  // Add relationships as edges
  relationships.forEach(rel => {
    if (
      rel.sourceId !== rel.targetId &&
      graph.hasNode(rel.sourceId) &&
      graph.hasNode(rel.targetId)
    ) {
      if (!graph.hasEdge(rel.sourceId, rel.targetId)) {
        graph.addEdge(rel.sourceId, rel.targetId, {
          id: rel.id,
          type: rel.type,
        });
      }
    }
  });

  // 2. Compute Louvain Communities dynamically
  let communityMap: Record<string, number> = {};
  try {
    communityMap = louvain(graph) || {};
  } catch (err) {
    console.warn('Louvain community clustering fallback:', err);
    // Deterministic fallback: assign nodes by connected components
    let currentComm = 0;
    const visited = new Set<string>();
    entities.forEach(e => {
      if (!visited.has(e.id)) {
        const queue = [e.id];
        visited.add(e.id);
        while (queue.length > 0) {
          const curr = queue.shift()!;
          communityMap[curr] = currentComm;
          if (graph.hasNode(curr)) {
            graph.forEachNeighbor(curr, nbr => {
              if (!visited.has(nbr)) {
                visited.add(nbr);
                queue.push(nbr);
              }
            });
          }
        }
        currentComm++;
      }
    });
  }

  // 3. Compute Betweenness Centrality
  let betweennessScores: Record<string, number> = {};
  try {
    betweennessScores = betweenness(graph, { normalized: true }) || {};
  } catch (err) {
    console.warn('Betweenness centrality calculation fallback:', err);
    entities.forEach(e => {
      betweennessScores[e.id] = 0;
    });
  }

  // 4. Calculate betweenness percentiles
  const entityIds = entities.map(e => e.id);
  const rawBetweennessValues = entityIds.map(id => betweennessScores[id] || 0);
  const percentileValues = calculatePercentiles(rawBetweennessValues);
  const betweennessPercentiles: Record<string, number> = {};
  entityIds.forEach((id, idx) => {
    betweennessPercentiles[id] = percentileValues[idx];
  });

  // 5. Structure community groups
  const communityGroups: Record<number, string[]> = {};
  entities.forEach(ent => {
    const commId = communityMap[ent.id] !== undefined ? communityMap[ent.id] : 0;
    if (!communityGroups[commId]) {
      communityGroups[commId] = [];
    }
    communityGroups[commId].push(ent.id);
  });

  // 6. Build node metrics with objective mathematical explanations
  const metricsByNodeId: Record<string, NodeXRayMetrics> = {};

  entities.forEach(ent => {
    const commId = communityMap[ent.id] !== undefined ? communityMap[ent.id] : 0;
    const deg = graph.hasNode(ent.id) ? graph.degree(ent.id) : 0;
    const btw = betweennessScores[ent.id] || 0;
    const btwPercentile = betweennessPercentiles[ent.id] || 0;

    // Count distinct communities connected
    const connectedCommSet = new Set<number>();
    connectedCommSet.add(commId);
    if (graph.hasNode(ent.id)) {
      graph.forEachNeighbor(ent.id, nbrId => {
        const nbrComm = communityMap[nbrId];
        if (nbrComm !== undefined) {
          connectedCommSet.add(nbrComm);
        }
      });
    }
    const communitiesConnected = connectedCommSet.size;

    // Count documents entity appears in
    const docsAppearedIn = new Set((ent.evidence || []).map(ev => ev.documentId)).size;

    // Configurable classifications:
    // Bridge: connects 2 or more distinct communities with degree >= minimumBridgeDegree
    const isBridge = communitiesConnected > 1 && deg >= config.minimumBridgeDegree;
    // Influencer: degree >= influencerDegreeThreshold or betweenness >= influencerBetweennessThreshold or percentile >= influencerPercentileThreshold
    const isInfluencer = deg >= config.influencerDegreeThreshold || btw >= config.influencerBetweennessThreshold || btwPercentile >= config.influencerPercentileThreshold;
    // Isolated: degree <= isolatedDegreeThreshold
    const isIsolated = deg <= config.isolatedDegreeThreshold;

    // Structured, strictly objective Network Importance explanation matching legal mandate
    const importanceReasons: string[] = [
      `Degree = ${deg}`,
      `Betweenness percentile = ${btwPercentile}`,
      `Connected communities = ${communitiesConnected}`,
      `Document frequency = ${docsAppearedIn}`
    ];

    metricsByNodeId[ent.id] = {
      id: ent.id,
      label: ent.label,
      type: ent.type,
      degree: deg,
      betweenness: btw,
      betweennessPercentile: btwPercentile,
      communitiesConnected,
      documentsAppearedIn: docsAppearedIn,
      communityId: commId,
      communityName: `Cluster ${commId + 1}`,
      isBridge,
      isInfluencer,
      isIsolated,
      networkImportanceReasons: importanceReasons,
    };
  });

  // 7. Structure Communities dynamically (Cluster 1, Cluster 2, etc.)
  const clusters: CommunityCluster[] = Object.keys(communityGroups)
    .sort((a, b) => Number(a) - Number(b))
    .map(key => {
      const cId = Number(key);
      const memberIds = communityGroups[cId];
      const memberSet = new Set(memberIds);
      const memberEntities = entities.filter(e => memberSet.has(e.id));

      // Internal vs External relationships count
      let internalCount = 0;
      let externalCount = 0;

      relationships.forEach(rel => {
        const srcIn = memberSet.has(rel.sourceId);
        const tgtIn = memberSet.has(rel.targetId);
        if (srcIn && tgtIn) {
          internalCount++;
        } else if (srcIn || tgtIn) {
          externalCount++;
        }
      });

      // Dominant entity type in cluster
      const typeCounts: Record<string, number> = {};
      memberEntities.forEach(e => {
        typeCounts[e.type] = (typeCounts[e.type] || 0) + 1;
      });
      let domType: EntityType = 'PERSON';
      let maxCount = 0;
      Object.entries(typeCounts).forEach(([t, count]) => {
        if (count > maxCount) {
          maxCount = count;
          domType = t as EntityType;
        }
      });

      // Bridge entities in this cluster
      const bridgeEntityIds = memberIds.filter(id => metricsByNodeId[id]?.isBridge);

      return {
        id: cId,
        name: `Cluster ${cId + 1}`,
        color: CLUSTER_PALETTE[cId % CLUSTER_PALETTE.length],
        nodeIds: memberIds,
        dominantType: domType,
        summary: `${memberIds.length} entities • ${internalCount} internal & ${externalCount} external links • ${bridgeEntityIds.length} bridge nodes`,
        internalRelationshipsCount: internalCount,
        externalRelationshipsCount: externalCount,
        bridgeEntityIds,
      };
    });

  // 8. Filter and rank influencers, bridges, and isolated nodes
  const influencers = Object.values(metricsByNodeId)
    .filter(m => m.isInfluencer)
    .sort((a, b) => b.degree - a.degree || b.betweenness - a.betweenness);

  const bridges = Object.values(metricsByNodeId)
    .filter(m => m.isBridge)
    .sort((a, b) => b.betweenness - a.betweenness || b.degree - a.degree);

  const isolatedEntities = Object.values(metricsByNodeId)
    .filter(m => m.isIsolated)
    .sort((a, b) => a.label.localeCompare(b.label));

  const totalNodes = graph.order;
  const totalEdges = graph.size;
  const possibleEdges = totalNodes > 1 ? (totalNodes * (totalNodes - 1)) / 2 : 1;
  const graphDensity = Math.round((totalEdges / possibleEdges) * 1000) / 1000;

  return {
    metricsByNodeId,
    influencers,
    bridges,
    clusters,
    isolatedEntities,
    graphDensity,
    totalNodes,
    totalEdges,
  };
}
