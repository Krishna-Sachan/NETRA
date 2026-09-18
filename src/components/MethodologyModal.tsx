import React from 'react';
import { X, Shield, CheckCircle2, AlertTriangle, FileText, Cpu, Scale } from 'lucide-react';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0b0f19] border border-slate-700/80 rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-xs text-slate-300">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/70">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded bg-cyan-950/80 border border-cyan-700/50 text-cyan-400">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
                NETRA Protocol & Decision-Support Principles
              </h2>
              <p className="text-[11px] text-slate-400 font-sans">
                Smart India Hackathon // Ministry of Home Affairs Problem Statement
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 leading-relaxed">
          {/* Synthetic Data Disclaimer */}
          <div className="p-3 bg-amber-950/30 border border-amber-800/50 rounded-lg text-amber-200 text-[11px]">
            <div className="font-mono font-bold flex items-center space-x-1.5 mb-1 text-amber-300 uppercase">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Synthetic Non-Operational Data Notice</span>
            </div>
            <p className="text-slate-300 text-[11px]">
              This software is a technical demonstration prototype developed for academic & hackathon evaluation. All case files (FIRs, CDR matrices, financial audit reports, and surveillance notes), suspect identities, phone numbers, license plates, and locations are 100% synthetic and fictional.
            </p>
          </div>

          {/* Hard Constraints & Anti-Bias Mandates */}
          <div className="space-y-2">
            <h3 className="font-mono uppercase text-cyan-400 font-bold text-xs">
              1. Core Decision-Support Constraints
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
                <span className="font-mono font-semibold text-rose-400 block mb-1">
                  NO Criminality Scoring
                </span>
                <p className="text-slate-400 text-[10px]">
                  NETRA will NEVER calculate or display a single numerical "criminality" or "threat" score. All prioritization is explained through observable structural signals (e.g. betweenness centrality, shared burner IMEI).
                </p>
              </div>

              <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
                <span className="font-mono font-semibold text-emerald-400 block mb-1">
                  100% Traceable Evidence Snippets
                </span>
                <p className="text-slate-400 text-[10px]">
                  Every entity, relationship, and finding extracted by Gemini MUST include the exact verbatim sentence from the official case file. No ungrounded conclusions are permitted.
                </p>
              </div>
            </div>
          </div>

          {/* Entity Ontology */}
          <div className="space-y-2">
            <h3 className="font-mono uppercase text-cyan-400 font-bold text-xs">
              2. 7-Class Strict Entity Ontology
            </h3>
            <p className="text-slate-400 text-[11px]">
              Case narratives are parsed into 7 canonical structured types:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
              <div className="p-1.5 rounded bg-slate-900 border border-cyan-500/30 text-cyan-300">PERSON (Suspects / Contacts)</div>
              <div className="p-1.5 rounded bg-slate-900 border border-emerald-500/30 text-emerald-300">PHONE (MSISDN / Burners)</div>
              <div className="p-1.5 rounded bg-slate-900 border border-amber-500/30 text-amber-300">VEHICLE (Plates / Carriers)</div>
              <div className="p-1.5 rounded bg-slate-900 border border-rose-500/30 text-rose-300">LOCATION (Hubs / Ports)</div>
              <div className="p-1.5 rounded bg-slate-900 border border-purple-500/30 text-purple-300">ORGANIZATION (Fronts)</div>
              <div className="p-1.5 rounded bg-slate-900 border border-sky-500/30 text-sky-300">EVENT (Meets / Transshipment)</div>
              <div className="p-1.5 rounded bg-slate-900 border border-yellow-500/30 text-yellow-300">TRANSACTION (Wires / Cash)</div>
            </div>
          </div>

          {/* Architecture */}
          <div className="space-y-1.5">
            <h3 className="font-mono uppercase text-cyan-400 font-bold text-xs">
              3. System Architecture
            </h3>
            <p className="text-slate-400 text-[11px]">
              Full-stack application built with Express + Vite middleware, Cytoscape.js force-directed topology simulation, and Google Gemini 3.8 Flash SDK via server-side schema routing.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold font-mono text-xs"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
