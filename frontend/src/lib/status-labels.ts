export type StatusVariant = "success" | "warning" | "error" | "info" | "neutral";

const STATUS_MAP: Record<string, { label: string; variant: StatusVariant }> = {
  active: { label: "Active", variant: "success" },
  inactive: { label: "Inactive", variant: "neutral" },
  enabled: { label: "Enabled", variant: "success" },
  disabled: { label: "Disabled", variant: "neutral" },
  draft: { label: "Draft", variant: "neutral" },
  published: { label: "Published", variant: "success" },
  archived: { label: "Archived", variant: "neutral" },
  pending: { label: "Pending", variant: "warning" },
  approved: { label: "Approved", variant: "success" },
  rejected: { label: "Rejected", variant: "error" },
  cancelled: { label: "Cancelled", variant: "error" },
  canceled: { label: "Cancelled", variant: "error" },
  completed: { label: "Completed", variant: "success" },
  processing: { label: "Processing", variant: "info" },
  confirmed: { label: "Confirmed", variant: "success" },
  paid: { label: "Paid", variant: "success" },
  failed: { label: "Failed", variant: "error" },
  in_progress: { label: "In progress", variant: "info" },
  high: { label: "High", variant: "error" },
  medium: { label: "Medium", variant: "warning" },
  low: { label: "Low", variant: "neutral" },
  partial: { label: "Partial", variant: "warning" },
  no_match: { label: "No match", variant: "info" },
};

export function formatStatus(value: string | boolean | null | undefined): {
  label: string;
  variant: StatusVariant;
} {
  if (typeof value === "boolean") {
    return value
      ? { label: "Active", variant: "success" }
      : { label: "Inactive", variant: "neutral" };
  }

  if (!value) {
    return { label: "Unknown", variant: "neutral" };
  }

  const key = value.toLowerCase().replace(/\s+/g, "_");
  const mapped = STATUS_MAP[key];
  if (mapped) return mapped;

  const label = value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return { label, variant: "neutral" };
}

export function formatRole(role: string): string {
  return role
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
