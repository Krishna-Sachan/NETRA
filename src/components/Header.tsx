import React from 'react';
import { UserRole } from '../types';
import { RoleSwitcher } from './RoleSwitcher';
import { InfoTooltip } from './InfoTooltip';

interface HeaderProps {
  onGoHome?: () => void;
  onOpenIngest: () => void;
  onResetGraph: () => void;
  onOpenMethodology: () => void;
  onOpenGuide?: () => void;
  entityCount?: number;
  relationshipCount?: number;
  documentCount?: number;
  isAiAnalyzing?: boolean;
  currentRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
  onOpenAuditLog?: () => void;
  onGenerateReport?: () => void;
  isLeftSidebarOpen?: boolean;
  isRightSidebarOpen?: boolean;
  onToggleLeftSidebar?: () => void;
  onToggleRightSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onGoHome,
  onOpenIngest,
  onResetGraph,
  onOpenMethodology,
  onOpenGuide,
  currentRole,
  onRoleChange,
  onOpenAuditLog,
  onGenerateReport,
  isLeftSidebarOpen = true,
  isRightSidebarOpen = true,
  onToggleLeftSidebar,
  onToggleRightSidebar,
}) => {
  return (
    <header className="h-14 border-b border-[#2d323e] bg-[#1a1d26] px-5 flex items-center justify-between z-30 select-none text-white shadow-md">
      {/* Left: Brand & Home Option */}
      <div className="flex items-center space-x-3.5">
        {onGoHome && (
          <button
            onClick={onGoHome}
            className="px-3 py-1.5 rounded-lg bg-[#2a2f3d] hover:bg-[#343b4c] text-slate-200 border border-[#394052] text-xs font-semibold transition-all cursor-pointer shadow-xs"
            title="Return to Landing Page & Select Case"
          >
            <span>‹ Home</span>
          </button>
        )}

        {/* Clean NETRA Branding & System Info */}
        <div className="flex items-center space-x-2 pl-1">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse"></span>
          <h1 className="text-base font-extrabold tracking-widest text-white uppercase font-sans">
            NETRA
          </h1>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#252b38] text-cyan-300 border border-[#343c4e] font-semibold">
            v2.4
          </span>

          <InfoTooltip
            title="NETRA Intelligence Platform"
            description="Law enforcement criminal network intelligence platform combining graph analytics, fuzzy entity deduplication, and timeline story reconstruction."
            howToUse="Click 'Quick Guide' or any (i) icon across the interface for feature walkthroughs and score explanations."
            position="bottom"
            size="sm"
          />

          {onOpenGuide && (
            <button
              onClick={onOpenGuide}
              className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/35 text-cyan-300 border border-cyan-400/60 text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer shadow-xs ml-1.5"
              title="Open Complete System & Feature Guide"
            >
              <span className="font-mono font-bold italic text-xs">i</span>
              <span>Quick Guide</span>
            </button>
          )}
        </div>
      </div>

      {/* Center: Executive Toggle Controls */}
      <div className="flex items-center space-x-2">
        {onToggleLeftSidebar && (
          <button
            onClick={onToggleLeftSidebar}
            className={`px-3.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              isLeftSidebarOpen
                ? 'bg-[#2e3748] text-cyan-300 border-[#434f66] font-bold shadow-xs'
                : 'bg-[#252a36] text-slate-300 hover:text-white border-[#323847] hover:bg-[#2e3443]'
            }`}
            title={isLeftSidebarOpen ? 'Hide Case Files Panel' : 'Show Case Files Panel'}
          >
            <span>{isLeftSidebarOpen ? 'Hide Files' : 'Show Files'}</span>
          </button>
        )}

        {onToggleRightSidebar && (
          <button
            onClick={onToggleRightSidebar}
            className={`px-3.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              isRightSidebarOpen
                ? 'bg-[#2e3748] text-cyan-300 border-[#434f66] font-bold shadow-xs'
                : 'bg-[#252a36] text-slate-300 hover:text-white border-[#323847] hover:bg-[#2e3443]'
            }`}
            title={isRightSidebarOpen ? 'Hide Intelligence Panel' : 'Show Intelligence Panel'}
          >
            <span>{isRightSidebarOpen ? 'Hide Intelligence' : 'Show Intelligence'}</span>
          </button>
        )}

        <InfoTooltip
          title="Workspace Sidebar Toggles"
          description="Toggle the left Case Files panel or right Intelligence panel to customize your layout. Hide both panels for full-screen graph analysis."
          position="bottom"
          size="sm"
        />
      </div>

      {/* Right: Actions & Role */}
      <div className="flex items-center space-x-2">
        {currentRole && onRoleChange && (
          <div className="hidden md:flex items-center space-x-1">
            <RoleSwitcher currentRole={currentRole} onRoleChange={onRoleChange} />
            <InfoTooltip
              title="Role-Based Security Policy"
              description="Switch roles (Admin, Investigator, Analyst) to test permission boundaries and auditable access scopes."
              position="bottom"
              size="sm"
            />
          </div>
        )}

        {onOpenAuditLog && (
          <div className="flex items-center space-x-1">
            <button
              onClick={onOpenAuditLog}
              className="px-3 py-1.5 rounded-lg text-indigo-300 hover:text-white bg-[#252a36] hover:bg-[#2e3443] border border-[#343b4d] transition-all text-xs font-medium cursor-pointer shadow-xs"
              title="View Audit Log"
            >
              Audit Log
            </button>
            <InfoTooltip
              title="Auditable Chain of Custody Log"
              description="Tracks every analyst action, search, entity view, and report generation event with immutable role-based timestamps."
              howToUse="Click Audit Log to inspect full compliance trail & export audit verification logs."
              position="bottom"
              size="sm"
            />
          </div>
        )}

        {onGenerateReport && (
          <div className="flex items-center space-x-1">
            <button
              onClick={onGenerateReport}
              className="px-3 py-1.5 rounded-lg text-amber-300 hover:text-white bg-[#252a36] hover:bg-[#2e3443] border border-[#343b4d] transition-all text-xs font-medium cursor-pointer shadow-xs"
              title="Generate Case Intelligence Report"
            >
              Report
            </button>
            <InfoTooltip
              title="Case Report Generator"
              description="Compiles an executive dossier containing key suspects, network metrics, timeline events, and detected anomalies."
              howToUse="Click Report to preview, format, or print the official case report."
              position="bottom"
              size="sm"
            />
          </div>
        )}

        <div className="flex items-center space-x-1">
          <button
            onClick={onOpenIngest}
            className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white transition-all cursor-pointer shadow-xs"
            title="Extract entities from new case document or FIR"
          >
            + Ingest File
          </button>
          <InfoTooltip
            title="Document & FIR Ingestion"
            description="Extracts structured entities (Persons, Phones, Vehicles, Locations, Transactions) from FIRs, CDRs, and transcripts."
            howToUse="Click + Ingest File to paste text or upload documents for automated entity extraction."
            position="bottom"
            size="sm"
          />
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={onResetGraph}
            className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-rose-300 bg-[#252a36] hover:bg-rose-950/40 border border-[#323847] transition-all text-xs font-medium cursor-pointer"
            title="Reset graph to default baseline"
          >
            Reset
          </button>
          <InfoTooltip
            title="Reset Case View"
            description="Clears active search filters, node selections, and timeline cutoffs, restoring the graph to baseline."
            position="bottom"
            size="sm"
          />
        </div>
      </div>
    </header>
  );
};




