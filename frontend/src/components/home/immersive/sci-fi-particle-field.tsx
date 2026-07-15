"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion, useSaveData } from "@/hooks/use-media-preferences";
import { cn } from "@/lib/utils";

type Particle = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  hue: number;
};

const PALETTE = [
  { h: 240, s: 100, l: 68 },
  { h: 185, s: 100, l: 55 },
  { h: 320, s: 90, l: 62 },
];

const MAX_PARTICLES = 72;
const LINK_NEIGHBORS = 6;

function createParticles(count: number, width: number, height: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    z: Math.random(),
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    vz: (Math.random() - 0.5) * 0.002,
    hue: PALETTE[i % PALETTE.length].h,
  }));
}

function scheduleIdle(task: () => void): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(task, { timeout: 1200 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(task, 180);
  return () => window.clearTimeout(id);
}

export function SciFiParticleField({
  className,
  opacity = 1,
  defer = false,
}: {
  className?: string;
  opacity?: number;
  defer?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const saveData = useSaveData();
  const [ready, setReady] = useState(!defer);

  useEffect(() => {
    if (!defer || reducedMotion || saveData) return;
    return scheduleIdle(() => setReady(true));
  }, [defer, reducedMotion, saveData]);

  useEffect(() => {
    if (!ready || reducedMotion || saveData) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let raf = 0;
    let visible = true;
    let mouse = { x: -9999, y: -9999, active: false };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const density = width < 768 ? 72 : 96;
      const count = Math.min(MAX_PARTICLES, Math.floor((width * height) / (density * density)));
      particles = createParticles(count, width, height);
    };

    const onMove = (e: PointerEvent) => {
      mouse = { x: e.clientX, y: e.clientY, active: true };
    };

    const onLeave = () => {
      mouse = { x: -9999, y: -9999, active: false };
    };

    const draw = () => {
      if (!visible) return;

      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 160 && dist > 0) {
            const force = (160 - dist) / 20000;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        p.vx *= 0.992;
        p.vy *= 0.992;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
        if (p.z < 0 || p.z > 1) p.vz *= -1;
      }

      const linkDist = width < 768 ? 88 : 110;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        let links = 0;
        for (let j = i + 1; j < particles.length && links < LINK_NEIGHBORS; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < linkDist) {
            links += 1;
            const alpha = (1 - dist / linkDist) * 0.18 * (0.4 + a.z * 0.6);
            ctx.beginPath();
            ctx.strokeStyle = `hsla(240, 90%, 70%, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        const size = 1 + p.z * 1.8;
        ctx.fillStyle = `hsla(${p.hue}, 100%, 82%, ${0.55 + p.z * 0.35})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !raf) raf = requestAnimationFrame(draw);
        if (!visible && raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { threshold: 0 },
    );

    resize();
    observer.observe(canvas);
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [ready, reducedMotion, saveData]);

  if (reducedMotion || saveData) {
    return (
      <div
        className={cn("immersive-particles-fallback", className)}
        aria-hidden
        style={{ opacity }}
      />
    );
  }

  if (!ready) {
    return (
      <div
        className={cn("immersive-particles-fallback", className)}
        aria-hidden
        style={{ opacity }}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={cn("immersive-particles-canvas", className)}
      style={{ opacity }}
      aria-hidden
    />
  );
}
