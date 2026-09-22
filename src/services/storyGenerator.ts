import { TimelineMilestone, Entity, Relationship, CaseDocument } from '../types';

export interface StoryToken {
  text: string;
  isEntity: boolean;
  entityId?: string;
  entityType?: string;
}

/**
 * Generates a cinematic, movie-subtitle style story narrative for a timeline milestone.
 * Converts raw technical evidence tuples into simple, high-impact intelligence text.
 */
export function generateMilestoneStory(
  milestone: TimelineMilestone,
  entities: Entity[] = [],
  relationships: Relationship[] = [],
  documents: CaseDocument[] = []
): string {
  // If milestone already has a custom narrative, return it
  if (milestone.narrativeStory) {
    return milestone.narrativeStory;
  }

  const dateStr = milestone.date;
  const involvedEntities = entities.filter(e => milestone.involvedEntityIds.includes(e.id));
  const primaryEntity = involvedEntities[0];
  const secondaryEntity = involvedEntities[1];

  const snippet = milestone.evidenceSnippet || milestone.description;

  // 1. If snippet is available and structured, clean it up into a narrative sentence
  if (snippet && snippet.length > 15) {
    // If snippet already reads like a story sentence
    let clean = snippet.trim();
    if (!clean.endsWith('.')) clean += '.';
    
    // Prefix date context if not present
    if (!clean.toLowerCase().includes(dateStr.toLowerCase())) {
      return `On ${dateStr}: ${clean}`;
    }
    return clean;
  }

  // 2. Synthesize narrative from milestone type & titles
  const typeUpper = milestone.type.toUpperCase();

  if (typeUpper.includes('VEHICLE') || typeUpper.includes('OPERATES')) {
    const driver = primaryEntity ? primaryEntity.label : 'Suspect';
    const vehicle = secondaryEntity ? secondaryEntity.label : (milestone.title.split('↔')[1] || 'vehicle');
    return `On ${dateStr}: ${driver} was spotted operating target vehicle ${vehicle}.`;
  }

  if (typeUpper.includes('PHONE') || typeUpper.includes('COMMUNICATED') || typeUpper.includes('CDR')) {
    const caller = primaryEntity ? primaryEntity.label : 'Target subscriber';
    const callee = secondaryEntity ? secondaryEntity.label : 'associate';
    return `On ${dateStr}: Direct communication intercept confirmed between ${caller} and ${callee}.`;
  }

  if (typeUpper.includes('TRANSACTION') || typeUpper.includes('FINANCED') || typeUpper.includes('FINANCIAL')) {
    const src = primaryEntity ? primaryEntity.label : 'Source account';
    const tgt = secondaryEntity ? secondaryEntity.label : 'destination account';
    return `On ${dateStr}: Financial conduit movement registered between ${src} and ${tgt}.`;
  }

  if (typeUpper.includes('LOCATION') || typeUpper.includes('PRESENT')) {
    const subject = primaryEntity ? primaryEntity.label : 'Subject';
    const loc = secondaryEntity ? secondaryEntity.label : 'staging area';
    return `On ${dateStr}: Intelligence logs place ${subject} at ${loc}.`;
  }

  if (typeUpper.includes('DOCUMENT') || typeUpper.includes('FIR')) {
    const doc = documents.find(d => d.id === milestone.documentId);
    const docName = doc ? doc.title : milestone.title;
    return `On ${dateStr}: ${docName} was formally logged into official case records.`;
  }

  // Fallback
  if (primaryEntity && secondaryEntity) {
    return `On ${dateStr}: Operational link catalogued between ${primaryEntity.label} and ${secondaryEntity.label} (${milestone.title}).`;
  }

  if (primaryEntity) {
    return `On ${dateStr}: Key intelligence update logged regarding ${primaryEntity.label} (${milestone.title}).`;
  }

  return `On ${dateStr}: ${milestone.title} - ${milestone.description || 'Milestone event recorded in case dossier.'}`;
}

/**
 * Tokenizes a story string to highlight entity labels as clickable subtitle chips.
 */
export function parseStoryTokens(story: string, entities: Entity[]): StoryToken[] {
  if (!story || entities.length === 0) {
    return [{ text: story, isEntity: false }];
  }

  // Sort entities by label length descending to match longer names first
  const sortedEntities = [...entities].sort((a, b) => b.label.length - a.label.length);

  // Build a regex pattern of all entity labels and aliases
  const entityMap = new Map<string, Entity>();
  const patterns: string[] = [];

  sortedEntities.forEach(ent => {
    if (ent.label && ent.label.length >= 2) {
      const escaped = ent.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      patterns.push(escaped);
      entityMap.set(ent.label.toLowerCase(), ent);
    }
    ent.aliases?.forEach(alias => {
      if (alias && alias.length >= 3) {
        const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        patterns.push(escaped);
        entityMap.set(alias.toLowerCase(), ent);
      }
    });
  });

  if (patterns.length === 0) {
    return [{ text: story, isEntity: false }];
  }

  // Regex matching whole words or exact terms
  const regex = new RegExp(`\\b(${patterns.join('|')})\\b`, 'gi');
  const tokens: StoryToken[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(story)) !== null) {
    const matchText = match[0];
    const matchIdx = match.index;

    if (matchIdx > lastIdx) {
      tokens.push({
        text: story.slice(lastIdx, matchIdx),
        isEntity: false,
      });
    }

    const matchedEnt = entityMap.get(matchText.toLowerCase());
    if (matchedEnt) {
      tokens.push({
        text: matchText,
        isEntity: true,
        entityId: matchedEnt.id,
        entityType: matchedEnt.type,
      });
    } else {
      tokens.push({ text: matchText, isEntity: false });
    }

    lastIdx = regex.lastIndex;
  }

  if (lastIdx < story.length) {
    tokens.push({
      text: story.slice(lastIdx),
      isEntity: false,
    });
  }

  return tokens;
}
