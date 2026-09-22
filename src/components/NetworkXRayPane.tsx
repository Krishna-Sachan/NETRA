import React, { useState } from 'react';
import { NetworkXRayReport, NodeXRayMetrics, CommunityCluster } from '../types';
import { InfoTooltip } from './InfoTooltip';
import { ConfidenceBadge } from './ConfidenceBadge';

interface NetworkXRayPaneProps {
  report: NetworkXRayReport;
  activeMode: 'INFLUENCERS' | 'BRIDGES' | 'CLUSTERS' | 'ISOLATED';
  onChangeMode: (mode: 'INFLUENCERS' | 'BRIDGES' | 'CLUSTERS' | 'ISOLATED') => void;
  onHighlightEntities: (nodeIds: string[]) => void;
  onSelectEntity: (entityId: string) => void;
}

export const NetworkXRayPane: React.FC<NetworkXRayPaneProps> = ({
  report,
  activeMode,
  onChangeMode,
  onHighlightEntities,
  onSelectEntity,
}) => {
  const [selectedClusterId, setSelectedClusterId] = useState<number | null>(null);

  const handleModeChange = (mode: 'INFLUENCERS' | 'BRIDGES' | 'CLUSTERS' | 'ISOLATED') => {
    onChangeMode(mode);
    if (mode === 'INFLUENCERS') {
      const topIds = report.influencers.slice(0, 6).map(n => n.id);
      onHighlightEntities(topIds);
    } else if (mode === 'BRIDGES') {
      const bridgeIds = report.bridges.map(n => n.id);
      onHighlightEntities(bridgeIds);
    } else if (mode === 'ISOLATED') {
      const isoIds = report.isolatedEntities.map(n => n.id);
      onHighlightEntities(isoIds);
    } else if (mode === 'CLUSTERS') {
      if (report.clusters.length > 0) {
        setSelectedClusterId(report.clusters[0].id);
        onHighlightEntities(report.clusters[0].nodeIds);
      }
    }
  };

  const handleSelectCluster = (cluster: CommunityCluster) => {
    setSelectedClusterId(cluster.id);
    onHighlightEntities(cluster.nodeIds);
  };

  return (
    <div className="flex flex-col h-full bg-[#f4f1ea] border-l border-[#e0d9cc] text-[#1c1e22] select-none text-xs font-sans overflow-hidden">
      {/* Pane Header */}
      <div className="px-3.5 py-3 border-b border-[#e2dcd0] bg-[#ede8df] flex-shrink-0 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <h3 className="text-xs font-bold tracking-wider text-slate-900 uppercase font-sans">
              Network X-Ray
            </h3>
            <InfoTooltip
              title="Network X-Ray Analysis"
              description="Evaluates graph topology, centrality metrics (Degree, Betweenness), and community structures using the Louvain modularity algorithm."
              howToUse="Click any mode button below to highlight top influencers, structural bridge entities, or distinct operational clusters."
              calculation="Calculates Degree Centrality (total direct links) and Betweenness Centrality (shortest paths passing through each node)."
              variant="highlight"
            />
          </div>

          <div className="flex items-center space-x-1">
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#e3ded3] text-slate-800 border border-[#d6cfc2]">
              Density: {report.graphDensity}
            </span>
            <InfoTooltip
              title="Graph Density Metric"
              description={`Graph density (${report.graphDensity}) measures how interconnected the entities in this case file are relative to maximum potential links.`}
              calculation="Density = (2 * Actual Edges) / (Total Nodes * (Total Nodes - 1))"
            />
          </div>
        </div>

        {/* 4 Action Mode Buttons */}
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <button
            onClick={() => handleModeChange('INFLUENCERS')}
            className={`w-full px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer text-center flex items-center justify-center space-x-1 ${
              activeMode === 'INFLUENCERS'
                ? 'bg-slate-900 text-white font-semibold shadow-xs'
                : 'bg-[#faf8f5] text-slate-700 border border-[#e0d9cc] hover:bg-[#ede8df]'
            }`}
          >
            <span>Find Influencers</span>
          </button>

          <button
            onClick={() => handleModeChange('BRIDGES')}
            className={`w-full px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer text-center flex items-center justify-center space-x-1 ${
              activeMode === 'BRIDGES'
                ? 'bg-slate-900 text-white font-semibold shadow-xs'
                : 'bg-[#faf8f5] text-slate-700 border border-[#e0d9cc] hover:bg-[#ede8df]'
            }`}
          >
            <span>Find Bridges</span>
          </button>

          <button
            onClick={() => handleModeChange('CLUSTERS')}
            className={`w-full px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer text-center flex items-center justify-center space-x-1 ${
              activeMode === 'CLUSTERS'
                ? 'bg-slate-900 text-white font-semibold shadow-xs'
                : 'bg-[#faf8f5] text-slate-700 border border-[#e0d9cc] hover:bg-[#ede8df]'
            }`}
          >
            <span>Detect Clusters</span>
          </button>

          <button
            onClick={() => handleModeChange('ISOLATED')}
            className={`w-full px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer text-center flex items-center justify-center space-x-1 ${
              activeMode === 'ISOLATED'
                ? 'bg-slate-900 text-white font-semibold shadow-xs'
                : 'bg-[#faf8f5] text-slate-700 border border-[#e0d9cc] hover:bg-[#ede8df]'
            }`}
          >
            <span>Isolated Nodes</span>
          </button>
        </div>
      </div>

      {/* Mode Content View */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
        {activeMode === 'INFLUENCERS' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium px-1">
              <span>Nodes ranked by Degree & Centrality Importance:</span>
              <InfoTooltip
                title="Node Importance Calculation"
                description="Calculated from normalized degree and betweenness centrality."
                calculation="Importance % = (0.6 * Normalized Degree + 0.4 * Normalized Betweenness) * 100"
              />
            </div>
            {report.influencers.map((item: NodeXRayMetrics, idx: number) => (
              <div
                key={item.id}
                onClick={() => onSelectEntity(item.id)}
                className="p-3 rounded-xl bg-white/70 hover:bg-white/95 border border-slate-200/90 shadow-xs transition-all cursor-pointer space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">
                    #{idx + 1} {item.label}
                  </span>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {item.type}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                  <span>Degree: <strong>{item.degree}</strong> links</span>
                  <ConfidenceBadge
                    score={item.betweennessPercentile}
                    label="Importance"
                    calculationDescription={`Degree: ${item.degree} connections. Eigenvector/Betweenness score: ${item.betweennessPercentile}%.`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeMode === 'BRIDGES' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium px-1">
              <span>Nodes with high Betweenness Centrality (structural bridges):</span>
              <InfoTooltip
                title="Bridge Node Calculation"
                description="Identifies entities lying on the highest number of shortest paths between disparate pairs of nodes."
              />
            </div>
            {report.bridges.map((item: NodeXRayMetrics, idx: number) => (
              <div
                key={item.id}
                onClick={() => onSelectEntity(item.id)}
                className="p-3 rounded-xl bg-white/70 hover:bg-white/95 border border-slate-200/90 shadow-xs transition-all cursor-pointer space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">
                    #{idx + 1} {item.label}
                  </span>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    {item.type}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                  <span>Betweenness: <strong>{item.betweenness}</strong></span>
                  <ConfidenceBadge
                    score={item.betweennessPercentile}
                    label="Bridge Confidence"
                    calculationDescription={`Betweenness centrality index: ${item.betweenness}. Structural influence percentile: ${item.betweennessPercentile}%.`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeMode === 'CLUSTERS' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium px-1">
              <span>Louvain Community Sub-Graph Clusters ({report.clusters.length}):</span>
              <InfoTooltip
                title="Louvain Modularity Clustering"
                description="Iteratively groups entities to maximize network modularity (density of links inside cluster vs outside)."
              />
            </div>
            {report.clusters.map((cluster: CommunityCluster) => {
              const isSelected = selectedClusterId === cluster.id;
              const clusterScore = Math.round(Math.min(100, (cluster.nodeIds.length / (report.influencers.length || 1)) * 100 + 40));

              return (
                <div
                  key={cluster.id}
                  onClick={() => handleSelectCluster(cluster)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all space-y-2 text-xs ${
                    isSelected
                      ? 'bg-white border-slate-300 shadow-md border-l-4 border-l-slate-900'
                      : 'bg-white/70 hover:bg-white/95 border-slate-200/90 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{cluster.name}</span>
                    <ConfidenceBadge
                      score={clusterScore}
                      label="Cell Density"
                      calculationDescription={`Cluster contains ${cluster.nodeIds.length} tightly connected member entities.`}
                    />
                  </div>
                  <p className="text-xs text-slate-600 font-normal leading-relaxed">{cluster.summary}</p>
                </div>
              );
            })}
          </div>
        )}

        {activeMode === 'ISOLATED' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium px-1">
              <span>Isolated or Low-Degree Entities:</span>
              <InfoTooltip
                title="Isolated Entity Analysis"
                description="Lists entities with degree <= 1 that lack extensive relationship links in ingested documents."
              />
            </div>
            {report.isolatedEntities.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                No isolated entities in this case graph.
              </div>
            ) : (
              report.isolatedEntities.map((item: NodeXRayMetrics) => (
                <div
                  key={item.id}
                  onClick={() => onSelectEntity(item.id)}
                  className="p-3 rounded-xl bg-white/70 hover:bg-white/95 border border-slate-200/90 shadow-xs transition-all cursor-pointer flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-slate-900">{item.label}</span>
                  <div className="flex items-center space-x-2">
                    <ConfidenceBadge score={35} label="Coverage" calculationDescription="Entity has single or no connected relationships in current case data." />
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {item.type}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
