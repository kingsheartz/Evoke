import { cn } from "@/lib/utils";

function Bone({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-app-surface-muted/80", className)} aria-hidden />;
}

export function SitePageSkeleton() {
  return (
    <div className="app-shell-x animate-pulse space-y-8 pb-16 pt-[5.5rem]" aria-busy="true" aria-label="Loading page">
      <div className="space-y-4">
        <Bone className="h-4 w-32 rounded-full" />
        <Bone className="h-12 w-full max-w-2xl" />
        <Bone className="h-5 w-full max-w-xl" />
        <div className="flex flex-wrap gap-2 pt-2">
          <Bone className="h-9 w-28 rounded-full" />
          <Bone className="h-9 w-28 rounded-full" />
          <Bone className="h-9 w-28 rounded-full" />
        </div>
      </div>
      <Bone className="h-48 w-full rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Bone className="h-40 rounded-2xl" />
        <Bone className="h-40 rounded-2xl" />
        <Bone className="h-40 rounded-2xl" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Bone className="h-32 rounded-2xl" />
        <Bone className="h-32 rounded-2xl" />
        <Bone className="h-32 rounded-2xl" />
      </div>
    </div>
  );
}

export function AdminPageSkeleton() {
  return (
    <div className="app-page animate-pulse space-y-6" aria-busy="true" aria-label="Loading page">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Bone className="h-8 w-48" />
          <Bone className="h-4 w-72 max-w-full" />
        </div>
        <Bone className="h-9 w-32" />
      </div>
      <Bone className="h-64 w-full rounded-2xl" />
      <div className="grid gap-4 md:grid-cols-2">
        <Bone className="h-40 rounded-2xl" />
        <Bone className="h-40 rounded-2xl" />
      </div>
    </div>
  );
}

export function AuthPageSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-md animate-pulse flex-col gap-6 px-4 py-16" aria-busy="true" aria-label="Loading">
      <Bone className="mx-auto h-24 w-24 rounded-2xl" />
      <Bone className="h-10 w-full rounded-xl" />
      <Bone className="h-10 w-full rounded-xl" />
      <Bone className="h-11 w-full rounded-xl" />
    </div>
  );
}
