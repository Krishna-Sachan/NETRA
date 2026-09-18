import { Entity, Relationship, DuplicateCandidate, EvidenceItem } from '../types';

/**
 * Standard Levenshtein distance calculation
 */
export function levenshteinDistance(a: string, b: string): number {
  const an = a.length;
  const bn = b.length;
  if (an === 0) return bn;
  if (bn === 0) return an;

  const matrix: number[][] = [];
  for (let i = 0; i <= bn; ++i) matrix[i] = [i];
  for (let i = 0; i <= an; ++i) matrix[0][i] = i;

  for (let i = 1; i <= bn; ++i) {
    for (let j = 1; j <= an; ++j) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[bn][an];
}

/**
 * Normalized string similarity (0.0 to 1.0)
 */
export function stringSimilarity(s1: string, s2: string): number {
  const str1 = normalizeString(s1);
  const str2 = normalizeString(s2);
  if (str1 === str2) return 1.0;
  if (!str1 || !str2) return 0.0;

  const maxLen = Math.max(str1.length, str2.length);
  const dist = levenshteinDistance(str1, str2);
  return Math.max(0, 1 - dist / maxLen);
}

/**
 * Normalizes strings by lowercasing, trimming, and standardizing whitespace and punctuation
 */
export function normalizeString(raw: string): string {
  if (!raw) return '';
  return raw
    .toLowerCase()
    .trim()
    .replace(/["'’“”`()]/g, ' ')
    .replace(/[.,\-_/\\:;]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Name normalization alias matching Test B specifications
 */
export const normalizeName = normalizeString;

/**
 * Levenshtein similarity alias matching Test A specifications
 */
export const calculateLevenshteinSimilarity = stringSimilarity;

/**
 * Clean phone numbers to numeric digits only and extract normalized national 10 digits
 */
export function normalizePhoneNumber(raw: string): string {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return digits;
}

/**
 * Tokenize a person's name into clean core name tokens (ignoring honorifics and noise words)
 */
export function extractPersonTokens(raw: string): string[] {
  const normalized = normalizeString(raw);
  const noiseWords = new Set([
    'mr', 'mrs', 'ms', 'shri', 'smt', 'dr', 'adv', 'the', 'alias', 'known', 'as',
    'bhai', 'babu', 'operator', 'driver', 'contractor', 'unregistered', 'forged'
  ]);
  return normalized
    .split(' ')
    .filter(t => t.length > 1 && !noiseWords.has(t));
}

export interface EntityResolutionConfig {
  personSimilarityThreshold: number; // e.g. 0.68
  phoneSimilarityThreshold: number;  // e.g. 0.85
}

export const DEFAULT_RESOLUTION_CONFIG: EntityResolutionConfig = {
  personSimilarityThreshold: 0.68,
  phoneSimilarityThreshold: 0.85,
};

/**
 * Finds duplicate candidate pairs between entities of the same type (PERSON or PHONE).
 * Operates purely on arbitrary entity arrays with no hardcoded assumptions.
 */
export function findDuplicateEntities(
  entities: Entity[],
  dismissedPairIds: Set<string> | string[] = new Set(),
  config: EntityResolutionConfig = DEFAULT_RESOLUTION_CONFIG
): DuplicateCandidate[] {
  const dismissedSet = dismissedPairIds instanceof Set 
    ? dismissedPairIds 
    : new Set(Array.isArray(dismissedPairIds) ? dismissedPairIds : []);

  const candidates: DuplicateCandidate[] = [];

  // 1. Process PERSON entities with pre-normalized metadata (blocking & performance optimization)
  const persons = entities
    .filter(e => e.type === 'PERSON')
    .map(e => {
      const normLabel = normalizeString(e.label);
      const tokens = extractPersonTokens(e.label);
      const tokenSet = new Set(tokens);
      const allNames = [e.label, ...(e.aliases || [])].map(n => ({
        raw: n,
        norm: normalizeString(n)
      }));
      const docsList = Array.from(new Set((e.evidence || []).map(ev => ev.documentId)));
      const docsSet = new Set(docsList);
      return {
        entity: e,
        normLabel,
        tokens,
        tokenSet,
        allNames,
        docsList,
        docsSet
      };
    });

  for (let i = 0; i < persons.length; i++) {
    const pA = persons[i];
    for (let j = i + 1; j < persons.length; j++) {
      const pB = persons[j];

      const pairId = [pA.entity.id, pB.entity.id].sort().join('::');
      if (dismissedSet.has(pairId)) continue;

      // Fast candidate blocking: skip if lengths differ by more than 2x and no common tokens
      const lenRatio = Math.min(pA.normLabel.length, pB.normLabel.length) / Math.max(pA.normLabel.length, pB.normLabel.length, 1);
      const commonTokens = pB.tokens.filter(t => pA.tokenSet.has(t));
      if (lenRatio < 0.35 && commonTokens.length === 0) {
        continue;
      }

      const factors: string[] = [];
      let score = 0;

      const labelSim = stringSimilarity(pA.normLabel, pB.normLabel);
      score = labelSim;

      // Check alias concordance across pre-normalized names
      let maxAliasSim = 0;
      let matchingAliasPair = '';

      for (const na of pA.allNames) {
        for (const nb of pB.allNames) {
          const sim = stringSimilarity(na.norm, nb.norm);
          if (sim > maxAliasSim) {
            maxAliasSim = sim;
            matchingAliasPair = `"${na.raw}" ↔ "${nb.raw}"`;
          }
        }
      }

      if (maxAliasSim >= 0.88) {
        score = Math.max(score, maxAliasSim);
        factors.push(`Alias concordance: High string match on ${matchingAliasPair} (${Math.round(maxAliasSim * 100)}%)`);
      }

      if (commonTokens.length >= 2) {
        score = Math.max(score, 0.82);
        factors.push(`Shared multiple core name tokens: [${commonTokens.join(', ')}]`);
      } else if (commonTokens.length === 1 && pA.tokens.length <= 2 && pB.tokens.length <= 2) {
        score = Math.max(score, 0.72);
        factors.push(`Shared primary surname/token: "${commonTokens[0]}"`);
      }

      if (labelSim >= 0.70) {
        factors.push(`Normalized Levenshtein name similarity of ${Math.round(labelSim * 100)}%`);
      }

      // Check co-occurrence in same evidentiary documents
      const sharedDocs = pB.docsList.filter(dId => pA.docsSet.has(dId));
      if (sharedDocs.length > 0 && score >= 0.60) {
        score = Math.min(0.98, score + 0.05);
        factors.push(`Co-cited in common case document: ${sharedDocs[0]}`);
      }

      if (score >= config.personSimilarityThreshold && factors.length > 0) {
        const similarityPercentage = Math.round(score * 100);

        candidates.push({
          id: pairId,
          entityA: pA.entity,
          entityB: pB.entity,
          similarityScore: score,
          similarityPercentage,
          matchingFactors: factors,
          evidenceA: pA.entity.evidence || [],
          evidenceB: pB.entity.evidence || [],
          originatingDocumentsA: pA.docsList,
          originatingDocumentsB: pB.docsList,
          dismissed: false,
        });
      }
    }
  }

  // 2. Process PHONE entities with pre-normalized 10-digit subscriber sequences
  const phones = entities
    .filter(e => e.type === 'PHONE')
    .map(e => {
      const normNumber = normalizePhoneNumber(e.label);
      const docsList = Array.from(new Set((e.evidence || []).map(ev => ev.documentId)));
      return {
        entity: e,
        normNumber,
        docsList
      };
    })
    .filter(p => p.normNumber.length >= 7);

  for (let i = 0; i < phones.length; i++) {
    const phA = phones[i];
    for (let j = i + 1; j < phones.length; j++) {
      const phB = phones[j];

      const pairId = [phA.entity.id, phB.entity.id].sort().join('::');
      if (dismissedSet.has(pairId)) continue;

      const factors: string[] = [];
      let score = 0;

      if (phA.normNumber === phB.normNumber) {
        score = 1.0;
        factors.push(`Identical normalized 10-digit subscriber number (${phA.normNumber}) across formatting variations`);
      } else {
        const sim = stringSimilarity(phA.normNumber, phB.normNumber);
        if (sim >= config.phoneSimilarityThreshold) {
          score = sim;
          factors.push(`High numeric digit sequence similarity (${Math.round(sim * 100)}%) between ${phA.normNumber} and ${phB.normNumber}`);
        }
      }

      if (score >= config.phoneSimilarityThreshold && factors.length > 0) {
        const similarityPercentage = Math.round(score * 100);

        candidates.push({
          id: pairId,
          entityA: phA.entity,
          entityB: phB.entity,
          similarityScore: score,
          similarityPercentage,
          matchingFactors: factors,
          evidenceA: phA.entity.evidence || [],
          evidenceB: phB.entity.evidence || [],
          originatingDocumentsA: phA.docsList,
          originatingDocumentsB: phB.docsList,
          dismissed: false,
        });
      }
    }
  }

  // Sort descending by similarity percentage
  return candidates.sort((a, b) => b.similarityPercentage - a.similarityPercentage);
}

/**
 * Merges two entities preserving complete evidentiary provenance and re-routing relationships.
 * NEVER deletes evidence, source documents, or aliases.
 */
export function mergeEntities(
  survivorId: string,
  duplicateId: string,
  entities: Entity[],
  relationships: Relationship[]
): {
  updatedEntities: Entity[];
  updatedRelationships: Relationship[];
  mergedEntity: Entity;
} {
  const survivor = entities.find(e => e.id === survivorId);
  const duplicate = entities.find(e => e.id === duplicateId);

  if (!survivor || !duplicate) {
    throw new Error(`Cannot merge entities: either survivor (${survivorId}) or duplicate (${duplicateId}) does not exist in graph.`);
  }

  // 1. Preserve all aliases without duplicates
  const allAliases = Array.from(
    new Set([
      ...(survivor.aliases || []),
      duplicate.label,
      ...(duplicate.aliases || []),
    ])
  ).filter(a => a.toLowerCase() !== survivor.label.toLowerCase());

  // 2. Preserve all evidence from both entities without duplicating identical snippets
  const existingEvidenceMap = new Map<string, EvidenceItem>();
  (survivor.evidence || []).forEach(ev => {
    existingEvidenceMap.set(`${ev.documentId}:::${ev.snippet.trim()}`, ev);
  });
  (duplicate.evidence || []).forEach(ev => {
    const key = `${ev.documentId}:::${ev.snippet.trim()}`;
    if (!existingEvidenceMap.has(key)) {
      existingEvidenceMap.set(key, ev);
    }
  });
  const combinedEvidence = Array.from(existingEvidenceMap.values());

  // 3. Track provenance: keep record of all merged entity IDs
  const previousMergedIds = (survivor.metadata as any)?.mergedEntityIds || [survivor.id];
  const duplicateMergedIds = (duplicate.metadata as any)?.mergedEntityIds || [duplicate.id];
  const mergedEntityIds = Array.from(new Set([...previousMergedIds, ...duplicateMergedIds]));

  const mergeAuditEntry = {
    mergedAt: new Date().toISOString(),
    mergedEntityId: duplicate.id,
    mergedEntityLabel: duplicate.label,
  };
  const previousHistory = (survivor.metadata as any)?.mergeHistory || [];

  const mergedEntity: Entity = {
    ...survivor,
    aliases: allAliases,
    evidence: combinedEvidence,
    metadata: {
      ...survivor.metadata,
      mergedEntityIds,
      mergeHistory: [...previousHistory, mergeAuditEntry],
      notes: `${survivor.metadata?.notes || ''} [Investigator Merged: ${duplicate.label} (${duplicate.id})]`.trim(),
    },
  };

  // 4. Update entity list: replace survivor, remove duplicate
  const updatedEntities = entities
    .filter(e => e.id !== duplicateId)
    .map(e => (e.id === survivorId ? mergedEntity : e));

  // 5. Re-point relationships and combine relationship evidence
  const updatedRelationships: Relationship[] = [];
  const seenRelKeys = new Map<string, number>();

  relationships.forEach(rel => {
    const src = rel.sourceId === duplicateId ? survivorId : rel.sourceId;
    const tgt = rel.targetId === duplicateId ? survivorId : rel.targetId;

    // Prevent self-loops
    if (src === tgt) return;

    const relKey = [src, tgt].sort().join('::') + '::' + rel.type;

    if (seenRelKeys.has(relKey)) {
      const existingIdx = seenRelKeys.get(relKey)!;
      const existingRel = updatedRelationships[existingIdx];
      // Combine evidence
      const existingSnippets = new Set(existingRel.evidence.map(ev => `${ev.documentId}:::${ev.snippet}`));
      const newEv = rel.evidence.filter(ev => !existingSnippets.has(`${ev.documentId}:::${ev.snippet}`));
      existingRel.evidence.push(...newEv);
    } else {
      const newRelIndex = updatedRelationships.length;
      seenRelKeys.set(relKey, newRelIndex);
      updatedRelationships.push({
        ...rel,
        sourceId: src,
        targetId: tgt,
        evidence: [...rel.evidence],
      });
    }
  });

  return {
    updatedEntities,
    updatedRelationships,
    mergedEntity,
  };
}
