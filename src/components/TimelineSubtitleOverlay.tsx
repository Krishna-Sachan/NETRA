import React, { useState, useEffect } from 'react';
import { TimelineMilestone, Entity, Relationship, CaseDocument } from '../types';
import { generateMilestoneStory, parseStoryTokens } from '../services/storyGenerator';
import { InfoTooltip } from './InfoTooltip';
import { Play, Pause, ChevronLeft, ChevronRight, Subtitles, X, Eye, Sparkles } from 'lucide-react';

interface TimelineSubtitleOverlayProps {
  milestone: TimelineMilestone;
  allMilestones: TimelineMilestone[];
  currentIndex: number;
  entities: Entity[];
  relationships: Relationship[];
  documents: CaseDocument[];
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStepPrev: () => void;
  onStepNext: () => void;
  onSelectEntity?: (entityId: string) => void;
  onCloseSubtitle?: () => void;
}

export const TimelineSubtitleOverlay: React.FC<TimelineSubtitleOverlayProps> = ({
  milestone,
  allMilestones,
  currentIndex,
  entities,
  relationships,
  documents,
  isPlaying,
  onTogglePlay,
  onStepPrev,
  onStepNext,
  onSelectEntity,
  onCloseSubtitle,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [displayedText, setDisplayedText] = useState<string>('');

  const fullStory = milestone
    ? generateMilestoneStory(milestone, entities, relationships, documents)
    : 'No timeline events recorded.';

  // Smooth typewriter / fade animation when milestone index changes
  useEffect(() => {
    setDisplayedText('');
    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx <= fullStory.length) {
        setDisplayedText(fullStory.slice(0, currentIdx));
        currentIdx += 3; // Type 3 chars per step for swift cinematic feel
      } else {
        setDisplayedText(fullStory);
        clearInterval(interval);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [fullStory, milestone?.id]);

  if (!milestone) return null;

  const tokens = parseStoryTokens(displayedText || fullStory, entities);

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 w-11/12 max-w-3xl pointer-events-auto font-sans transition-all duration-300">
      <div className="relative bg-slate-950/92 backdrop-blur-2xl border border-amber-500/40 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(245,158,11,0.2)] overflow-hidden text-slate-100 p-4">
        
        {/* Top Header: Badge, Step Indicator & Quick Controls */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 mb-2.5">
          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/60 text-cyan-300 text-[11px] font-mono font-bold tracking-wide uppercase shadow-xs">
              <Subtitles className="w-3.5 h-3.5 animate-pulse text-amber-400" />
              <span>Cinematic Story Mode</span>
            </span>
            <InfoTooltip
              title="Cinematic Story Mode"
              description="Converts evidence items, CDR records, and location logs into cinematic, human-readable narrative stories unrolling over time."
              howToUse="Click any highlighted entity chip inside the story box to locate and zoom in on that suspect or asset in the crime graph!"
              variant="highlight"
            />

            <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-[11px] font-mono font-medium">
              {milestone.date}
            </span>

            <span className="text-[10px] text-slate-400 font-mono">
              Step {currentIndex + 1} of {allMilestones.length}
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={onTogglePlay}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                isPlaying
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800 text-amber-300 border border-amber-500/30 hover:bg-slate-700'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlaying ? 'Pause Story' : 'Play Story'}</span>
            </button>

            <button
              onClick={onStepPrev}
              disabled={currentIndex === 0}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 border border-slate-700 cursor-pointer"
              title="Previous milestone"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onStepNext}
              disabled={currentIndex === allMilestones.length - 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 border border-slate-700 cursor-pointer"
              title="Next milestone"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {onCloseSubtitle && (
              <button
                onClick={onCloseSubtitle}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-800 transition-colors cursor-pointer"
                title="Hide Subtitle Overlay"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Subtitle Movie Narrative Text Content */}
        <div className="relative min-h-[52px] flex items-center justify-center px-2 py-1">
          <p className="text-center font-serif text-lg md:text-xl text-amber-100/95 leading-snug tracking-wide select-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            "{tokens.map((token, idx) => {
              if (token.isEntity && token.entityId) {
                return (
                  <button
                    key={idx}
                    onClick={() => onSelectEntity?.(token.entityId!)}
                    className="inline-flex items-center px-1.5 py-0.5 mx-1 rounded bg-amber-400/20 hover:bg-amber-400/35 border border-amber-400/50 text-amber-200 hover:text-amber-100 font-sans font-bold text-sm underline underline-offset-4 decoration-amber-400/70 transition-all cursor-pointer shadow-xs"
                    title={`Click to locate entity ${token.text} in crime canvas`}
                  >
                    {token.text}
                  </button>
                );
              }
              return <span key={idx}>{token.text}</span>;
            })}"
          </p>
        </div>

        {/* Bottom Subtitle Footer: Document Source & Type Tag */}
        <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[10px]">
              EVENT: {milestone.type}
            </span>
            {milestone.documentId && (
              <span className="text-slate-400 font-mono">
                Source: <strong className="text-slate-200">{milestone.documentId}</strong>
              </span>
            )}
          </div>

          <span className="text-[10px] text-slate-400 italic">
            Click highlighted entity names to focus canvas
          </span>
        </div>
      </div>
    </div>
  );
};
