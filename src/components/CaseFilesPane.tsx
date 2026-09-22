import React, { useState } from 'react';
import { CaseDocument, DocumentType } from '../types';
import { InfoTooltip } from './InfoTooltip';

interface CaseFilesPaneProps {
  documents: CaseDocument[];
  selectedDocumentId: string | null;
  onSelectDocument: (doc: CaseDocument) => void;
  onOpenIngest: () => void;
  onTriggerExtraction: (doc: CaseDocument) => void;
  isExtracting: boolean;
}

const DOCUMENT_TYPE_CONFIG: Record<DocumentType, { label: string; color: string }> = {
  FIR: { label: 'FIR', color: 'bg-rose-50/90 border-[#f2d5d7] text-rose-800' },
  CDR: { label: 'CDR', color: 'bg-emerald-50/90 border-[#d3ebd9] text-emerald-800' },
  Financial: { label: 'FIN', color: 'bg-amber-50/90 border-[#f3e5c8] text-amber-900' },
  Surveillance: { label: 'SURV', color: 'bg-sky-50/90 border-[#d4e7f5] text-sky-800' },
  'Intelligence Note': { label: 'INTEL', color: 'bg-purple-50/90 border-[#e9daf0] text-purple-800' }
};

export const CaseFilesPane: React.FC<CaseFilesPaneProps> = ({
  documents,
  selectedDocumentId,
  onSelectDocument,
  onOpenIngest,
  onTriggerExtraction,
  isExtracting,
}) => {
  const [filterType, setFilterType] = useState<DocumentType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocs = documents.filter((doc) => {
    const matchesFilter = filterType === 'ALL' || doc.type === filterType;
    const matchesQuery = 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  return (
    <div className="flex flex-col h-full bg-[#f4f1ea] border-r border-[#e2dcd0] text-slate-900 select-none font-sans text-xs">
      {/* Pane Header */}
      <div className="p-3.5 border-b border-[#e2dcd0] flex items-center justify-between bg-[#ede8df]">
        <div className="flex items-center space-x-2">
          <h2 className="text-xs font-bold tracking-wider text-slate-800 uppercase font-sans">
            Case Evidence Files
          </h2>
          <InfoTooltip
            title="Case Evidence Dossiers"
            description="Manages all ingested FIRs, CDR transcripts, bank audits, and intelligence notes for the active case."
            howToUse="Click any document card to read full text, view SHA-256 tamper-proof hash, or re-run entity extraction."
            variant="highlight"
          />
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#e3dcd0] text-slate-700 border border-[#d5cebf]">
            {filteredDocs.length}
          </span>
        </div>

        <button
          onClick={onOpenIngest}
          className="px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white transition-all cursor-pointer shadow-xs"
          title="Upload or paste custom case dossier"
        >
          + Ingest
        </button>
      </div>

      {/* Search Bar & Filter Pills */}
      <div className="p-3 border-b border-[#e2dcd0] space-y-2 bg-[#eae5da]/60">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter files by name, ID, text..."
            className="w-full bg-white border border-[#ded7c9] rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500 font-sans transition-all shadow-xs"
          />
        </div>

        {/* Source Type Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-0.5 no-scrollbar text-xs">
          {(['ALL', 'FIR', 'CDR', 'Financial', 'Surveillance'] as const).map((type) => {
            const isActive = filterType === type;
            const pillColors: Record<string, string> = {
              ALL: isActive ? 'bg-[#1e232a] text-white border-[#1e232a]' : 'bg-[#eae5da] hover:bg-[#e0d9cb] text-slate-700 border-[#ddd6c8]',
              FIR: isActive ? 'bg-rose-700 text-white border-rose-700' : 'bg-rose-100/90 hover:bg-rose-200 text-rose-800 border-rose-200',
              CDR: isActive ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-emerald-100/90 hover:bg-emerald-200 text-emerald-800 border-emerald-200',
              Financial: isActive ? 'bg-amber-700 text-white border-amber-700' : 'bg-amber-100/90 hover:bg-amber-200 text-amber-900 border-amber-200',
              Surveillance: isActive ? 'bg-sky-700 text-white border-sky-700' : 'bg-sky-100/90 hover:bg-sky-200 text-sky-800 border-sky-200',
            };

            return (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1 rounded-md border text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  pillColors[type] || (isActive ? 'bg-slate-900 text-white' : 'bg-[#eae5da] text-slate-700')
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {filteredDocs.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs font-medium">
            No case files matching criteria.
          </div>
        ) : (
          filteredDocs.map((doc) => {
            const isSelected = selectedDocumentId === doc.id;
            const config = DOCUMENT_TYPE_CONFIG[doc.type] || DOCUMENT_TYPE_CONFIG.FIR;

            return (
              <div
                key={doc.id}
                onClick={() => onSelectDocument(doc)}
                className={`group relative p-3.5 rounded-xl border cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? 'bg-white border-[#cbc4b3] shadow-md border-l-4 border-l-slate-900 ring-1 ring-slate-900/10'
                    : 'bg-[#faf8f5] hover:bg-white border-[#e5e0d5] hover:border-[#d5cebf] shadow-xs hover:shadow-sm'
                }`}
              >
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${config.color}`}>
                      {config.label}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {doc.id}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 font-normal">
                    {doc.date}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xs font-semibold text-slate-900 font-sans line-clamp-1 group-hover:text-slate-700 transition-colors">
                  {doc.title}
                </h3>

                {/* Authority */}
                <p className="text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-1 font-sans">
                  {doc.sourceAuthority}
                </p>

                {/* Brief Summary */}
                <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed font-sans font-normal">
                  {doc.summary}
                </p>

                {/* Footer Action Strip */}
                <div className="mt-2.5 pt-2 border-t border-[#f0eadf] flex items-center justify-between text-xs">
                  <span className="text-[10px] font-medium tracking-wider text-slate-600 bg-[#ede8df] px-2 py-0.5 rounded border border-[#e0d9cc] uppercase">
                    {doc.classification}
                  </span>

                  <div className="flex items-center space-x-3 font-sans">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDocument(doc);
                      }}
                      className="text-slate-600 hover:text-slate-900 font-medium text-xs transition-colors cursor-pointer"
                      title="Inspect full document text"
                    >
                      Read Text
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTriggerExtraction(doc);
                      }}
                      disabled={isExtracting}
                      className="text-xs font-semibold text-cyan-300 bg-[#1e232a] hover:bg-[#28303d] border border-cyan-700/50 px-2.5 py-1 rounded-md transition-all cursor-pointer shadow-xs disabled:opacity-50"
                      title="Run structured extraction"
                    >
                      {isExtracting ? 'Parsing...' : 'Extract'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
