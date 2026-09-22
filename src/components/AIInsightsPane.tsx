import React, { useState } from 'react';
import { AIInsight } from '../types';
import { InfoTooltip } from './InfoTooltip';
import { ConfidenceBadge } from './ConfidenceBadge';

interface AIInsightsPaneProps {
  insights: AIInsight[];
  onHighlightEntities: (entityIds: string[]) => void;
  onRefreshInsights: () => void;
  isAnalyzing: boolean;
}

const CATEGORY_TAGS: Record<string, { label: string; color: string }> = {
  CROSS_CLUSTER_BRIDGE: { label: 'Cross-Cluster Bridge', color: 'bg-sky-50 border-sky-200/90 text-sky-700' },
  COMMUNICATION_HUB: { label: 'Burner Phone Hub', color: 'bg-emerald-50 border-emerald-200/90 text-emerald-700' },
  FINANCIAL_CONDUIT: { label: 'Financial Conduit', color: 'bg-amber-50 border-amber-200/90 text-amber-800' },
  CO_PRESENCE_ANOMALY: { label: 'Co-Presence Anomaly', color: 'bg-purple-50 border-purple-200/90 text-purple-700' },
  LOGISTICAL_PIVOT: { label: 'Logistical Pivot', color: 'bg-rose-50 border-rose-200/90 text-rose-700' },
};

export const AIInsightsPane: React.FC<AIInsightsPaneProps> = ({
  insights,
  onHighlightEntities,
  onRefreshInsights,
  isAnalyzing,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const filteredInsights = insights.filter((ins) => {
    if (activeCategory === 'ALL') return true;
    return ins.category === activeCategory;
  });

  return (
    <div className="flex flex-col h-full bg-[#f4f1ea] border-l border-[#e0d9cc] text-[#1c1e22] select-none text-xs font-sans overflow-hidden">
      {/* Header */}
      <div className="p-3.5 border-b border-[#e2dcd0] flex items-center justify-between bg-[#ede8df] flex-shrink-0">
        <div className="flex items-center space-x-2">
          <h2 className="text-xs font-bold tracking-wider text-slate-900 uppercase font-sans">
            AI Insights Feed
          </h2>
          <InfoTooltip
            title="AI Pattern Insights Engine"
            description="Synthesizes cross-cluster bridges, high-frequency burner phone hubs, and financial structuring patterns using Gemini 3.8."
            howToUse="Review AI lead hypotheses with verbatim document evidence citations."
            variant="highlight"
          />
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#e3ded3] text-slate-800 border border-[#d6cfc2]">
            {filteredInsights.length} Findings
          </span>
        </div>

        <button
          onClick={onRefreshInsights}
          disabled={isAnalyzing}
          className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-all cursor-pointer shadow-xs disabled:opacity-50"
          title="Trigger graph-level pattern analysis"
        >
          {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
        </button>
      </div>

      {/* Investigator Directive Notice */}
      <div className="px-3.5 py-2 bg-[#ede8df]/60 border-b border-[#e2dcd0] text-[11px] text-slate-600 leading-relaxed font-normal">
        <span className="text-slate-900 font-semibold mr-1">NOTICE:</span>
        Findings are decision-support hypotheses grounded strictly in cited evidence snippets.
      </div>

      {/* Category Filter Pills */}
      <div className="px-3 py-2 border-b border-[#e2dcd0] flex items-center space-x-1.5 overflow-x-auto no-scrollbar text-xs font-medium bg-[#f4f1ea]">
        <button
          onClick={() => setActiveCategory('ALL')}
          className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
            activeCategory === 'ALL'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-[#faf8f5] text-slate-700 border-[#e0d9cc] hover:bg-[#ede8df]'
          }`}
        >
          All Signals
        </button>
        {Object.entries(CATEGORY_TAGS).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === key
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs font-semibold'
                : 'bg-[#faf8f5] text-slate-700 border-[#e0d9cc] hover:bg-[#ede8df]'
            }`}
          >
            {cfg.label}
          </button>
        ))}
      </div>

      {/* Feed List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
        {filteredInsights.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs font-medium">
            No insights matching selected filter. Click "Run Analysis" to query Gemini.
          </div>
        ) : (
          filteredInsights.map((ins) => {
            const cat = CATEGORY_TAGS[ins.category] || { label: ins.category, color: 'bg-slate-100 border-slate-200 text-slate-700' };
            const confidenceScore = ins.priorityLevel === 'HIGH_PRIORITY' ? 90 : 75;

            return (
              <div
                key={ins.id}
                className="p-3.5 rounded-xl bg-[#faf8f5] hover:bg-white border border-[#e0d9cc] shadow-xs hover:shadow-sm transition-all duration-150 space-y-2 text-xs"
              >
                {/* Header: Category & Confidence */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${cat.color}`}>
                    {cat.label}
                  </span>

                  <ConfidenceBadge
                    score={confidenceScore}
                    label="Signal Confidence"
                    calculationDescription="Confidence score derived from corroborating primary evidence items & network centrality metrics."
                  />
                </div>

                {/* Finding Title */}
                <h3 className="text-xs font-semibold text-slate-900 leading-snug">
                  {ins.title}
                </h3>

                {/* Contributing Signals */}
                <div className="bg-slate-50/80 rounded-lg p-2.5 border border-slate-200/80 space-y-1">
                  <div className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                    Contributing Signals:
                  </div>
                  <ul className="space-y-0.5 text-[11px] text-slate-700">
                    {ins.contributingSignals.map((signal, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5">
                        <span className="text-slate-400 font-bold">•</span>
                        <span className="leading-tight">{signal}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Grounded Evidence Snippet Trace */}
                {ins.evidenceSnippets && ins.evidenceSnippets.length > 0 && (
                  <div className="bg-slate-50/60 rounded-lg p-2 border border-slate-200/70 text-[11px]">
                    <div className="text-[10px] font-semibold text-slate-500 uppercase mb-0.5">
                      Traceable Evidence ({ins.evidenceSnippets[0].documentId}):
                    </div>
                    <p className="italic text-slate-600 line-clamp-2 border-l-2 border-slate-400 pl-2 text-xs leading-relaxed">
                      "{ins.evidenceSnippets[0].snippet}"
                    </p>
                  </div>
                )}

                {/* Recommended Follow-Up Inquiries */}
                {ins.recommendedInquiry && ins.recommendedInquiry.length > 0 && (
                  <div className="pt-1 text-[11px] space-y-1">
                    <div className="text-[10px] font-semibold text-slate-600 uppercase">
                      Recommended Follow-Up Inquiries:
                    </div>
                    <ul className="space-y-0.5 text-slate-700 text-xs">
                      {ins.recommendedInquiry.slice(0, 2).map((inq, i) => (
                        <li key={i} className="flex items-start space-x-1">
                          <span className="text-slate-400 font-bold">→</span>
                          <span>{inq}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Bottom Action Strip */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-normal">
                    {ins.involvedEntityIds.length} Linked Nodes
                  </span>

                  <button
                    onClick={() => onHighlightEntities(ins.involvedEntityIds)}
                    className="text-xs font-semibold text-slate-800 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    Highlight in Network
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
