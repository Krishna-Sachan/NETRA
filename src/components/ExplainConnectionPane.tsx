import React, { useState, useMemo } from 'react';
import { 
  Entity, 
  Relationship, 
  CaseDocument, 
  ExplainConnectionResult, 
  PathHop 
} from '../types';
import { findConnectionPath } from '../services/pathService';

interface ExplainConnectionPaneProps {
  entities: Entity[];
  relationships: Relationship[];
  documents: CaseDocument[];
  initialSourceEntityId?: string | null;
  initialTargetEntityId?: string | null;
  onSelectEntity: (id: string) => void;
  onSelectDocument: (doc: CaseDocument) => void;
  onHighlightPathNodes: (ids: string[]) => void;
}

export const ExplainConnectionPane: React.FC<ExplainConnectionPaneProps> = ({
  entities,
  relationships,
  documents,
  initialSourceEntityId,
  initialTargetEntityId,
  onSelectEntity,
  onSelectDocument,
  onHighlightPathNodes
}) => {
  const [sourceId, setSourceId] = useState<string>(initialSourceEntityId || (entities[0]?.id || ''));
  const [targetId, setTargetId] = useState<string>(
    initialTargetEntityId || (entities.length > 1 ? entities[1]?.id : (entities[0]?.id || ''))
  );
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [expandedHopIndex, setExpandedHopIndex] = useState<number | null>(null);

  React.useEffect(() => {
    if (initialSourceEntityId) setSourceId(initialSourceEntityId);
    if (initialTargetEntityId) setTargetId(initialTargetEntityId);
  }, [initialSourceEntityId, initialTargetEntityId]);

  const connectionResult: ExplainConnectionResult = useMemo(() => {
    if (!sourceId || !targetId) {
      return {
        found: false,
        hops: [],
        pathEntities: [],
        pathRelationships: [],
        message: 'Select two entities to analyze indirect graph connections.'
      };
    }
    return findConnectionPath(sourceId, targetId, entities, relationships, documents);
  }, [sourceId, targetId, entities, relationships, documents]);

  const handleExplain = () => {
    setHasSearched(true);
    if (connectionResult.found && connectionResult.pathEntities.length > 0) {
      onHighlightPathNodes(connectionResult.pathEntities.map(e => e.id));
    }
  };

  const handleSwap = () => {
    const prevSource = sourceId;
    setSourceId(targetId);
    setTargetId(prevSource);
  };

  const docMap = useMemo(() => {
    const map = new Map<string, CaseDocument>();
    documents.forEach(d => map.set(d.id, d));
    return map;
  }, [documents]);

  return (
    <div className="flex flex-col h-full bg-[#f4f1ea] text-[#1c1e22] select-none text-xs font-sans overflow-hidden">
      {/* Pane Header */}
      <div className="p-3.5 border-b border-[#e2dcd0] bg-[#ede8df] flex-shrink-0 space-y-2">
        <div>
          <h3 className="text-xs font-bold tracking-wider text-slate-900 uppercase font-sans">
            Explain Connection
          </h3>
          <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
            Deterministic shortest-path traversal. Discovers indirect associations across intermediate nodes.
          </p>
        </div>

        {/* Entity Selector Controls */}
        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-5">
              <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
                Source Entity
              </label>
              <select
                value={sourceId}
                onChange={(e) => {
                  setSourceId(e.target.value);
                  setHasSearched(false);
                }}
                className="w-full bg-[#faf8f5] border border-[#e0d9cc] rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 font-sans shadow-xs"
              >
                {entities.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.label} ({e.type})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2 flex justify-center pt-4">
              <button
                type="button"
                onClick={handleSwap}
                title="Swap source and target"
                className="px-2 py-1.5 rounded-lg bg-[#ede8df] hover:bg-[#e2dacd] text-slate-800 border border-[#e0d9cc] text-xs font-medium cursor-pointer transition-all"
              >
                ⇄
              </button>
            </div>

            <div className="col-span-5">
              <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
                Target Entity
              </label>
              <select
                value={targetId}
                onChange={(e) => {
                  setTargetId(e.target.value);
                  setHasSearched(false);
                }}
                className="w-full bg-[#faf8f5] border border-[#e0d9cc] rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 font-sans shadow-xs"
              >
                {entities.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.label} ({e.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExplain}
            disabled={!sourceId || !targetId || sourceId === targetId}
            className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:bg-[#ede8df] disabled:text-slate-400 text-white font-semibold transition-all shadow-xs cursor-pointer text-xs"
          >
            Explain This Connection
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {!hasSearched && (
          <div className="p-4 rounded-xl bg-[#faf8f5] border border-[#e0d9cc] text-center text-slate-600 space-y-1.5 shadow-xs">
            <p className="text-xs font-medium text-slate-800">
              Select two entities above and click Explain This Connection.
            </p>
            <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
              NETRA traverses the entire case graph using deterministic BFS to reveal multi-hop chains (Person → Phone → Person → Vehicle).
            </p>
          </div>
        )}

        {hasSearched && !connectionResult.found && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/90 text-rose-800 space-y-1.5">
            <div className="font-semibold text-xs text-rose-900">
              No Supported Connection Found
            </div>
            <p className="text-xs text-rose-700 leading-relaxed">
              The active investigative graph contains no continuous relationship path between 
              <span className="font-semibold"> {entities.find(e => e.id === sourceId)?.label}</span> and 
              <span className="font-semibold"> {entities.find(e => e.id === targetId)?.label}</span>.
            </p>
          </div>
        )}

        {hasSearched && connectionResult.found && connectionResult.hops.length === 0 && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/90 text-amber-800 text-xs">
            Source and target entities are identical.
          </div>
        )}

        {hasSearched && connectionResult.found && connectionResult.hops.length > 0 && (
          <div className="space-y-3">
            {/* Path Confidence Banner */}
            {connectionResult.confidence && (
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-900">
                    Path Confidence: {connectionResult.confidence.scorePercentage}%
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {connectionResult.hops.length} Hop{connectionResult.hops.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="text-xs text-slate-600 border-t border-slate-100 pt-2 space-y-1">
                  <div className="font-medium text-slate-800">
                    {connectionResult.confidence.label}
                  </div>
                  <ul className="space-y-0.5 text-slate-500 text-[11px]">
                    <li>• Coverage: {connectionResult.confidence.factors.evidenceCoverage.description}</li>
                    <li>• Temporal support: {connectionResult.confidence.factors.temporalSupport.description}</li>
                    <li>• Path length: {connectionResult.confidence.factors.pathLength.description}</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Step-by-Step Path Visualization */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Step-by-Step Traversal Path
                </span>
                <button
                  type="button"
                  onClick={() => onHighlightPathNodes(connectionResult.pathEntities.map(e => e.id))}
                  className="text-xs font-medium text-slate-700 hover:text-slate-900 cursor-pointer"
                >
                  Highlight on Network
                </button>
              </div>

              <div className="space-y-2">
                {connectionResult.hops.map((hop: PathHop, idx: number) => {
                  const isExpanded = expandedHopIndex === idx;

                  return (
                    <div 
                      key={hop.relationship.id} 
                      className="p-3 rounded-xl bg-white/80 border border-slate-200/90 shadow-xs space-y-2 text-xs"
                    >
                      {/* Hop Header */}
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <div className="flex items-center space-x-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => onSelectEntity(hop.fromEntity.id)}
                            className="font-semibold text-slate-900 hover:underline cursor-pointer"
                          >
                            {hop.fromEntity.label}
                          </button>
                          <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {hop.fromEntity.type}
                          </span>
                          <span className="text-slate-400 font-mono">→</span>
                          <button
                            type="button"
                            onClick={() => onSelectEntity(hop.toEntity.id)}
                            className="font-semibold text-slate-900 hover:underline cursor-pointer"
                          >
                            {hop.toEntity.label}
                          </button>
                          <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {hop.toEntity.type}
                          </span>
                        </div>
                      </div>

                      {/* Relationship Type & Metadata */}
                      <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                          {hop.relationship.type}
                        </span>
                        {hop.evidenceDates.length > 0 && (
                          <span>{hop.evidenceDates.join(', ')}</span>
                        )}
                      </div>

                      {/* Expandable Evidence Snippets */}
                      <div className="border-t border-slate-100 pt-1.5">
                        <button
                          type="button"
                          onClick={() => setExpandedHopIndex(isExpanded ? null : idx)}
                          className="w-full flex items-center justify-between text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                        >
                          <span>
                            {hop.supportingEvidenceCount} Supporting Record(s) ({hop.supportingDocumentCount} Doc{hop.supportingDocumentCount > 1 ? 's' : ''})
                          </span>
                          <span>{isExpanded ? '▲' : '▼'}</span>
                        </button>

                        {isExpanded && (
                          <div className="mt-2 space-y-1.5 pt-1">
                            {hop.evidence.map((ev, evIdx) => {
                              const doc = docMap.get(ev.documentId);

                              return (
                                <div 
                                  key={evIdx}
                                  className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1 text-xs"
                                >
                                  <div className="flex items-center justify-between text-[11px] font-medium text-slate-700">
                                    <span>{doc?.title || ev.documentId}</span>
                                    {doc && (
                                      <button
                                        type="button"
                                        onClick={() => onSelectDocument(doc)}
                                        className="text-slate-800 hover:underline font-semibold cursor-pointer"
                                      >
                                        View Document
                                      </button>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-600 italic bg-white p-2 rounded border border-slate-200">
                                    "{ev.snippet}"
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
