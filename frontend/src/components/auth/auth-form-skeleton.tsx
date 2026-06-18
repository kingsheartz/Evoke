/** Placeholder while auth forms mount client-side (password managers inject attrs before hydrate). */
export function AuthFormSkeleton() {
  return (
    <div className="space-y-5" aria-hidden="true">
      <div className="space-y-2">
        <div className="h-4 w-12 rounded bg-white/10" />
        <div className="h-11 w-full animate-pulse rounded-xl bg-white/5" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-16 rounded bg-white/10" />
        <div className="h-11 w-full animate-pulse rounded-xl bg-white/5" />
      </div>
      <div className="h-11 w-full animate-pulse rounded-xl bg-accent/20" />
    </div>
  );
}
