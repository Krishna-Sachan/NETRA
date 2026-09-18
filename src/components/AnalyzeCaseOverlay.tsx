import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Shield, Network, Activity, Clock, Target, CheckCircle2, Crosshair, Radio } from 'lucide-react';
import { motion } from 'motion/react';

interface AnalyzeCaseOverlayProps {
  isVisible: boolean;
  stages: AnalysisStage[];
  onComplete: () => void;
}

export interface AnalysisStage {
  id: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  status: 'PENDING' | 'RUNNING' | 'COMPLETE';
}

export const DEFAULT_ANALYSIS_STAGES: Omit<AnalysisStage, 'status'>[] = [
  { id: 'ingest', label: 'Loading Case Documents', icon: Shield },
  { id: 'extract', label: 'Extracting Entities & Relationships', icon: Target },
  { id: 'network', label: 'Building Network Graph', icon: Network },
  { id: 'xray', label: 'Running Network X-Ray Analysis', icon: Cpu },
  { id: 'anomaly', label: 'Scanning for Anomaly Patterns', icon: Activity },
  { id: 'timeline', label: 'Reconstructing Event Timeline', icon: Clock },
];

// Decryption Text Scrambler
const DecryptText: React.FC<{ text: string; isActive: boolean }> = ({ text, isActive }) => {
  const [displayText, setDisplayText] = useState(text);
  const glyphs = '01#X¥§89AZ@&%';

  useEffect(() => {
    if (!isActive) {
      setDisplayText(text);
      return;
    }
    let step = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, idx) => {
            if (char === ' ') return ' ';
            if (idx < step) return text[idx];
            return glyphs[Math.floor(Math.random() * glyphs.length)];
          })
          .join('')
      );
      if (step >= text.length) {
        clearInterval(interval);
      }
      step += 1 / 3;
    }, 30);
    return () => clearInterval(interval);
  }, [isActive, text]);

  return <span>{displayText}</span>;
};

export const AnalyzeCaseOverlay: React.FC<AnalyzeCaseOverlayProps> = ({
  isVisible,
  stages,
  onComplete,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const allComplete = stages.every(s => s.status === 'COMPLETE');

  useEffect(() => {
    if (allComplete && isVisible) {
      const timer = setTimeout(onComplete, 500);
      return () => clearTimeout(timer);
    }
  }, [allComplete, isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#030509]/80 backdrop-blur-xl select-none overflow-hidden">
      
      {/* Background Video Layer */}
      <div className="fixed inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <video
          ref={videoRef}
          src="/kaya.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-90 scale-105 filter contrast-110 brightness-95"
        />
        <div className="absolute inset-0 vignette-overlay z-10" />
      </div>

      {/* Main Glassmorphic Loading Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-20 w-full max-w-lg p-8 rounded-3xl glass-card-hero border border-white/20 shadow-2xl backdrop-blur-2xl"
      >
        <div className="decoding-scanner" />

        {/* Header */}
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center justify-center p-3.5 mb-4 rounded-2xl bg-white/10 border border-white/20 text-rose-400 shadow-xl backdrop-blur-md relative">
            <Crosshair className="w-8 h-8 text-rose-400 animate-spin-slow" />
            <Radio className="w-4 h-4 text-white absolute -top-1 -right-1 animate-ping" />
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-white font-mysterious uppercase tracking-[0.15em] text-glow-white mb-2">
            DECODING CASE INTELLIGENCE
          </h2>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            Extracting criminal network nodes, evidence relationships, & graph analytics...
          </p>
        </div>

        {/* Stage List */}
        <div className="space-y-3 relative z-10">
          {stages.map((stage) => {
            const Icon = stage.icon;
            const isRunning = stage.status === 'RUNNING';
            const isComplete = stage.status === 'COMPLETE';

            return (
              <div
                key={stage.id}
                className={`relative overflow-hidden flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-300 ${
                  isComplete
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200 shadow-md'
                    : isRunning
                    ? 'bg-rose-950/40 border-rose-500/60 text-white shadow-xl shadow-rose-950/50 scale-[1.01]'
                    : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                {isRunning && <div className="decoding-scanner" />}

                <div className="flex items-center space-x-3.5 relative z-10">
                  <div className={`flex-shrink-0 ${
                    isComplete ? 'text-emerald-400' : isRunning ? 'text-rose-400 animate-pulse' : 'text-slate-500'
                  }`}>
                    {isComplete ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Icon className={`w-5 h-5 ${isRunning ? 'animate-spin' : ''}`} />
                    )}
                  </div>

                  <span className={`text-xs ${
                    isComplete
                      ? 'font-tech text-emerald-200'
                      : isRunning
                      ? 'font-mysterious font-bold text-white tracking-wider text-sm'
                      : 'font-tech text-slate-400'
                  }`}>
                    <DecryptText text={stage.label} isActive={isRunning} />
                  </span>
                </div>

                {isRunning && (
                  <div className="flex items-center space-x-2 relative z-10">
                    <div className="w-20 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/15">
                      <div className="h-full bg-gradient-to-r from-rose-500 to-white rounded-full animate-pulse" style={{ width: '75%' }} />
                    </div>
                    <span className="text-[10px] font-tech text-rose-300 animate-pulse">DECODING</span>
                  </div>
                )}

                {isComplete && (
                  <span className="text-[10px] font-tech text-emerald-400 font-bold tracking-wider relative z-10">
                    READY
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Announcement */}
        {allComplete && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-6 relative z-10"
          >
            <p className="text-xs text-emerald-300 font-mysterious font-bold tracking-widest uppercase animate-pulse">
              ANALYSIS COMPLETE — LAUNCHING INVESTIGATION WORKSPACE…
            </p>
          </motion.div>
        )}
      </motion.div>

    </div>
  );
};

