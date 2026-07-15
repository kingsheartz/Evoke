"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { OfferingCard, OfferingCardGrid } from "@/components/offerings/offering-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { AcademyCategory } from "@/lib/api";
import type { OfferingCardData } from "@/lib/offerings";
import {
  OFFERING_CATALOG_SORT_OPTIONS,
  TOUR_TYPE_OPTIONS,
  activeOfferingFilterCount,
  offeringCatalogPath,
  type OfferingCatalogFilters,
} from "@/lib/offering-catalog";
import { cn } from "@/lib/utils";

function FilterCheckbox({
  id,
  label,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-app-surface-muted/50"
    >
      <span className="text-sm text-app-text">{label}</span>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </label>
  );
}

export function OfferingsCatalog({
  vertical,
  eyebrow,
  title,
  description,
  basePath,
  searchPlaceholder,
  emptyMessage,
  filters,
  items,
  total,
  currentPage,
  lastPage,
  categories,
}: {
  vertical: "tours" | "academy";
  eyebrow: string;
  title: string;
  description: string;
  basePath: string;
  searchPlaceholder: string;
  emptyMessage: string;
  filters: OfferingCatalogFilters;
  items: OfferingCardData[];
  total: number;
  currentPage: number;
  lastPage: number;
  categories?: AcademyCategory[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState(filters.q ?? "");

  const resultLabel =
    total === 0
      ? vertical === "tours"
        ? "No packages found"
        : "No courses found"
      : total === 1
        ? vertical === "tours"
          ? "1 package"
          : "1 course"
        : `${total.toLocaleString("en-IN")} ${vertical === "tours" ? "packages" : "courses"}`;

  function navigate(next: OfferingCatalogFilters) {
    startTransition(() => {
      router.push(offeringCatalogPath(basePath, next));
    });
  }

  function applyFilters(patch: Partial<OfferingCatalogFilters>) {
    navigate({ ...filters, ...patch, page: 1 });
    setMobileFiltersOpen(false);
  }

  function clearFilters() {
    navigate({ sort: filters.sort, per_page: filters.per_page, page: 1 });
    setSearchDraft("");
    setMobileFiltersOpen(false);
  }

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    applyFilters({ q: searchDraft.trim() || undefined });
  }

  const activeCount = activeOfferingFilterCount(filters);

  return (
    <PageContainer className="py-8 md:py-12">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-soft">{eyebrow}</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-app-text sm:text-4xl md:text-5xl">
          {title}
        </h1>
        <p className="mt-3 text-base text-app-muted sm:text-lg">{description}</p>
      </div>

      <form onSubmit={handleSearchSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-muted" />
          <Input
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-10"
            aria-label={`Search ${vertical}`}
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            Search
          </Button>
          <Button
            type="button"
            variant="outline"
            className="lg:hidden"
            onClick={() => setMobileFiltersOpen((open) => !open)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeCount > 0 && (
              <span className="ml-1 rounded-full bg-accent/20 px-1.5 text-xs text-accent-soft">{activeCount}</span>
            )}
          </Button>
        </div>
      </form>

      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside
          className={cn(
            "space-y-6 rounded-2xl border border-app-border bg-app-surface/60 p-5 ring-1 ring-app-border",
            mobileFiltersOpen ? "block" : "hidden lg:block",
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-lg font-semibold text-app-text">Filters</h2>
            {activeCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-medium text-accent-soft hover:text-accent"
              >
                Clear all
              </button>
            )}
          </div>

          {vertical === "tours" && (
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-app-muted">Type</h3>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => applyFilters({ type: undefined })}
                  className={cn(
                    "block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    !filters.type
                      ? "bg-accent/10 font-medium text-accent-soft"
                      : "text-app-muted hover:bg-app-surface-muted/50 hover:text-app-text",
                  )}
                >
                  All types
                </button>
                {TOUR_TYPE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => applyFilters({ type: option.value })}
                    className={cn(
                      "block w-full rounded-lg px-3 py-2 text-left text-sm capitalize transition-colors",
                      filters.type === option.value
                        ? "bg-accent/10 font-medium text-accent-soft"
                        : "text-app-muted hover:bg-app-surface-muted/50 hover:text-app-text",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {vertical === "academy" && categories && categories.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-app-muted">Category</h3>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => applyFilters({ category: undefined })}
                  className={cn(
                    "block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    !filters.category
                      ? "bg-accent/10 font-medium text-accent-soft"
                      : "text-app-muted hover:bg-app-surface-muted/50 hover:text-app-text",
                  )}
                >
                  All categories
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => applyFilters({ category: category.slug })}
                    className={cn(
                      "block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      filters.category === category.slug
                        ? "bg-accent/10 font-medium text-accent-soft"
                        : "text-app-muted hover:bg-app-surface-muted/50 hover:text-app-text",
                    )}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-app-muted">Price (₹)</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="min-price" className="text-xs text-app-muted">
                  Min
                </Label>
                <Input
                  id="min-price"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder="0"
                  defaultValue={filters.min_price ?? ""}
                  key={`min-${filters.min_price ?? ""}`}
                  onBlur={(e) => {
                    const value = e.target.value.trim();
                    applyFilters({ min_price: value ? Number.parseFloat(value) : undefined });
                  }}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="max-price" className="text-xs text-app-muted">
                  Max
                </Label>
                <Input
                  id="max-price"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder="Any"
                  defaultValue={filters.max_price ?? ""}
                  key={`max-${filters.max_price ?? ""}`}
                  onBlur={(e) => {
                    const value = e.target.value.trim();
                    applyFilters({ max_price: value ? Number.parseFloat(value) : undefined });
                  }}
                />
              </div>
            </div>
          </div>

          <FilterCheckbox
            id="featured-only"
            label="Featured only"
            checked={Boolean(filters.featured)}
            onCheckedChange={(checked) => applyFilters({ featured: checked || undefined })}
          />
        </aside>

        <div className={cn("min-w-0 space-y-6", pending && "opacity-60")}>
          <div className="flex flex-col gap-4 rounded-2xl border border-app-border bg-app-surface/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-app-muted">
              <span className="font-medium text-app-text">{resultLabel}</span>
              {filters.q && <span className="hidden sm:inline"> matching your search</span>}
            </p>
            <div className="flex items-center gap-2">
              <Label htmlFor="sort-offerings" className="shrink-0 text-xs text-app-muted">
                Sort by
              </Label>
              <Select
                id="sort-offerings"
                value={filters.sort ?? "newest"}
                onChange={(e) =>
                  applyFilters({ sort: e.target.value as OfferingCatalogFilters["sort"] })
                }
                className="min-w-[11rem]"
              >
                {OFFERING_CATALOG_SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {items.length > 0 ? (
            <OfferingCardGrid className="lg:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <OfferingCard key={item.href} {...item} />
              ))}
            </OfferingCardGrid>
          ) : (
            <div className="rounded-2xl border border-dashed border-app-border px-6 py-16 text-center">
              <p className="font-medium text-app-text">{emptyMessage}</p>
              <p className="mt-2 text-sm text-app-muted">Try clearing filters or using a broader search.</p>
              <Button type="button" variant="outline" className="mt-6" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          )}

          {lastPage > 1 && (
            <nav
              className="flex flex-col items-center justify-between gap-4 border-t border-app-border pt-6 sm:flex-row"
              aria-label="Catalog pagination"
            >
              <p className="text-sm text-app-muted">
                Page {currentPage} of {lastPage}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1 || pending}
                  onClick={() => navigate({ ...filters, page: currentPage - 1 })}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= lastPage || pending}
                  onClick={() => navigate({ ...filters, page: currentPage + 1 })}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </nav>
          )}
        </div>
      </div>

      <p className="mt-10 text-center text-sm text-app-muted">
        Looking for something else?{" "}
        <Link href="/" className="font-medium text-accent-soft hover:text-accent">
          Back to home
        </Link>
      </p>
    </PageContainer>
  );
}
