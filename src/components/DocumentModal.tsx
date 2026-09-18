import React from 'react';
import { CaseDocument } from '../types';

interface DocumentModalProps {
  document: CaseDocument | null;
  onClose: () => void;
  onTriggerExtraction: (doc: CaseDocument) => void;
  isExtracting: boolean;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({
  document,
  onClose,
  onTriggerExtraction,
  isExtracting,
}) => {
  if (!document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="bg-white/95 border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden text-slate-900 font-sans">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/80">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                {document.type} • {document.id}
              </span>
              <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase">
                {document.classification}
              </span>
            </div>
            <h2 className="text-sm font-semibold text-slate-900">{document.title}</h2>
            <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1 font-medium">
              <span>{document.date}</span>
              <span>•</span>
              <span>{document.sourceAuthority}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-all cursor-pointer"
          >
            Close
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Executive Summary */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
            <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider block mb-1">
              Official Executive Summary
            </span>
            <p className="text-slate-700 leading-relaxed font-normal">{document.summary}</p>
          </div>

          {/* Full Text Dossier */}
          <div>
            <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider block mb-2">
              Verbatim Intelligence Record
            </span>
            <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 whitespace-pre-line leading-relaxed selection:bg-slate-200">
              {document.content}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">
            CONFIDENTIAL LAW ENFORCEMENT RECORD
          </span>

          <button
            onClick={() => {
              onTriggerExtraction(document);
              onClose();
            }}
            disabled={isExtracting}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
          >
            {isExtracting ? 'Extracting...' : 'Extract Entities into Graph'}
          </button>
        </div>
      </div>
    </div>
  );
};

