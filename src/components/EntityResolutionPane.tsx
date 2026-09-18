import React, { useState } from 'react';
import { DuplicateCandidate } from '../types';

interface EntityResolutionPaneProps {
  candidates: DuplicateCandidate[];
  onMerge: (survivorId: string, duplicateId: string) => void;
  onKeepSeparate: (candidateId: string) => void;
  onReviewEvidence: (candidate: DuplicateCandidate) => void;
  onHighlightEntities: (ids: string[]) => void;
}

export const EntityResolutionPane: React.FC<EntityResolutionPaneProps> = ({
  candidates,
  onMerge,
  onKeepSeparate,
  onReviewEvidence,
  onHighlightEntities,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'PERSON' | 'PHONE'>('ALL');
  const [minSimilarity, setMinSimilarity] = useState<number>(65);

  const activeCandidates = candidates.filter(c => {
    if (c.dismissed) return false;
    const sim = c.similarityPercentage;
    if (sim < minSimilarity) return false;
    if (filterType !== 'ALL' && c.entityA.type !== filterType) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-[#f4f1ea] border-l border-[#e0d9cc] text-[#1c1e22] select-none text-xs font-sans overflow-hidden">
      {/* Pane Header */}
      <div className="px-3.5 py-3 border-b border-[#e2dcd0] bg-[#ede8df] flex-shrink-0 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold tracking-wider text-slate-900 uppercase font-sans">
              Entity Resolution
            </h3>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Cross-document entity deduplication & resolution
            </p>
          </div>

          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
            {activeCandidates.length} Pairs
          </span>
        </div>

        {/* Filter Toolbar */}
        <div className="flex items-center space-x-1.5 pt-1 text-xs font-medium">
          {(['ALL', 'PERSON', 'PHONE'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-all cursor-pointer ${
                filterType === type
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-[#faf8f5] text-slate-700 border-[#e0d9cc] hover:bg-[#ede8df]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Candidates List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
        {activeCandidates.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs font-medium">
            No duplicate candidates found matching the criteria.
          </div>
        ) : (
          activeCandidates.map(cand => (
            <div
              key={cand.id}
              className="p-3.5 rounded-xl bg-[#faf8f5] hover:bg-white border border-[#e0d9cc] shadow-xs transition-all space-y-2.5 text-xs"
            >
              {/* Header: Similarity Score */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {cand.similarityPercentage}% Match
                </span>
                <span className="text-[11px] text-slate-400 font-mono">{cand.id}</span>
              </div>

              {/* Entity Pair comparison */}
              <div className="bg-[#ede8df]/80 rounded-lg p-2.5 border border-[#e0d9cc] grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase">Entity A</div>
                  <div className="font-semibold text-slate-900 line-clamp-1">{cand.entityA.label}</div>
                  <div className="text-[10px] text-slate-500">{cand.entityA.type}</div>
                </div>

                <div>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase">Entity B</div>
                  <div className="font-semibold text-slate-900 line-clamp-1">{cand.entityB.label}</div>
                  <div className="text-[10px] text-slate-500">{cand.entityB.type}</div>
                </div>
              </div>

              {/* Reason / Shared Evidence */}
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {cand.matchReason}
              </p>

              {/* Action Strip */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => onReviewEvidence(cand)}
                  className="text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
                >
                  Review Evidence
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onKeepSeparate(cand.id)}
                    className="px-2.5 py-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all text-xs font-medium cursor-pointer"
                  >
                    Keep Separate
                  </button>

                  <button
                    onClick={() => onMerge(cand.entityA.id, cand.entityB.id)}
                    className="px-3 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all cursor-pointer shadow-xs"
                  >
                    Merge
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
