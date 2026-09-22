import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Info, Sparkles, X, AlertCircle } from 'lucide-react';

export interface InfoTooltipProps {
  title: string;
  description: string;
  calculation?: string;
  howToUse?: string;
  disclaimer?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'subtle' | 'highlight' | 'dark' | 'amber';
  icon?: React.ReactNode;
  className?: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  title,
  description,
  calculation,
  howToUse,
  disclaimer = 'Calculated dynamically from case topology & evidence to assist analysts.',
  position = 'top',
  size = 'sm',
  variant = 'subtle',
  icon,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const tooltipIdRef = useRef<string>(`tt_${Math.random().toString(36).substring(2, 9)}`);
  const mouseLeaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [coords, setCoords] = useState<{ top?: number; bottom?: number; left?: number; right?: number }>({});

  // Global listener: ensure ONLY ONE tooltip is open at a time
  useEffect(() => {
    const handleCloseOthers = (e: Event) => {
      const customEvent = e as CustomEvent<{ id: string }>;
      if (customEvent.detail && customEvent.detail.id !== tooltipIdRef.current) {
        setIsOpen(false);
      }
    };
    window.addEventListener('close-all-tooltips', handleCloseOthers);
    return () => {
      window.removeEventListener('close-all-tooltips', handleCloseOthers);
      if (mouseLeaveTimerRef.current) {
        clearTimeout(mouseLeaveTimerRef.current);
      }
    };
  }, []);

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const cardWidth = 320; // 320px width

    let left = rect.left + rect.width / 2 - cardWidth / 2;
    // Clamp horizontally between 12px and (window.innerWidth - cardWidth - 12px)
    left = Math.max(12, Math.min(window.innerWidth - cardWidth - 12, left));

    let top: number | undefined = undefined;
    let bottom: number | undefined = undefined;

    if (position === 'bottom') {
      top = rect.bottom + 8;
      // Flip if bleeds below screen
      if (top + 280 > window.innerHeight) {
        top = undefined;
        bottom = window.innerHeight - rect.top + 8;
      }
    } else if (position === 'left') {
      top = Math.max(12, Math.min(window.innerHeight - 280, rect.top));
      const right = window.innerWidth - rect.left + 8;
      setCoords({ top, right });
      return;
    } else if (position === 'right') {
      top = Math.max(12, Math.min(window.innerHeight - 280, rect.top));
      const leftPos = rect.right + 8;
      setCoords({ top, left: leftPos });
      return;
    } else {
      // position === 'top' (default)
      bottom = window.innerHeight - rect.top + 8;
      // If top goes off-screen, flip below button
      if (window.innerHeight - bottom < 220 || rect.top - 280 < 12) {
        bottom = undefined;
        top = rect.bottom + 8;
      }
    }

    setCoords({ top, bottom, left });
  };

  const handleMouseEnter = () => {
    if (mouseLeaveTimerRef.current) {
      clearTimeout(mouseLeaveTimerRef.current);
      mouseLeaveTimerRef.current = null;
    }
    window.dispatchEvent(new CustomEvent('close-all-tooltips', { detail: { id: tooltipIdRef.current } }));
    updatePosition();
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    mouseLeaveTimerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const handleTooltipMouseEnter = () => {
    if (mouseLeaveTimerRef.current) {
      clearTimeout(mouseLeaveTimerRef.current);
      mouseLeaveTimerRef.current = null;
    }
  };

  const handleTooltipMouseLeave = () => {
    mouseLeaveTimerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const handleClickToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOpen) {
      setIsOpen(false);
    } else {
      handleMouseEnter();
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      const handleScrollOrResize = () => {
        updatePosition();
      };
      const handleClickOutside = (event: MouseEvent) => {
        if (
          triggerRef.current && !triggerRef.current.contains(event.target as Node) &&
          tooltipRef.current && !tooltipRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);
      document.addEventListener('mousedown', handleClickOutside);

      return () => {
        window.removeEventListener('scroll', handleScrollOrResize, true);
        window.removeEventListener('resize', handleScrollOrResize);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, position]);

  const sizeClasses = {
    sm: 'w-4 h-4 text-[10px]',
    md: 'w-4.5 h-4.5 text-[11px]',
    lg: 'w-5 h-5 text-xs',
  }[size];

  // Unified, ultra-consistent trigger button style across all locations
  const variantClasses = {
    subtle: 'bg-[#121826] hover:bg-cyan-950 text-cyan-300 hover:text-cyan-100 border-cyan-500/40 hover:border-cyan-300 shadow-xs ring-1 ring-cyan-500/20',
    highlight: 'bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-200 border-cyan-400 font-bold shadow-xs shadow-cyan-500/30 ring-1 ring-cyan-400/40',
    dark: 'bg-slate-900 hover:bg-slate-800 text-cyan-300 border-slate-700 shadow-xs',
    amber: 'bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border-amber-400/80 font-bold shadow-xs shadow-amber-500/30 ring-1 ring-amber-400/40',
  }[variant];

  return (
    <div className={`inline-flex items-center ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleClickToggle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`inline-flex items-center justify-center rounded-full border transition-all cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-cyan-400/60 hover:scale-110 active:scale-95 ${sizeClasses} ${variantClasses}`}
        title={`Hover for info on ${title}`}
        aria-label={`Information regarding ${title}`}
      >
        {icon || <Info className="w-2.5 h-2.5 text-cyan-300" />}
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={tooltipRef}
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
            style={{
              position: 'fixed',
              top: coords.top !== undefined ? `${coords.top}px` : undefined,
              bottom: coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
              left: coords.left !== undefined ? `${coords.left}px` : undefined,
              right: coords.right !== undefined ? `${coords.right}px` : undefined,
              zIndex: 99999,
            }}
            className="w-72 md:w-80 bg-slate-950/98 text-slate-100 border border-cyan-500/40 rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.85)] p-3.5 backdrop-blur-xl text-xs font-sans ring-1 ring-white/10 pointer-events-auto transition-all duration-150 animate-in fade-in zoom-in-95"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-2 mb-2">
              <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>{title}</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Description */}
            <p className="text-slate-200 text-[11px] leading-relaxed mb-2.5 font-normal">
              {description}
            </p>

            {/* How To Use */}
            {howToUse && (
              <div className="bg-[#0f172a] rounded-lg p-2.5 border border-cyan-500/30 mb-2.5">
                <span className="text-[10px] font-mono uppercase font-bold text-cyan-400 block mb-1 flex items-center space-x-1">
                  <span>💡</span>
                  <span>How to Use</span>
                </span>
                <p className="text-slate-300 text-[11px] leading-snug">
                  {howToUse}
                </p>
              </div>
            )}

            {/* Calculation Methodology */}
            {calculation && (
              <div className="bg-[#181324] rounded-lg p-2.5 border border-amber-500/30 mb-2.5">
                <span className="text-[10px] font-mono uppercase font-bold text-amber-400 block mb-1 flex items-center space-x-1">
                  <span>🧮</span>
                  <span>How It Is Calculated</span>
                </span>
                <p className="text-amber-200/90 text-[11px] leading-snug font-mono">
                  {calculation}
                </p>
              </div>
            )}

            {/* Decision Support Disclaimer */}
            {disclaimer && (
              <div className="flex items-center space-x-1 text-[9.5px] text-slate-400 italic pt-1.5 border-t border-slate-800/80">
                <AlertCircle className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                <span>{disclaimer}</span>
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
};


