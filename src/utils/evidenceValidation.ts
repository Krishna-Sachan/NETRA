import { EntityType, Entity, Relationship, EvidenceItem, AIInsight } from '../types';

/**
 * Normalizes text for evidence verification by standardizing harmless formatting differences:
 * - Smart quotes vs standard quotes (“ ” „ « » -> " and ‘ ’ ‚ › ‹ ` -> ')
 * - Non-breaking spaces and other Unicode spaces -> standard space
 * - Collapsing multiple consecutive whitespace (spaces, tabs, newlines, carriage returns) into a single space
 * - Trimming leading and trailing whitespace
 */
export function normalizeEvidenceText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    // Replace smart double quotes and guillemets with standard double quote
    .replace(/[\u201C\u201D\u201E\u00AB\u00BB]/g, '"')
    // Replace smart single quotes, prime, backtick with standard single quote
    .replace(/[\u2018\u2019\u201A\u2039\u203A`]/g, "'")
    // Replace non-breaking spaces and special unicode spaces with normal space
    .replace(/[\u00A0\u1680\u2000-\u200B\u202F\u205F\u3000]/g, ' ')
    // Normalize newlines and carriage returns
    .replace(/[\r\n\t]+/g, ' ')
    // Collapse multiple spaces into a single space
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Verifies whether a given evidence snippet is an actual verbatim substring of the source document text
 * after applying deterministic, harmless whitespace and quote normalization.
 * Strictly forbids fuzzy matching for evidence verification.
 */
export function evidenceExistsInSource(sourceText: string, snippet: string): boolean {
  if (!sourceText || !snippet || typeof sourceText !== 'string' || typeof snippet !== 'string') {
    return false;
  }

  const normalizedSource = normalizeEvidenceText(sourceText);
  const normalizedSnippet = normalizeEvidenceText(snippet);

  if (!normalizedSnippet || normalizedSnippet.length < 3) {
    return false;
  }

  return normalizedSource.includes(normalizedSnippet);
}

/**
 * Strict finite enum of supported Entity Types in NETRA
 */
export const VALID_ENTITY_TYPES: readonly EntityType[] = [
  'PERSON',
  'PHONE',
  'VEHICLE',
  'LOCATION',
  'ORGANIZATION',
  'EVENT',
  'TRANSACTION',
] as const;

/**
 * Strict finite enum of supported Confidence Labels
 */
export const VALID_CONFIDENCE_LABELS = [
  'HIGH',
  'CORROBORATED',
  'INDICATIVE',
  'REPORTED',
] as const;

/**
 * Strict finite enum of semantic relationship types supported by the NETRA ontology
 */
export const VALID_RELATIONSHIP_TYPES = [
  'operates_vehicle',
  'possesses_device',
  'communicated_with',
  'financed_asset',
  'affiliated_to',
  'present_at',
  'issued_document',
  'attended_event',
  'initiated_transaction',
  'disbursed_to',
  'controls_entity',
  'liquidated_cash',
  'associated_with',
  'delivered_payment',
  'supervised_event',
  'event_location',
  'transacted_with',
] as const;

export type ValidRelationshipType = typeof VALID_RELATIONSHIP_TYPES[number];
export type ValidConfidenceLabel = typeof VALID_CONFIDENCE_LABELS[number];

export interface ValidatedEntity {
  id?: string;
  type: EntityType;
  label: string;
  aliases: string[];
  evidenceSnippet: string;
}

export interface ValidatedRelationship {
  sourceLabel: string;
  targetLabel: string;
  type: string;
  confidenceLabel: ValidConfidenceLabel;
  evidenceSnippet: string;
}

export interface ValidatedExtractionResult {
  entities: ValidatedEntity[];
  relationships: ValidatedRelationship[];
  caseSummary: string;
}

export type ExtractionValidationResult =
  | { valid: true; data: ValidatedExtractionResult }
  | { valid: false; error: string; code?: string };

/**
 * Complete verification pipeline for structured AI output:
 * 1. Root schema validation (types, arrays, strings)
 * 2. Entity type and property validation
 * 3. Evidence verification: every entity snippet must exist verbatim in the source text
 * 4. Relationship type, property, and evidence verification
 * 5. Relationship reference validation: sourceLabel and targetLabel MUST resolve to an extracted entity
 * 
 * Rejects any malformed or unverified AI output before it can reach application state.
 */
export function validateExtractionResponse(
  sourceText: string,
  rawOutput: any
): ExtractionValidationResult {
  if (!rawOutput || typeof rawOutput !== 'object') {
    return {
      valid: false,
      error: 'Extraction rejected: AI response is not a valid structured object.',
      code: 'MALFORMED_OUTPUT'
    };
  }

  if (!Array.isArray(rawOutput.entities)) {
    return {
      valid: false,
      error: 'Extraction rejected: "entities" array is missing or invalid in model output.',
      code: 'MISSING_ENTITIES'
    };
  }

  if (!Array.isArray(rawOutput.relationships)) {
    return {
      valid: false,
      error: 'Extraction rejected: "relationships" array is missing or invalid in model output.',
      code: 'MISSING_RELATIONSHIPS'
    };
  }

  const validEntityTypesSet = new Set<string>(VALID_ENTITY_TYPES);
  const validRelTypesSet = new Set<string>(VALID_RELATIONSHIP_TYPES);
  const validConfidenceSet = new Set<string>(VALID_CONFIDENCE_LABELS);

  const validatedEntities: ValidatedEntity[] = [];

  // Map to index entities by normalized label and alias for relationship reference validation
  // Key: normalized label/alias, Value: normalized primary label
  const entityLookup = new Map<string, string>();

  // 1. Validate each entity
  for (let i = 0; i < rawOutput.entities.length; i++) {
    const ent = rawOutput.entities[i];
    if (!ent || typeof ent !== 'object') {
      return {
        valid: false,
        error: `Extraction rejected: entity at index ${i} is not a valid object.`,
        code: 'INVALID_ENTITY_FORMAT'
      };
    }

    if (!ent.label || typeof ent.label !== 'string' || !ent.label.trim()) {
      return {
        valid: false,
        error: `Extraction rejected: entity at index ${i} is missing a valid label.`,
        code: 'MISSING_ENTITY_LABEL'
      };
    }

    const cleanLabel = ent.label.trim();

    if (!validEntityTypesSet.has(ent.type)) {
      return {
        valid: false,
        error: `Extraction rejected: invalid entity type "${ent.type}" for "${cleanLabel}". Must be one of: ${VALID_ENTITY_TYPES.join(', ')}.`,
        code: 'INVALID_ENTITY_TYPE'
      };
    }

    if (!ent.evidenceSnippet || typeof ent.evidenceSnippet !== 'string' || !ent.evidenceSnippet.trim()) {
      return {
        valid: false,
        error: `Extraction rejected: entity "${cleanLabel}" is missing an evidence snippet.`,
        code: 'MISSING_EVIDENCE_SNIPPET'
      };
    }

    const cleanSnippet = ent.evidenceSnippet.trim();

    // Verify evidence snippet exists in source document
    if (!evidenceExistsInSource(sourceText, cleanSnippet)) {
      return {
        valid: false,
        error: 'Extraction rejected: one or more AI evidence snippets could not be verified against the source document.',
        code: 'UNVERIFIED_EVIDENCE'
      };
    }

    const cleanAliases: string[] = Array.isArray(ent.aliases)
      ? ent.aliases
          .filter((a: any) => typeof a === 'string' && a.trim().length > 0)
          .map((a: string) => a.trim())
      : [];

    validatedEntities.push({
      type: ent.type as EntityType,
      label: cleanLabel,
      aliases: cleanAliases,
      evidenceSnippet: cleanSnippet
    });

    // Register primary label and aliases in lookup map
    const normPrimary = cleanLabel.toLowerCase();
    entityLookup.set(normPrimary, normPrimary);
    cleanAliases.forEach(alias => {
      entityLookup.set(alias.toLowerCase(), normPrimary);
    });
  }

  // 2. Validate relationships
  const validatedRelationships: ValidatedRelationship[] = [];

  for (let i = 0; i < rawOutput.relationships.length; i++) {
    const rel = rawOutput.relationships[i];
    if (!rel || typeof rel !== 'object') {
      return {
        valid: false,
        error: `Extraction rejected: relationship at index ${i} is not a valid object.`,
        code: 'INVALID_RELATIONSHIP_FORMAT'
      };
    }

    if (!rel.sourceLabel || typeof rel.sourceLabel !== 'string' || !rel.sourceLabel.trim()) {
      return {
        valid: false,
        error: `Extraction rejected: relationship at index ${i} is missing sourceLabel.`,
        code: 'MISSING_SOURCE_LABEL'
      };
    }

    if (!rel.targetLabel || typeof rel.targetLabel !== 'string' || !rel.targetLabel.trim()) {
      return {
        valid: false,
        error: `Extraction rejected: relationship at index ${i} is missing targetLabel.`,
        code: 'MISSING_TARGET_LABEL'
      };
    }

    const cleanSource = rel.sourceLabel.trim();
    const cleanTarget = rel.targetLabel.trim();

    if (!validRelTypesSet.has(rel.type)) {
      return {
        valid: false,
        error: `Extraction rejected: invalid relationship type "${rel.type}". Must be one of the supported relationship types.`,
        code: 'INVALID_RELATIONSHIP_TYPE'
      };
    }

    const confidence = rel.confidenceLabel || 'HIGH';
    if (!validConfidenceSet.has(confidence)) {
      return {
        valid: false,
        error: `Extraction rejected: invalid confidence label "${confidence}". Must be one of: ${VALID_CONFIDENCE_LABELS.join(', ')}.`,
        code: 'INVALID_CONFIDENCE_LABEL'
      };
    }

    if (!rel.evidenceSnippet || typeof rel.evidenceSnippet !== 'string' || !rel.evidenceSnippet.trim()) {
      return {
        valid: false,
        error: `Extraction rejected: relationship between "${cleanSource}" and "${cleanTarget}" is missing an evidence snippet.`,
        code: 'MISSING_EVIDENCE_SNIPPET'
      };
    }

    const cleanSnippet = rel.evidenceSnippet.trim();

    // Verify relationship evidence exists in source document
    if (!evidenceExistsInSource(sourceText, cleanSnippet)) {
      return {
        valid: false,
        error: 'Extraction rejected: one or more AI evidence snippets could not be verified against the source document.',
        code: 'UNVERIFIED_EVIDENCE'
      };
    }

    // Verify relationship references: sourceLabel and targetLabel MUST resolve to extracted entities
    const normSource = cleanSource.toLowerCase();
    const normTarget = cleanTarget.toLowerCase();

    const sourceEntityFound = entityLookup.has(normSource);
    const targetEntityFound = entityLookup.has(normTarget);

    if (!sourceEntityFound || !targetEntityFound) {
      const missingLabel = !sourceEntityFound ? cleanSource : cleanTarget;
      return {
        valid: false,
        error: `Extraction rejected: relationship references entity "${missingLabel}" which was not found in extracted entities.`,
        code: 'UNRESOLVED_RELATIONSHIP_REFERENCE'
      };
    }

    validatedRelationships.push({
      sourceLabel: cleanSource,
      targetLabel: cleanTarget,
      type: rel.type,
      confidenceLabel: confidence as ValidConfidenceLabel,
      evidenceSnippet: cleanSnippet
    });
  }

  const caseSummary = typeof rawOutput.caseSummary === 'string' && rawOutput.caseSummary.trim()
    ? rawOutput.caseSummary.trim()
    : 'Extraction completed with verified evidence references.';

  return {
    valid: true,
    data: {
      entities: validatedEntities,
      relationships: validatedRelationships,
      caseSummary
    }
  };
}

// =======================================================
// NETWORK INSIGHTS VALIDATION PIPELINE
// =======================================================

export const VALID_INSIGHT_CATEGORIES = [
  'CROSS_CLUSTER_BRIDGE',
  'COMMUNICATION_HUB',
  'FINANCIAL_CONDUIT',
  'CO_PRESENCE_ANOMALY',
  'LOGISTICAL_PIVOT',
] as const;

export const VALID_INSIGHT_PRIORITIES = [
  'HIGH_PRIORITY',
  'ELEVATED',
  'ROUTINE',
] as const;

export type ValidInsightCategory = typeof VALID_INSIGHT_CATEGORIES[number];
export type ValidInsightPriority = typeof VALID_INSIGHT_PRIORITIES[number];

export type InsightValidationResult =
  | { valid: true; data: AIInsight[] }
  | { valid: false; error: string; code?: string };

/**
 * Validates generated network intelligence insights against the trusted graph data.
 * Enforces:
 * 1. Schema integrity & strict enum values for category and priorityLevel
 * 2. All involvedEntityIds must resolve to entities in the supplied graph
 * 3. Every cited evidence snippet MUST match an existing evidence item in the supplied graph
 *    via documentId and normalized snippet text (using normalizeEvidenceText)
 * 4. Replaces model-reported evidence with validated evidence objects from the trusted graph
 * 5. Rejects the entire response if any insight fails validation
 */
export function validateInsightsResponse(
  rawInsights: any,
  trustedEntities: Entity[],
  trustedRelationships: Relationship[]
): InsightValidationResult {
  if (!Array.isArray(rawInsights)) {
    return {
      valid: false,
      error: 'Insight generation rejected: expected an array of insights.',
      code: 'INVALID_INSIGHTS_FORMAT'
    };
  }

  // Build entity ID lookup from trusted entities
  const trustedEntityIdSet = new Set<string>();
  for (const ent of trustedEntities || []) {
    if (ent && ent.id) {
      trustedEntityIdSet.add(ent.id);
    }
  }

  // Build trusted evidence index from supplied entities and relationships
  // Key format: `${normDocId}:::${normSnippet}`
  const trustedEvidenceMap = new Map<string, EvidenceItem>();

  const registerEvidence = (item?: EvidenceItem) => {
    if (!item || !item.documentId || !item.snippet) return;
    const normDocId = item.documentId.trim();
    const normSnippet = normalizeEvidenceText(item.snippet);
    if (!normDocId || !normSnippet) return;
    const key = `${normDocId}:::${normSnippet}`;
    if (!trustedEvidenceMap.has(key)) {
      trustedEvidenceMap.set(key, item);
    }
  };

  for (const ent of trustedEntities || []) {
    if (Array.isArray(ent.evidence)) {
      for (const ev of ent.evidence) {
        registerEvidence(ev);
      }
    }
  }

  for (const rel of trustedRelationships || []) {
    if (Array.isArray(rel.evidence)) {
      for (const ev of rel.evidence) {
        registerEvidence(ev);
      }
    }
  }

  const validCategoriesSet = new Set<string>(VALID_INSIGHT_CATEGORIES);
  const validPrioritiesSet = new Set<string>(VALID_INSIGHT_PRIORITIES);

  const validatedInsights: AIInsight[] = [];

  for (let i = 0; i < rawInsights.length; i++) {
    const raw = rawInsights[i];
    if (!raw || typeof raw !== 'object') {
      return {
        valid: false,
        error: `Insight generation rejected: insight at index ${i} is not a valid object.`,
        code: 'INVALID_INSIGHT_OBJECT'
      };
    }

    // A. Validate basic fields
    if (typeof raw.id !== 'string' || !raw.id.trim()) {
      return {
        valid: false,
        error: `Insight generation rejected: insight at index ${i} is missing a valid id string.`,
        code: 'INVALID_INSIGHT_ID'
      };
    }

    if (typeof raw.title !== 'string' || !raw.title.trim()) {
      return {
        valid: false,
        error: `Insight generation rejected: insight "${raw.id}" is missing a title.`,
        code: 'INVALID_INSIGHT_TITLE'
      };
    }

    if (!validCategoriesSet.has(raw.category)) {
      return {
        valid: false,
        error: `Insight generation rejected: insight "${raw.id}" has invalid category "${raw.category}".`,
        code: 'INVALID_INSIGHT_CATEGORY'
      };
    }

    if (!validPrioritiesSet.has(raw.priorityLevel)) {
      return {
        valid: false,
        error: `Insight generation rejected: insight "${raw.id}" has invalid priorityLevel "${raw.priorityLevel}".`,
        code: 'INVALID_INSIGHT_PRIORITY'
      };
    }

    // contributingSignals: non-empty array of strings
    if (
      !Array.isArray(raw.contributingSignals) ||
      raw.contributingSignals.length === 0 ||
      !raw.contributingSignals.every((s: any) => typeof s === 'string' && s.trim().length > 0)
    ) {
      return {
        valid: false,
        error: `Insight generation rejected: insight "${raw.id}" must contain a non-empty array of contributingSignals strings.`,
        code: 'INVALID_CONTRIBUTING_SIGNALS'
      };
    }

    // involvedEntityIds: array, and every involvedEntityId exists in the supplied entities
    if (!Array.isArray(raw.involvedEntityIds)) {
      return {
        valid: false,
        error: `Insight generation rejected: insight "${raw.id}" involvedEntityIds must be an array.`,
        code: 'INVALID_INVOLVED_ENTITIES_FORMAT'
      };
    }

    for (const entId of raw.involvedEntityIds) {
      if (typeof entId !== 'string' || !trustedEntityIdSet.has(entId)) {
        return {
          valid: false,
          error: `Insight generation rejected: insight "${raw.id}" references unknown involvedEntityId "${entId}".`,
          code: 'UNKNOWN_INVOLVED_ENTITY_ID'
        };
      }
    }

    // recommendedInquiry: array of strings
    if (
      !Array.isArray(raw.recommendedInquiry) ||
      !raw.recommendedInquiry.every((inq: any) => typeof inq === 'string')
    ) {
      return {
        valid: false,
        error: `Insight generation rejected: insight "${raw.id}" recommendedInquiry must be an array of strings.`,
        code: 'INVALID_RECOMMENDED_INQUIRY'
      };
    }

    // B. MOST IMPORTANT:
    // Every generated evidenceSnippets item MUST correspond to an existing evidence item
    // already present in the supplied entities or relationships.
    if (!Array.isArray(raw.evidenceSnippets) || raw.evidenceSnippets.length === 0) {
      return {
        valid: false,
        error: `Insight generation rejected: insight "${raw.id}" must contain a non-empty evidenceSnippets array.`,
        code: 'EMPTY_INSIGHT_EVIDENCE'
      };
    }

    const validatedEvidenceItems: EvidenceItem[] = [];

    for (const rawEv of raw.evidenceSnippets) {
      if (!rawEv || typeof rawEv !== 'object' || typeof rawEv.documentId !== 'string' || typeof rawEv.snippet !== 'string') {
        return {
          valid: false,
          error: 'Insight generation rejected: one or more AI evidence citations could not be verified against the case evidence.',
          code: 'MALFORMED_EVIDENCE_CITATION'
        };
      }

      const normDocId = rawEv.documentId.trim();
      const normSnippet = normalizeEvidenceText(rawEv.snippet);
      const lookupKey = `${normDocId}:::${normSnippet}`;

      const trustedMatch = trustedEvidenceMap.get(lookupKey);
      if (!trustedMatch) {
        return {
          valid: false,
          error: 'Insight generation rejected: one or more AI evidence citations could not be verified against the case evidence.',
          code: 'UNVERIFIED_INSIGHT_EVIDENCE'
        };
      }

      // D. Return the validated evidence objects from the trusted graph, rather than blindly trusting Gemini's version.
      validatedEvidenceItems.push(trustedMatch);
    }

    validatedInsights.push({
      id: raw.id.trim(),
      title: raw.title.trim(),
      category: raw.category as ValidInsightCategory,
      priorityLevel: raw.priorityLevel as ValidInsightPriority,
      contributingSignals: raw.contributingSignals.map((s: string) => s.trim()),
      involvedEntityIds: [...raw.involvedEntityIds],
      evidenceSnippets: validatedEvidenceItems,
      recommendedInquiry: raw.recommendedInquiry.map((inq: string) => inq.trim()),
      timestamp: typeof raw.timestamp === 'string' && raw.timestamp.trim() ? raw.timestamp.trim() : new Date().toISOString()
    });
  }

  return {
    valid: true,
    data: validatedInsights
  };
}

