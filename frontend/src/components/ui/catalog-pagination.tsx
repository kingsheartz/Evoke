"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getVisiblePages, paginationRangeLabel } from "@/lib/pagination";
import { cn } from "@/lib/utils";

export function CatalogPagination({
  currentPage,
  lastPage,
  total,
  perPage,
  onPageChange,
  disabled = false,
  className,
}: {
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  className?: string;
}) {
  if (lastPage <= 1) return null;

  const pages = getVisiblePages(currentPage, lastPage);

  return (
    <nav
      className={cn("flex flex-col items-center gap-3 border-t border-app-border pt-5 sm:gap-4", className)}
      aria-label="Pagination"
    >
      <p className="text-xs text-app-muted">{paginationRangeLabel(currentPage, perPage, total)}</p>

      <div className="flex flex-wrap items-center justify-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 px-2.5"
          disabled={currentPage <= 1 || disabled}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        <div className="flex items-center gap-0.5 px-1">
          {pages.map((page, index) =>
            page === "ellipsis" ? (
              <span key={`ellipsis-${index}`} className="px-2 text-sm text-app-muted" aria-hidden>
                …
              </span>
            ) : (
              <button
                key={page}
                type="button"
                disabled={disabled}
                onClick={() => onPageChange(page)}
                aria-label={`Page ${page}`}
                aria-current={page === currentPage ? "page" : undefined}
                className={cn(
                  "inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-medium transition-colors",
                  page === currentPage
                    ? "bg-accent text-white shadow-sm"
                    : "text-app-muted hover:bg-app-surface-muted/60 hover:text-app-text",
                  disabled && "pointer-events-none opacity-50",
                )}
              >
                {page}
              </button>
            ),
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 px-2.5"
          disabled={currentPage >= lastPage || disabled}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
}
