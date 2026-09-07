"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";
import { Select } from "@/components/ui/select";

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 15, 20, 50, 100];

export function TablePagination({
  page,
  lastPage,
  total,
  pageSize,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  lastPage: number;
  total?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}) {
  if (lastPage <= 1 && !onPageSizeChange) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-app-border px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-xs text-app-muted">
          {total != null ? `${total} total · ` : ""}
          Page {page} of {Math.max(lastPage, 1)}
        </p>
        {onPageSizeChange && pageSize != null && (
          <label className="flex items-center gap-2 text-xs text-app-muted">
            Rows
            <Select
              value={String(pageSize)}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-8 w-20 py-0 text-xs"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </Select>
          </label>
        )}
      </div>
      {lastPage > 1 && (
        <div className="flex gap-2">
          <ActionButton
            variant="outline"
            size="sm"
            icon={ChevronLeft}
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Prev
          </ActionButton>
          <ActionButton
            variant="outline"
            size="sm"
            icon={ChevronRight}
            disabled={page >= lastPage}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </ActionButton>
        </div>
      )}
    </div>
  );
}
