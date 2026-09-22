import React, { useState } from 'react';
import { AnomalyFinding } from '../types';
import { InfoTooltip } from './InfoTooltip';
import { ConfidenceBadge } from './ConfidenceBadge';

interface AnomalyRadarPaneProps {
  anomalies: AnomalyFinding[];
  onHighlightEntities: (entityIds: string[]) => void;
  onSelectEntity?: (entityId: string) => void;
}

export const AnomalyRadarPane: React.FC<AnomalyRadarPaneProps> = ({
  anomalies,
  onHighlightEntities,
  onSelectEntity,
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [expandedAnomalyId, setExpandedAnomalyId] = useState<string | null>(null);

  const filteredAnomalies = anomalies.filter(a => {
    if (selectedSeverity === 'ALL') return true;
    return a.severity === selectedSeverity;
  });

  const handleToggleExpand = (id: string, entityIds: string[]) => {
    if (expandedAnomalyId === id) {
      setExpandedAnomalyId(null);
    } else {
      setExpandedAnomalyId(id);
      onHighlightEntities(entityIds);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f4f1ea] border-l border-[#e0d9cc] text-[#1c1e22] select-none text-xs font-sans overflow-hidden">
      {/* Pane Header */}
      <div className="px-3.5 py-3 border-b border-[#e2dcd0] bg-[#ede8df] flex-shrink-0 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <h3 className="text-xs font-bold tracking-wider text-slate-900 uppercase font-sans">
              Anomaly Radar
            </h3>
            <InfoTooltip
              title="Rule-Based Anomaly Radar"
              description="Detects operational anomalies such as communication spikes, burner phone surges, location co-presences, and financial structuring."
              calculation="Uses rule engines evaluating historical baseline deviations and temporal frequency spikes."
              howToUse="Click an anomaly card to highlight all involved entities directly in the network canvas."
              variant="highlight"
            />
          </div>

          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300">
            {filteredAnomalies.length} Signals
          </span>
        </div>

        {/* Severity Filter Pills */}
        <div className="flex items-center space-x-1.5 pt-1 text-xs font-medium">
          {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(sev => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-all cursor-pointer ${
                selectedSeverity === sev
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-[#faf8f5] text-slate-700 border-[#e0d9cc] hover:bg-[#ede8df]'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Anomalies List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
        {filteredAnomalies.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs font-medium">
            No network anomalies detected for selected severity.
          </div>
        ) : (
          filteredAnomalies.map(item => {
            const isExpanded = expandedAnomalyId === item.id;
            const severityScore = item.severity === 'HIGH' ? 92 : item.severity === 'MEDIUM' ? 72 : 45;

            return (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-[#faf8f5] hover:bg-white border border-[#e0d9cc] shadow-xs transition-all space-y-2 text-xs"
              >
                {/* Header: Type & Severity */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {item.detectorType || item.category || 'ANOMALY'}
                  </span>

                  <ConfidenceBadge
                    score={severityScore}
                    label="Anomaly Severity"
                    calculationDescription="Severity score derived from rule trigger thresholds & baseline deviation multipliers."
                  />
                </div>

                {/* Title & Description */}
                <h4 className="font-semibold text-slate-900 text-xs leading-snug">
                  {item.title}
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {item.description}
                </p>

                {/* Expandable Details */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleExpand(item.id, item.involvedEntityIds)}
                    className="text-xs font-semibold text-slate-800 hover:text-slate-900 cursor-pointer"
                  >
                    {isExpanded ? 'Hide Details' : 'Highlight & View Details'}
                  </button>

                  <span className="text-[11px] text-slate-400">
                    {item.involvedEntityIds.length} Nodes Involved
                  </span>
                </div>

                {isExpanded && (
                  <div className="pt-2 space-y-2 border-t border-slate-100 bg-slate-50/70 p-2.5 rounded-lg text-xs">
                    <div className="font-semibold text-slate-700 uppercase text-[10px]">
                      Grounded Evidence:
                    </div>
                    <p className="text-slate-600 italic bg-white p-2 rounded border border-slate-200 text-xs">
                      "{item.evidenceText}"
                    </p>

                    {item.recommendedAction && (
                      <div className="pt-1 text-slate-700">
                        <span className="font-semibold text-slate-800">Action: </span>
                        <span>{item.recommendedAction}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
