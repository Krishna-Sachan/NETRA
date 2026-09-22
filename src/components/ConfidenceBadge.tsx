import React from 'react';
import { InfoTooltip } from './InfoTooltip';

interface ConfidenceBadgeProps {
  score: number; // 0 to 100
  label?: string; // e.g. "Importance", "Match Confidence", "Path Support"
  calculationDescription?: string;
  showTooltip?: boolean;
  className?: string;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  score,
  label = 'Importance',
  calculationDescription = 'Score calculated from graph metrics (degree/betweenness centrality) & evidence recency.',
  showTooltip = false,
  className = '',
}) => {
  const normScore = Math.max(0, Math.min(100, Math.round(score)));

  let colorClasses = 'bg-cyan-100 text-cyan-900 border-cyan-300';
  let badgeLabel = 'Moderate';

  if (normScore >= 80) {
    colorClasses = 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold shadow-xs';
    badgeLabel = 'High';
  } else if (normScore >= 50) {
    colorClasses = 'bg-amber-100 text-amber-900 border-amber-300 font-bold shadow-xs';
    badgeLabel = 'Medium';
  }

  return (
    <div className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md border text-[11px] font-sans ${colorClasses} ${className}`}>
      <span className="font-semibold tracking-wide">
        {label}: <strong className="text-xs">{normScore}%</strong>
      </span>

      {showTooltip && (
        <InfoTooltip
          title={`${label} (${normScore}%)`}
          description={`This ${label.toLowerCase()} score (${normScore}%) indicates the relative statistical significance of this node/link within the case network.`}
          calculation={calculationDescription}
          howToUse="Use higher percentage scores to prioritize investigative leads. Scores reflect relative graph prominence to assist analysts."
          size="sm"
          variant={normScore >= 80 ? 'highlight' : 'subtle'}
        />
      )}
    </div>
  );
};
