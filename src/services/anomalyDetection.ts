import { 
  Entity, 
  Relationship, 
  AnomalyFinding, 
  AnomalyDetectorType, 
  EvidenceItem 
} from '../types';
import { normalizeDate } from './timelineService';
import { generateAnomalyId } from './idService';

export interface AnomalyEngineConfig {
  interactionSpike: {
    minBaselineWindows: number;
    highDeviationMultiplier: number;
    mediumDeviationMultiplier: number;
    minCurrentInteractions: number;
  };
  newBridge: {
    minCommunitySize: number;
  };
  locationConvergence: {
    minCoOccurrences: number;
  };
  activityDeviation: {
    minObservations: number;
  };
}

/**
 * Centrally configured deterministic thresholds for all anomaly rules.
 * Documented, objective parameters that can be tuned without modifying detector logic.
 */
export const ANOMALY_THRESHOLDS: AnomalyEngineConfig = {
  interactionSpike: {
    minBaselineWindows: 2, // Requires strictly >= 2 prior observation windows
    highDeviationMultiplier: 3.0,
    mediumDeviationMultiplier: 2.0,
    minCurrentInteractions: 3,
  },
  newBridge: {
    minCommunitySize: 2,
  },
  locationConvergence: {
    minCoOccurrences: 2,
  },
  activityDeviation: {
    minObservations: 3, // Requires strictly >= 3 prior observation windows
  },
};

/**
 * Purely rule/statistics-based Anomaly Engine for arbitrary case data.
 * Does NOT hardcode entity IDs, dates, or results.
 * Exposes actual calculation values (current, baseline, deviation) for every finding.
 * 
 * LAW-ENFORCEMENT INTEGRITY RULES:
 * 1. Historical baselines must strictly use observations occurring BEFORE the evaluated window.
 * 2. Never allow the current observation being evaluated to contaminate its own baseline.
 * 3. Never manufacture artificial baselines (e.g. 1.0 or 4.0x) for deterministic topological rules.
 * 4. Label all outputs as DERIVED NETWORK ANALYSIS to distinguish from primary source facts.
 */
export function detectNetworkAnomalies(
  entities: Entity[],
  relationships: Relationship[],
  config: AnomalyEngineConfig = ANOMALY_THRESHOLDS
): AnomalyFinding[] {
  const anomalies: AnomalyFinding[] = [];
  const entityMap = new Map(entities.map(e => [e.id, e]));

  // =========================================================================
  // Index Chronologically Dated Evidence per Entity
  // =========================================================================
  const entityDateCounts = new Map<string, Map<string, EvidenceItem[]>>();

  // Extract from relationships
  relationships.forEach(rel => {
    rel.evidence?.forEach(ev => {
      const normDate = normalizeDate(ev.date);
      if (normDate) {
        [rel.sourceId, rel.targetId].forEach(entId => {
          if (!entityDateCounts.has(entId)) {
            entityDateCounts.set(entId, new Map());
          }
          const dateMap = entityDateCounts.get(entId)!;
          if (!dateMap.has(normDate)) {
            dateMap.set(normDate, []);
          }
          dateMap.get(normDate)!.push(ev);
        });
      }
    });
  });

  // Extract from entity direct evidence
  entities.forEach(ent => {
    ent.evidence?.forEach(ev => {
      const normDate = normalizeDate(ev.date);
      if (normDate) {
        if (!entityDateCounts.has(ent.id)) {
          entityDateCounts.set(ent.id, new Map());
        }
        const dateMap = entityDateCounts.get(ent.id)!;
        if (!dateMap.has(normDate)) {
          dateMap.set(normDate, []);
        }
        dateMap.get(normDate)!.push(ev);
      }
    });
  });

  // =========================================================================
  // DETECTOR A: Interaction Spike
  // Evaluates each temporal window strictly against PRIOR observation windows (t < T).
  // Current observation is NEVER included in historical baseline.
  // =========================================================================
  entityDateCounts.forEach((dateMap, entId) => {
    const ent = entityMap.get(entId);
    if (!ent) return;

    // Chronologically sorted distinct observation dates
    const dates = Array.from(dateMap.keys()).sort();
    const counts = dates.map(d => dateMap.get(d)!.length);

    // Evaluate each observation window k against strictly prior windows [0 ... k-1]
    for (let k = 0; k < dates.length; k++) {
      const currentDate = dates[k];
      const currentCount = counts[k];
      const currentEvidence = dateMap.get(currentDate) || [];

      // If prior windows are insufficient, we cannot calculate a historical baseline
      if (k < config.interactionSpike.minBaselineWindows) {
        continue;
      }

      if (currentCount < config.interactionSpike.minCurrentInteractions) {
        continue;
      }

      // Historical baseline is calculated STRICTLY from prior observations (i < k)
      const priorCounts = counts.slice(0, k);
      const sumPrior = priorCounts.reduce((acc, v) => acc + v, 0);
      const baseline = sumPrior / priorCounts.length;

      if (baseline <= 0) continue;

      const deviation = currentCount / baseline;

      if (deviation >= config.interactionSpike.mediumDeviationMultiplier) {
        const severity: 'HIGH' | 'MEDIUM' | 'LOW' = 
          deviation >= config.interactionSpike.highDeviationMultiplier ? 'HIGH' : 'MEDIUM';

        const sourceDocs = Array.from(new Set(currentEvidence.map(ev => ev.documentId).filter(Boolean)));

        anomalies.push({
          id: generateAnomalyId('SPIKE', `${entId}-${currentDate}`),
          title: `Interaction Spike: ${ent.label} (${currentCount} events on ${currentDate})`,
          severity,
          category: 'COMMUNICATION_SPIKE',
          detectorType: 'INTERACTION_SPIKE',
          date: currentDate,
          involvedEntityIds: [entId],
          triggerRule: `Observed frequency exceeded strictly historical baseline by ${deviation.toFixed(2)}× (threshold: ${config.interactionSpike.mediumDeviationMultiplier}×)`,
          explanation: `Calculated interaction spike for ${ent.label}. In window ${currentDate}, entity recorded ${currentCount} interactions compared to a strictly historical baseline of ${baseline.toFixed(1)} interactions/window (${deviation.toFixed(2)}× deviation).`,
          supportingData: {
            window: currentDate,
            currentInteractions: currentCount,
            historicalBaseline: Math.round(baseline * 10) / 10,
            deviationMultiplier: Math.round(deviation * 100) / 100,
            isBaselineAvailable: true,
            supportingRecordsCount: currentEvidence.length,
            sourceDocumentIds: sourceDocs,
            details: `Historical baseline calculated strictly over ${priorCounts.length} prior observation windows occurring before ${currentDate}. Current observation excluded from baseline calculation.`,
          },
          evidenceSnippets: currentEvidence.slice(0, 3),
          recommendedAction: `Inspect telecommunications and transaction logs for ${ent.label} on ${currentDate} for operational surge factors.`,
        });
      }
    }
  });

  // =========================================================================
  // DETECTOR B: New Bridge Relationship
  // Relationship newly connecting two previously disconnected sub-graphs
  // Deterministic topological rule: No artificial baseline manufactured.
  // =========================================================================
  const adj = new Map<string, Set<string>>();
  entities.forEach(e => adj.set(e.id, new Set()));

  // Sort relationships chronologically
  const datedRelationships = relationships
    .map(rel => {
      const earliestDate = rel.evidence
        ?.map(ev => normalizeDate(ev.date))
        .filter((d): d is string => d !== null)
        .sort()[0] || null;
      return { rel, earliestDate };
    })
    .filter(item => item.earliestDate !== null)
    .sort((a, b) => a.earliestDate!.localeCompare(b.earliestDate!));

  datedRelationships.forEach(({ rel, earliestDate }) => {
    const src = rel.sourceId;
    const tgt = rel.targetId;

    // Check if path exists between src and tgt before this edge
    const visited = new Set<string>();
    const queue = [src];
    visited.add(src);
    let pathFound = false;

    while (queue.length > 0) {
      const curr = queue.shift()!;
      if (curr === tgt) {
        pathFound = true;
        break;
      }
      const neighbors = adj.get(curr) || new Set();
      neighbors.forEach(nbr => {
        if (!visited.has(nbr)) {
          visited.add(nbr);
          queue.push(nbr);
        }
      });
    }

    // If no path existed, this relationship bridged two separate components
    if (!pathFound && visited.size >= config.newBridge.minCommunitySize) {
      const srcEnt = entityMap.get(src);
      const tgtEnt = entityMap.get(tgt);

      if (srcEnt && tgtEnt) {
        const sourceDocs = Array.from(new Set((rel.evidence || []).map(ev => ev.documentId).filter(Boolean)));

        anomalies.push({
          id: generateAnomalyId('BRIDGE', rel.id),
          title: `New Cross-Network Bridge: ${srcEnt.label} ↔ ${tgtEnt.label}`,
          severity: visited.size >= 3 ? 'HIGH' : 'MEDIUM',
          category: 'NEW_BRIDGE',
          detectorType: 'NEW_BRIDGE',
          date: earliestDate!,
          involvedEntityIds: [src, tgt],
          triggerRule: `First documented relational link joining previously disconnected sub-graphs (${visited.size} nodes bridged)`,
          explanation: `Relational bridge formed on ${earliestDate} between ${srcEnt.label} and ${tgtEnt.label}. Prior to this record, no graph path connected these two sub-networks.`,
          supportingData: {
            window: earliestDate!,
            currentInteractions: 1,
            historicalBaseline: null,
            deviationMultiplier: null,
            isBaselineAvailable: false,
            insufficientBaselineReason: 'Topological connectivity rule; no rate baseline applicable.',
            supportingRecordsCount: rel.evidence?.length || 1,
            sourceDocumentIds: sourceDocs,
            details: `Deterministic graph topology rule: Bridged a component of ${visited.size} entities to an adjacent sub-network. No statistical rate baseline applicable.`,
          },
          evidenceSnippets: rel.evidence || [],
          recommendedAction: `Trace intermediary facilitators and communication records linking ${srcEnt.label} and ${tgtEnt.label}.`,
        });
      }
    }

    // Add edge to adjacency
    adj.get(src)?.add(tgt);
    adj.get(tgt)?.add(src);
  });

  // =========================================================================
  // DETECTOR C: Location Convergence
  // Repeated co-occurrence of entities at same location / event.
  // Deterministic co-presence rule: NO artificial 1.0 baseline or 4.0x multiplier!
  // =========================================================================
  const locationEntities = entities.filter(e => e.type === 'LOCATION' || e.type === 'EVENT');

  locationEntities.forEach(loc => {
    const connectedEntityIds = new Set<string>();
    relationships.forEach(rel => {
      if (rel.sourceId === loc.id) connectedEntityIds.add(rel.targetId);
      if (rel.targetId === loc.id) connectedEntityIds.add(rel.sourceId);
    });

    entities.forEach(e => {
      if (e.id !== loc.id && e.evidence?.some(ev => ev.snippet.toLowerCase().includes(loc.label.toLowerCase()))) {
        connectedEntityIds.add(e.id);
      }
    });

    const connectedList = Array.from(connectedEntityIds);
    if (connectedList.length >= 2) {
      const allLocEvidence: EvidenceItem[] = [
        ...(loc.evidence || []),
        ...relationships
          .filter(r => r.sourceId === loc.id || r.targetId === loc.id)
          .flatMap(r => r.evidence || []),
      ];

      const locDates = Array.from(
        new Set(
          allLocEvidence
            .map(ev => normalizeDate(ev.date))
            .filter((d): d is string => d !== null)
        )
      ).sort();

      if (locDates.length >= config.locationConvergence.minCoOccurrences) {
        const involvedLabels = connectedList
          .slice(0, 3)
          .map(id => entityMap.get(id)?.label || id)
          .join(', ');

        const sourceDocs = Array.from(new Set(allLocEvidence.map(ev => ev.documentId).filter(Boolean)));

        anomalies.push({
          id: generateAnomalyId('CONVERGE', loc.id),
          title: `Location Convergence: ${loc.label} (${connectedList.length} entities)`,
          severity: connectedList.length >= 3 ? 'HIGH' : 'MEDIUM',
          category: 'CO_LOCATION',
          detectorType: 'LOCATION_CONVERGENCE',
          date: locDates[locDates.length - 1] || 'Multiple Dates',
          involvedEntityIds: [loc.id, ...connectedList],
          triggerRule: `Repeated co-presence of ${connectedList.length} entities across ${locDates.length} distinct evidentiary dates`,
          explanation: `Multiple entities (${involvedLabels}) converged at ${loc.label} across ${locDates.length} distinct dates: [${locDates.join(', ')}].`,
          supportingData: {
            window: locDates.join(' → '),
            currentInteractions: connectedList.length,
            historicalBaseline: null,
            deviationMultiplier: null,
            isBaselineAvailable: false,
            insufficientBaselineReason: 'Deterministic co-presence rule; no historical rate baseline applicable.',
            supportingRecordsCount: allLocEvidence.length,
            sourceDocumentIds: sourceDocs,
            details: `Location convergence detected through deterministic co-presence rules across ${locDates.length} separate temporal checkpoints. No artificial baseline manufactured.`,
          },
          evidenceSnippets: allLocEvidence.slice(0, 3),
          recommendedAction: `Cross-reference physical surveillance notes and tower transceiver logs at ${loc.label}.`,
        });
      }
    }
  });

  // =========================================================================
  // DETECTOR D: Activity Deviation
  // Significant deviation evaluated strictly against entity's own PRIOR baseline rate.
  // Current observation is NEVER included in historical mean/variance calculation.
  // =========================================================================
  entities.forEach(ent => {
    const dates = Array.from(entityDateCounts.get(ent.id)?.keys() || []).sort();
    if (dates.length === 0) return;

    const counts = dates.map(d => entityDateCounts.get(ent.id)!.get(d)!.length);

    // Evaluate each window k against strictly prior windows [0 ... k-1]
    for (let k = 0; k < dates.length; k++) {
      if (k < config.activityDeviation.minObservations) {
        // Insufficient prior observation windows to establish non-self baseline
        continue;
      }

      const currentDate = dates[k];
      const currentCount = counts[k];
      const evList = entityDateCounts.get(ent.id)?.get(currentDate) || [];

      // Prior observations strictly excluding current observation
      const priorCounts = counts.slice(0, k);
      const priorMean = priorCounts.reduce((a, b) => a + b, 0) / priorCounts.length;
      const priorVariance = priorCounts.reduce((a, b) => a + Math.pow(b - priorMean, 2), 0) / priorCounts.length;
      const priorStdDev = Math.sqrt(priorVariance);

      if (priorStdDev > 0) {
        const zScore = (currentCount - priorMean) / priorStdDev;
        if (zScore >= 2.0 && currentCount >= 4) {
          const sourceDocs = Array.from(new Set(evList.map(ev => ev.documentId).filter(Boolean)));
          const deviationMultiplier = priorMean > 0 ? currentCount / priorMean : currentCount;

          anomalies.push({
            id: generateAnomalyId('DEV', `${ent.id}-${currentDate}`),
            title: `Activity Deviation: ${ent.label} (Z-Score: +${zScore.toFixed(2)})`,
            severity: zScore >= 2.5 ? 'HIGH' : 'MEDIUM',
            category: 'BURNER_SURGE',
            detectorType: 'ACTIVITY_DEVIATION',
            date: currentDate,
            involvedEntityIds: [ent.id],
            triggerRule: `Activity rate deviated by +${zScore.toFixed(2)} standard deviations from strictly historical mean`,
            explanation: `Statistical activity surge detected for ${ent.label}. Event volume (${currentCount}) exceeded historical prior mean (${priorMean.toFixed(1)}) with prior standard deviation ${priorStdDev.toFixed(2)} (Z = +${zScore.toFixed(2)}).`,
            supportingData: {
              window: currentDate,
              currentInteractions: currentCount,
              historicalBaseline: Math.round(priorMean * 10) / 10,
              deviationMultiplier: Math.round(deviationMultiplier * 100) / 100,
              isBaselineAvailable: true,
              supportingRecordsCount: evList.length,
              sourceDocumentIds: sourceDocs,
              details: `Z-score of +${zScore.toFixed(2)} evaluated strictly against ${k} prior temporal checkpoints (mean = ${priorMean.toFixed(1)}, σ = ${priorStdDev.toFixed(2)}). Current observation excluded from baseline calculation.`,
            },
            evidenceSnippets: evList.slice(0, 2),
            recommendedAction: `Correlate events on ${currentDate} with concurrent law-enforcement operations or target movements.`,
          });
        }
      }
    }
  });

  // Sort anomalies by severity (HIGH first) then date descending
  const severityRank = { HIGH: 3, MEDIUM: 2, LOW: 1 };
  return anomalies.sort((a, b) => {
    const rankDiff = severityRank[b.severity] - severityRank[a.severity];
    if (rankDiff !== 0) return rankDiff;
    return b.date.localeCompare(a.date);
  });
}
