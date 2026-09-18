import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Network,
  FileText,
  Sparkles,
  Activity,
  Target,
  Eye,
  Clock,
  ChevronRight,
  Brain,
  Layers,
  Lock,
  Volume2,
  VolumeX,
  Upload,
  Radio,
  Anchor,
  Truck,
  Crosshair,
  Zap,
  Shield
} from 'lucide-react';
import { SampleCase } from '../types';
import { SAMPLE_CASES } from '../data/sampleCases';

interface LandingPageProps {
  sampleCases?: SampleCase[];
  onLoadDefaultCase?: () => void;
  onLoadSampleCase?: (caseData: SampleCase) => void;
  onOpenIngest?: () => void;
  onSelectCase?: (caseData: SampleCase) => void;
}

// Scrambler Decryption Text Component
const DecryptText: React.FC<{ text: string; isHovered: boolean }> = ({ text, isHovered }) => {
  const [displayText, setDisplayText] = useState(text);
  const glyphs = '01#X¥§89AZ@&%';

  useEffect(() => {
    if (!isHovered) {
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
      step += 1 / 2;
    }, 20);
    return () => clearInterval(interval);
  }, [isHovered, text]);

  return <span>{displayText}</span>;
};

export const LandingPage: React.FC<LandingPageProps> = ({
  sampleCases = SAMPLE_CASES,
  onLoadDefaultCase,
  onLoadSampleCase,
  onOpenIngest,
  onSelectCase,
}) => {
  const [isMuted, setIsMuted] = useState(true);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Web Audio Synthesizer
  const playHoverSound = () => {
    if (isMuted) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch (e) {}
  };

  const playClickSound = () => {
    if (isMuted) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {}
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Mouse movement tracking for dynamic glass spotlight
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Floating Evidence Particles & Red Thread Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle nodes
    const particles = Array.from({ length: 35 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 1,
      alpha: Math.random() * 0.5 + 0.2,
      isRed: Math.random() > 0.65,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw floating particles and subtle red threads
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.isRed ? `rgba(225, 29, 72, ${p.alpha})` : `rgba(255, 255, 255, ${p.alpha * 0.7})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.isRed ? 'rgba(225, 29, 72, 0.8)' : 'rgba(255, 255, 255, 0.5)';
        ctx.fill();

        // Connect close nodes with thin red yarn threads
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            const lineAlpha = (1 - dist / 130) * 0.25;
            ctx.strokeStyle = (p.isRed || p2.isRed)
              ? `rgba(225, 29, 72, ${lineAlpha})`
              : `rgba(255, 255, 255, ${lineAlpha * 0.5})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const capabilities = [
    { icon: Network, label: 'Network Graph', desc: 'Visual connection mapping' },
    { icon: Target, label: 'Network X-Ray', desc: 'Ringleader & node analysis' },
    { icon: Activity, label: 'Anomaly Radar', desc: 'Suspicious pattern detection' },
    { icon: Clock, label: 'Timeline View', desc: 'Chronological event ordering' },
    { icon: Brain, label: 'AI Copilot', desc: 'Grounded intelligence queries' },
    { icon: Layers, label: 'Entity Resolution', desc: 'Alias & fuzzy deduplication' },
  ];

  const getCaseIcon = (id: string) => {
    if (id.includes('WESTERN')) return FileText;
    if (id.includes('RIVERINE')) return Anchor;
    if (id.includes('HIGHWAY')) return Truck;
    return Sparkles;
  };

  const activeCases = (sampleCases && Array.isArray(sampleCases) && sampleCases.length > 0) ? sampleCases : SAMPLE_CASES;
  const displayCases = activeCases.slice(0, 3);

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative h-screen w-full bg-[#030509] text-white flex flex-col items-center justify-between p-4 md:px-10 md:py-6 select-none overflow-hidden"
      style={
        {
          '--mouse-x': `${mousePos.x}px`,
          '--mouse-y': `${mousePos.y}px`,
        } as React.CSSProperties
      }
    >
      
      {/* Background Video Layer */}
      <div className="fixed inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <video
          ref={videoRef}
          src="/kaya.mp4"
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-90 scale-105 filter contrast-110 brightness-95 transition-opacity duration-700"
        />
        {/* Particle Canvas Layer */}
        <canvas ref={canvasRef} className="absolute inset-0 z-10 opacity-75" />
        {/* Dynamic Mouse Spotlight Glow */}
        <div className="absolute inset-0 mouse-spotlight z-10" />
        {/* Vignette Overlay */}
        <div className="absolute inset-0 vignette-overlay z-10" />
      </div>

      {/* Header Bar */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-20 w-full max-w-7xl flex items-center justify-between py-1 border-b border-white/10 mb-2"
      >
        <div className="flex items-center space-x-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
          </span>
          <span className="text-[11px] font-tech text-slate-300 tracking-widest uppercase">
            CRIMINAL NETWORK INTELLIGENCE PLATFORM
          </span>
        </div>

      </motion.header>

      {/* Main Content Area */}
      <main className="relative z-20 w-full max-w-7xl flex flex-col justify-center my-auto space-y-4">
        
        {/* Hero Title Section with Motion */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto py-1"
        >
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-950/40 border border-rose-500/30 mb-3 backdrop-blur-md">
            <Crosshair className="w-3.5 h-3.5 text-rose-400 animate-spin-slow" />
            <span className="text-[10px] font-tech text-rose-300 uppercase tracking-widest">DECISION SUPPORT AI</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-[0.25em] text-white font-mysterious uppercase mb-2 text-glow-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.95)] animate-float">
            NETRA
          </h1>
          
          <p className="text-slate-200 text-xs md:text-sm leading-relaxed font-sans max-w-xl mx-auto drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
            Evidence-Grounded Intelligence Platform for Criminal Network Extraction, Hawala Trail Analysis, & Automated Case Resolution.
          </p>
        </motion.div>

        {/* SECTION 1: UPLOAD CUSTOM EVIDENCE FILE (First) */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="w-full"
        >
          <button
            onClick={() => { playClickSound(); if (onOpenIngest) onOpenIngest(); }}
            onMouseEnter={() => { playHoverSound(); setHoveredCardId('custom-ingest'); }}
            onMouseLeave={() => setHoveredCardId(null)}
            className="w-full text-left p-4 rounded-2xl glass-card-premium border-dashed border-white/30 hover:border-rose-500/50 transition-all duration-300 group cursor-pointer relative overflow-hidden flex items-center justify-between shadow-2xl"
          >
            <div className="decoding-scanner" />
            <div className="flex items-center space-x-4 relative z-10">
              <div className="p-3 rounded-xl bg-white/10 border border-white/20 text-white group-hover:bg-rose-500/25 group-hover:border-rose-400 transition-all duration-300 shadow-lg flex-shrink-0 group-hover:scale-110">
                <Upload className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm md:text-base font-bold text-white group-hover:text-rose-200 transition-colors font-mysterious tracking-wider">
                    <DecryptText text="Upload Custom Evidence File" isHovered={hoveredCardId === 'custom-ingest'} />
                  </span>
                  <span className="px-2 py-0.5 text-[9px] font-tech text-rose-300 bg-rose-950/70 rounded border border-rose-500/50 animate-pulse">
                    INGEST CUSTOM FILE
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5 font-sans">
                  Extract networks directly from your own FIRs, CDR transcripts, surveillance logs, or plain text case reports
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 bg-white/10 group-hover:bg-rose-500/30 text-white border border-white/30 group-hover:border-rose-400 px-4 py-2 rounded-xl font-mysterious text-xs font-semibold flex-shrink-0 transition-all duration-300 backdrop-blur-md shadow-lg relative z-10 group-hover:translate-x-1">
              <span>INGEST FILE</span>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-white group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </motion.section>

        {/* SECTION 2: SELECT AN EXAMPLE CASE (Equal 3-Column Grid Hierarchy) */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full"
        >
          <div className="flex items-center space-x-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            <h2 className="text-xs font-mysterious uppercase tracking-widest text-slate-200 font-bold">
              SELECT AN EXAMPLE CASE SCENARIO
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {displayCases.map((sc, index) => {
              const CaseIcon = getCaseIcon(sc.id);
              const isDefault = sc.id === 'CASE-WESTERN-CORRIDOR';

              return (
                <motion.button
                  key={sc.id}
                  whileHover={{ y: -3, scale: 1.01 }}
                  onClick={() => {
                    playClickSound();
                    if (onSelectCase) {
                      onSelectCase(sc);
                    } else if (isDefault && onLoadDefaultCase) {
                      onLoadDefaultCase();
                    } else if (onLoadSampleCase) {
                      onLoadSampleCase(sc);
                    }
                  }}
                  onMouseEnter={() => {
                    playHoverSound();
                    setHoveredCardId(sc.id);
                  }}
                  onMouseLeave={() => setHoveredCardId(null)}
                  className="p-5 rounded-2xl glass-card-premium text-left transition-all duration-300 group cursor-pointer flex flex-col justify-between relative overflow-hidden h-full border border-white/15 hover:border-rose-500/40 shadow-xl"
                >
                  <div className="decoding-scanner" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2.5 rounded-xl bg-white/10 border border-white/20 text-white group-hover:bg-rose-500/20 group-hover:border-rose-500/50 transition-colors flex-shrink-0 group-hover:scale-110">
                        <CaseIcon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-base font-bold text-white group-hover:text-rose-100 transition-colors font-mysterious leading-tight">
                        <DecryptText text={sc.name} isHovered={hoveredCardId === sc.id} />
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-4 line-clamp-3 font-sans font-normal">
                      {sc.description || 'Cross-border syndicate network analysis with intercepted documents, entity resolution, and timeline analytics.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/10 relative z-10 flex items-center justify-between">
                    <div className="text-[10px] font-tech text-slate-300">
                      {sc.entities && sc.entities.length > 0 ? (
                        <span>{sc.entities.length} entities • {sc.relationships?.length || 0} links</span>
                      ) : (
                        <span>15 entities • 17 links • 4 docs</span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1 bg-white/10 group-hover:bg-rose-500/30 text-white border border-white/30 group-hover:border-rose-400 px-3 py-1 rounded-lg font-mysterious text-[11px] font-semibold transition-all">
                      <span>OPEN</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-white group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.section>

        {/* SECTION 3: CORE CAPABILITIES (Compact Horizontal 6-Column Grid) */}
        <motion.section
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="w-full"
        >
          <div className="text-center mb-2.5">
            <h3 className="text-[10px] font-tech uppercase tracking-widest text-slate-400">
              CORE INVESTIGATIVE CAPABILITIES
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {capabilities.map((cap, i) => {
              const Icon = cap.icon;
              return (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.03 }}
                  onMouseEnter={playHoverSound}
                  className="p-3 rounded-xl glass-card-premium transition-all duration-300 group relative overflow-hidden cursor-default"
                >
                  <div className="decoding-scanner" />
                  <div className="flex items-center space-x-2 mb-1.5 relative z-10">
                    <Icon className="w-4 h-4 text-slate-300 group-hover:text-rose-400 transition-colors flex-shrink-0" />
                    <span className="text-[11px] font-bold text-white font-mysterious truncate">
                      {cap.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-tight font-sans line-clamp-2 relative z-10">
                    {cap.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

      </main>

      {/* Footer Disclaimer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="relative z-20 w-full max-w-7xl pt-2 border-t border-white/10 text-center"
      >
        <div className="flex items-center justify-center space-x-2 text-[10px] text-slate-400 font-tech">
          <Lock className="w-3 h-3 text-slate-400" />
          <span>CONFIDENTIAL INTEL PLATFORM — LOCAL SECURITY SANDBOX</span>
        </div>
      </motion.footer>

    </div>
  );
};



