import { 
  ExtractionRequest, 
  ExtractionResponse, 
  Entity, 
  Relationship, 
  CaseDocument, 
  AIInsight,
  EntityType,
  CopilotRequest,
  CopilotResponse,
  CopilotCitation,
  CopilotAction,
  EvidenceRef
} from '../types';
import { SYNTHETIC_PREPARSED_DOCS } from '../data/syntheticFallbacks';
import { validateExtractionResponse } from '../utils/evidenceValidation';
import { validateCopilotResponse } from '../utils/copilotValidation';
import { findConnectionPath } from './pathService';

/**
 * Service module for all Gemini AI operations.
 * All UI components MUST call Gemini capabilities through this module.
 */

/**
 * Resolves a calendar-aware month boundary (handling leap-year Feb, 30-day months, etc.).
 * Does NOT default to 2026 unless unambiguous case data or explicit query year provides it.
 */
export function resolveCalendarMonth(
  monthName: string,
  queryYear?: string,
  caseDates: string[] = []
): { startDate: string; endDate: string } | { error: string } {
  const monthMap: Record<string, number> = {
    january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
    july: 7, august: 8, september: 9, october: 10, november: 11, december: 12
  };
  const mNum = monthMap[monthName.toLowerCase()];
  if (!mNum) {
    return { error: `Unrecognized month name: "${monthName}"` };
  }

  let year: number | null = null;
  if (queryYear && /^\d{4}$/.test(queryYear)) {
    year = parseInt(queryYear, 10);
  } else {
    // Infer year only if current case data provides unambiguous temporal context
    const monthPrefix = `-${String(mNum).padStart(2, '0')}-`;
    const validDates = caseDates.filter(d => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d));
    const matchingYears = Array.from(
      new Set(validDates.filter(d => d.includes(monthPrefix)).map(d => d.slice(0, 4)))
    );

    if (matchingYears.length === 1) {
      year = parseInt(matchingYears[0], 10);
    } else {
      const allYears = Array.from(new Set(validDates.map(d => d.slice(0, 4))));
      if (allYears.length === 1) {
        year = parseInt(allYears[0], 10);
      } else {
        return { error: "Not enough temporal information in this case's data to determine the requested year." };
      }
    }
  }

  const mStr = String(mNum).padStart(2, '0');
  const startDate = `${year}-${mStr}-01`;
  const lastDay = new Date(Date.UTC(year, mNum, 0)).getUTCDate();
  const endDate = `${year}-${mStr}-${String(lastDay).padStart(2, '0')}`;

  return { startDate, endDate };
}

/**
 * Extracts entities and relationships from case document text using Gemini.
 * Strictly verifies AI-extracted evidence against source text before returning.
 */
import { extractEntitiesFromCustomText } from './customTextExtractor';

export async function extractEntitiesAndRelationships(
  params: ExtractionRequest
): Promise<ExtractionResponse> {
  try {
    const res = await fetch('/api/extract-entities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    // If backend returns success and valid validated data
    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data.entities)) {
        return {
          ...json.data,
          isDemoFallback: false
        };
      }
    }

    const errData = await res.json().catch(() => ({}));

    if (res.status === 422 || res.status === 400) {
      throw new Error(
        errData.error || 'Extraction rejected: one or more AI evidence snippets could not be verified against the source document.'
      );
    }

    // Baseline fallback for pre-parsed demo docs
    if (SYNTHETIC_PREPARSED_DOCS[params.documentId]) {
      const fallbackRaw = SYNTHETIC_PREPARSED_DOCS[params.documentId];
      const validation = validateExtractionResponse(params.text, fallbackRaw);
      if (validation.valid !== false && validation.data) {
        return {
          ...validation.data,
          isDemoFallback: true
        };
      }
    }

    // Client-side extraction for custom uploaded files
    return extractEntitiesFromCustomText(params.text);
  } catch (error: any) {
    if (error.message && error.message.includes('Extraction rejected')) {
      throw error;
    }

    if (SYNTHETIC_PREPARSED_DOCS[params.documentId]) {
      const fallbackRaw = SYNTHETIC_PREPARSED_DOCS[params.documentId];
      const validation = validateExtractionResponse(params.text, fallbackRaw);
      if (validation.valid !== false && validation.data) {
        return {
          ...validation.data,
          isDemoFallback: true
        };
      }
    }

    // Always extract entities & relationships from custom text
    return extractEntitiesFromCustomText(params.text);
  }
}

/**
 * Generates high-level multi-signal network intelligence insights
 */
export async function generateNetworkInsights(params: {
  entities: Entity[];
  relationships: Relationship[];
  documents: CaseDocument[];
}): Promise<AIInsight[]> {
  const res = await fetch('/api/generate-insights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate network insights from Gemini');
  }

  const json = await res.json();
  return json.insights || [];
}

/**
 * Generates focused decision-support inquiry expansion for an entity
 */
export async function expandEntityInvestigation(params: {
  entity: Entity;
  connectedEntities: Entity[];
  relationships: Relationship[];
}): Promise<{
  actionableLeads: string[];
  evidentiaryGaps: string[];
  contributingSignals: string[];
}> {
  const res = await fetch('/api/expand-investigation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to expand entity investigation');
  }

  const json = await res.json();
  return json.data;
}

/**
 * Submits an investigative query to Grounded Investigator Copilot.
 * All responses are strictly verified against the current case state.
 */
export async function askInvestigatorCopilot(
  request: CopilotRequest
): Promise<{
  data: CopilotResponse;
  citations: CopilotCitation[];
  actions: CopilotAction[];
  warnings?: string[];
  connectionPath?: any;
}> {
  // Check if query is asking to connect two entities
  let precomputedConnection: any = null;
  try {
    if (request.selectedEntityIds && request.selectedEntityIds.length === 2) {
      precomputedConnection = findConnectionPath(
        request.selectedEntityIds[0],
        request.selectedEntityIds[1],
        request.entities,
        request.relationships,
        request.documents
      );
    }
  } catch (pathErr) {
    console.warn('Precomputed path calculation failed:', pathErr);
  }

  let res: Response;
  try {
    res = await fetch('/api/copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: request.query,
        entities: request.entities,
        relationships: request.relationships,
        documents: request.documents,
        networkContext: request.networkContext,
        connectionResult: precomputedConnection
      }),
    });
  } catch (networkErr: any) {
    // Genuine network connectivity / fetch failure (offline, connection refused, DNS error, etc.)
    console.warn('Copilot network fetch failure, invoking local grounded fallback:', networkErr?.message || networkErr);
    return generateLocalGroundedCopilotResponse(
      request,
      precomputedConnection,
      'Network connection unavailable. This response was generated by deterministic case-data rules only.'
    );
  }

  // 1. Success response
  if (res.ok) {
    let json: any;
    try {
      json = await res.json();
    } catch (parseErr: any) {
      console.error('Copilot malformed server response:', parseErr);
      throw new Error('Copilot service error. The request was not completed.');
    }

    if (!json || typeof json !== 'object' || !json.data) {
      console.error('Copilot response missing data payload:', json);
      throw new Error('Copilot service error. The request was not completed.');
    }

    return {
      data: json.data,
      citations: json.citations || [],
      actions: json.actions || [],
      warnings: json.warnings || [],
      connectionPath: precomputedConnection
    };
  }

  // 2. Explicit 503 / 502 / 504: Gemini service is genuinely unavailable -> Fallback is allowed
  if (res.status === 503 || res.status === 502 || res.status === 504) {
    console.warn(`Copilot upstream service unavailable (HTTP ${res.status}), invoking local grounded fallback.`);
    return generateLocalGroundedCopilotResponse(
      request, 
      precomputedConnection,
      'Gemini was unavailable. This response was generated by deterministic case-data rules only.'
    );
  }

  // 3. HTTP 400 / 422: Server-side validation or grounding rejection MUST throw and MUST NOT fallback
  if (res.status === 400 || res.status === 422) {
    const err = await res.json().catch(() => ({}));
    const message = err.error || 'COPILOT RESPONSE REJECTED — GENERATED OUTPUT FAILED CASE-GROUNDING VALIDATION.';
    console.warn(`Copilot validation rejection (HTTP ${res.status}):`, message);
    throw new Error(message);
  }

  // 4. HTTP 500: Unexpected internal server error MUST throw and MUST NOT fallback
  if (res.status === 500) {
    const err = await res.json().catch(() => ({}));
    console.error('Copilot internal server error (HTTP 500):', err);
    throw new Error('Copilot service error. The request was not completed.');
  }

  // 5. HTTP 401 / 403: Authorization errors MUST throw and MUST NOT fallback
  if (res.status === 401 || res.status === 403) {
    const err = await res.json().catch(() => ({}));
    console.error(`Copilot authorization error (HTTP ${res.status}):`, err);
    throw new Error('Copilot service error. The request was not completed.');
  }

  // 6. HTTP 404 or any other unexpected status code MUST throw and MUST NOT fallback
  const err = await res.json().catch(() => ({}));
  console.error(`Copilot unexpected HTTP status ${res.status}:`, err);
  throw new Error('Copilot service error. The request was not completed.');
}

/**
 * Deterministic, strictly case-grounded fallback response generator.
 * Used ONLY when Gemini API is unconfigured or unreachable.
 * Never guesses or fills missing facts from outside the case.
 */
export function generateLocalGroundedCopilotResponse(
  request: CopilotRequest,
  precomputedPath?: any,
  fallbackReason: string = 'Gemini was unavailable. This response was generated by deterministic case-data rules only.'
): {
  data: CopilotResponse;
  citations: CopilotCitation[];
  actions: CopilotAction[];
  warnings?: string[];
  connectionPath?: any;
} {
  const { query, entities, relationships, documents, networkContext } = request;
  const qLower = query.toLowerCase().trim();

  // Collect all available dates from the active case data
  const caseDates = [
    ...documents.map(d => d.date),
    ...entities.flatMap(e => e.evidence?.map(ev => ev.date) || []),
    ...relationships.flatMap(r => r.evidence?.map(ev => ev.date) || [])
  ].filter((d): d is string => typeof d === 'string');

  // Find any entities referenced by label or alias in the query
  const matchedEntities: Entity[] = [];
  entities.forEach(ent => {
    const labelMatch = qLower.includes(ent.label.toLowerCase());
    const aliasMatch = ent.aliases.some(a => qLower.includes(a.toLowerCase()));
    const idMatch = qLower.includes(ent.id.toLowerCase());
    if (labelMatch || aliasMatch || idMatch) {
      matchedEntities.push(ent);
    }
  });

  // If activeEntityId was passed and not already included
  if (request.activeEntityId && !matchedEntities.some(e => e.id === request.activeEntityId)) {
    const active = entities.find(e => e.id === request.activeEntityId);
    if (active) matchedEntities.push(active);
  }

  // 1. QUESTION TYPE: Criminal role / Guilt inquiry
  const isRoleOrGuiltInquiry = /criminal role|guilt|guilty|is a criminal|committed|offen[sc]e|liability/i.test(qLower);
  if (isRoleOrGuiltInquiry && matchedEntities.length > 0) {
    const target = matchedEntities[0];
    const entRels = relationships.filter(r => r.sourceId === target.id || r.targetId === target.id);
    const answer = `[LOCAL GROUNDED FALLBACK]\nNETRA's current case data does not establish a criminal role. The available network analysis shows that entity "${target.label}" (${target.type}) is connected via ${entRels.length} documented relationship(s) across the investigative graph. All findings remain subject to formal evidentiary substantiation under law.`;
    
    const evidenceRefs: EvidenceRef[] = (target.evidence || []).map(ev => ({
      ownerType: 'ENTITY' as const,
      ownerId: target.id,
      documentId: ev.documentId,
      snippet: ev.snippet
    }));

    const raw = {
      answer,
      entityIds: [target.id],
      relationshipIds: entRels.map(r => r.id),
      documentIds: target.evidence?.map(e => e.documentId) || [],
      evidenceRefs,
      isLocalFallback: true,
      fallbackReason,
      actions: [{ type: 'FOCUS_ENTITY' as const, payload: { entityId: target.id } }]
    };
    const validated = validateCopilotResponse(raw, entities, relationships, documents);
    return {
      data: { ...validated.data, isLocalFallback: true, fallbackReason },
      citations: validated.resolvedCitations,
      actions: validated.validatedActions,
      warnings: validated.validationWarnings
    };
  }

  // 2. QUESTION TYPE: Connection inquiry (between 2 entities)
  const isConnectionInquiry = /connect|connection|linked|path|between/i.test(qLower) || matchedEntities.length >= 2 || (request.selectedEntityIds && request.selectedEntityIds.length === 2);
  if (isConnectionInquiry) {
    let ent1: Entity | undefined;
    let ent2: Entity | undefined;

    if (request.selectedEntityIds && request.selectedEntityIds.length === 2) {
      ent1 = entities.find(e => e.id === request.selectedEntityIds![0]);
      ent2 = entities.find(e => e.id === request.selectedEntityIds![1]);
    } else if (matchedEntities.length >= 2) {
      ent1 = matchedEntities[0];
      ent2 = matchedEntities[1];
    }

    if (ent1 && ent2) {
      const pathResult = precomputedPath || findConnectionPath(ent1.id, ent2.id, entities, relationships, documents);
      if (pathResult.found && pathResult.hops.length > 0) {
        const hopDescs = pathResult.hops.map((h: any) => 
          `${h.fromEntity.label} ↔ ${h.toEntity.label} [${h.relationship.type}]`
        ).join(' → ');

        const answer = `[LOCAL GROUNDED FALLBACK]\nFound verified graph connection between "${ent1.label}" and "${ent2.label}" spanning ${pathResult.hops.length} relationship hop(s):\n\n${hopDescs}\n\nPath Confidence in evidentiary support: ${pathResult.confidence?.scorePercentage}%. Every hop is substantiated by source case records.`;
        
        const evidenceRefs: EvidenceRef[] = pathResult.hops.flatMap((h: any) => 
          (h.evidence || []).map((ev: any) => ({
            ownerType: 'RELATIONSHIP' as const,
            ownerId: h.relationship.id,
            documentId: ev.documentId,
            snippet: ev.snippet
          }))
        );

        const raw = {
          answer,
          entityIds: pathResult.pathEntities.map((e: any) => e.id),
          relationshipIds: pathResult.pathRelationships.map((r: any) => r.id),
          documentIds: Array.from(new Set(pathResult.hops.flatMap((h: any) => h.documents.map((d: any) => d.id)))),
          evidenceRefs,
          isLocalFallback: true,
          fallbackReason,
          actions: [{
            type: 'SHOW_CONNECTION' as const,
            payload: { sourceEntityId: ent1.id, targetEntityId: ent2.id }
          }]
        };

        const validated = validateCopilotResponse(raw, entities, relationships, documents);
        return {
          data: { ...validated.data, isLocalFallback: true, fallbackReason },
          citations: validated.resolvedCitations,
          actions: validated.validatedActions,
          warnings: validated.validationWarnings,
          connectionPath: pathResult
        };
      } else {
        const raw = {
          answer: `[LOCAL GROUNDED FALLBACK]\nNO SUPPORTED CONNECTION FOUND IN THIS CASE DATA.`,
          entityIds: [ent1.id, ent2.id],
          relationshipIds: [],
          documentIds: [],
          evidenceRefs: [],
          isLocalFallback: true,
          fallbackReason,
          actions: []
        };
        const validated = validateCopilotResponse(raw, entities, relationships, documents);
        return {
          data: { ...validated.data, isLocalFallback: true, fallbackReason },
          citations: validated.resolvedCitations,
          actions: validated.validatedActions,
          warnings: validated.validationWarnings,
          connectionPath: pathResult
        };
      }
    }
  }

  // 3. QUESTION TYPE: Temporal / Timeline inquiry
  const isTemporalInquiry = /january|february|march|april|may|june|july|august|september|october|november|december|events|timeline|during|date/i.test(qLower);
  if (isTemporalInquiry) {
    // Extract target entity if present
    const target = matchedEntities[0] || (request.activeEntityId ? entities.find(e => e.id === request.activeEntityId) : null);
    
    const monthMatch = qLower.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/i);
    const yearMatch = qLower.match(/\b(\d{4})\b/);

    if (monthMatch) {
      const monthResult = resolveCalendarMonth(
        monthMatch[1],
        yearMatch ? yearMatch[1] : undefined,
        caseDates
      );

      if ('error' in monthResult) {
        const raw = {
          answer: `[LOCAL GROUNDED FALLBACK]\n${monthResult.error}`,
          entityIds: target ? [target.id] : [],
          relationshipIds: [],
          documentIds: [],
          evidenceRefs: [],
          isLocalFallback: true,
          fallbackReason,
          actions: []
        };
        const validated = validateCopilotResponse(raw, entities, relationships, documents);
        return {
          data: { ...validated.data, isLocalFallback: true, fallbackReason },
          citations: validated.resolvedCitations,
          actions: validated.validatedActions,
          warnings: validated.validationWarnings
        };
      }

      const { startDate, endDate } = monthResult;

      // Filter evidence records matching this range across BOTH Entity evidence AND Relationship evidence
      const matchingEvidenceRefs: EvidenceRef[] = [];
      const matchingRelIds = new Set<string>();
      const matchingDocIds = new Set<string>();

      if (target) {
        // A. Target entity evidence
        (target.evidence || []).forEach(ev => {
          if (ev.date && ev.date >= startDate && ev.date <= endDate) {
            matchingEvidenceRefs.push({
              ownerType: 'ENTITY',
              ownerId: target.id,
              documentId: ev.documentId,
              snippet: ev.snippet
            });
            matchingDocIds.add(ev.documentId);
          }
        });

        // B. Target relationship evidence (events involving target via relationships)
        const targetRels = relationships.filter(r => r.sourceId === target.id || r.targetId === target.id);
        targetRels.forEach(r => {
          let hasMatch = false;
          (r.evidence || []).forEach(ev => {
            if (ev.date && ev.date >= startDate && ev.date <= endDate) {
              matchingEvidenceRefs.push({
                ownerType: 'RELATIONSHIP',
                ownerId: r.id,
                documentId: ev.documentId,
                snippet: ev.snippet
              });
              matchingDocIds.add(ev.documentId);
              hasMatch = true;
            }
          });
          if (hasMatch) {
            matchingRelIds.add(r.id);
          }
        });
      } else {
        // Case-wide date filter: collect all evidence in date range
        entities.forEach(e => {
          (e.evidence || []).forEach(ev => {
            if (ev.date && ev.date >= startDate && ev.date <= endDate) {
              matchingEvidenceRefs.push({
                ownerType: 'ENTITY',
                ownerId: e.id,
                documentId: ev.documentId,
                snippet: ev.snippet
              });
              matchingDocIds.add(ev.documentId);
            }
          });
        });
        relationships.forEach(r => {
          let hasMatch = false;
          (r.evidence || []).forEach(ev => {
            if (ev.date && ev.date >= startDate && ev.date <= endDate) {
              matchingEvidenceRefs.push({
                ownerType: 'RELATIONSHIP',
                ownerId: r.id,
                documentId: ev.documentId,
                snippet: ev.snippet
              });
              matchingDocIds.add(ev.documentId);
              hasMatch = true;
            }
          });
          if (hasMatch) {
            matchingRelIds.add(r.id);
          }
        });
      }

      const answer = target 
        ? `[LOCAL GROUNDED FALLBACK]\nFound ${matchingEvidenceRefs.length} relevant record(s) involving "${target.label}" between ${startDate} and ${endDate}. Applying timeline filter to case graph.`
        : `[LOCAL GROUNDED FALLBACK]\nApplying timeline filter for date range ${startDate} to ${endDate}.`;

      const raw = {
        answer,
        entityIds: target ? [target.id] : [],
        relationshipIds: Array.from(matchingRelIds),
        documentIds: Array.from(matchingDocIds),
        evidenceRefs: matchingEvidenceRefs,
        isLocalFallback: true,
        fallbackReason,
        actions: [{
          type: 'FILTER_TIMELINE' as const,
          payload: {
            entityId: target?.id,
            startDate,
            endDate
          }
        }]
      };
      const validated = validateCopilotResponse(raw, entities, relationships, documents);
      return {
        data: { ...validated.data, isLocalFallback: true, fallbackReason },
        citations: validated.resolvedCitations,
        actions: validated.validatedActions,
        warnings: validated.validationWarnings
      };
    }
  }

  // 4. QUESTION TYPE: Importance inquiry
  const isImportanceInquiry = /why is .* important|importance of|centrality|influencer|bridge/i.test(qLower);
  if (isImportanceInquiry && matchedEntities.length > 0) {
    const target = matchedEntities[0];
    const entRels = relationships.filter(r => r.sourceId === target.id || r.targetId === target.id);
    const influencer = networkContext?.topInfluencers?.find((i: any) => i.id === target.id);

    const betweennessDesc = influencer?.betweenness 
      ? `betweenness centrality of ${influencer.betweenness.toFixed(4)}`
      : 'high graph betweenness';

    const answer = `[LOCAL GROUNDED FALLBACK]\nEntity "${target.label}" (${target.type}) exhibits structural importance within the crime network based on ${betweennessDesc} and a degree of ${entRels.length} direct relationship links. Ingested records show presence across ${target.evidence?.length || 1} evidentiary citation(s).`;

    const evidenceRefs: EvidenceRef[] = (target.evidence || []).map(ev => ({
      ownerType: 'ENTITY' as const,
      ownerId: target.id,
      documentId: ev.documentId,
      snippet: ev.snippet
    }));

    const raw = {
      answer,
      entityIds: [target.id],
      relationshipIds: entRels.map(r => r.id),
      documentIds: target.evidence?.map(e => e.documentId) || [],
      evidenceRefs,
      isLocalFallback: true,
      fallbackReason,
      actions: [{ type: 'FOCUS_ENTITY' as const, payload: { entityId: target.id } }]
    };
    const validated = validateCopilotResponse(raw, entities, relationships, documents);
    return {
      data: { ...validated.data, isLocalFallback: true, fallbackReason },
      citations: validated.resolvedCitations,
      actions: validated.validatedActions,
      warnings: validated.validationWarnings
    };
  }

  // 5. If specific entity mentioned, provide factual case summary
  if (matchedEntities.length > 0) {
    const target = matchedEntities[0];
    const entRels = relationships.filter(r => r.sourceId === target.id || r.targetId === target.id);
    const answer = `[LOCAL GROUNDED FALLBACK]\nCase records document entity "${target.label}" (${target.type}, ID: ${target.id}) with ${entRels.length} active relationship connection(s) and ${target.evidence?.length || 0} supporting evidence item(s).`;

    const evidenceRefs: EvidenceRef[] = (target.evidence || []).map(ev => ({
      ownerType: 'ENTITY' as const,
      ownerId: target.id,
      documentId: ev.documentId,
      snippet: ev.snippet
    }));

    const raw = {
      answer,
      entityIds: [target.id],
      relationshipIds: entRels.map(r => r.id),
      documentIds: target.evidence?.map(e => e.documentId) || [],
      evidenceRefs,
      isLocalFallback: true,
      fallbackReason,
      actions: [{ type: 'FOCUS_ENTITY' as const, payload: { entityId: target.id } }]
    };
    const validated = validateCopilotResponse(raw, entities, relationships, documents);
    return {
      data: { ...validated.data, isLocalFallback: true, fallbackReason },
      citations: validated.resolvedCitations,
      actions: validated.validatedActions,
      warnings: validated.validationWarnings
    };
  }

  // 6. DEFAULT: Information not found in active case data
  const raw = {
    answer: `[LOCAL GROUNDED FALLBACK]\nNot found in this case's data.`,
    entityIds: [],
    relationshipIds: [],
    documentIds: [],
    evidenceRefs: [],
    isLocalFallback: true,
    fallbackReason,
    actions: []
  };
  const validated = validateCopilotResponse(raw, entities, relationships, documents);
  return {
    data: { ...validated.data, isLocalFallback: true, fallbackReason },
    citations: validated.resolvedCitations,
    actions: validated.validatedActions,
    warnings: validated.validationWarnings
  };
}

