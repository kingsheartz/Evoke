"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cropImageToFile } from "@/lib/crop-image";
import { cn } from "@/lib/utils";

type CropAspectPreset = "free" | "1:1" | "16:9" | "4:3";

const ASPECT_PRESETS: { id: CropAspectPreset; label: string; value: number | undefined }[] = [
  { id: "free", label: "Free", value: undefined },
  { id: "1:1", label: "1:1", value: 1 },
  { id: "16:9", label: "16:9", value: 16 / 9 },
  { id: "4:3", label: "4:3", value: 4 / 3 },
];

export interface ImageCropModalProps {
  open: boolean;
  imageSrc: string | null;
  fileName: string;
  mimeType: string;
  /** Fixed aspect ratio (e.g. `1` for avatars). Hides ratio presets when set. */
  aspect?: number;
  title?: string;
  confirmLabel?: string;
  onClose: () => void;
  onConfirm: (file: File) => void | Promise<void>;
}

export function ImageCropModal({
  open,
  imageSrc,
  fileName,
  mimeType,
  aspect: fixedAspect,
  title = "Crop image",
  confirmLabel = "Crop & upload",
  onClose,
  onConfirm,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspectPreset, setAspectPreset] = useState<CropAspectPreset>("free");
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setAspectPreset(fixedAspect === 1 ? "1:1" : "free");
    setCroppedAreaPixels(null);
    setSubmitting(false);
  }, [open, imageSrc, fixedAspect]);

  const aspect = fixedAspect ?? ASPECT_PRESETS.find((p) => p.id === aspectPreset)?.value;

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setSubmitting(true);
    try {
      const file = await cropImageToFile(imageSrc, croppedAreaPixels, fileName, mimeType);
      await onConfirm(file);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted || !open || !imageSrc) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[2147483645] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-crop-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-app-border bg-app-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-app-border px-4 py-3">
          <h2 id="image-crop-title" className="font-display text-lg font-semibold text-app-text">
            {title}
          </h2>
          <Button type="button" variant="ghost" size="sm" disabled={submitting} onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative h-[min(52vh,420px)] w-full bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            objectFit="contain"
          />
        </div>

        <div className="space-y-4 border-t border-app-border px-4 py-4">
          {fixedAspect === undefined && (
            <div className="flex flex-wrap gap-2">
              {ASPECT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                    aspectPreset === preset.id
                      ? "border-accent/50 bg-accent/15 text-accent-soft"
                      : "border-app-border text-app-muted hover:border-app-border-strong hover:text-app-text",
                  )}
                  onClick={() => setAspectPreset(preset.id)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}

          <label className="flex items-center gap-3 text-sm text-app-muted">
            <span className="shrink-0">Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-accent"
            />
          </label>

          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" disabled={submitting} onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" disabled={submitting || !croppedAreaPixels} onClick={() => void handleConfirm()}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                confirmLabel
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
