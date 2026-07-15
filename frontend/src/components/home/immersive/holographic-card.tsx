"use client";

import { useCallback, useRef, type CSSProperties, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-media-preferences";
import { cn } from "@/lib/utils";

export function HolographicCard({
  children,
  className,
  glow = "violet",
  depth = 1,
  style,
}: {
  children: ReactNode;
  className?: string;
  glow?: "violet" | "cyan" | "emerald" | "rose";
  depth?: number;
  style?: CSSProperties;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  const onMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (reducedMotion || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      cardRef.current.style.setProperty("--tilt-x", `${-y * 10 * depth}deg`);
      cardRef.current.style.setProperty("--tilt-y", `${x * 10 * depth}deg`);
      cardRef.current.style.setProperty("--glow-x", `${x * 40}%`);
      cardRef.current.style.setProperty("--glow-y", `${y * 40}%`);
    },
    [reducedMotion, depth],
  );

  const onLeave = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.setProperty("--tilt-x", "0deg");
    cardRef.current.style.setProperty("--tilt-y", "0deg");
    cardRef.current.style.setProperty("--glow-x", "50%");
    cardRef.current.style.setProperty("--glow-y", "50%");
  }, []);

  return (
    <div
      ref={cardRef}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn("holo-card", `holo-card--${glow}`, className)}
      style={style}
    >
      <span className="holo-card__corner holo-card__corner--tl" aria-hidden />
      <span className="holo-card__corner holo-card__corner--tr" aria-hidden />
      <span className="holo-card__corner holo-card__corner--bl" aria-hidden />
      <span className="holo-card__corner holo-card__corner--br" aria-hidden />
      <span className="holo-card__scan" aria-hidden />
      <div className="holo-card__inner">{children}</div>
    </div>
  );
}
