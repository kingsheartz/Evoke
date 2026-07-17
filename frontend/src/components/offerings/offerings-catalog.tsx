"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { OfferingCard, OfferingCardGrid } from "@/components/offerings/offering-card";
import { Button } from "@/components/ui/button";
import { CatalogPagination } from "@/components/ui/catalog-pagination";
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
      className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-1.5 py-1.5 hover:bg-app-surface-muted/50"
    >
      <span className="text-xs text-app-text">{label}</span>
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

  function goToPage(page: number) {
    navigate({ ...filters, page });
    document.getElementById("catalog-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    <PageContainer className="py-5 md:py-7">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-soft">{eyebrow}</p>
          <h1 className="mt-0.5 font-display text-2xl font-semibold tracking-tight text-app-text sm:text-3xl">
            {title}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-app-muted">{description}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <form onSubmit={handleSearchSubmit} className="flex min-w-0 flex-1 items-center gap-2">
          <div className="relative min-w-0 flex-1 sm:max-w-md">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-app-muted" />
            <Input
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-9 pl-8 text-sm"
              aria-label={`Search ${vertical}`}
            />
          </div>
          <Button type="submit" size="sm" disabled={pending}>
            Search
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => setMobileFiltersOpen((open) => !open)}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">Filters</span>
            {activeCount > 0 && (
              <span className="rounded-full bg-accent/20 px-1.5 text-[10px] text-accent-soft">{activeCount}</span>
            )}
          </Button>
        </form>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <Label htmlFor="sort-offerings" className="text-xs text-app-muted">
            Sort
          </Label>
          <Select
            id="sort-offerings"
            value={filters.sort ?? "newest"}
            onChange={(e) => applyFilters({ sort: e.target.value as OfferingCatalogFilters["sort"] })}
            className="h-9 min-w-[9.5rem] text-sm"
          >
            {OFFERING_CATALOG_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-start">
        <aside
          className={cn(
            "w-full shrink-0 space-y-3 rounded-xl border border-app-border bg-app-surface/60 p-3 ring-1 ring-app-border",
            "lg:sticky lg:top-20 lg:w-52 lg:self-start lg:max-h-[calc(100dvh-5.5rem)] lg:overflow-y-auto",
            mobileFiltersOpen ? "block" : "hidden lg:block",
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-app-text">Filters</h2>
            {activeCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-[10px] font-medium text-accent-soft hover:text-accent"
              >
                Clear
              </button>
            )}
          </div>

          {vertical === "tours" && (
            <div>
              <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-app-muted">Type</h3>
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => applyFilters({ type: undefined })}
                  className={cn(
                    "block w-full rounded-md px-2 py-1.5 text-left text-xs transition-colors",
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
                      "block w-full rounded-md px-2 py-1.5 text-left text-xs capitalize transition-colors",
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
              <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-app-muted">Category</h3>
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => applyFilters({ category: undefined })}
                  className={cn(
                    "block w-full rounded-md px-2 py-1.5 text-left text-xs transition-colors",
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
                      "block w-full rounded-md px-2 py-1.5 text-left text-xs transition-colors",
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
            <h3 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-app-muted">Price (₹)</h3>
            <div className="grid grid-cols-2 gap-1.5">
              <Input
                id="min-price"
                type="number"
                min={0}
                inputMode="numeric"
                placeholder="Min"
                aria-label="Minimum price"
                className="h-8 text-xs"
                defaultValue={filters.min_price ?? ""}
                key={`min-${filters.min_price ?? ""}`}
                onBlur={(e) => {
                  const value = e.target.value.trim();
                  applyFilters({ min_price: value ? Number.parseFloat(value) : undefined });
                }}
              />
              <Input
                id="max-price"
                type="number"
                min={0}
                inputMode="numeric"
                placeholder="Max"
                aria-label="Maximum price"
                className="h-8 text-xs"
                defaultValue={filters.max_price ?? ""}
                key={`max-${filters.max_price ?? ""}`}
                onBlur={(e) => {
                  const value = e.target.value.trim();
                  applyFilters({ max_price: value ? Number.parseFloat(value) : undefined });
                }}
              />
            </div>
          </div>

          <FilterCheckbox
            id="featured-only"
            label="Featured only"
            checked={Boolean(filters.featured)}
            onCheckedChange={(checked) => applyFilters({ featured: checked || undefined })}
          />
        </aside>

        <div id="catalog-results" className={cn("min-w-0 flex-1 scroll-mt-24 space-y-3", pending && "opacity-60")}>
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-app-border bg-app-surface/40 px-3 py-2">
            <p className="text-xs text-app-muted">
              <span className="font-medium text-app-text">{resultLabel}</span>
              {filters.q && <span className="hidden sm:inline"> · matching search</span>}
            </p>
            <div className="flex items-center gap-2 lg:hidden">
              <Label htmlFor="sort-offerings-mobile" className="text-[10px] text-app-muted">
                Sort
              </Label>
              <Select
                id="sort-offerings-mobile"
                value={filters.sort ?? "newest"}
                onChange={(e) =>
                  applyFilters({ sort: e.target.value as OfferingCatalogFilters["sort"] })
                }
                className="h-8 min-w-[8.5rem] text-xs"
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

          <CatalogPagination
            currentPage={currentPage}
            lastPage={lastPage}
            total={total}
            perPage={filters.per_page ?? 12}
            disabled={pending}
            onPageChange={goToPage}
          />
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-app-muted">
        Looking for something else?{" "}
        <Link href="/" className="font-medium text-accent-soft hover:text-accent">
          Back to home
        </Link>
      </p>
    </PageContainer>
  );
}
