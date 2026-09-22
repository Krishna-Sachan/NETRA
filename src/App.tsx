/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { CaseFilesPane } from './components/CaseFilesPane';
import { CrimeNetworkPane } from './components/CrimeNetworkPane';
import { AIInsightsPane } from './components/AIInsightsPane';
import { NetworkXRayPane } from './components/NetworkXRayPane';
import { EntityResolutionPane } from './components/EntityResolutionPane';
import { DuplicateReviewModal } from './components/DuplicateReviewModal';
import { AnomalyRadarPane } from './components/AnomalyRadarPane';
import { InvestigatorCopilotPane } from './components/InvestigatorCopilotPane';
import { ExplainConnectionPane } from './components/ExplainConnectionPane';
import { EvidenceDrawer } from './components/EvidenceDrawer';
import { IngestModal } from './components/IngestModal';
import { DocumentModal } from './components/DocumentModal';
import { MethodologyModal } from './components/MethodologyModal';
import { SystemGuideModal } from './components/SystemGuideModal';
import { InfoTooltip } from './components/InfoTooltip';
import { SAMPLE_DOCUMENTS } from './data/sampleDocuments';
import { INITIAL_ENTITIES, INITIAL_RELATIONSHIPS, INITIAL_AI_INSIGHTS } from './data/initialGraph';
import { 
  Entity, 
  Relationship, 
  CaseDocument, 
  AIInsight, 
  EntityType,
  DuplicateCandidate,
  AnomalyFinding,
  NetworkXRayReport,
  SampleCase,
  UserRole,
  AuditEvent
} from './types';
import { extractEntitiesAndRelationships, generateNetworkInsights } from './services/gemini';
import { analyzeNetworkXRay } from './services/networkAnalysis';
import { findDuplicateEntities, mergeEntities } from './services/entityResolution';
import { ALL_ROLES, ROLE_DISPLAY_LABELS, canMerge } from './services/accessPolicy';
import { detectNetworkAnomalies } from './services/anomalyDetection';
import { generateEntityId, generateRelationshipId, generateUUID } from './services/idService';
import { recordAuditEvent, getAuditEvents } from './services/auditService';
import { CaseIntelligenceReport, generateCaseReport } from './services/reportService';
import { SAMPLE_CASES } from './data/sampleCases';
import { LandingPage } from './components/LandingPage';
import { AnalyzeCaseOverlay, DEFAULT_ANALYSIS_STAGES, AnalysisStage } from './components/AnalyzeCaseOverlay';
import { AuditLogPane } from './components/AuditLogPane';
import { CaseReportPane } from './components/CaseReportPane';
import { GlobalCursorMotion } from './components/GlobalCursorMotion';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Activity, 
  GitMerge, 
  Radar, 
  Share2,
  Bot,
  Route,
  PanelLeft,
  PanelRight,
  Search
} from 'lucide-react';

export default function App() {
  // App Phase 4 state
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [currentRole, setCurrentRole] = useState<UserRole>('ADMIN');
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);
  const [isReportPaneOpen, setIsReportPaneOpen] = useState(false);
  const [reportData, setReportData] = useState<CaseIntelligenceReport | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(getAuditEvents());
  const [isAnalyzingCase, setIsAnalyzingCase] = useState(false);
  const [analysisStages, setAnalysisStages] = useState<AnalysisStage[]>(DEFAULT_ANALYSIS_STAGES);
  const [pendingCaseLoad, setPendingCaseLoad] = useState<SampleCase | null>(null);

  // Core state for documents, entities, relationships, insights
  const [documents, setDocuments] = useState<CaseDocument[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);

  // Right pane tab management: Explain, Insights, X-Ray, Resolve, Radar
  const [rightTab, setRightTab] = useState<'COPILOT' | 'EXPLAIN' | 'INSIGHTS' | 'XRAY' | 'DUPLICATES' | 'ANOMALIES'>('EXPLAIN');
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [xrayMode, setXrayMode] = useState<'INFLUENCERS' | 'BRIDGES' | 'CLUSTERS' | 'ISOLATED'>('INFLUENCERS');

  // Explain Connection pre-selected entity IDs
  const [explainSourceId, setExplainSourceId] = useState<string | null>(null);
  const [explainTargetId, setExplainTargetId] = useState<string | null>(null);

  // Entity Resolution state
  const [dismissedDuplicatePairIds, setDismissedDuplicatePairIds] = useState<string[]>([]);
  const [reviewCandidate, setReviewCandidate] = useState<DuplicateCandidate | null>(null);

  // Chronological timeline filter cutoff and date-range
  const [currentCutoffDate, setCurrentCutoffDate] = useState<string | null>(null);
  const [timelineRange, setTimelineRange] = useState<{ startDate: string | null; endDate: string | null } | null>(null);

  // Selection states
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [selectedRelationshipId, setSelectedRelationshipId] = useState<string | null>(null);
  const [selectedDocForReading, setSelectedDocForReading] = useState<CaseDocument | null>(null);
  const [highlightedEntityIds, setHighlightedEntityIds] = useState<string[]>([]);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  // Modals
  const [isIngestOpen, setIsIngestOpen] = useState(false);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);

  // Loading flags & Toasts
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Phase 4 Handlers
  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    recordAuditEvent({
      action: 'ROLE_CHANGED',
      role,
      metadata: { newRole: role }
    });
    setAuditEvents(getAuditEvents());
    showToast(`Role switched to ${role}. Access policies applied.`, 'info');
  };

  const handleLoadCase = (caseData: SampleCase) => {
    setPendingCaseLoad(caseData);
    setIsAnalyzingCase(true);
    setAnalysisStages(DEFAULT_ANALYSIS_STAGES.map(s => ({ ...s, status: 'PENDING' } as AnalysisStage)));
  };

  const handleAnalysisComplete = () => {
    setIsAnalyzingCase(false);
    setAnalysisStages(DEFAULT_ANALYSIS_STAGES.map(s => ({ ...s, status: 'PENDING' } as AnalysisStage)));
    if (pendingCaseLoad) {
      let caseToLoad = pendingCaseLoad;
      // If it's the western corridor default case, load it from initialGraph/sampleDocuments
      if (pendingCaseLoad.id === 'CASE-WESTERN-CORRIDOR') {
        caseToLoad = {
          ...pendingCaseLoad,
          documents: SAMPLE_DOCUMENTS,
          entities: INITIAL_ENTITIES,
          relationships: INITIAL_RELATIONSHIPS,
          insights: INITIAL_AI_INSIGHTS,
        };
      }
      setActiveCaseId(caseToLoad.id);
      setDocuments(caseToLoad.documents);
      setEntities(caseToLoad.entities);
      setRelationships(caseToLoad.relationships);
      setInsights(caseToLoad.insights);
      setRightTab('COPILOT');
      setDismissedDuplicatePairIds([]);
      setCurrentCutoffDate(null);
      setTimelineRange(null);
      setSelectedEntityId(null);
      setSelectedRelationshipId(null);
      setHighlightedEntityIds([]);
      
      recordAuditEvent({
        action: 'CASE_LOADED',
        role: currentRole,
        targetId: caseToLoad.id,
        targetType: 'CASE',
        metadata: { caseName: caseToLoad.name }
      });
      setAuditEvents(getAuditEvents());
      setPendingCaseLoad(null);
    }
  };


  // Selected Entity and Relationship objects
  const selectedEntity = entities.find(e => e.id === selectedEntityId) || null;
  const selectedRelationship = relationships.find(r => r.id === selectedRelationshipId) || null;

  // Intelligence Layer Computations (Graphology X-Ray, Fuzzy Deduplication, Anomaly Detection)
  const networkReport: NetworkXRayReport = useMemo(() => {
    return analyzeNetworkXRay(entities, relationships);
  }, [entities, relationships]);

  const duplicateCandidates: DuplicateCandidate[] = useMemo(() => {
    return findDuplicateEntities(entities, dismissedDuplicatePairIds);
  }, [entities, dismissedDuplicatePairIds]);

  const anomalies: AnomalyFinding[] = useMemo(() => {
    return detectNetworkAnomalies(entities, relationships);
  }, [entities, relationships]);

  const handleGenerateReport = () => {
    const report = generateCaseReport({
      entities,
      relationships,
      documents,
      insights,
      anomalies,
      networkReport,
      role: currentRole
    });
    setReportData(report);
    setIsReportPaneOpen(true);
    recordAuditEvent({
      action: 'REPORT_GENERATED',
      role: currentRole,
      metadata: { entitiesCount: String(entities.length) }
    });
    setAuditEvents(getAuditEvents());
  };

  // Color mapping when in Clusters mode
  const communityColorMap = useMemo(() => {
    if (rightTab !== 'XRAY' || xrayMode !== 'CLUSTERS') return {};
    const map: Record<string, string> = {};
    networkReport.clusters.forEach(cluster => {
      cluster.nodeIds.forEach(nodeId => {
        map[nodeId] = cluster.color;
      });
    });
    return map;
  }, [networkReport, rightTab, xrayMode]);

  // Simulate Analysis Pipeline Progress
  useEffect(() => {
    if (!isAnalyzingCase) return;

    let currentStageIndex = 0;
    let timer: ReturnType<typeof setTimeout>;
    const stages = [...analysisStages];

    const transitionStage = () => {
      if (currentStageIndex > stages.length) return;
      
      // Complete previous stage if any
      if (currentStageIndex > 0 && currentStageIndex <= stages.length) {
        stages[currentStageIndex - 1].status = 'COMPLETE';
      }
      
      // Start current stage
      if (currentStageIndex < stages.length) {
        stages[currentStageIndex].status = 'RUNNING';
      }
      
      setAnalysisStages([...stages]);
      
      if (currentStageIndex < stages.length) {
        currentStageIndex++;
        timer = setTimeout(transitionStage, 1100);
      }
    };

    transitionStage();
    return () => clearTimeout(timer);
  }, [isAnalyzingCase]);

  // Document Ingest & Entity Extraction Handlers
  const handleExtractDocument = async (doc: CaseDocument) => {
    setIsExtracting(true);

    try {
      // Add document to list if not already present
      if (!documents.some(d => d.id === doc.id)) {
        setDocuments(prev => [doc, ...prev]);
      }

      const extractionResult = await extractEntitiesAndRelationships({
        documentId: doc.id,
        documentTitle: doc.title,
        documentType: doc.type,
        date: doc.date,
        text: doc.content,
      });

      // Merge newly extracted entities into graph
      let newEntitiesCount = 0;
      let newRelationsCount = 0;

      const updatedEntities = [...entities];
      const entityLabelToIdMap = new Map<string, string>();
      updatedEntities.forEach(e => {
        entityLabelToIdMap.set(e.label.toLowerCase(), e.id);
        e.aliases.forEach(a => entityLabelToIdMap.set(a.toLowerCase(), e.id));
      });

      // Process extracted entities
      extractionResult.entities.forEach(extracted => {
        const key = extracted.label.toLowerCase();
        if (entityLabelToIdMap.has(key)) {
          // Update existing entity with new evidence
          const existingId = entityLabelToIdMap.get(key)!;
          const existingIdx = updatedEntities.findIndex(e => e.id === existingId);
          if (existingIdx !== -1) {
            const existing = updatedEntities[existingIdx];
            const hasEvidenceAlready = existing.evidence?.some(ev => ev.snippet === extracted.evidenceSnippet);
            if (!hasEvidenceAlready && extracted.evidenceSnippet) {
              updatedEntities[existingIdx] = {
                ...existing,
                aliases: Array.from(new Set([...existing.aliases, ...extracted.aliases])),
                evidence: [
                  ...(existing.evidence || []),
                  {
                    documentId: doc.id,
                    documentTitle: doc.title,
                    snippet: extracted.evidenceSnippet,
                    date: doc.date,
                    confidence: 'HIGH',
                  },
                ],
              };
            }
          }
        } else {
          // Create new entity
          const newId = generateEntityId(extracted.type);
          const newEntity: Entity = {
            id: newId,
            type: extracted.type as EntityType,
            label: extracted.label,
            aliases: extracted.aliases || [],
            metadata: {
              source: 'AI_EXTRACTION',
              firstSeenDate: doc.date,
              notes: `Extracted via Gemini 3.8 from ${doc.title}`,
            },
            evidence: [
              {
                documentId: doc.id,
                documentTitle: doc.title,
                snippet: extracted.evidenceSnippet,
                date: doc.date,
                confidence: 'HIGH',
              },
            ],
          };
          updatedEntities.push(newEntity);
          entityLabelToIdMap.set(key, newId);
          extracted.aliases.forEach(a => entityLabelToIdMap.set(a.toLowerCase(), newId));
          newEntitiesCount++;
        }
      });

      // Process extracted relationships
      const updatedRelationships = [...relationships];
      extractionResult.relationships.forEach((rel) => {
        const sourceId = entityLabelToIdMap.get(rel.sourceLabel.toLowerCase());
        const targetId = entityLabelToIdMap.get(rel.targetLabel.toLowerCase());

        if (sourceId && targetId && sourceId !== targetId) {
          const existingRelIdx = updatedRelationships.findIndex(
            r => (r.sourceId === sourceId && r.targetId === targetId && r.type === rel.type) ||
                 (r.sourceId === targetId && r.targetId === sourceId && r.type === rel.type)
          );

          if (existingRelIdx !== -1) {
            // Append evidence
            const existingRel = updatedRelationships[existingRelIdx];
            if (!existingRel.evidence.some(ev => ev.snippet === rel.evidenceSnippet)) {
              updatedRelationships[existingRelIdx] = {
                ...existingRel,
                evidence: [
                  ...existingRel.evidence,
                  {
                    documentId: doc.id,
                    documentTitle: doc.title,
                    snippet: rel.evidenceSnippet,
                    date: doc.date,
                    confidence: rel.confidenceLabel,
                  },
                ],
              };
            }
          } else {
            // Create new relationship
            const extracted = rel;
            const newRel: Relationship = {
              id: generateRelationshipId(extracted.type),
              sourceId,
              targetId,
              type: rel.type,
              confidenceLabel: rel.confidenceLabel || 'HIGH',
              evidence: [
                {
                  documentId: doc.id,
                  documentTitle: doc.title,
                  snippet: rel.evidenceSnippet,
                  date: doc.date,
                  confidence: rel.confidenceLabel,
                },
              ],
            };
            updatedRelationships.push(newRel);
            newRelationsCount++;
          }
        }
      });

      setEntities(updatedEntities);
      setRelationships(updatedRelationships);
      const sourceBadge = extractionResult.isDemoFallback
        ? '[Offline Demo Baseline]'
        : '[Live Gemini 3.8 Flash]';
      showToast(
        `${sourceBadge} Ingested ${extractionResult.entities.length} entities (+${newEntitiesCount} new) & ${extractionResult.relationships.length} relationships with verified evidence!`,
        'success'
      );

      if (activeCaseId === null) {
        const customCaseId = `CASE-CUSTOM-${generateUUID()}`;
        setActiveCaseId(customCaseId);
        recordAuditEvent({
          action: 'CASE_LOADED',
          role: currentRole,
          targetId: customCaseId,
          targetType: 'CASE',
          metadata: {
            caseName: doc.title,
            source: 'CUSTOM_INGEST',
          },
        });
        setAuditEvents(getAuditEvents());
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Extraction rejected: unverified evidence or invalid model output.', 'error');
    } finally {
      setIsExtracting(false);
    }
  };

  // Re-run AI Network Insights with Gemini
  const handleRefreshInsights = async () => {
    setIsAiAnalyzing(true);
    showToast('Submitting full network topology to Gemini 3.8 for pattern synthesis...', 'info');

    try {
      const generated = await generateNetworkInsights({
        entities,
        relationships,
        documents,
      });

      if (generated && generated.length > 0) {
        setInsights(generated);
        showToast(`Gemini synthesized ${generated.length} actionable intelligence leads grounded in cited evidence.`, 'success');
      }
    } catch (err: any) {
      console.error(err);
      showToast(`AI insight synthesis failed: ${err.message}`, 'error');
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  // Quick X-Ray triggers from toolbar or cards
  const handleTriggerXRay = (mode: 'INFLUENCERS' | 'BRIDGES' | 'CLUSTERS' | 'ISOLATED') => {
    setRightTab('XRAY');
    setXrayMode(mode);
    if (mode === 'INFLUENCERS') {
      const topIds = networkReport.influencers.slice(0, 6).map(n => n.id);
      setHighlightedEntityIds(topIds);
      showToast(`Identified ${topIds.length} top centrality influencer nodes.`, 'info');
      recordAuditEvent({ action: 'RAN_XRAY', role: currentRole, metadata: { mode } });
      setAuditEvents(getAuditEvents());
    } else if (mode === 'BRIDGES') {
      const bridgeIds = networkReport.bridges.map(n => n.id);
      setHighlightedEntityIds(bridgeIds);
      showToast(`Identified ${bridgeIds.length} cross-cluster bridge nodes.`, 'info');
    } else if (mode === 'CLUSTERS') {
      if (networkReport.clusters.length > 0) {
        setHighlightedEntityIds(networkReport.clusters[0].nodeIds);
        showToast(`Computed ${networkReport.clusters.length} Louvain community clusters.`, 'info');
      }
    } else if (mode === 'ISOLATED') {
      const isoIds = networkReport.isolatedEntities.map(n => n.id);
      setHighlightedEntityIds(isoIds);
      showToast(`Identified ${isoIds.length} isolated/peripheral entities.`, 'info');
    }
  };

  // Manual Entity Merge Action (Invoked by investigator only)
  const handleMergeEntities = (survivorId: string, duplicateId: string) => {
    if (!canMerge(currentRole)) {
      showToast('Permission denied: Analysts cannot merge entities.', 'error');
      return;
    }

    const { updatedEntities, updatedRelationships, mergedEntity } = mergeEntities(
      survivorId,
      duplicateId,
      entities,
      relationships
    );

    setEntities(updatedEntities);
    setRelationships(updatedRelationships);

    // Record dismissed pair keys so it won't re-appear
    setDismissedDuplicatePairIds(prev => [
      ...prev,
      `${survivorId}-${duplicateId}`,
      `${duplicateId}-${survivorId}`
    ]);

    if (selectedEntityId === duplicateId) {
      setSelectedEntityId(survivorId);
    }
    setReviewCandidate(null);
    showToast(`Investigator confirmed merge: Consolidated into "${mergedEntity.label}" (${survivorId}).`, 'success');
    recordAuditEvent({ action: 'MERGED_ENTITIES', role: currentRole, targetId: survivorId, metadata: { duplicateId } });
    setAuditEvents(getAuditEvents());
  };

  const handleKeepSeparate = (candidateId: string) => {
    setDismissedDuplicatePairIds(prev => [...prev, candidateId]);
    if (reviewCandidate?.id === candidateId) {
      setReviewCandidate(null);
    }
    showToast('Marked candidate pair as confirmed distinct entities.', 'info');
    recordAuditEvent({ action: 'KEPT_SEPARATE', role: currentRole, targetId: candidateId });
    setAuditEvents(getAuditEvents());
  };

  // Copilot & Explain Connection Actions
  const handleShowConnection = (sourceId: string, targetId: string) => {
    setExplainSourceId(sourceId);
    setExplainTargetId(targetId);
    setRightTab('EXPLAIN');
    setHighlightedEntityIds([sourceId, targetId]);
    showToast('Analyzing indirect graph connection...', 'info');
    recordAuditEvent({ action: 'RAN_EXPLAIN_CONNECTION', role: currentRole, targetId: sourceId, metadata: { targetId } });
    setAuditEvents(getAuditEvents());
  };

  const handleApplyTimelineFilter = (entityId?: string, startDate?: string, endDate?: string) => {
    if (startDate || endDate) {
      setTimelineRange({
        startDate: startDate || null,
        endDate: endDate || null
      });
    }
    if (endDate) {
      setCurrentCutoffDate(endDate);
    } else if (startDate) {
      setCurrentCutoffDate(startDate);
    }
    if (entityId) {
      setSelectedEntityId(entityId);
      setHighlightedEntityIds([entityId]);
    }
    showToast(`Applied timeline filter: ${startDate || 'Earliest'} to ${endDate || 'Latest'}`, 'info');
    recordAuditEvent({ action: 'APPLIED_TIMELINE_FILTER', role: currentRole, metadata: { startDate, endDate } });
    setAuditEvents(getAuditEvents());
  };

  const handleApplyGraphFilter = (entityIds?: string[], clusterId?: number | string) => {
    if (entityIds && entityIds.length > 0) {
      setHighlightedEntityIds(entityIds);
      showToast(`Filtered graph to ${entityIds.length} entities`, 'info');
      recordAuditEvent({ action: 'APPLIED_GRAPH_FILTER', role: currentRole, metadata: { filterType: 'ENTITY_LIST', count: String(entityIds.length) } });
      setAuditEvents(getAuditEvents());
    } else if (clusterId !== undefined) {
      const cluster = networkReport.clusters.find(c => c.id === Number(clusterId));
      if (cluster) {
        setHighlightedEntityIds(cluster.nodeIds);
        showToast(`Filtered graph to Cluster ${clusterId} (${cluster.name})`, 'info');
      }
    }
  };

  // Reset graph to synthetic defaults
  const handleResetGraph = () => {
    if (confirm('Reset graph back to default baseline synthetic case data?')) {
      setEntities(INITIAL_ENTITIES);
      setRelationships(INITIAL_RELATIONSHIPS);
      setInsights(INITIAL_AI_INSIGHTS);
      setDismissedDuplicatePairIds([]);
      setCurrentCutoffDate(null);
      setTimelineRange(null);
      setSelectedEntityId(null);
      setSelectedRelationshipId(null);
      setHighlightedEntityIds([]);
      showToast('Crime network reset to synthetic baseline.', 'info');
    }
  };

  if (isAnalyzingCase) {
    return (
      <div className="relative min-h-screen bg-[#030509]">
        <GlobalCursorMotion />
        <AnalyzeCaseOverlay
          isVisible={isAnalyzingCase}
          stages={analysisStages}
          onComplete={handleAnalysisComplete}
        />
      </div>
    );
  }

  if (!activeCaseId) {
    return (
      <div className="relative min-h-screen bg-[#030509]">
        <GlobalCursorMotion />
        <LandingPage
          onSelectCase={handleLoadCase}
          onOpenIngest={() => setIsIngestOpen(true)}
          sampleCases={SAMPLE_CASES}
        />
        <IngestModal
          isOpen={isIngestOpen}
          onClose={() => setIsIngestOpen(false)}
          onExtractDocument={handleExtractDocument}
          isExtracting={isExtracting}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-100/90 text-slate-900 overflow-hidden font-sans select-none relative">
      <GlobalCursorMotion />
      {/* Top Application Bar */}
      <Header
        onGoHome={() => setActiveCaseId(null)}
        onOpenIngest={() => setIsIngestOpen(true)}
        onResetGraph={handleResetGraph}
        onOpenMethodology={() => setIsMethodologyOpen(true)}
        onOpenGuide={() => setIsGuideModalOpen(true)}
        entityCount={entities.length}
        relationshipCount={relationships.length}
        documentCount={documents.length}
        isAiAnalyzing={isAiAnalyzing || isExtracting}
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        onOpenAuditLog={() => setIsAuditLogOpen(true)}
        onGenerateReport={handleGenerateReport}
        isLeftSidebarOpen={isLeftSidebarOpen}
        isRightSidebarOpen={isRightSidebarOpen}
        onToggleLeftSidebar={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
        onToggleRightSidebar={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
      />

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-slate-900/95 border border-slate-700 shadow-2xl text-xs font-sans text-slate-100 backdrop-blur-md animate-fade-in">
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main 3-Pane Investigator Interface */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden relative">
        {/* Left Pane: Case Files */}
        {isLeftSidebarOpen && (
          <div className="col-span-12 md:col-span-4 lg:col-span-3 h-full overflow-hidden transition-all duration-300">
            <CaseFilesPane
              documents={documents}
              selectedDocumentId={selectedDocForReading?.id || null}
              onSelectDocument={(doc) => {
                setSelectedDocForReading(doc);
                if (doc) {
                  recordAuditEvent({ action: 'OPENED_DOCUMENT', role: currentRole, targetId: doc.id, targetType: 'DOCUMENT' });
                  setAuditEvents(getAuditEvents());
                }
              }}
              onOpenIngest={() => setIsIngestOpen(true)}
              onTriggerExtraction={handleExtractDocument}
              isExtracting={isExtracting}
            />
          </div>
        )}

        {/* Center Pane: Crime Network Graph & Horizontal Timeline */}
        <div className={`h-full relative border-r border-slate-200/80 transition-all duration-300 ${
          isLeftSidebarOpen && isRightSidebarOpen
            ? 'col-span-12 md:col-span-8 lg:col-span-6'
            : !isLeftSidebarOpen && isRightSidebarOpen
            ? 'col-span-12 md:col-span-8 lg:col-span-9'
            : isLeftSidebarOpen && !isRightSidebarOpen
            ? 'col-span-12 md:col-span-8 lg:col-span-9'
            : 'col-span-12'
        }`}>
          <CrimeNetworkPane
            documents={documents}
            entities={entities}
            relationships={relationships}
            selectedEntityId={selectedEntityId}
            selectedRelationshipId={selectedRelationshipId}
            highlightedEntityIds={highlightedEntityIds}
            currentCutoffDate={currentCutoffDate}
            timelineRange={timelineRange}
            communityColorMap={communityColorMap}
            onSelectEntity={(ent) => {
              setSelectedEntityId(ent ? ent.id : null);
              if (ent) {
                setSelectedRelationshipId(null);
                recordAuditEvent({ action: 'OPENED_ENTITY', role: currentRole, targetId: ent.id, targetType: 'ENTITY' });
                setAuditEvents(getAuditEvents());
              }
            }}
            onSelectRelationship={(rel) => {
              setSelectedRelationshipId(rel ? rel.id : null);
              if (rel) {
                setSelectedEntityId(null);
                recordAuditEvent({ action: 'VIEWED_EVIDENCE', role: currentRole, targetId: rel.id, targetType: 'RELATIONSHIP' });
                setAuditEvents(getAuditEvents());
              }
            }}
            onCutoffDateChange={(d) => setCurrentCutoffDate(d)}
            onClearTimelineFilter={() => setTimelineRange(null)}
            onHighlightEntities={(ids) => setHighlightedEntityIds(ids)}
            userRole={currentRole}
          />

          {/* Evidence Side Drawer */}
          {(selectedEntity || selectedRelationship) && (
            <EvidenceDrawer
              entity={selectedEntity}
              relationship={selectedRelationship}
              allEntities={entities}
              allRelationships={relationships}
              onClose={() => {
                setSelectedEntityId(null);
                setSelectedRelationshipId(null);
              }}
              onSelectConnectedEntity={(id) => {
                setSelectedEntityId(id);
                setSelectedRelationshipId(null);
                recordAuditEvent({ action: 'OPENED_ENTITY', role: currentRole, targetId: id, targetType: 'ENTITY' });
                setAuditEvents(getAuditEvents());
              }}
              onExplainConnection={(entId) => {
                setExplainSourceId(entId);
                setRightTab('EXPLAIN');
                showToast(`Exploring connections from ${entities.find(e => e.id === entId)?.label || entId}`, 'info');
              }}
              currentRole={currentRole}
            />
          )}
        </div>

        {/* Right Pane: Intelligence Layer Switcher */}
        {isRightSidebarOpen && (
          <div className="col-span-12 lg:col-span-3 h-full flex flex-col bg-[#f4f1ea] border-l border-[#e2dcd0] overflow-hidden transition-all duration-300">
            {/* Sub-Navigation Tabs for Intelligence Layer */}
            <div className="h-10 border-b border-[#e2dcd0] bg-[#ede8df] px-2 flex items-center justify-between z-10 text-xs font-sans">
              <div className="flex items-center space-x-1 w-full">
                <button
                  onClick={() => setRightTab('EXPLAIN')}
                  className={`flex-1 py-1.5 px-1 rounded-md text-xs font-medium transition-all cursor-pointer text-center ${
                    rightTab === 'EXPLAIN'
                      ? 'bg-[#1a2334] text-cyan-300 border border-cyan-500/40 font-semibold shadow-xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-[#e2dacd]'
                  }`}
                  title="Explain This Connection (Shortest-Path Traversal)"
                >
                  Explain
                </button>

                <button
                  onClick={() => setRightTab('INSIGHTS')}
                  className={`flex-1 py-1.5 px-1 rounded-md text-xs font-medium transition-all cursor-pointer text-center ${
                    rightTab === 'INSIGHTS'
                      ? 'bg-[#1a2334] text-cyan-300 border border-cyan-500/40 font-semibold shadow-xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-[#e2dacd]'
                  }`}
                  title="AI Synthesized Pattern Leads"
                >
                  Insights
                </button>

                <button
                  onClick={() => setRightTab('XRAY')}
                  className={`flex-1 py-1.5 px-1 rounded-md text-xs font-medium transition-all cursor-pointer text-center ${
                    rightTab === 'XRAY'
                      ? 'bg-[#1a2334] text-cyan-300 border border-cyan-500/40 font-semibold shadow-xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-[#e2dacd]'
                  }`}
                  title="Graphology Centrality & Communities"
                >
                  X-Ray
                </button>

                <button
                  onClick={() => setRightTab('DUPLICATES')}
                  className={`flex-1 py-1.5 px-1 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center justify-center space-x-1 ${
                    rightTab === 'DUPLICATES'
                      ? 'bg-[#1a2334] text-cyan-300 border border-cyan-500/40 font-semibold shadow-xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-[#e2dacd]'
                  }`}
                  title="Entity Resolution & Deduplication"
                >
                  <span>Resolve</span>
                  {duplicateCandidates.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-200 text-emerald-950 text-[10px] font-bold border border-emerald-400">
                      {duplicateCandidates.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setRightTab('ANOMALIES')}
                  className={`flex-1 py-1.5 px-1 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center justify-center space-x-1 ${
                    rightTab === 'ANOMALIES'
                      ? 'bg-[#1a2334] text-cyan-300 border border-cyan-500/40 font-semibold shadow-xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-[#e2dacd]'
                  }`}
                  title="Rule-Based Anomaly Radar"
                >
                  <span>Radar</span>
                  {anomalies.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-200 text-rose-950 text-[10px] font-bold border border-rose-400">
                      {anomalies.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Render Active Right Pane View */}
            <div className="flex-1 overflow-hidden">
              {rightTab === 'EXPLAIN' && (
                <ExplainConnectionPane
                  entities={entities}
                  relationships={relationships}
                  documents={documents}
                  initialSourceEntityId={explainSourceId}
                  initialTargetEntityId={explainTargetId}
                  onSelectEntity={(id) => {
                    setSelectedEntityId(id);
                    setSelectedRelationshipId(null);
                  }}
                  onSelectDocument={(doc) => setSelectedDocForReading(doc)}
                  onHighlightPathNodes={(ids) => {
                    setHighlightedEntityIds(ids);
                    showToast(`Highlighted ${ids.length} path entities on crime network canvas.`, 'info');
                  }}
                />
              )}

              {rightTab === 'INSIGHTS' && (
                <AIInsightsPane
                  insights={insights}
                  onHighlightEntities={(ids) => {
                    setHighlightedEntityIds(ids);
                    showToast(`Highlighted ${ids.length} linked nodes in network canvas.`, 'info');
                  }}
                  onRefreshInsights={handleRefreshInsights}
                  isAnalyzing={isAiAnalyzing}
                />
              )}

              {rightTab === 'XRAY' && (
                <NetworkXRayPane
                  report={networkReport}
                  activeMode={xrayMode}
                  onChangeMode={(mode) => setXrayMode(mode)}
                  onHighlightEntities={(ids) => {
                    setHighlightedEntityIds(ids);
                    showToast(`Highlighted ${ids.length} entities for ${xrayMode} analysis.`, 'info');
                  }}
                  onSelectEntity={(id) => {
                    setSelectedEntityId(id);
                    setSelectedRelationshipId(null);
                  }}
                />
              )}

              {rightTab === 'DUPLICATES' && (
                <EntityResolutionPane
                  candidates={duplicateCandidates}
                  onReviewEvidence={(cand) => setReviewCandidate(cand)}
                  onMerge={(survivorId, duplicateId) => {
                    handleMergeEntities(survivorId, duplicateId);
                  }}
                  onKeepSeparate={(candId) => handleKeepSeparate(candId)}
                  onHighlightEntities={(ids) => {
                    setHighlightedEntityIds(ids);
                    showToast(`Highlighted duplicate candidate entities in network canvas.`, 'info');
                  }}
                />
              )}

              {rightTab === 'ANOMALIES' && (
                <AnomalyRadarPane
                  anomalies={anomalies}
                  onHighlightEntities={(ids) => {
                    setHighlightedEntityIds(ids);
                    showToast(`Highlighted ${ids.length} anomaly-linked entities on network canvas.`, 'info');
                  }}
                  onSelectEntity={(id) => {
                    setSelectedEntityId(id);
                    setSelectedRelationshipId(null);
                    setHighlightedEntityIds([id]);
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Circular Copilot Button & Drawer in Bottom Right */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-3">
        {isCopilotOpen && (
          <div className="w-[410px] h-[560px] bg-[#0c101a] border border-cyan-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 animate-in fade-in slide-in-from-bottom-5">
            <div className="px-4 py-3 border-b border-slate-800 bg-[#121826] flex items-center justify-between select-none">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <span className="text-xs font-bold text-white tracking-wider uppercase font-sans">
                  Investigator Copilot
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                  Grounded
                </span>
              </div>
              <button
                onClick={() => setIsCopilotOpen(false)}
                className="text-slate-400 hover:text-white hover:bg-slate-800/80 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all"
              >
                ✕ Close
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <InvestigatorCopilotPane
                entities={entities}
                relationships={relationships}
                documents={documents}
                selectedEntityId={selectedEntityId}
                selectedDocumentId={selectedDocForReading?.id || null}
                networkContext={{
                  topInfluencers: networkReport.influencers.map(i => ({
                    id: i.id,
                    label: i.label,
                    betweenness: i.betweenness,
                    degree: i.degree
                  })),
                  communities: networkReport.clusters.map(c => ({
                    clusterId: c.id,
                    label: c.name,
                    memberCount: c.nodeIds.length,
                    members: c.nodeIds
                  }))
                }}
                onSelectEntity={(id) => {
                  setSelectedEntityId(id);
                  setSelectedRelationshipId(null);
                }}
                onSelectDocument={(doc) => setSelectedDocForReading(doc)}
                onApplyTimelineFilter={handleApplyTimelineFilter}
                onApplyGraphFilter={handleApplyGraphFilter}
                onShowConnection={handleShowConnection}
                currentRole={currentRole}
              />
            </div>
          </div>
        )}

        <button
          onClick={() => setIsCopilotOpen(!isCopilotOpen)}
          className="relative group w-16 h-16 rounded-full bg-[#0a0f1d] hover:bg-cyan-950 text-white border-2 border-cyan-500/60 shadow-[0_0_25px_rgba(6,182,212,0.35)] flex items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-95 animate-bounce select-none ring-4 ring-cyan-500/20"
          title="Click to open Investigator Copilot"
        >
          <Search className="w-7 h-7 text-cyan-400 group-hover:text-white transition-transform group-hover:scale-110" />
        </button>
      </div>

      {/* Manual Entity Resolution Review & Merge Modal */}
      <DuplicateReviewModal
        candidate={reviewCandidate}
        isOpen={reviewCandidate !== null}
        onClose={() => setReviewCandidate(null)}
        onMerge={(survivorId, duplicateId) => {
          handleMergeEntities(survivorId, duplicateId);
        }}
        onKeepSeparate={(candId) => handleKeepSeparate(candId)}
      />

      {/* Ingest Case Document Modal */}
      <IngestModal
        isOpen={isIngestOpen}
        onClose={() => setIsIngestOpen(false)}
        onExtractDocument={handleExtractDocument}
        isExtracting={isExtracting}
      />

      {/* Inspect Case Document Text Modal */}
      <DocumentModal
        document={selectedDocForReading}
        onClose={() => setSelectedDocForReading(null)}
        onTriggerExtraction={handleExtractDocument}
        isExtracting={isExtracting}
      />

      {/* Methodology & SIH Protocol Modal */}
      <MethodologyModal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
      />

      <AuditLogPane
        isOpen={isAuditLogOpen}
        onClose={() => setIsAuditLogOpen(false)}
        events={auditEvents}
        onEventsCleared={() => setAuditEvents([])}
      />

      <CaseReportPane
        isOpen={isReportPaneOpen}
        onClose={() => setIsReportPaneOpen(false)}
        report={reportData}
        currentRole={currentRole}
      />
    </div>
  );
}
