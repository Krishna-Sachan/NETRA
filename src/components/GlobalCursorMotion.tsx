import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

interface ClickRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

export const GlobalCursorMotion: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cursorDotRef = useRef<HTMLDivElement | null>(null);
  const cursorRingRef = useRef<HTMLDivElement | null>(null);

  const mousePos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const smoothPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const lastMousePos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const mouseVelocity = useRef(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };

      // Update global CSS custom properties for hover spotlight
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);

      // Check hover interactive state
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.tagName === 'INPUT' ||
          target.closest('button') ||
          target.closest('a') ||
          target.classList.contains('cursor-pointer'))
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsMouseDown(true);
      // Spawn ripple on click
      ripplesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        radius: 5,
        maxRadius: 140,
        alpha: 0.8,
        color: 'rgba(255, 255, 255, 0.7)'
      });
    };

    const handleMouseUp = () => setIsMouseDown(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const particlesRef = useRef<Particle[]>([]);
  const ripplesRef = useRef<ClickRipple[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Populate baseline ambient mystery particles
    const initParticles = () => {
      const count = Math.min(60, Math.floor((window.innerWidth * window.innerHeight) / 25000));
      const arr: Particle[] = [];
      const colors = ['rgba(255, 255, 255, ', 'rgba(226, 232, 240, ', 'rgba(203, 213, 225, ', 'rgba(148, 163, 184, '];
      for (let i = 0; i < count; i++) {
        arr.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          size: Math.random() * 2 + 0.8,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: Math.random() * 0.5 + 0.2,
          life: 0,
          maxLife: Math.random() * 300 + 100
        });
      }
      particlesRef.current = arr;
    };

    initParticles();

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Interpolate smooth cursor position (lerp)
      const dx = mousePos.current.x - smoothPos.current.x;
      const dy = mousePos.current.y - smoothPos.current.y;
      smoothPos.current.x += dx * 0.18;
      smoothPos.current.y += dy * 0.18;

      // Compute velocity
      const v = Math.sqrt(
        Math.pow(mousePos.current.x - lastMousePos.current.x, 2) +
        Math.pow(mousePos.current.y - lastMousePos.current.y, 2)
      );
      mouseVelocity.current = v;
      lastMousePos.current = { ...mousePos.current };

      // Update DOM cursor elements
      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0)`;
      }
      if (cursorRingRef.current) {
        const scale = isHovered ? 1.8 : isMouseDown ? 0.75 : 1 + Math.min(v * 0.03, 0.5);
        cursorRingRef.current.style.transform = `translate3d(${smoothPos.current.x}px, ${smoothPos.current.y}px, 0) scale(${scale})`;
      }

      // Render ripples
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const r = ripplesRef.current[i];
        r.radius += (r.maxRadius - r.radius) * 0.08 + 1.5;
        r.alpha -= 0.02;

        if (r.alpha <= 0) {
          ripplesRef.current.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${r.alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius * 0.6, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${r.alpha * 0.5})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Render & update particles
      const mx = mousePos.current.x;
      const my = mousePos.current.y;

      particlesRef.current.forEach((p) => {
        // Move particle
        p.x += p.vx;
        p.y += p.vy;

        // Mouse force interaction
        const pdx = mx - p.x;
        const pdy = my - p.y;
        const dist = Math.sqrt(pdx * pdx + pdy * pdy);
        const maxDist = 140;

        if (dist < maxDist && dist > 0) {
          const force = (1 - dist / maxDist) * 0.05;
          // Push away slightly
          p.x -= (pdx / dist) * force * 15;
          p.y -= (pdy / dist) * force * 15;
        }

        // Screen boundary wrap
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.fill();

        // Connect nearby particles with subtle light strings
        particlesRef.current.forEach((p2) => {
          const d2 = Math.sqrt(Math.pow(p.x - p2.x, 2) + Math.pow(p.y - p2.y, 2));
          if (d2 < 80 && d2 > 0) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 * (1 - d2 / 80)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [isHovered, isMouseDown]);

  return (
    <>
      {/* Background Interactive Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-30 opacity-70"
      />

      {/* Dynamic Cursor Spotlight Halo */}
      <div
        className="fixed inset-0 pointer-events-none z-20 transition-opacity duration-500 mouse-spotlight opacity-90"
      />

      {/* Dynamic Precision Cursor Point */}
      <div
        ref={cursorDotRef}
        className="fixed top-0 left-0 w-2 h-2 -ml-1 -mt-1 rounded-full bg-white pointer-events-none z-50 transition-transform duration-75 ease-out shadow-[0_0_12px_rgba(255,255,255,0.9)]"
      />

      {/* Smooth Fluid Inertia Ring Follower */}
      <div
        ref={cursorRingRef}
        className={`fixed top-0 left-0 w-8 h-8 -ml-4 -mt-4 rounded-full border pointer-events-none z-40 transition-colors duration-200 ${
          isHovered
            ? 'border-white/80 bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.4)]'
            : 'border-white/30 bg-white/[0.02]'
        }`}
      />
    </>
  );
};
