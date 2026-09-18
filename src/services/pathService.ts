/**
 * Deterministic Path Search and Evidentiary Path Confidence Service
 * 
 * LAW-ENFORCEMENT METHODOLOGY RULE:
 * 1. Path search uses deterministic unweighted BFS graph traversal.
 * 2. Path confidence measures strictly the EVIDENCE SUPPORTING THE GRAPH PATH.
 * 3. NEVER reflects guilt, criminality, or suspect probability.
 * 4. Missing temporal data is reported explicitly as "Not available from case data."
 */

import { 
  Entity, 
  Relationship, 
  CaseDocument, 
  PathHop, 
  PathConfidenceBreakdown, 
  ExplainConnectionResult,
  EvidenceItem 
} from '../types';

interface AdjacencyEdge {
  neighborId: string;
  relationship: Relationship;
  direction: 'FORWARD' | 'REVERSE';
}

/**
 * Finds the shortest path between two entities using deterministic BFS.
 * Traversal treats the investigative graph as bidirectionally navigable,
 * allowing discovery of indirect connections (e.g. Person -> Phone -> Person -> Vehicle -> Person).
 */
export function findConnectionPath(
  sourceEntityId: string,
  targetEntityId: string,
  entities: Entity[],
  relationships: Relationship[],
  documents: CaseDocument[]
): ExplainConnectionResult {
  const entityMap = new Map<string, Entity>();
  entities.forEach(e => entityMap.set(e.id, e));

  const sourceEntity = entityMap.get(sourceEntityId);
  const targetEntity = entityMap.get(targetEntityId);

  if (!sourceEntity || !targetEntity) {
    return {
      found: false,
      hops: [],
      pathEntities: [],
      pathRelationships: [],
      message: 'One or both requested entities do not exist in the current case data.'
    };
  }

  if (sourceEntityId === targetEntityId) {
    return {
      found: true,
      sourceEntity,
      targetEntity,
      hops: [],
      pathEntities: [sourceEntity],
      pathRelationships: [],
      message: 'Source and target are the identical entity.'
    };
  }

  // Build adjacency list with deterministic edge ordering
  const adj = new Map<string, AdjacencyEdge[]>();
  entities.forEach(e => adj.set(e.id, []));

  relationships.forEach(rel => {
    if (!adj.has(rel.sourceId)) adj.set(rel.sourceId, []);
    if (!adj.has(rel.targetId)) adj.set(rel.targetId, []);

    adj.get(rel.sourceId)!.push({
      neighborId: rel.targetId,
      relationship: rel,
      direction: 'FORWARD'
    });

    adj.get(rel.targetId)!.push({
      neighborId: rel.sourceId,
      relationship: rel,
      direction: 'REVERSE'
    });
  });

  // Sort neighbors deterministically by target ID and relationship ID
  adj.forEach(edges => {
    edges.sort((a, b) => {
      const cmp = a.neighborId.localeCompare(b.neighborId);
      if (cmp !== 0) return cmp;
      return a.relationship.id.localeCompare(b.relationship.id);
    });
  });

  // BFS Queue: [currentEntityId, pathOfEdges]
  const queue: Array<[string, AdjacencyEdge[]]> = [[sourceEntityId, []]];
  const visited = new Set<string>([sourceEntityId]);

  let foundEdges: AdjacencyEdge[] | null = null;

  while (queue.length > 0) {
    const [currentId, path] = queue.shift()!;

    if (currentId === targetEntityId) {
      foundEdges = path;
      break;
    }

    const neighbors = adj.get(currentId) || [];
    for (const edge of neighbors) {
      if (!visited.has(edge.neighborId)) {
        visited.add(edge.neighborId);
        queue.push([edge.neighborId, [...path, edge]]);
      }
    }
  }

  if (!foundEdges) {
    return {
      found: false,
      sourceEntity,
      targetEntity,
      hops: [],
      pathEntities: [],
      pathRelationships: [],
      message: 'NO SUPPORTED CONNECTION FOUND IN THIS CASE DATA.'
    };
  }

  // Construct structured path hops with full provenance
  const docMap = new Map<string, CaseDocument>();
  documents.forEach(d => docMap.set(d.id, d));

  let prevNodeId = sourceEntityId;
  const hops: PathHop[] = [];
  const pathEntities: Entity[] = [sourceEntity];
  const pathRelationships: Relationship[] = [];

  foundEdges.forEach((edge, index) => {
    const fromEnt = entityMap.get(prevNodeId)!;
    const toEnt = entityMap.get(edge.neighborId)!;
    pathEntities.push(toEnt);
    pathRelationships.push(edge.relationship);

    const evidence: EvidenceItem[] = edge.relationship.evidence || [];
    const evidenceDates = Array.from(
      new Set(evidence.map(e => e.date).filter(Boolean) as string[])
    ).sort();

    const uniqueDocIds = Array.from(new Set(evidence.map(e => e.documentId)));
    const hopDocs = uniqueDocIds.map(docId => {
      const doc = docMap.get(docId);
      return {
        id: docId,
        title: doc?.title || docId,
        type: doc?.type || 'DOCUMENT'
      };
    });

    hops.push({
      hopIndex: index + 1,
      fromEntity: fromEnt,
      toEntity: toEnt,
      relationship: edge.relationship,
      direction: edge.direction,
      supportingEvidenceCount: evidence.length,
      supportingDocumentCount: uniqueDocIds.length,
      evidenceDates,
      evidence,
      documents: hopDocs
    });

    prevNodeId = edge.neighborId;
  });

  const confidence = calculatePathConfidence(hops);

  return {
    found: true,
    sourceEntity,
    targetEntity,
    hops,
    pathEntities,
    pathRelationships,
    confidence
  };
}

/**
 * Calculates a transparent, deterministic Path Confidence score.
 * Reflects evidentiary corroboration, path length attenuation, and temporal support.
 * Does NOT reflect guilt, criminality, or suspect probability.
 */
export function calculatePathConfidence(hops: PathHop[]): PathConfidenceBreakdown {
  const hopCount = hops.length;
  if (hopCount === 0) {
    return {
      scorePercentage: 100,
      label: 'Confidence in evidentiary support for this graph path.',
      factors: {
        evidenceCoverage: {
          totalSupportingEvidence: 0,
          averagePerHop: 0,
          description: 'Direct identical entity link.'
        },
        temporalSupport: {
          datedRecordsCount: 0,
          missingTemporalHops: 0,
          hasTemporalData: false,
          description: 'Not applicable for identity match.'
        },
        pathLength: {
          hopCount: 0,
          description: '0 hops (identity).'
        },
        evidenceRecency: {
          hasRecencyData: false,
          description: 'Not applicable for identity match.'
        }
      },
      formulaDescription: 'Direct identity evaluation.',
      disclaimer: 'AI outputs require investigator validation and are not determinations of guilt.'
    };
  }

  // 1. Evidence Coverage Factor
  let totalEvidence = 0;
  let datedEvidenceCount = 0;
  let datedHopsCount = 0;
  const allDates: string[] = [];

  hops.forEach(h => {
    totalEvidence += h.supportingEvidenceCount;
    if (h.evidenceDates.length > 0) {
      datedHopsCount++;
      datedEvidenceCount += h.evidenceDates.length;
      allDates.push(...h.evidenceDates);
    }
  });

  const averagePerHop = parseFloat((totalEvidence / hopCount).toFixed(2));
  // Coverage score: 1 ev/hop => 0.65, 2 ev/hop => 0.80, 3+ ev/hop => 0.95
  const coverageScore = Math.min(1.0, 0.50 + 0.15 * Math.min(3, averagePerHop));

  // 2. Path Length Factor (attenuation across indirect transitive links)
  // 1 hop: 1.0; 2 hops: 0.93; 3 hops: 0.86; 4 hops: 0.79
  const lengthScore = Math.max(0.50, 1.0 - 0.07 * (hopCount - 1));

  // 3. Temporal Support Factor
  const hasTemporalData = allDates.length > 0;
  const missingTemporalHops = hopCount - datedHopsCount;

  let temporalScore = 0.5;
  let temporalDesc = 'Not available from case data.';
  let recencyDesc = 'Not available from case data.';
  let mostRecentDate: string | undefined = undefined;

  if (hasTemporalData) {
    allDates.sort();
    mostRecentDate = allDates[allDates.length - 1];
    const temporalRatio = datedHopsCount / hopCount;
    temporalScore = 0.60 + 0.40 * temporalRatio;
    temporalDesc = `${datedEvidenceCount} dated record(s) across ${datedHopsCount}/${hopCount} hops.`;
    recencyDesc = `Latest corroborating evidence recorded on ${mostRecentDate}.`;
  }

  // Weighted calculation
  let rawScore: number;
  if (hasTemporalData) {
    rawScore = (coverageScore * 0.50 + lengthScore * 0.30 + temporalScore * 0.20) * 100;
  } else {
    // Rebalance weights when temporal data is not available in the case
    rawScore = (coverageScore * 0.60 + lengthScore * 0.40) * 100;
  }

  const scorePercentage = Math.round(Math.min(99, Math.max(25, rawScore)));

  return {
    scorePercentage,
    label: 'Confidence in evidentiary support for this graph path.',
    factors: {
      evidenceCoverage: {
        totalSupportingEvidence: totalEvidence,
        averagePerHop,
        description: `${totalEvidence} supporting record(s) across ${hopCount} relationship hop(s) (avg ${averagePerHop}/hop).`
      },
      temporalSupport: {
        datedRecordsCount: datedEvidenceCount,
        missingTemporalHops,
        hasTemporalData,
        description: hasTemporalData 
          ? temporalDesc 
          : 'Not available from case data.'
      },
      pathLength: {
        hopCount,
        description: `${hopCount} relationship hop(s) in shortest path traversal.`
      },
      evidenceRecency: {
        mostRecentDate,
        hasRecencyData: hasTemporalData,
        description: hasTemporalData 
          ? recencyDesc 
          : 'Not available from case data.'
      }
    },
    formulaDescription: hasTemporalData
      ? 'Weighted formula: 50% Evidence Coverage + 30% Path Length Attenuation + 20% Temporal Support.'
      : 'Weighted formula: 60% Evidence Coverage + 40% Path Length Attenuation (Temporal data not available).',
    disclaimer: 'Confidence reflects graph path evidentiary grounding only. It is not an indicator of guilt or criminality.'
  };
}
