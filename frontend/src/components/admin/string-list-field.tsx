"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function StringListField({
  label,
  addLabel = "Add item",
  values,
  onChange,
  placeholder = "List item",
}: {
  label: string;
  addLabel?: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div className="rounded-xl border border-app-border/70 bg-app-surface-muted/15 p-4">
      <Label className="mb-4 block">{label}</Label>
      <div className="space-y-3">
        {values.map((value, index) => (
          <div key={index} className="flex items-start gap-3 rounded-lg border border-app-border bg-app-surface-muted/40 p-3">
            <Input
              value={value}
              placeholder={placeholder}
              onChange={(e) => onChange(values.map((item, i) => (i === index ? e.target.value : item)))}
              className="min-w-0 flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0"
              onClick={() => onChange(values.filter((_, i) => i !== index))}
            >
              <Trash2 className="h-4 w-4 text-status-error" />
            </Button>
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

export function normalizeStringList(values: string[] | undefined): string[] {
  return (values ?? []).map((item) => item.trim()).filter(Boolean);
}
