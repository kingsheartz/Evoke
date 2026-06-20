"use client";

import { Plus, Trash2 } from "lucide-react";
import { MediaUrlField } from "@/components/cms/media-url-field";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function GalleryUrlsField({
  label = "Gallery images",
  addLabel = "Add image",
  values,
  onChange,
}: {
  label?: string;
  addLabel?: string;
  values: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="rounded-xl border border-app-border/70 bg-app-surface-muted/15 p-4">
      <Label className="mb-4 block">{label}</Label>
      <div className="space-y-4">
        {values.map((url, index) => (
          <div key={index} className="rounded-lg border border-app-border bg-app-surface-muted/40 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-wider text-app-muted">Image {index + 1}</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange(values.filter((_, i) => i !== index))}
              >
                <Trash2 className="h-4 w-4 text-status-error" />
              </Button>
            </div>
            <MediaUrlField
              value={url}
              onChange={(next) => onChange(values.map((item, i) => (i === index ? next : item)))}
              cropAspect={4 / 3}
            />
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => onChange([...values, ""])}>
        <Plus className="h-4 w-4" />
        {addLabel}
      </Button>
    </div>
  );
}

export function normalizeUrlList(values: string[] | undefined): string[] {
  return (values ?? []).map((item) => item.trim()).filter(Boolean);
}
