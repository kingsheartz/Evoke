"use client";

import { Sparkles } from "lucide-react";
import { GalleryUrlsField, normalizeUrlList } from "@/components/admin/gallery-urls-field";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { HERO_BACKGROUND_EXAMPLES, type HeroSlideshowSettings } from "@/lib/cms-sections";

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-app-muted">{children}</p>;
}

export function HeroBackgroundImagesField({
  images,
  settings,
  onChange,
}: {
  images: string[];
  settings: HeroSlideshowSettings;
  onChange: (images: string[], settings: HeroSlideshowSettings) => void;
}) {
  const normalized = images.length > 0 ? images : [""];
  const filledCount = normalizeUrlList(images).length;
  const slideshowEnabled = filledCount > 1;

  const patchSettings = (patch: Partial<HeroSlideshowSettings>) => {
    onChange(images, { ...settings, ...patch });
  };

  const loadExamples = () => {
    onChange(
      HERO_BACKGROUND_EXAMPLES.map((item) => item.url),
      {
        ...settings,
        duration_seconds: settings.duration_seconds ?? 6,
        transition: settings.transition ?? "fade",
        autoplay: settings.autoplay ?? true,
        show_indicators: settings.show_indicators ?? true,
      },
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <Label>Background images</Label>
          <FieldHint>
            Add one image for a static hero, or multiple for an autoplay slideshow. Wide landscape photos work best
            (16:9 or wider).
          </FieldHint>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={loadExamples}>
          <Sparkles className="h-4 w-4" />
          Load example set
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {HERO_BACKGROUND_EXAMPLES.map((example) => (
          <button
            key={example.url}
            type="button"
            onClick={() => {
              const urls = normalizeUrlList([...images, example.url]);
              onChange(urls, settings);
            }}
            className="rounded-full border border-app-border bg-app-surface-muted/30 px-3 py-1 text-xs text-app-muted transition-colors hover:border-accent/40 hover:text-app-text"
          >
            + {example.label}
          </button>
        ))}
      </div>

      <GalleryUrlsField
        label=""
        addLabel="Add background image"
        values={normalized}
        onChange={(next) => onChange(next, settings)}
        cropAspect={16 / 9}
      />

      {slideshowEnabled ? (
        <div className="rounded-xl border border-app-border/70 bg-app-surface-muted/15 p-4">
          <p className="text-sm font-medium text-app-text">Slideshow settings</p>
          <FieldHint>
            {filledCount} images will rotate automatically. Visitors can still read the headline over the fade
            transition.
          </FieldHint>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-app-muted">Seconds per slide</Label>
              <Select
                value={String(settings.duration_seconds ?? 6)}
                onChange={(e) => patchSettings({ duration_seconds: Number(e.target.value) })}
              >
                <option value="4">4 seconds — quick pace</option>
                <option value="6">6 seconds — balanced (recommended)</option>
                <option value="8">8 seconds — relaxed</option>
                <option value="10">10 seconds — slow</option>
                <option value="15">15 seconds — showcase</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-app-muted">Transition</Label>
              <Select
                value={settings.transition ?? "fade"}
                onChange={(e) => patchSettings({ transition: e.target.value as HeroSlideshowSettings["transition"] })}
              >
                <option value="fade">Crossfade — smooth blend</option>
                <option value="none">Instant — hard cut</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-app-muted">Autoplay</Label>
              <Select
                value={settings.autoplay === false ? "off" : "on"}
                onChange={(e) => patchSettings({ autoplay: e.target.value === "on" })}
              >
                <option value="on">On — cycle automatically</option>
                <option value="off">Off — stay on first slide</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-app-muted">Slide indicators</Label>
              <Select
                value={settings.show_indicators === false ? "off" : "on"}
                onChange={(e) => patchSettings({ show_indicators: e.target.value === "on" })}
              >
                <option value="on">Show dots below content</option>
                <option value="off">Hidden</option>
              </Select>
            </div>
          </div>
        </div>
      ) : (
        <FieldHint>Add a second image to enable slideshow timing and transition options.</FieldHint>
      )}
    </div>
  );
}
