import React, { useState, useRef, useEffect } from 'react';
import { UserCircle2, ChevronDown, Shield, Lock } from 'lucide-react';
import { UserRole } from '../types';
import { ALL_ROLES, ROLE_DISPLAY_LABELS } from '../services/accessPolicy';

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  currentRole,
  onRoleChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roleColors: Record<UserRole, string> = {
    ADMIN: 'text-white border-white/30 bg-white/10 hover:bg-white/20',
    SENIOR_INVESTIGATOR: 'text-amber-300 border-amber-500/40 bg-amber-950/30',
    INVESTIGATOR: 'text-cyan-300 border-cyan-500/40 bg-cyan-950/30',
    ANALYST: 'text-slate-300 border-slate-500/40 bg-slate-800/30',
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center space-x-1.5 px-2.5 py-1.5 text-[11px] font-mono rounded border transition-colors ${roleColors[currentRole]}`}
        title="Switch demo role (local simulation only)"
      >
        <UserCircle2 className="w-3.5 h-3.5" />
        <span>{ROLE_DISPLAY_LABELS[currentRole]}</span>
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-64 rounded-lg bg-[#0c111d] border border-slate-700/80 shadow-2xl z-50 overflow-hidden">
          <div className="p-2 border-b border-slate-800/80 bg-slate-900/60">
            <div className="flex items-center space-x-1 text-[10px] font-mono text-slate-400">
              <Lock className="w-3 h-3" />
              <span>DEMO LOCAL — Not real authentication</span>
            </div>
          </div>

          <div className="p-1">
            {ALL_ROLES.map((role) => {
              const isActive = role === currentRole;
              return (
                <button
                  key={role}
                  onClick={() => {
                    onRoleChange(role);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded text-left transition-colors text-xs ${
                    isActive
                      ? 'bg-cyan-950/40 text-cyan-300 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono border ${roleColors[role]}`}>
                        {role.replace(/_/g, ' ')}
                      </span>
                    </div>
                    {isActive && <Shield className="w-3 h-3 text-cyan-400" />}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {getRoleDescription(role)}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

function getRoleDescription(role: UserRole): string {
  switch (role) {
    case 'ADMIN': return 'Full access — all actions, all data, report generation, case reset';
    case 'SENIOR_INVESTIGATOR': return 'Full data access, merge/export, report generation, case reset';
    case 'INVESTIGATOR': return 'Full data access, merge/export, report generation';
    case 'ANALYST': return 'View-only with sensitive fields masked, no merge/export/report';
  }
}
