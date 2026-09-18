import React from 'react';
import { 
  X, 
  GitMerge, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Calendar, 
  User, 
  Phone, 
  Sparkles,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { DuplicateCandidate } from '../types';

interface DuplicateReviewModalProps {
  candidate: DuplicateCandidate | null;
  isOpen: boolean;
  onClose: () => void;
  onMerge: (survivorId: string, duplicateId: string) => void;
  onKeepSeparate: (candidateId: string) => void;
}

export const DuplicateReviewModal: React.FC<DuplicateReviewModalProps> = ({
  candidate,
  isOpen,
  onClose,
  onMerge,
  onKeepSeparate,
}) => {
  if (!isOpen || !candidate) return null;

  const entA = candidate.entityA;
  const entB = candidate.entityB;

  const similarityVal = candidate.similarityPercentage;

  const handleExecuteMerge = (survivorId: string, duplicateId: string) => {
    onMerge(survivorId, duplicateId);
    onClose();
  };

  const handleSeparate = () => {
    onKeepSeparate(candidate.id);
    onClose();
  };

  const docsA = Array.from(new Set((entA.evidence || []).map(ev => ev.documentId))).join(', ') || 'None';
  const docsB = Array.from(new Set((entB.evidence || []).map(ev => ev.documentId))).join(', ') || 'None';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0b101e] border border-slate-700/80 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#0e1526]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <GitMerge className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100 font-mono flex items-center gap-2">
                Comparative Evidence Review — Entity Resolution
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  Similarity: {similarityVal}%
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Inspect source document citations before executing irreversible entity consolidation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Similarity Rationale Box */}
          <div className="p-3.5 rounded-lg bg-slate-900/90 border border-cyan-500/30">
            <div className="flex items-center space-x-2 text-xs font-mono font-semibold text-cyan-300 uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Matching Factors & Signals</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono text-slate-300">
              {candidate.matchingFactors.map((reason, idx) => (
                <div key={idx} className="flex items-start space-x-1.5">
                  <span className="text-cyan-400">•</span>
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Legal Notice */}
          <div className="px-3.5 py-2 rounded bg-amber-950/30 border border-amber-500/30 flex items-center space-x-2 text-xs font-mono text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              Merging re-points all relationships, accumulates source evidence, and updates investigator audit records.
            </span>
          </div>

          {/* Side-by-Side Comparison Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Record A */}
            <div className="rounded-lg border border-cyan-500/30 bg-[#0d1424] p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
                  <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold">
                    {entA.type === 'PERSON' ? <User className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                    <span>PRIMARY RECORD A ({entA.id})</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-500/40">
                    {entA.type}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="text-sm font-bold font-mono text-slate-100">{entA.label}</div>
                  {entA.aliases?.length > 0 && (
                    <div className="text-xs font-mono text-slate-400 mt-1">
                      <span className="text-slate-500">Aliases:</span> {entA.aliases.join(', ')}
                    </div>
                  )}
                  <div className="text-xs font-mono text-slate-400 mt-1">
                    <span className="text-slate-500">Originating Documents:</span> {docsA}
                  </div>
                </div>

                {/* Evidence Citations A */}
                <div className="space-y-2">
                  <div className="text-[11px] font-mono uppercase text-slate-400 font-semibold flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Cited Source Evidence ({entA.evidence?.length || 0})</span>
                  </div>
                  {(entA.evidence || []).map((ev, i) => (
                    <div key={i} className="p-2.5 rounded bg-slate-900/90 border border-slate-800 text-xs font-mono">
                      <div className="flex items-center justify-between text-[10px] text-cyan-400 mb-1">
                        <span>{ev.documentTitle || ev.documentId}</span>
                        <span>{ev.date}</span>
                      </div>
                      <p className="text-slate-300 italic text-[11px] leading-relaxed">
                        "{ev.snippet}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => handleExecuteMerge(entA.id, entB.id)}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-500/50 text-xs font-mono font-bold transition-all"
                >
                  <GitMerge className="w-4 h-4 text-cyan-300" />
                  <span>[Merge B into A] (Keep Record A)</span>
                </button>
              </div>
            </div>

            {/* Record B */}
            <div className="rounded-lg border border-amber-500/30 bg-[#0d1424] p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
                  <div className="flex items-center space-x-2 text-amber-400 font-mono text-xs font-bold">
                    {entB.type === 'PERSON' ? <User className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                    <span>CANDIDATE RECORD B ({entB.id})</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950/60 text-amber-300 border border-amber-500/40">
                    {entB.type}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="text-sm font-bold font-mono text-slate-100">{entB.label}</div>
                  {entB.aliases?.length > 0 && (
                    <div className="text-xs font-mono text-slate-400 mt-1">
                      <span className="text-slate-500">Aliases:</span> {entB.aliases.join(', ')}
                    </div>
                  )}
                  <div className="text-xs font-mono text-slate-400 mt-1">
                    <span className="text-slate-500">Originating Documents:</span> {docsB}
                  </div>
                </div>

                {/* Evidence Citations B */}
                <div className="space-y-2">
                  <div className="text-[11px] font-mono uppercase text-slate-400 font-semibold flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>Cited Source Evidence ({entB.evidence?.length || 0})</span>
                  </div>
                  {(entB.evidence || []).map((ev, i) => (
                    <div key={i} className="p-2.5 rounded bg-slate-900/90 border border-slate-800 text-xs font-mono">
                      <div className="flex items-center justify-between text-[10px] text-amber-400 mb-1">
                        <span>{ev.documentTitle || ev.documentId}</span>
                        <span>{ev.date}</span>
                      </div>
                      <p className="text-slate-300 italic text-[11px] leading-relaxed">
                        "{ev.snippet}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => handleExecuteMerge(entB.id, entA.id)}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 border border-amber-500/50 text-xs font-mono font-bold transition-all"
                >
                  <GitMerge className="w-4 h-4 text-amber-300" />
                  <span>[Merge A into B] (Keep Record B)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-[#0c1222] flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
            <HelpCircle className="w-4 h-4 text-slate-500" />
            <span>If these records represent distinct persons/numbers, choose Keep Separate.</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleSeparate}
              className="flex items-center space-x-1.5 px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-medium transition-colors"
            >
              <XCircle className="w-4 h-4 text-rose-400" />
              <span>[Keep Separate]</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-mono transition-colors"
            >
              [Cancel]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
