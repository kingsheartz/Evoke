"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HOME_VARIANT_COOKIE, HOME_VARIANT_OPTIONS, type HomeVariant } from "@/lib/home-variant";
import { cn } from "@/lib/utils";

export function HomeVariantSwitcher({
  current,
  enabled,
}: {
  current: HomeVariant;
  enabled: boolean;
}) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(enabled);
  }, [enabled]);

  if (!visible) return null;

  const setVariant = (next: HomeVariant) => {
    if (next === current) return;
    document.cookie = `${HOME_VARIANT_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  };

  return (
    <div className="fixed bottom-4 left-4 z-[60] flex flex-col gap-1 rounded-xl border border-white/15 bg-black/70 p-1.5 shadow-xl backdrop-blur-md">
      <p className="px-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
        Home variant
      </p>
      <div className="flex flex-wrap gap-1">
        {HOME_VARIANT_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            title={option.description}
            onClick={() => setVariant(option.id)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              current === option.id
                ? "bg-accent text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
