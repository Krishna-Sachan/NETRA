export type EntityType = 
  | 'PERSON'
  | 'PHONE'
  | 'VEHICLE'
  | 'LOCATION'
  | 'ORGANIZATION'
  | 'EVENT'
  | 'TRANSACTION';

export type DocumentType = 
  | 'FIR'
  | 'CDR'
  | 'Financial'
  | 'Surveillance'
  | 'Intelligence Note';

export interface EvidenceItem {
  documentId: string;
  documentTitle?: string;
  snippet: string;
  date?: string;
  confidence?: 'HIGH' | 'MEDIUM' | 'CORROBORATED' | 'INDICATIVE' | 'REPORTED';
}

export interface Entity {
  id: string;
  type: EntityType;
  label: string;
  aliases: string[];
  evidence?: EvidenceItem[];
  metadata?: {
    cluster?: string;
    firstSeenDate?: string;
    notes?: string;
    tags?: string[];
    mergedEntityIds?: string[];
    [key: string]: any;
  };
}

export interface Relationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: string; // e.g. "communicated_with", "associated_with", "present_at", "transacted_with", "operates_vehicle", "registered_owner"
  evidence: EvidenceItem[];
  confidenceLabel: 'HIGH' | 'CORROBORATED' | 'INDICATIVE' | 'REPORTED';
}

export interface CaseDocument {
  id: string;
  title: string;
  type: DocumentType;
  date: string;
  sourceAuthority: string;
  classification: 'CONFIDENTIAL' | 'RESTRICTED' | 'OFFICIAL USE ONLY';
  content: string;
  summary: string;
  isCustom?: boolean;
  sha256Hash?: string;
  contentSource?: 'FILE_UPLOAD' | 'PASTED_TEXT' | 'SAMPLE_DATA';
}

export interface AIInsight {
  id: string;
  title: string;
  category: 'CROSS_CLUSTER_BRIDGE' | 'COMMUNICATION_HUB' | 'FINANCIAL_CONDUIT' | 'CO_PRESENCE_ANOMALY' | 'LOGISTICAL_PIVOT';
  priorityLevel: 'HIGH_PRIORITY' | 'ELEVATED' | 'ROUTINE';
  contributingSignals: string[]; // WHY this is highlighted (never a criminality score)
  evidenceSnippets: EvidenceItem[];
  involvedEntityIds: string[];
  recommendedInquiry: string[]; // Concrete law-enforcement follow-up next steps
  timestamp: string;
}

export interface NetworkGraphData {
  entities: Entity[];
  relationships: Relationship[];
}

export interface ExtractionRequest {
  documentId: string;
  documentTitle: string;
  documentType: DocumentType;
  date: string;
  text: string;
}

export interface ExtractionResponse {
  entities: {
    id?: string;
    type: EntityType;
    label: string;
    aliases: string[];
    evidenceSnippet: string;
  }[];
  relationships: {
    sourceLabel: string;
    targetLabel: string;
    type: string;
    confidenceLabel: 'HIGH' | 'CORROBORATED' | 'INDICATIVE' | 'REPORTED';
    evidenceSnippet: string;
  }[];
  caseSummary?: string;
  isDemoFallback?: boolean;
}

// ==========================================
// INTELLIGENCE LAYER: Entity Resolution Types
// ==========================================
export interface DuplicateCandidate {
  id: string;
  entityA: Entity;
  entityB: Entity;
  similarityScore: number; // 0 to 1
  similarityPercentage: number; // 0 to 100 percentage (e.g. 91 for "Similarity: 91%")
  matchingFactors: string[];
  evidenceA: EvidenceItem[];
  evidenceB: EvidenceItem[];
  originatingDocumentsA: string[];
  originatingDocumentsB: string[];
  dismissed?: boolean;
}

// ==========================================
// INTELLIGENCE LAYER: Network X-Ray Types
// ==========================================
export interface NodeXRayMetrics {
  id: string;
  label: string;
  type: EntityType;
  degree: number;
  betweenness: number;
  betweennessPercentile: number;
  communitiesConnected: number;
  documentsAppearedIn: number;
  communityId: number;
  communityName: string;
  isBridge: boolean;
  isInfluencer: boolean;
  isIsolated: boolean;
  networkImportanceReasons: string[];
}

export interface CommunityCluster {
  id: number;
  name: string;
  color: string;
  nodeIds: string[];
  dominantType: EntityType;
  summary: string;
  internalRelationshipsCount: number;
  externalRelationshipsCount: number;
  bridgeEntityIds: string[];
}

export interface NetworkXRayReport {
  metricsByNodeId: Record<string, NodeXRayMetrics>;
  influencers: NodeXRayMetrics[];
  bridges: NodeXRayMetrics[];
  clusters: CommunityCluster[];
  isolatedEntities: NodeXRayMetrics[];
  graphDensity: number;
  totalNodes: number;
  totalEdges: number;
}

// ==========================================
// INTELLIGENCE LAYER: Anomaly Radar Types
// ==========================================
export type AnomalyDetectorType = 
  | 'INTERACTION_SPIKE'
  | 'NEW_BRIDGE'
  | 'LOCATION_CONVERGENCE'
  | 'ACTIVITY_DEVIATION';

export interface AnomalySupportingData {
  window?: string;
  currentInteractions?: number;
  historicalBaseline?: number | null;
  deviationMultiplier?: number | null;
  isBaselineAvailable: boolean;
  insufficientBaselineReason?: string;
  supportingRecordsCount: number;
  sourceDocumentIds?: string[];
  details?: string;
}

export interface AnomalyFinding {
  id: string;
  title: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  category?: 'COMMUNICATION_SPIKE' | 'NEW_BRIDGE' | 'FINANCIAL_STRUCTURING' | 'CO_LOCATION' | 'BURNER_SURGE';
  detectorType: AnomalyDetectorType;
  date: string;
  involvedEntityIds: string[];
  triggerRule: string;
  explanation: string; // "Why was this detected?"
  supportingData: AnomalySupportingData;
  evidenceSnippets: EvidenceItem[];
  recommendedAction: string;
}

// ==========================================
// INTELLIGENCE LAYER: Timeline Reconstruction
// ==========================================
export interface TimelineMilestone {
  id: string;
  date: string;
  title: string;
  type: string;
  description: string;
  involvedEntityIds: string[];
  documentId?: string;
  evidenceSnippet?: string;
}

// ==========================================
// PHASE 3: Explain This Connection
// ==========================================

export interface PathHop {
  hopIndex: number;
  fromEntity: Entity;
  toEntity: Entity;
  relationship: Relationship;
  direction: 'FORWARD' | 'REVERSE';
  supportingEvidenceCount: number;
  supportingDocumentCount: number;
  evidenceDates: string[];
  evidence: EvidenceItem[];
  documents: { id: string; title?: string; type?: string }[];
}

export interface PathConfidenceBreakdown {
  scorePercentage: number;
  label: string;
  factors: {
    evidenceCoverage: {
      totalSupportingEvidence: number;
      averagePerHop: number;
      description: string;
    };
    temporalSupport: {
      datedRecordsCount: number;
      missingTemporalHops: number;
      hasTemporalData: boolean;
      description: string;
    };
    pathLength: {
      hopCount: number;
      description: string;
    };
    evidenceRecency: {
      mostRecentDate?: string;
      hasRecencyData: boolean;
      description: string;
    };
  };
  formulaDescription: string;
  disclaimer: string;
}

export interface ExplainConnectionResult {
  found: boolean;
  sourceEntity?: Entity;
  targetEntity?: Entity;
  hops: PathHop[];
  pathEntities: Entity[];
  pathRelationships: Relationship[];
  confidence?: PathConfidenceBreakdown;
  message?: string;
}

// ==========================================
// PHASE 3: Grounded Investigator Copilot
// ==========================================

export interface TimelineFilter {
  startDate: string | null;
  endDate: string | null;
}

export type CopilotActionType = 
  | 'FILTER_TIMELINE' 
  | 'FILTER_GRAPH' 
  | 'FOCUS_ENTITY' 
  | 'SHOW_CONNECTION' 
  | 'SHOW_EVIDENCE';

export interface CopilotAction {
  type: CopilotActionType;
  payload: {
    entityId?: string;
    entityIds?: string[];
    sourceEntityId?: string;
    targetEntityId?: string;
    startDate?: string;
    endDate?: string;
    documentId?: string;
    clusterId?: number | string;
    relationshipId?: string;
    [key: string]: any;
  };
  status?: 'PENDING' | 'APPLIED' | 'REJECTED';
  rejectionReason?: string;
}

export interface EvidenceRef {
  ownerType: 'ENTITY' | 'RELATIONSHIP';
  ownerId: string;
  documentId: string;
  snippet: string;
}

export interface CopilotCitation {
  type: 'ENTITY' | 'RELATIONSHIP' | 'DOCUMENT' | 'EVIDENCE';
  id: string;
  label?: string;
  documentId?: string;
  snippet?: string;
  ownerType?: 'ENTITY' | 'RELATIONSHIP';
  ownerId?: string;
  ownerLabel?: string;
  verified: boolean;
}

export interface CopilotMessage {
  id: string;
  sender: 'USER' | 'COPILOT';
  text: string;
  timestamp: string;
  citations?: CopilotCitation[];
  actions?: CopilotAction[];
  isGrounded?: boolean;
  isLocalFallback?: boolean;
  fallbackReason?: string;
  validationWarnings?: string[];
  connectionPath?: ExplainConnectionResult;
}

export interface CopilotRequest {
  query: string;
  activeEntityId?: string | null;
  activeDocumentId?: string | null;
  selectedEntityIds?: string[];
  entities: Entity[];
  relationships: Relationship[];
  documents: CaseDocument[];
  networkContext?: {
    topInfluencers?: { id: string; label: string; betweenness: number; degree: number }[];
    communities?: { clusterId: number; label: string; memberCount: number; members: string[] }[];
  };
}

export interface CopilotResponse {
  answer: string;
  entityIds: string[];
  relationshipIds: string[];
  documentIds: string[];
  evidenceRefs?: EvidenceRef[];
  evidenceSnippets?: { documentId: string; snippet: string }[];
  actions: CopilotAction[];
  validationErrors?: string[];
  isLocalFallback?: boolean;
  fallbackReason?: string;
}

// ==========================================
// PHASE 4: Government-Readiness Foundation
// ==========================================

export type UserRole = 'ADMIN' | 'SENIOR_INVESTIGATOR' | 'INVESTIGATOR' | 'ANALYST';

export type AuditAction =
  | 'OPENED_ENTITY'
  | 'OPENED_DOCUMENT'
  | 'VIEWED_EVIDENCE'
  | 'MERGED_ENTITIES'
  | 'KEPT_SEPARATE'
  | 'RAN_XRAY'
  | 'RAN_EXPLAIN_CONNECTION'
  | 'RAN_COPILOT_QUERY'
  | 'APPLIED_GRAPH_FILTER'
  | 'APPLIED_TIMELINE_FILTER'
  | 'GENERATED_REPORT'
  | 'EXPORTED_REPORT'
  | 'LOADED_CASE'
  | 'RESET_CASE'
  | 'ROLE_CHANGED'
  | 'CASE_LOADED'
  | 'REPORT_GENERATED';

export interface AuditEvent {
  id: string;
  timestamp: string;
  role: UserRole;
  action: AuditAction;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, string>;
}

export interface SampleCase {
  id: string;
  name: string;
  description: string;
  documents: CaseDocument[];
  entities: Entity[];
  relationships: Relationship[];
  insights: AIInsight[];
}

