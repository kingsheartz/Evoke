"use client";

import { forwardRef } from "react";
import { GraduationCap, MapPin, Plane, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

export type ChapterId = "academy" | "sports" | "tours";

function viewBoxPointStyle(x: number, y: number, vbW: number, vbH: number): React.CSSProperties {
  return {
    left: `${(x / vbW) * 100}%`,
    top: `${(y / vbH) * 100}%`,
  };
}

function PathLocationMarker({
  x,
  y,
  vbW,
  vbH,
  className,
  children,
}: {
  x: number;
  y: number;
  vbW: number;
  vbH: number;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("motion-art__path-marker", className)} style={viewBoxPointStyle(x, y, vbW, vbH)}>
      {children ?? <MapPin className="motion-art__path-marker-icon" strokeWidth={1.75} />}
    </div>
  );
}

export const MotionChapterArt = forwardRef<
  HTMLDivElement,
  {
    chapter: ChapterId;
    className?: string;
    style?: React.CSSProperties;
  }
>(function MotionChapterArt({ chapter, className, style }, ref) {
  return (
    <div
      ref={ref}
      className={cn("motion-art", `motion-art--${chapter}`, className)}
      style={style}
      aria-hidden
    >
      <div className="motion-art__mesh" />
      <div className="motion-art__grid-lines" />

      {chapter === "academy" && <AcademyArt />}
      {chapter === "sports" && <SportsArt />}
      {chapter === "tours" && <ToursArt />}

      <div className="motion-art__scan" />
    </div>
  );
});

function AcademyArt() {
  const path = "M20 95 Q90 20 180 55";
  return (
    <>
      <div className="motion-art__orbit motion-art__orbit--outer" />
      <div className="motion-art__orbit motion-art__orbit--inner" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="motion-art__ripple" style={{ animationDelay: `${i * 0.35}s` }} />
      ))}
      <div className="motion-art__speed-lines">
        {Array.from({ length: 7 }).map((_, i) => (
          <span key={i} className="motion-art__speed-line" style={{ "--i": i } as React.CSSProperties} />
        ))}
      </div>
      <div className="motion-art__icon-badge motion-art__icon-badge--academy">
        <GraduationCap className="motion-art__icon" strokeWidth={1.25} />
      </div>
      <svg className="motion-art__arc motion-art__arc--strike" viewBox="0 0 200 120" fill="none">
        <path d={path} stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="4 8" />
        <path
          d={path}
          stroke="url(#academy-arc)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="8 14"
          className="motion-art__trajectory-glow"
        />
        <defs>
          <linearGradient id="academy-arc" x1="0" y1="0" x2="200" y2="0">
            <stop stopColor="rgba(251,146,60,0)" />
            <stop offset="0.4" stopColor="rgba(251,146,60,0.9)" />
            <stop offset="1" stopColor="rgba(253,186,116,0.2)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="motion-art__impact" />
    </>
  );
}

function SportsArt() {
  const path = "M40 150 Q120 30 280 80";
  const vbW = 320;
  const vbH = 200;
  const arcStart = { x: 40, y: 150 };
  const arcEnd = { x: 280, y: 80 };

  return (
    <>
      <div className="motion-art__pitch">
        <div className="motion-art__pitch-center" />
        <div className="motion-art__pitch-box motion-art__pitch-box--left" />
        <div className="motion-art__pitch-box motion-art__pitch-box--right" />
        <div className="motion-art__pitch-football" aria-hidden>
          <div className="motion-art__football-surface" />
        </div>
      </div>

      <div className="motion-art__trajectory-wrap">
        <svg className="motion-art__trajectory" viewBox={`0 0 ${vbW} ${vbH}`} fill="none" preserveAspectRatio="xMidYMid meet">
          <path d={path} stroke="rgba(255,255,255,0.12)" strokeWidth="2" strokeDasharray="6 10" />
          <path
            d={path}
            stroke="url(#sports-trail)"
            strokeWidth="4"
            strokeLinecap="round"
            className="motion-art__trajectory-glow"
          />
          <circle cx={arcStart.x} cy={arcStart.y} r="5" className="motion-art__path-dot motion-art__path-dot--sports" />
          <circle cx={arcEnd.x} cy={arcEnd.y} r="5" className="motion-art__path-dot motion-art__path-dot--sports motion-art__path-dot--end" />
          <defs>
            <linearGradient id="sports-trail" x1="0" y1="0" x2="320" y2="0">
              <stop stopColor="rgba(74,222,128,0.15)" />
              <stop offset="0.5" stopColor="rgba(74,222,128,0.85)" />
              <stop offset="1" stopColor="rgba(255,255,255,0.35)" />
            </linearGradient>
          </defs>
        </svg>

        <PathLocationMarker
          x={arcStart.x}
          y={arcStart.y}
          vbW={vbW}
          vbH={vbH}
          className="motion-art__path-marker--sports motion-art__path-marker--start motion-art__path-marker--shop"
        >
          <ShoppingBag className="motion-art__path-marker-icon motion-art__path-marker-icon--shop" strokeWidth={1.75} />
        </PathLocationMarker>
        <PathLocationMarker
          x={arcEnd.x}
          y={arcEnd.y}
          vbW={vbW}
          vbH={vbH}
          className="motion-art__path-marker--sports motion-art__path-marker--end"
        />
      </div>
    </>
  );
}

function ToursArt() {
  const path = "M0 120 C80 40 160 100 240 60 S360 20 400 50";
  const vbW = 400;
  const vbH = 160;
  const arcStart = { x: 0, y: 120 };
  const arcEnd = { x: 400, y: 50 };

  return (
    <>
      <div className="motion-art__cloud motion-art__cloud--1" />
      <div className="motion-art__cloud motion-art__cloud--2" />
      <div className="motion-art__cloud motion-art__cloud--3" />

      <div className="motion-art__trajectory-wrap motion-art__trajectory-wrap--tours">
        <svg className="motion-art__flight-path" viewBox={`0 0 ${vbW} ${vbH}`} fill="none" preserveAspectRatio="xMidYMid meet">
          <path d={path} stroke="rgba(255,255,255,0.08)" strokeWidth="2" strokeDasharray="5 9" />
          <path
            d={path}
            stroke="url(#flight-trail)"
            strokeWidth="3"
            strokeLinecap="round"
            className="motion-art__flight-glow"
          />
          <circle cx={arcStart.x} cy={arcStart.y} r="5" className="motion-art__path-dot motion-art__path-dot--tours" />
          <circle cx={arcEnd.x} cy={arcEnd.y} r="5" className="motion-art__path-dot motion-art__path-dot--tours motion-art__path-dot--end" />
          <defs>
            <linearGradient id="flight-trail" x1="0" y1="0" x2="400" y2="0">
              <stop stopColor="rgba(56,189,248,0.1)" />
              <stop offset="0.45" stopColor="rgba(125,211,252,0.9)" />
              <stop offset="1" stopColor="rgba(255,255,255,0.4)" />
            </linearGradient>
          </defs>
        </svg>

        <PathLocationMarker
          x={arcStart.x}
          y={arcStart.y}
          vbW={vbW}
          vbH={vbH}
          className="motion-art__path-marker--tours motion-art__path-marker--start"
        />
        <PathLocationMarker
          x={arcEnd.x}
          y={arcEnd.y}
          vbW={vbW}
          vbH={vbH}
          className="motion-art__path-marker--tours motion-art__path-marker--end"
        />
      </div>

      <div className="motion-art__plane-wrap">
        <Plane className="motion-art__plane-icon" strokeWidth={1.5} />
        <div className="motion-art__contrail" />
      </div>
      <div className="motion-art__horizon" />
    </>
  );
}
