import { cn } from "@/lib/utils";

export function AmbientGlow({ className }: { className?: string }) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      <div className="absolute -left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-accent/20 blur-[120px] kings-pulse" />
      <div className="absolute -right-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-violet-500/15 blur-[100px] kings-pulse kings-pulse-delay-1" />
      <div className="absolute bottom-0 left-1/3 h-[350px] w-[350px] rounded-full bg-blue-500/10 blur-[90px] kings-pulse kings-pulse-delay-2" />
    </div>
  );
}
