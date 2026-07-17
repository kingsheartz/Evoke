"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import {
  Calendar,
  CheckSquare,
  ChevronDown,
  CircleDot,
  CloudUpload,
  GripVertical,
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
  normalizeFormFields,
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

function SortableFormField({
  field,
  index,
  onChange,
  onDelete,
}: {
  field: FormField;
  index: number;
  onChange: (index: number, patch: Partial<FormField>) => void;
  onDelete: (index: number) => void;
}) {
  const fieldId = field.id ?? `field-${index}`;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: fieldId });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "space-y-3 rounded-lg border border-app-border bg-app-surface-muted/40 p-4",
        isDragging && "z-10 opacity-90",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="cursor-grab shrink-0 text-app-muted hover:text-accent-soft"
            aria-label={`Reorder field ${index + 1}`}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5" />
          </button>
          <span className="text-xs font-medium uppercase tracking-wider text-app-muted">
            {formFieldTypeLabel(field.type)}
          </span>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={() => onDelete(index)}>
          <Trash2 className="h-4 w-4 text-status-error" />
        </Button>
      </div>
      <Input
        placeholder="Field label"
        value={field.label}
        onChange={(e) => onChange(index, { label: e.target.value })}
      />
      <Input
        placeholder="Placeholder (optional)"
        value={field.placeholder ?? ""}
        onChange={(e) => onChange(index, { placeholder: e.target.value })}
      />
      {fieldTypeNeedsOptions(field.type) && (
        <OptionsEditor
          options={field.options ?? []}
          onChange={(options) => onChange(index, { options })}
        />
      )}
      <label className="flex items-center gap-2 text-sm text-app-muted">
        <input
          type="checkbox"
          checked={field.required ?? false}
          onChange={(e) => onChange(index, { required: e.target.checked })}
        />
        Required
      </label>
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
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const normalizedFields = normalizeFormFields(fields);

  const addField = (type: FormFieldType) => {
    onChange([...normalizedFields, defaultFormField(type)]);
    setPickingType(false);
  };

  const updateField = (index: number, patch: Partial<FormField>) => {
    onChange(updateList(normalizedFields, index, patch));
  };

  const deleteField = (index: number) => {
    onChange(normalizedFields.filter((_, i) => i !== index));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = normalizedFields.findIndex((field) => field.id === active.id);
    const newIndex = normalizedFields.findIndex((field) => field.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onChange(arrayMove(normalizedFields, oldIndex, newIndex));
  };

  return (
    <div className="space-y-3">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={normalizedFields.map((field) => field.id!)} strategy={verticalListSortingStrategy}>
          <div className={cn("space-y-3", normalizedFields.length === 0 && "hidden")}>
            {normalizedFields.map((field, index) => (
              <SortableFormField
                key={field.id}
                field={field}
                index={index}
                onChange={updateField}
                onDelete={deleteField}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

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

export function FormFieldPreview({ field, name, className }: { field: FormField; name: string; className?: string }) {
  const label = (
    <span className="text-sm font-medium text-app-text">
      {field.label}
      {field.required && <span className="text-status-error"> *</span>}
    </span>
  );
  const inputClass =
    "w-full rounded-lg border border-app-border bg-app-surface-muted/60 px-3 py-2 text-sm text-app-text";
  const placeholder = field.placeholder?.trim() || undefined;

  const wrap = (node: React.ReactNode) => <div className={className}>{node}</div>;

  switch (field.type) {
    case "textarea":
      return wrap(
        <div className="space-y-2">
          <label className="block">{label}</label>
          <textarea name={name} required={field.required} rows={4} placeholder={placeholder} className={inputClass} />
        </div>,
      );
    case "radio":
      return wrap(
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
        </fieldset>,
      );
    case "checkbox":
      return wrap(
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
        </fieldset>,
      );
    case "select":
      return wrap(
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
        </div>,
      );
    case "file":
      return wrap(
        <div className="space-y-2">
          <label className="block">{label}</label>
          <FormFileUpload name={name} required={field.required} placeholder={placeholder} />
        </div>,
      );
    default:
      return wrap(
        <div className="space-y-2">
          <label className="block">{label}</label>
          <input
            type={field.type}
            name={name}
            required={field.required}
            placeholder={placeholder}
            className={cn(inputClass, "h-10")}
          />
        </div>,
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
      compact
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
