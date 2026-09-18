import { CaseDocument, Entity, Relationship, TimelineMilestone } from '../types';
import { generateMilestoneId } from './idService';

/**
 * Standard date regex to find YYYY-MM-DD or DD-MMM-YYYY in strings
 */
const ISO_DATE_REGEX = /\b(\d{4})-(\d{2})-(\d{2})\b/;
const MONTH_MAP: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
};
const NAMED_DATE_REGEX = /\b(\d{1,2})-(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*-(\d{4})\b/i;

/**
 * Parses and normalizes any date string found in documents or evidence to strict YYYY-MM-DD.
 * Returns null if no valid date can be determined (NEVER fabricates dates).
 */
export function normalizeDate(raw?: string | null): string | null {
  if (!raw) return null;
  const str = raw.trim();

  // Match ISO YYYY-MM-DD
  const isoMatch = str.match(ISO_DATE_REGEX);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    const year = parseInt(y, 10);
    const month = parseInt(m, 10);
    const day = parseInt(d, 10);
    if (year >= 1900 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
  }

  // Match DD-Mon-YYYY (e.g. 14-Oct-2024)
  const namedMatch = str.match(NAMED_DATE_REGEX);
  if (namedMatch) {
    const [, d, monStr, y] = namedMatch;
    const m = MONTH_MAP[monStr.toLowerCase().slice(0, 3)];
    if (m) {
      return `${y}-${m}-${d.padStart(2, '0')}`;
    }
  }

  // Attempt Date.parse as fallback
  const parsed = Date.parse(str);
  if (!isNaN(parsed)) {
    const d = new Date(parsed);
    const year = d.getFullYear();
    if (year >= 1900 && year <= 2100) {
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }

  return null;
}

/**
 * Dynamically builds timeline events strictly from the CURRENT CASE data.
 * Extracts dates from:
 * - Documents (doc.date)
 * - Entity evidence items (ev.date)
 * - Relationship evidence items (ev.date)
 * - Entity metadata (firstSeenDate)
 * 
 * NEVER hardcodes sample timeline events or fabricates non-existent dates.
 */
export function buildTimelineFromCase(
  documents: CaseDocument[],
  entities: Entity[],
  relationships: Relationship[]
): TimelineMilestone[] {
  const milestones: TimelineMilestone[] = [];
  const seenMilestoneKeys = new Set<string>();

  // Helper to register a timeline milestone
  const addMilestone = (
    rawDate: string | undefined | null,
    title: string,
    type: string,
    description: string,
    involvedEntityIds: string[],
    documentId?: string,
    evidenceSnippet?: string
  ) => {
    const normDate = normalizeDate(rawDate);
    if (!normDate) return; // Do not create dates that do not exist

    const key = `${normDate}:::${title}:::${documentId || ''}`;
    if (seenMilestoneKeys.has(key)) return;
    seenMilestoneKeys.add(key);

    milestones.push({
      id: generateMilestoneId(normDate),
      date: normDate,
      title,
      type,
      description,
      involvedEntityIds: Array.from(new Set(involvedEntityIds)),
      documentId,
      evidenceSnippet,
    });
  };

  // 1. Extract from Case Documents
  documents.forEach(doc => {
    if (doc.date) {
      // Find all entities mentioned in or with evidence in this document
      const docEntities = entities.filter(e =>
        e.evidence?.some(ev => ev.documentId === doc.id)
      ).map(e => e.id);

      addMilestone(
        doc.date,
        doc.title || `Document Ingest: ${doc.id}`,
        doc.type || 'DOCUMENT',
        doc.summary || `Official case file recorded by ${doc.sourceAuthority || 'Investigating Agency'}`,
        docEntities,
        doc.id
      );
    }
  });

  // 2. Extract from Relationship Evidence
  relationships.forEach(rel => {
    const sourceEnt = entities.find(e => e.id === rel.sourceId);
    const targetEnt = entities.find(e => e.id === rel.targetId);
    const srcName = sourceEnt ? sourceEnt.label : rel.sourceId;
    const tgtName = targetEnt ? targetEnt.label : rel.targetId;

    rel.evidence?.forEach(ev => {
      if (ev.date) {
        addMilestone(
          ev.date,
          `${srcName} ↔ ${tgtName} (${rel.type.replace(/_/g, ' ')})`,
          rel.type.toUpperCase(),
          ev.snippet,
          [rel.sourceId, rel.targetId],
          ev.documentId,
          ev.snippet
        );
      }
    });
  });

  // 3. Extract from Entity Evidence (events, transactions, locations)
  entities.forEach(ent => {
    ent.evidence?.forEach(ev => {
      if (ev.date) {
        // Also check if snippet has an explicit date
        addMilestone(
          ev.date,
          `${ent.type}: ${ent.label}`,
          ent.type,
          ev.snippet,
          [ent.id],
          ev.documentId,
          ev.snippet
        );
      }
    });

    if (ent.metadata?.firstSeenDate) {
      addMilestone(
        ent.metadata.firstSeenDate,
        `Initial Record: ${ent.label}`,
        ent.type,
        ent.metadata.notes || `Entity ${ent.label} first catalogued in investigation records.`,
        [ent.id]
      );
    }
  });

  // Sort strictly chronological ascending
  return milestones.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Filters the graph elements dynamically based on an active time window [startDate, endDate].
 * Keeps graph and timeline synchronized.
 */
export function filterGraphByTimeWindow(
  entities: Entity[],
  relationships: Relationship[],
  milestones: TimelineMilestone[],
  cutoffDate: string | null
): {
  visibleEntities: Entity[];
  visibleRelationships: Relationship[];
  filteredMilestones: TimelineMilestone[];
} {
  if (!cutoffDate) {
    return {
      visibleEntities: entities,
      visibleRelationships: relationships,
      filteredMilestones: milestones,
    };
  }

  // 1. Milestones on or before cutoff date
  const filteredMilestones = milestones.filter(m => m.date <= cutoffDate);

  // Set of entity IDs involved in milestones on or before cutoff
  const activeEntityIds = new Set<string>();
  filteredMilestones.forEach(m => {
    m.involvedEntityIds.forEach(id => activeEntityIds.add(id));
  });

  // 2. Filter relationships:
  // A relationship is visible if its evidence occurred on or before cutoff, OR if both endpoints are active
  const visibleRelationships = relationships.filter(rel => {
    const hasDatedEvidence = rel.evidence && rel.evidence.length > 0 && rel.evidence.some(ev => ev.date);
    if (hasDatedEvidence) {
      // Must have at least one evidence item dated on or before cutoff
      return rel.evidence.some(ev => {
        const norm = normalizeDate(ev.date);
        return norm && norm <= cutoffDate;
      });
    }
    // If undated relationship, visible if both endpoints are active
    return activeEntityIds.has(rel.sourceId) && activeEntityIds.has(rel.targetId);
  });

  // Visible relationships add their endpoints to active entity IDs
  visibleRelationships.forEach(rel => {
    activeEntityIds.add(rel.sourceId);
    activeEntityIds.add(rel.targetId);
  });

  // 3. Filter entities:
  // An entity is visible if it is in activeEntityIds OR if it has no dated evidence at all (so un-dated baseline entities remain visible)
  const visibleEntities = entities.filter(ent => {
    if (activeEntityIds.has(ent.id)) return true;
    const hasAnyDatedEvidence = ent.evidence?.some(ev => normalizeDate(ev.date) !== null);
    if (!hasAnyDatedEvidence) {
      // Entity has no dates associated with it; preserve it in graph
      return true;
    }
    return false;
  });

  return {
    visibleEntities,
    visibleRelationships,
    filteredMilestones,
  };
}
