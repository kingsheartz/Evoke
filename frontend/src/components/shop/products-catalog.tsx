"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { OfferingCard, OfferingCardGrid } from "@/components/offerings/offering-card";
import { Button } from "@/components/ui/button";
import { CatalogPagination } from "@/components/ui/catalog-pagination";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { Paginated, ShopCategory } from "@/lib/api";
import type { Product } from "@/lib/api";
import { productToOffering } from "@/lib/offerings";
import {
  SHOP_CATALOG_SORT_OPTIONS,
  activeShopFilterCount,
  shopCatalogPath,
  type ShopCatalogFilters,
} from "@/lib/shop-catalog";
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
    <label htmlFor={id} className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-1.5 py-1.5 hover:bg-app-surface-muted/50">
      <span className="text-xs text-app-text">{label}</span>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </label>
  );
}

function CatalogFilters({
  filters,
  categories,
  onChange,
  onClear,
  className,
}: {
  filters: ShopCatalogFilters;
  categories: ShopCategory[];
  onChange: (patch: Partial<ShopCatalogFilters>) => void;
  onClear: () => void;
  className?: string;
}) {
  const activeCount = activeShopFilterCount(filters);

  return (
    <aside className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-app-text">Filters</h2>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-[10px] font-medium text-accent-soft hover:text-accent"
          >
            Clear
          </button>
        )}
      </div>

      <div>
        <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-app-muted">Category</h3>
        <div className="max-h-40 space-y-0.5 overflow-y-auto pr-0.5 lg:max-h-none lg:overflow-visible">
          <button
            type="button"
            onClick={() => onChange({ category: undefined })}
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
              onClick={() => onChange({ category: category.slug })}
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
              onChange({ min_price: value ? Number.parseFloat(value) : undefined });
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
              onChange({ max_price: value ? Number.parseFloat(value) : undefined });
            }}
          />
        </div>
      </div>

      <div>
        <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-app-muted">Availability</h3>
        <div className="space-y-0.5">
          <FilterCheckbox
            id="filter-in-stock"
            label="In stock only"
            checked={Boolean(filters.in_stock)}
            onCheckedChange={(checked) => onChange({ in_stock: checked || undefined })}
          />
          <FilterCheckbox
            id="filter-on-sale"
            label="On sale"
            checked={Boolean(filters.on_sale)}
            onCheckedChange={(checked) => onChange({ on_sale: checked || undefined })}
          />
          <FilterCheckbox
            id="filter-featured"
            label="Featured"
            checked={Boolean(filters.featured)}
            onCheckedChange={(checked) => onChange({ featured: checked || undefined })}
          />
        </div>
      </div>
    </aside>
  );
}

function ActiveFilterChips({
  filters,
  categories,
  onChange,
}: {
  filters: ShopCatalogFilters;
  categories: ShopCategory[];
  onChange: (patch: Partial<ShopCatalogFilters>) => void;
}) {
  const chips: { key: string; label: string; clear: Partial<ShopCatalogFilters> }[] = [];

  if (filters.q) chips.push({ key: "q", label: `“${filters.q}”`, clear: { q: undefined } });
  if (filters.category) {
    const name = categories.find((c) => c.slug === filters.category)?.name ?? filters.category;
    chips.push({ key: "category", label: name, clear: { category: undefined } });
  }
  if (filters.min_price != null && filters.min_price > 0) {
    chips.push({ key: "min", label: `Min ₹${filters.min_price}`, clear: { min_price: undefined } });
  }
  if (filters.max_price != null && filters.max_price > 0) {
    chips.push({ key: "max", label: `Max ₹${filters.max_price}`, clear: { max_price: undefined } });
  }
  if (filters.in_stock) chips.push({ key: "stock", label: "In stock", clear: { in_stock: undefined } });
  if (filters.on_sale) chips.push({ key: "sale", label: "On sale", clear: { on_sale: undefined } });
  if (filters.featured) chips.push({ key: "featured", label: "Featured", clear: { featured: undefined } });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => onChange(chip.clear)}
          className="inline-flex items-center gap-1 rounded-full border border-app-border bg-app-surface-muted/40 px-3 py-1 text-xs font-medium text-app-text transition-colors hover:border-accent/30 hover:text-accent-soft"
        >
          {chip.label}
          <X className="h-3 w-3" />
        </button>
      ))}
    </div>
  );
}

export function ShopProductsCatalog({
  filters,
  products,
  categories,
}: {
  filters: ShopCatalogFilters;
  products: Paginated<Product>;
  categories: ShopCategory[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState(filters.q ?? "");

  const items = products.data.map(productToOffering);
  const resultLabel =
    products.total === 0
      ? "No products found"
      : products.total === 1
        ? "1 product"
        : `${products.total.toLocaleString("en-IN")} products`;

  function navigate(next: ShopCatalogFilters) {
    startTransition(() => {
      router.push(shopCatalogPath(next));
    });
  }

  function goToPage(page: number) {
    navigate({ ...filters, page });
    document.getElementById("catalog-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function applyFilters(patch: Partial<ShopCatalogFilters>) {
    navigate({ ...filters, ...patch, page: 1 });
    setMobileFiltersOpen(false);
  }

  function clearFilters() {
    navigate({
      sort: filters.sort,
      per_page: filters.per_page,
      page: 1,
    });
    setSearchDraft("");
    setMobileFiltersOpen(false);
  }

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    applyFilters({ q: searchDraft.trim() || undefined });
  }

  return (
    <PageContainer className="py-5 md:py-7">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-soft">EOKE Sports</p>
        <h1 className="mt-0.5 font-display text-2xl font-semibold tracking-tight text-app-text sm:text-3xl">
          Shop products
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-app-muted">
          Browse equipment, apparel, and accessories. Search and filter by category, price, and availability.
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <form onSubmit={handleSearchSubmit} className="flex min-w-0 flex-1 items-center gap-2">
          <div className="relative min-w-0 flex-1 sm:max-w-md">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-app-muted" />
            <Input
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder="Search by name, description, or SKU…"
              className="h-9 pl-8 text-sm"
              aria-label="Search products"
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
            {activeShopFilterCount(filters) > 0 && (
              <span className="rounded-full bg-accent/20 px-1.5 text-[10px] text-accent-soft">
                {activeShopFilterCount(filters)}
              </span>
            )}
          </Button>
        </form>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <Label htmlFor="sort-products" className="text-xs text-app-muted">
            Sort
          </Label>
          <Select
            id="sort-products"
            value={filters.sort ?? "newest"}
            onChange={(e) => applyFilters({ sort: e.target.value as ShopCatalogFilters["sort"] })}
            className="h-9 min-w-[9.5rem] text-sm"
          >
            {SHOP_CATALOG_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <ActiveFilterChips filters={filters} categories={categories} onChange={applyFilters} />

      <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-start">
        <CatalogFilters
          filters={filters}
          categories={categories}
          onChange={applyFilters}
          onClear={clearFilters}
          className={cn(
            "w-full shrink-0 rounded-xl border border-app-border bg-app-surface/60 p-3 ring-1 ring-app-border",
            "lg:sticky lg:top-20 lg:w-52 lg:self-start lg:max-h-[calc(100dvh-5.5rem)] lg:overflow-y-auto",
            mobileFiltersOpen ? "block" : "hidden lg:block",
          )}
        />

        <div id="catalog-results" className={cn("min-w-0 flex-1 scroll-mt-24 space-y-3", pending && "opacity-60")}>
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-app-border bg-app-surface/40 px-3 py-2">
            <p className="text-xs text-app-muted">
              <span className="font-medium text-app-text">{resultLabel}</span>
              {filters.q && <span className="hidden sm:inline"> · matching search</span>}
            </p>
            <div className="flex items-center gap-2 lg:hidden">
              <Label htmlFor="sort-products-mobile" className="text-[10px] text-app-muted">
                Sort
              </Label>
              <Select
                id="sort-products-mobile"
                value={filters.sort ?? "newest"}
                onChange={(e) => applyFilters({ sort: e.target.value as ShopCatalogFilters["sort"] })}
                className="h-8 min-w-[8.5rem] text-xs"
              >
                {SHOP_CATALOG_SORT_OPTIONS.map((option) => (
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
              <p className="font-medium text-app-text">No products match your filters</p>
              <p className="mt-2 text-sm text-app-muted">Try clearing filters or using a broader search term.</p>
              <Button type="button" variant="outline" className="mt-6" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          )}

          <CatalogPagination
            currentPage={products.current_page}
            lastPage={products.last_page}
            total={products.total}
            perPage={filters.per_page ?? 12}
            disabled={pending}
            onPageChange={goToPage}
          />
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-app-muted">
        Need help choosing?{" "}
        <Link href="/shop" className="font-medium text-accent-soft hover:text-accent">
          Explore EOKE Sports
        </Link>
      </p>
    </PageContainer>
  );
}
