"use client";

import { useState } from "react";
import {
  Calendar,
  CheckSquare,
  ChevronDown,
  CircleDot,
  CloudUpload,
  Hash,
  Plus,
  Trash2,
  Type,
  AlignLeft,
} from "lucide-react";
import { FileUploadZone } from "@/components/ui/file-upload-zone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormField, FormFieldType } from "@/lib/cms-sections";
import {
  FORM_FIELD_TYPES,
  defaultFormField,
  fieldTypeNeedsOptions,
  formFieldTypeLabel,
} from "@/lib/form-field-types";
import { cn } from "@/lib/utils";

const FIELD_ICONS: Record<FormFieldType, React.ComponentType<{ className?: string }>> = {
  text: Type,
  textarea: AlignLeft,
  number: Hash,
  email: Type,
  tel: Type,
  date: Calendar,
  radio: CircleDot,
  checkbox: CheckSquare,
  select: ChevronDown,
  file: CloudUpload,
};

function updateList<T>(list: T[], index: number, patch: Partial<T>): T[] {
  return list.map((item, i) => (i === index ? { ...item, ...patch } : item));
}

function FieldTypePicker({ onPick, onCancel }: { onPick: (type: FormFieldType) => void; onCancel: () => void }) {
  return (
    <div className="rounded-xl border border-app-border bg-app-surface p-4">
      <p className="mb-3 text-sm font-medium text-app-text">Select a field type</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {FORM_FIELD_TYPES.map((option) => {
          const Icon = FIELD_ICONS[option.value];
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onPick(option.value)}
              className="flex flex-col items-center gap-2 rounded-lg border border-app-border bg-app-surface-muted/30 px-3 py-4 text-center transition-colors hover:border-accent/40 hover:bg-accent/5"
            >
              <Icon className="h-6 w-6 text-accent-soft" />
              <span className="text-xs font-medium text-app-text">{option.label}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function OptionsEditor({
  options,
  onChange,
}: {
  options: string[];
  onChange: (options: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs text-app-muted">Options</Label>
      {options.map((option, index) => (
        <div key={index} className="flex gap-2">
          <Input
            value={option}
            placeholder={`Option ${index + 1}`}
            onChange={(e) => {
              const next = [...options];
              next[index] = e.target.value;
              onChange(next);
            }}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0"
            onClick={() => onChange(options.filter((_, i) => i !== index))}
          >
            <Trash2 className="h-4 w-4 text-status-error" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...options, ""])}>
        <Plus className="h-4 w-4" />
        Add option
      </Button>
    </div>
  );
}

export function FormFieldsEditor({
  fields,
  onChange,
}: {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
}) {
  const [pickingType, setPickingType] = useState(false);

  const addField = (type: FormFieldType) => {
    onChange([...fields, defaultFormField(type)]);
    setPickingType(false);
  };

  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <div
          key={index}
          className="space-y-3 rounded-lg border border-app-border bg-app-surface-muted/40 p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-app-muted">
              {formFieldTypeLabel(field.type)}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange(fields.filter((_, i) => i !== index))}
            >
              <Trash2 className="h-4 w-4 text-status-error" />
            </Button>
          </div>
          <Input
            placeholder="Field label"
            value={field.label}
            onChange={(e) => onChange(updateList(fields, index, { label: e.target.value }))}
          />
          <Input
            placeholder="Placeholder (optional)"
            value={field.placeholder ?? ""}
            onChange={(e) => onChange(updateList(fields, index, { placeholder: e.target.value }))}
          />
          {fieldTypeNeedsOptions(field.type) && (
            <OptionsEditor
              options={field.options ?? []}
              onChange={(options) => onChange(updateList(fields, index, { options }))}
            />
          )}
          <label className="flex items-center gap-2 text-sm text-app-muted">
            <input
              type="checkbox"
              checked={field.required ?? false}
              onChange={(e) => onChange(updateList(fields, index, { required: e.target.checked }))}
            />
            Required
          </label>
        </div>
      ))}

      {pickingType ? (
        <FieldTypePicker onPick={addField} onCancel={() => setPickingType(false)} />
      ) : (
        <Button type="button" variant="outline" size="sm" onClick={() => setPickingType(true)}>
          <Plus className="h-4 w-4" />
          Add field
        </Button>
      )}
    </div>
  );
}

export function FormFieldPreview({ field, name }: { field: FormField; name: string }) {
  const label = (
    <span className="text-sm font-medium text-app-text">
      {field.label}
      {field.required && <span className="text-status-error"> *</span>}
    </span>
  );
  const inputClass =
    "w-full rounded-lg border border-app-border bg-app-surface-muted/60 px-3 py-2 text-sm text-app-text";
  const placeholder = field.placeholder?.trim() || undefined;

  switch (field.type) {
    case "textarea":
      return (
        <div className="space-y-2">
          <label className="block">{label}</label>
          <textarea name={name} required={field.required} rows={4} placeholder={placeholder} className={inputClass} />
        </div>
      );
    case "radio":
      return (
        <fieldset className="space-y-2">
          <legend>{label}</legend>
          <div className="space-y-2">
            {(field.options ?? []).filter(Boolean).map((option, i) => (
              <label key={i} className="flex items-center gap-2 text-sm text-app-text">
                <input type="radio" name={name} value={option} required={field.required && i === 0} />
                {option}
              </label>
            ))}
          </div>
        </fieldset>
      );
    case "checkbox":
      return (
        <fieldset className="space-y-2">
          <legend>{label}</legend>
          <div className="space-y-2">
            {(field.options ?? []).filter(Boolean).map((option, i) => (
              <label key={i} className="flex items-center gap-2 text-sm text-app-text">
                <input type="checkbox" name={`${name}[]`} value={option} />
                {option}
              </label>
            ))}
          </div>
        </fieldset>
      );
    case "select":
      return (
        <div className="space-y-2">
          <label className="block">{label}</label>
          <select name={name} required={field.required} className={cn(inputClass, "h-10")}>
            <option value="">{placeholder ?? "Select…"}</option>
            {(field.options ?? []).filter(Boolean).map((option, i) => (
              <option key={i} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      );
    case "file":
      return (
        <div className="space-y-2">
          <label className="block">{label}</label>
          <FormFileUpload name={name} required={field.required} placeholder={placeholder} />
        </div>
      );
    default:
      return (
        <div className="space-y-2">
          <label className="block">{label}</label>
          <input
            type={field.type}
            name={name}
            required={field.required}
            placeholder={placeholder}
            className={cn(inputClass, "h-10")}
          />
        </div>
      );
  }
}

function FormFileUpload({
  name,
  required,
  placeholder,
}: {
  name: string;
  required?: boolean;
  placeholder?: string;
}) {
  const [selectedName, setSelectedName] = useState<string | null>(null);

  return (
    <FileUploadZone
      name={name}
      required={required}
      selectedFileName={selectedName}
      emptyTitle="Choose a file"
      emptyDescription={placeholder ?? "Click to browse or drag a file here."}
      changeTitle="Choose a different file"
      onFileSelect={(file) => setSelectedName(file.name)}
    />
  );
}
