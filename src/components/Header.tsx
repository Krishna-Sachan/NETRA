import React from 'react';
import { UserRole } from '../types';
import { RoleSwitcher } from './RoleSwitcher';

interface HeaderProps {
  onGoHome?: () => void;
  onOpenIngest: () => void;
  onResetGraph: () => void;
  onOpenMethodology: () => void;
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

        {/* Clean NETRA Branding */}
        <div className="flex items-center space-x-2 pl-1">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse"></span>
          <h1 className="text-base font-extrabold tracking-widest text-white uppercase font-sans">
            NETRA
          </h1>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#252b38] text-cyan-300 border border-[#343c4e] font-semibold">
            v2.4
          </span>
        </div>
      </div>

      {/* Center: Sleek Executive Toggle Controls */}
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
      </div>

      {/* Right: Actions & Role */}
      <div className="flex items-center space-x-2">
        {currentRole && onRoleChange && (
          <div className="hidden md:block">
            <RoleSwitcher currentRole={currentRole} onRoleChange={onRoleChange} />
          </div>
        )}

        {onOpenAuditLog && (
          <button
            onClick={onOpenAuditLog}
            className="px-3 py-1.5 rounded-lg text-indigo-300 hover:text-white bg-[#252a36] hover:bg-[#2e3443] border border-[#343b4d] transition-all text-xs font-medium cursor-pointer shadow-xs"
            title="View Audit Log"
          >
            Audit Log
          </button>
        )}

        {onGenerateReport && (
          <button
            onClick={onGenerateReport}
            className="px-3 py-1.5 rounded-lg text-amber-300 hover:text-white bg-[#252a36] hover:bg-[#2e3443] border border-[#343b4d] transition-all text-xs font-medium cursor-pointer shadow-xs"
            title="Generate Case Intelligence Report"
          >
            Report
          </button>
        )}

        <button
          onClick={onOpenIngest}
          className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white transition-all cursor-pointer shadow-xs"
          title="Extract entities from new case document or FIR"
        >
          + Ingest File
        </button>

        <button
          onClick={onResetGraph}
          className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-rose-300 bg-[#252a36] hover:bg-rose-950/40 border border-[#323847] transition-all text-xs font-medium cursor-pointer"
          title="Reset graph to default baseline"
        >
          Reset
        </button>
      </div>
    </header>
  );
};




