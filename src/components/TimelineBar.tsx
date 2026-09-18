import React, { useState, useEffect, useMemo } from 'react';
import { Entity, Relationship, CaseDocument, TimelineMilestone } from '../types';
import { buildTimelineFromCase, normalizeDate } from '../services/timelineService';

interface TimelineBarProps {
  documents?: CaseDocument[];
  entities: Entity[];
  relationships: Relationship[];
  currentCutoffDate: string | null;
  onCutoffDateChange: (date: string | null) => void;
  onHighlightEntities: (entityIds: string[]) => void;
  onSelectEntity?: (entityId: string) => void;
}

export const TimelineBar: React.FC<TimelineBarProps> = ({
  documents = [],
  entities,
  relationships,
  currentCutoffDate,
  onCutoffDateChange,
  onHighlightEntities,
  onSelectEntity,
}) => {
  const milestones: TimelineMilestone[] = useMemo(() => {
    return buildTimelineFromCase(documents, entities, relationships);
  }, [documents, entities, relationships]);

  const allDates = useMemo(() => milestones.map(m => m.date), [milestones]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [activeMilestoneIdx, setActiveMilestoneIdx] = useState<number>(() => {
    if (!currentCutoffDate) return Math.max(0, allDates.length - 1);
    const idx = allDates.indexOf(currentCutoffDate);
    return idx !== -1 ? idx : Math.max(0, allDates.length - 1);
  });

  useEffect(() => {
    if (allDates.length === 0) return;
    if (!currentCutoffDate) {
      setActiveMilestoneIdx(allDates.length - 1);
    } else {
      const idx = allDates.indexOf(currentCutoffDate);
      if (idx !== -1) setActiveMilestoneIdx(idx);
    }
  }, [currentCutoffDate, allDates]);

  useEffect(() => {
    let timer: any = null;
    if (isPlaying && allDates.length > 1) {
      timer = setInterval(() => {
        setActiveMilestoneIdx(prev => {
          if (prev >= allDates.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          const next = prev + 1;
          onCutoffDateChange(allDates[next]);
          if (milestones[next]?.involvedEntityIds) {
            onHighlightEntities(milestones[next].involvedEntityIds);
          }
          return next;
        });
      }, 2000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, allDates, milestones, onCutoffDateChange, onHighlightEntities]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (allDates.length === 0) return;
    const idx = parseInt(e.target.value, 10);
    setActiveMilestoneIdx(idx);
    const date = allDates[idx];
    onCutoffDateChange(idx === allDates.length - 1 ? null : date);
    if (milestones[idx]?.involvedEntityIds) {
      onHighlightEntities(milestones[idx].involvedEntityIds);
    }
    if (isPlaying) setIsPlaying(false);
  };

  const handleStepPrev = () => {
    if (activeMilestoneIdx > 0) {
      const next = activeMilestoneIdx - 1;
      setActiveMilestoneIdx(next);
      onCutoffDateChange(allDates[next]);
      if (milestones[next]?.involvedEntityIds) {
        onHighlightEntities(milestones[next].involvedEntityIds);
      }
      if (isPlaying) setIsPlaying(false);
    }
  };

  const handleStepNext = () => {
    if (activeMilestoneIdx < allDates.length - 1) {
      const next = activeMilestoneIdx + 1;
      setActiveMilestoneIdx(next);
      onCutoffDateChange(next === allDates.length - 1 ? null : allDates[next]);
      if (milestones[next]?.involvedEntityIds) {
        onHighlightEntities(milestones[next].involvedEntityIds);
      }
      if (isPlaying) setIsPlaying(false);
    }
  };

  const handleResetToAll = () => {
    if (allDates.length === 0) return;
    setActiveMilestoneIdx(allDates.length - 1);
    onCutoffDateChange(null);
    if (isPlaying) setIsPlaying(false);
  };

  if (milestones.length === 0) {
    return (
      <div className="w-full bg-white/80 border-t border-slate-200/80 px-4 py-2 text-slate-500 text-xs font-sans flex items-center justify-between">
        <span>Timeline Reconstruction: No dated evidentiary milestones in current case data.</span>
      </div>
    );
  }

  const currentMilestone = milestones[activeMilestoneIdx] || milestones[milestones.length - 1];
  const isFiltered = currentCutoffDate !== null && activeMilestoneIdx < allDates.length - 1;

  return (
    <div className="w-full bg-white/80 border-t border-slate-200/80 px-4 py-2.5 backdrop-blur-xl text-slate-900 select-none shadow-xs font-sans text-xs">
      {/* Top Row: Playback Controls & Active Milestone Header */}
      <div className="flex items-center justify-between gap-3 mb-2">
        {/* Playback Controls */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
            title={isPlaying ? 'Pause unfolding' : 'Play unfolding'}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>

          <button
            onClick={handleStepPrev}
            disabled={activeMilestoneIdx === 0}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 border border-slate-200 text-xs font-semibold cursor-pointer"
            title="Previous milestone"
          >
            ‹
          </button>

          <button
            onClick={handleStepNext}
            disabled={activeMilestoneIdx === allDates.length - 1}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 border border-slate-200 text-xs font-semibold cursor-pointer"
            title="Next milestone"
          >
            ›
          </button>

          <button
            onClick={handleResetToAll}
            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-medium cursor-pointer transition-all"
            title="Clear time cutoff and show full case view"
          >
            {isFiltered ? `Reset (Filtering ≤ ${currentMilestone.date})` : 'Full Case View'}
          </button>
        </div>

        {/* Current Active Milestone Summary */}
        <div className="flex-1 flex items-center justify-end space-x-3 text-xs overflow-hidden">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-semibold flex-shrink-0">
            <span>{currentMilestone.date}</span>
            <span className="text-[11px] text-slate-500 font-normal">
              ({activeMilestoneIdx + 1} / {milestones.length})
            </span>
          </div>

          <div className="text-slate-800 font-semibold truncate max-w-md" title={currentMilestone.title}>
            <span className="text-slate-600 font-medium mr-1.5 uppercase text-[10px] px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
              {currentMilestone.type}
            </span>
            {currentMilestone.title}
          </div>

          {currentMilestone.documentId && (
            <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 flex-shrink-0">
              {currentMilestone.documentId}
            </span>
          )}
        </div>
      </div>

      {/* Middle Row: Draggable Time Window Range Slider */}
      <div className="relative flex items-center py-1">
        <input
          type="range"
          min={0}
          max={Math.max(0, allDates.length - 1)}
          value={activeMilestoneIdx}
          onChange={handleSliderChange}
          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-ew-resize accent-slate-900 hover:accent-slate-800 focus:outline-none"
        />
      </div>

      {/* Bottom Row: Chronological Ticks and Active Evidence Snippet */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
        <span>{allDates[0]} (Earliest Date)</span>
        
        {currentMilestone.evidenceSnippet && (
          <span className="truncate max-w-lg text-slate-600 italic px-2" title={currentMilestone.evidenceSnippet}>
            "{currentMilestone.evidenceSnippet}"
          </span>
        )}

        <span>{allDates[allDates.length - 1]} (Latest Date)</span>
      </div>
    </div>
  );
};
