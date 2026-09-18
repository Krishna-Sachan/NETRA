/**
 * Investigator Copilot Panel
 * 
 * LAW-ENFORCEMENT INTEGRITY RULE:
 * 1. Strictly grounded in active case data.
 * 2. Documents & evidence treated as passive untrusted data (prompt-injection resistant).
 * 3. Never makes criminality or guilt determinations.
 * 4. Cites only verified entities, relationships, documents, and evidence snippets.
 * 5. Rejects unknown IDs with auditable warning badges.
 * 6. Dispatches controlled actions: FILTER_TIMELINE, FOCUS_ENTITY, SHOW_CONNECTION, etc.
 * 7. Displays persistent legal disclaimer.
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Entity, 
  Relationship, 
  CaseDocument, 
  CopilotMessage, 
  CopilotAction,
  CopilotCitation,
  UserRole
} from '../types';
import { askInvestigatorCopilot } from '../services/gemini';
import { recordAuditEvent } from '../services/auditService';
import { getDisplayLabel, maskSnippetSensitiveValues, maskSensitiveField } from '../services/accessPolicy';
import { 
  Bot, 
  Send, 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink, 
  FileText, 
  Calendar, 
  Crosshair, 
  Route, 
  Layers,
  ArrowRight,
  Info,
  Clock,
  RotateCcw
} from 'lucide-react';

interface InvestigatorCopilotPaneProps {
  entities: Entity[];
  relationships: Relationship[];
  documents: CaseDocument[];
  selectedEntityId: string | null;
  selectedDocumentId: string | null;
  networkContext?: {
    topInfluencers?: { id: string; label: string; betweenness: number; degree: number }[];
    communities?: { clusterId: number; label: string; memberCount: number; members: string[] }[];
  };
  onSelectEntity: (id: string) => void;
  onSelectDocument: (doc: CaseDocument) => void;
  onApplyTimelineFilter: (entityId?: string, startDate?: string, endDate?: string) => void;
  onApplyGraphFilter: (entityIds?: string[], clusterId?: number | string) => void;
  onShowConnection: (sourceId: string, targetId: string) => void;
  currentRole: UserRole;
}

export const InvestigatorCopilotPane: React.FC<InvestigatorCopilotPaneProps> = ({
  entities,
  relationships,
  documents,
  selectedEntityId,
  selectedDocumentId,
  networkContext,
  onSelectEntity,
  onSelectDocument,
  onApplyTimelineFilter,
  onApplyGraphFilter,
  onShowConnection,
  currentRole
}) => {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'welcome',
      sender: 'COPILOT',
      text: 'NETRA Grounded Investigator Copilot initialized. All queries are strictly anchored to the active case file. Ask about indirect connections, network importance metrics, or temporal activity.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isGrounded: true
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedEntity = entities.find(e => e.id === selectedEntityId);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Context-aware dynamic suggestions
  const suggestedQuestions = React.useMemo(() => {
    const suggestions: string[] = [];

    if (selectedEntity) {
      const label = getDisplayLabel(currentRole, selectedEntity);
      suggestions.push(`Why is "${label}" important in the graph?`);
      suggestions.push(`Show all events involving "${label}" during March 2026.`);
      const otherEnt = entities.find(e => e.id !== selectedEntity.id);
      if (otherEnt) {
        suggestions.push(`How are "${label}" and "${getDisplayLabel(currentRole, otherEnt)}" connected?`);
      }
    } else {
      if (entities.length >= 2) {
        suggestions.push(`How are "${getDisplayLabel(currentRole, entities[0])}" and "${getDisplayLabel(currentRole, entities[1])}" connected?`);
      }
      suggestions.push('What are the key central bridging entities in the case graph?');
      suggestions.push('Show all timeline events recorded during March 2026.');
    }

    return suggestions.slice(0, 3);
  }, [selectedEntity, entities]);

  const handleSendMessage = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed || isLoading) return;

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      sender: 'USER',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const safeEntities = entities.map(e => ({
        ...e,
        label: getDisplayLabel(currentRole, e),
        aliases: e.aliases.map(a => maskSensitiveField(currentRole, a, e.type)),
        evidence: e.evidence?.map(ev => ({
          ...ev,
          snippet: maskSnippetSensitiveValues(currentRole, ev.snippet || '')
        }))
      }));

      const safeDocuments = documents.map(doc => ({
        ...doc,
        content: maskSnippetSensitiveValues(currentRole, doc.content)
      }));

      const result = await askInvestigatorCopilot({
        query: trimmed,
        activeEntityId: selectedEntityId,
        activeDocumentId: selectedDocumentId,
        entities: safeEntities,
        relationships,
        documents: safeDocuments,
        networkContext
      });

      recordAuditEvent({
        action: 'RAN_COPILOT_QUERY',
        role: currentRole,
        metadata: { queryLength: String(trimmed.length), activeEntityId: selectedEntityId || '' }
      });

      const copilotMsg: CopilotMessage = {
        id: `copilot-${Date.now()}`,
        sender: 'COPILOT',
        text: result.data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: result.citations,
        actions: result.actions,
        isGrounded: true,
        isLocalFallback: result.data.isLocalFallback,
        fallbackReason: result.data.fallbackReason,
        validationWarnings: result.warnings || result.data.validationErrors,
        connectionPath: result.connectionPath
      };

      setMessages(prev => [...prev, copilotMsg]);

      // Automatically execute safe actions if explicitly structured
      result.actions.forEach(action => {
        if (action.status === 'PENDING') {
          handleExecuteAction(action);
        }
      });
    } catch (err: any) {
      const errorMsg: CopilotMessage = {
        id: `err-${Date.now()}`,
        sender: 'COPILOT',
        text: err.message || 'Failed to process inquiry. Verify that queries refer to active case entities.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isGrounded: false
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteAction = (action: CopilotAction) => {
    if (action.type === 'FOCUS_ENTITY' && action.payload.entityId) {
      onSelectEntity(action.payload.entityId);
    } else if (action.type === 'SHOW_CONNECTION' && action.payload.sourceEntityId && action.payload.targetEntityId) {
      onShowConnection(action.payload.sourceEntityId, action.payload.targetEntityId);
    } else if (action.type === 'FILTER_TIMELINE') {
      onApplyTimelineFilter(action.payload.entityId, action.payload.startDate, action.payload.endDate);
    } else if (action.type === 'FILTER_GRAPH') {
      onApplyGraphFilter(action.payload.entityIds, action.payload.clusterId);
    } else if (action.type === 'SHOW_EVIDENCE' && action.payload.documentId) {
      const doc = documents.find(d => d.id === action.payload.documentId);
      if (doc) onSelectDocument(doc);
    }
  };

  const handleCitationClick = (citation: CopilotCitation) => {
    if (citation.type === 'ENTITY') {
      onSelectEntity(citation.id);
    } else if (citation.type === 'DOCUMENT' || citation.type === 'EVIDENCE') {
      const docId = citation.documentId || citation.id;
      const doc = documents.find(d => d.id === docId);
      if (doc) onSelectDocument(doc);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0c101a] text-slate-200 overflow-hidden text-xs font-sans">
      {/* Statutory Legal Disclaimer Banner */}
      <div className="px-3.5 py-2 bg-[#121826] border-b border-slate-800 text-[11px] text-slate-400 flex items-center space-x-2 flex-shrink-0">
        <Info className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
        <span className="leading-snug text-slate-300">
          <strong className="text-white">Statutory Notice:</strong> AI outputs require investigator validation and are not determinations of guilt.
        </span>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 font-sans">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'USER' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[92%] p-3 space-y-2 text-xs shadow-md leading-relaxed ${
                msg.sender === 'USER'
                  ? 'bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-2xl rounded-tr-xs'
                  : 'bg-[#161f30] border border-slate-700/70 text-slate-100 rounded-2xl rounded-tl-xs'
              }`}
            >
              {/* Message Header */}
              <div className="flex items-center justify-between space-x-2 text-[10px] opacity-75 font-mono pb-1 border-b border-current/15">
                <span className="font-semibold">{msg.sender === 'USER' ? 'INVESTIGATOR' : 'NETRA COPILOT'}</span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Message Text Content */}
              <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed">{maskSnippetSensitiveValues(currentRole, msg.text)}</div>

              {/* Local Grounded Fallback Indicator */}
              {msg.isLocalFallback && msg.fallbackReason && (
                <div className="mt-2 p-2 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-300 text-[10px] font-mono flex items-start space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-200">DETERMINISTIC FALLBACK: </span>
                    <span>{msg.fallbackReason}</span>
                  </div>
                </div>
              )}

              {/* Validation Warning Badges */}
              {msg.validationWarnings && msg.validationWarnings.length > 0 && (
                <div className="mt-2 p-2 rounded-lg bg-amber-950/30 border border-amber-800/50 space-y-1">
                  <div className="flex items-center space-x-1 text-amber-400 text-[10px] font-mono font-semibold">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Citation Verification Alert</span>
                  </div>
                  <ul className="text-[10px] text-slate-300 space-y-0.5 list-disc pl-3">
                    {msg.validationWarnings.map((warn, wIdx) => (
                      <li key={wIdx}>{warn}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Verified Citations Pills */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-700/60 space-y-1.5">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Verified Case Citations ({msg.citations.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {msg.citations.map((cite, cIdx) => (
                      <button
                        key={cIdx}
                        type="button"
                        onClick={() => handleCitationClick(cite)}
                        className="px-2 py-1 rounded-lg bg-[#1c2638] hover:bg-[#25324a] text-cyan-300 border border-cyan-700/50 font-sans text-[10px] flex items-center space-x-1 transition-all cursor-pointer shadow-xs"
                        title={cite.snippet || `Focus ${cite.label || cite.id}`}
                      >
                        {cite.type === 'ENTITY' && <Crosshair className="w-3 h-3 text-cyan-400" />}
                        {cite.type === 'DOCUMENT' && <FileText className="w-3 h-3 text-emerald-400" />}
                        {cite.type === 'EVIDENCE' && <FileText className="w-3 h-3 text-amber-400" />}
                        <span className="truncate max-w-[150px]">
                          {cite.ownerLabel ? `${maskSnippetSensitiveValues(currentRole, cite.ownerLabel)} Evidence` : maskSnippetSensitiveValues(currentRole, cite.label || cite.id)}
                        </span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Dispatched Actions */}
              {msg.actions && msg.actions.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-700/60 space-y-1.5">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Workbench Actions
                  </div>
                  <div className="space-y-1">
                    {msg.actions.map((act, aIdx) => (
                      <div
                        key={aIdx}
                        className="flex items-center justify-between p-2 rounded-lg bg-[#121826] border border-cyan-800/40 text-[10px]"
                      >
                        <div className="flex items-center space-x-1.5 text-cyan-300 font-semibold">
                          {act.type === 'FILTER_TIMELINE' && <Calendar className="w-3.5 h-3.5 text-cyan-400" />}
                          {act.type === 'FOCUS_ENTITY' && <Crosshair className="w-3.5 h-3.5 text-cyan-400" />}
                          {act.type === 'SHOW_CONNECTION' && <Route className="w-3.5 h-3.5 text-cyan-400" />}
                          {act.type === 'FILTER_GRAPH' && <Layers className="w-3.5 h-3.5 text-cyan-400" />}
                          <span>{act.type}</span>
                        </div>

                        {act.status === 'REJECTED' ? (
                          <span className="text-rose-400 text-[10px] font-bold">REJECTED</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleExecuteAction(act)}
                            className="px-2.5 py-1 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-semibold transition-all cursor-pointer shadow-xs"
                          >
                            Apply Action
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 text-cyan-300 font-sans text-xs p-3 bg-[#121826] rounded-xl border border-slate-700/80 animate-pulse">
            <Bot className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>Verifying case graph and corroborating evidence citations...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-3 border-t border-slate-800 bg-[#101522] flex-shrink-0 space-y-2 font-sans">
        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          <span>Suggested Inquiries</span>
          {selectedEntity && (
            <span className="text-cyan-400">Context: {getDisplayLabel(currentRole, selectedEntity)}</span>
          )}
        </div>
        <div className="space-y-1.5">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(q)}
              disabled={isLoading}
              className="w-full text-left p-2 rounded-xl bg-[#161f30] hover:bg-[#1e2a42] text-slate-200 hover:text-cyan-300 border border-slate-700/70 text-xs transition-all flex items-center justify-between group cursor-pointer shadow-xs"
            >
              <span className="truncate pr-2">{q}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputQuery);
        }}
        className="p-3 border-t border-slate-800 bg-[#0d121f] flex-shrink-0 flex items-center space-x-2"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask Copilot about connections, importance, or dates..."
          disabled={isLoading}
          className="flex-1 bg-[#161f30] border border-slate-700/80 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none font-sans shadow-xs transition-all"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || isLoading}
          className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-white transition-all cursor-pointer shadow-xs"
          title="Send query"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
