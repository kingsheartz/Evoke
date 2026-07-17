import type { FormField, FormFieldType } from "@/lib/cms-sections";

export const FORM_FIELD_TYPES: {
  value: FormFieldType;
  label: string;
  description: string;
}[] = [
  { value: "text", label: "Text input", description: "Single-line text" },
  { value: "textarea", label: "Text area", description: "Multi-line text" },
  { value: "number", label: "Number", description: "Numeric input" },
  { value: "email", label: "Email", description: "Email address" },
  { value: "tel", label: "Phone", description: "Phone number" },
  { value: "date", label: "Date", description: "Date picker" },
  { value: "radio", label: "Single choice", description: "Pick one option" },
  { value: "checkbox", label: "Multiple choice", description: "Pick many options" },
  { value: "select", label: "Drop down", description: "Select from list" },
  { value: "file", label: "File upload", description: "Attach a file" },
];

export function fieldTypeNeedsOptions(type: FormFieldType): boolean {
  return type === "radio" || type === "checkbox" || type === "select";
}

export function fieldSpansFullWidth(type: FormFieldType): boolean {
  return type === "textarea" || type === "radio" || type === "checkbox" || type === "select" || type === "file";
}

export function defaultFormField(type: FormFieldType): FormField {
  const base: FormField = {
    id: `field-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    label: "New field",
    type,
    required: false,
  };
  if (fieldTypeNeedsOptions(type)) {
    base.options = ["Option 1", "Option 2"];
  }
  return base;
}

export function normalizeFormFields(fields: FormField[]): FormField[] {
  return fields.map((field, index) => ({
    ...field,
    id: field.id?.trim() || `field-${index}-${field.label.trim().toLowerCase().replace(/\s+/g, "-") || "untitled"}`,
  }));
}

export function formFieldTypeLabel(type: FormFieldType): string {
  return FORM_FIELD_TYPES.find((t) => t.value === type)?.label ?? type;
}
