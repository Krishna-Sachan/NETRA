import React, { useState } from 'react';
import {
  X,
  Clock,
  Shield,
  Trash2,
  Search,
  Filter,
  Lock,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { AuditEvent, AuditAction } from '../types';
import { AUDIT_ACTION_LABELS, clearDemoAuditEvents } from '../services/auditService';
import { ROLE_DISPLAY_LABELS } from '../services/accessPolicy';

interface AuditLogPaneProps {
  isOpen: boolean;
  onClose: () => void;
  events: AuditEvent[];
  onEventsCleared: () => void;
}

export const AuditLogPane: React.FC<AuditLogPaneProps> = ({
  isOpen,
  onClose,
  events,
  onEventsCleared,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState<AuditAction | 'ALL'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredEvents = events.filter((ev) => {
    const matchesAction = filterAction === 'ALL' || ev.action === filterAction;
    const matchesSearch =
      !searchQuery ||
      ev.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.targetId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.targetType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      Object.values(ev.metadata || {}).some(v => String(v).toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesAction && matchesSearch;
  });

  const handleClear = () => {
    clearDemoAuditEvents();
    onEventsCleared();
  };

  const uniqueActions = [...new Set(events.map(e => e.action))] as AuditAction[];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0b0f19] border border-slate-700/80 rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded bg-amber-950/60 border border-amber-700/50 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
                Audit Trail
              </h2>
              <div className="flex items-center space-x-1 text-[10px] text-slate-500 font-mono">
                <Lock className="w-2.5 h-2.5" />
                <span>DEMO LOCAL — localStorage, not tamper-resistant</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleClear}
              className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Clear demo audit log"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-3 border-b border-slate-800/60 flex items-center space-x-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events..."
              className="w-full bg-slate-900/90 border border-slate-800 rounded pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
            />
          </div>

          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value as AuditAction | 'ALL')}
            className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="ALL">All Actions</option>
            {uniqueActions.map((a) => (
              <option key={a} value={a}>{AUDIT_ACTION_LABELS[a] || a}</option>
            ))}
          </select>
        </div>

        {/* Events List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {filteredEvents.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs font-mono">
              {events.length === 0 ? 'No audit events recorded yet.' : 'No events match filter criteria.'}
            </div>
          ) : (
            filteredEvents.map((ev) => {
              const isExpanded = expandedId === ev.id;
              const hasMetadata = ev.metadata && Object.keys(ev.metadata).length > 0;

              return (
                <div
                  key={ev.id}
                  className="rounded-lg border border-slate-800/70 bg-slate-900/40 hover:bg-slate-900/60 transition-colors"
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : ev.id)}
                    className="w-full px-3 py-2.5 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <span className="text-[10px] font-mono text-slate-500 flex-shrink-0 w-36">
                        {new Date(ev.timestamp).toLocaleString()}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase border border-slate-700/60 bg-slate-800/60 text-slate-300 flex-shrink-0">
                        {ROLE_DISPLAY_LABELS[ev.role]}
                      </span>
                      <span className="text-xs text-slate-200 font-medium truncate">
                        {AUDIT_ACTION_LABELS[ev.action] || ev.action}
                      </span>
                      {ev.targetId && (
                        <span className="text-[10px] font-mono text-cyan-400/70 truncate">
                          → {ev.targetId}
                        </span>
                      )}
                    </div>
                    {hasMetadata && (
                      isExpanded
                        ? <ChevronDown className="w-3 h-3 text-slate-500 flex-shrink-0" />
                        : <ChevronRight className="w-3 h-3 text-slate-500 flex-shrink-0" />
                    )}
                  </button>

                  {isExpanded && hasMetadata && (
                    <div className="px-3 pb-2.5 pt-0">
                      <div className="p-2 rounded bg-slate-950/50 border border-slate-800/50 text-[10px] font-mono text-slate-400 space-y-0.5">
                        {Object.entries(ev.metadata!).map(([key, val]) => (
                          <div key={key}>
                            <span className="text-slate-500">{key}:</span>{' '}
                            <span className="text-slate-300">{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Count */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>Showing {filteredEvents.length} of {events.length} events</span>
          <span>Capped at 500 entries (demo)</span>
        </div>
      </div>
    </div>
  );
};
