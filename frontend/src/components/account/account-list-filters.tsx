"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function AccountListFilters({
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  status,
  onStatusChange,
  statusOptions,
  className,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  status?: string;
  onStatusChange?: (value: string) => void;
  statusOptions?: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3 px-4 pb-3 pt-1 sm:flex-row sm:items-center", className)}>
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-muted" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-10"
          aria-label="Search list"
        />
      </div>
      {statusOptions && onStatusChange && (
        <Select
          value={status ?? ""}
          onChange={(e) => onStatusChange(e.target.value)}
          className="sm:w-44"
          aria-label="Filter by status"
        >
          {statusOptions.map((option) => (
            <option key={option.value || "all"} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      )}
    </div>
  );
}

export function matchesAccountSearch(haystack: Array<string | null | undefined>, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return haystack.some((part) => part?.toLowerCase().includes(q));
}
