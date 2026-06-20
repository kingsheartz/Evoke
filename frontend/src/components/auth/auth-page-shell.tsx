import { AmbientGlow } from "@/components/ui/ambient-glow";
import { EvokeLogo } from "@/components/brand/evoke-logo";

export function AuthPageShell({
  badge,
  children,
}: {
  badge: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
      <div className="absolute inset-0 mesh-bg" aria-hidden />
      <AmbientGlow />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-app-bg/20 via-transparent to-app-bg/90"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(12,13,15,0.55)_100%)]"
        aria-hidden
      />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center">
        <header className="mb-12 flex flex-col items-center gap-6 text-center">
          <EvokeLogo variant="auth" elevated />
          {badge}
        </header>
        {children}
      </div>
    </div>
  );
}
