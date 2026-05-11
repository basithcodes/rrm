"use client";

// Industrial PIM Data Grid
// =====================================================================
// Full-screen layout: fixed left sidebar with collapsible accordion
// filters, main pane is a high-density native HTML <table>.
// No cards, no gradients, no shadows — borders + tight padding only.
// =====================================================================

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { useQuoteCart } from "@/lib/quote-cart";
import type { Product } from "@/lib/site-data";

const USD_RATES: Record<string, number> = {
  USD: 1,
  AED: 3.6725,
  SAR: 3.75,
  OMR: 0.3845,
  QAR: 3.64,
};
const CURRENCIES = ["USD", "AED", "SAR", "OMR", "QAR"] as const;
type Currency = (typeof CURRENCIES)[number];

function formatPrice(usd: number, currency: Currency) {
  if (usd <= 0) return "—";
  const converted = usd * (USD_RATES[currency] ?? 1);
  const decimals = currency === "OMR" ? 3 : 2;
  return `${currency} ${converted.toFixed(decimals)}`;
}

function pickKeySpec(product: Product, needles: string[]): string {
  for (const variant of product.variants) {
    for (const dim of variant.dimensions) {
      const k = dim.label.toLowerCase();
      if (needles.some((n) => k.includes(n))) return dim.value;
    }
  }
  return "—";
}

function pickMinUsd(product: Product): number {
  let min = Infinity;
  for (const v of product.variants) {
    const usd = v.priceBook?.USD;
    if (typeof usd === "number" && usd > 0 && usd < min) min = usd;
  }
  return min === Infinity ? 0 : min;
}

function dimensionSummary(product: Product): string {
  const variant = product.variants[0];
  if (!variant) return "—";
  return variant.dimensions
    .slice(0, 2)
    .map((d) => `${d.label} ${d.value}`)
    .join(" · ");
}

const PAGE_SIZE_OPTIONS = [25, 50, 100] as const;
type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

export function PimCatalog({ products }: { products: Product[] }) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMaterials, setSelectedMaterials] = useState<Set<string>>(new Set());
  const [selectedApplications, setSelectedApplications] = useState<Set<string>>(new Set());
  const [currency, setCurrency] = useState<Currency>("USD");
  const [pageSize, setPageSize] = useState<PageSize>(25);
  const [page, setPage] = useState(1);
  const cart = useQuoteCart();

  const facets = useMemo(() => {
    const categories = new Set<string>();
    const materials = new Set<string>();
    const applications = new Set<string>();
    for (const p of products) {
      categories.add(p.category);
      materials.add(p.material);
      for (const a of p.applications) applications.add(a);
    }
    return {
      categories: [...categories].sort(),
      materials: [...materials].sort(),
      applications: [...applications].sort(),
    };
  }, [products]);

  const filtered = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    return products.filter((p) => {
      if (selectedCategory && p.category !== selectedCategory) return false;
      if (selectedMaterials.size > 0 && !selectedMaterials.has(p.material)) return false;
      if (
        selectedApplications.size > 0 &&
        !p.applications.some((a) => selectedApplications.has(a))
      ) {
        return false;
      }
      if (!q) return true;
      const hay = [
        p.name,
        p.category,
        p.material,
        p.summary,
        ...p.applications,
        ...p.industries,
        ...p.variants.flatMap((v) => [
          v.code,
          v.description,
          ...v.dimensions.map((d) => `${d.label} ${d.value}`),
        ]),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [products, deferredSearch, selectedCategory, selectedMaterials, selectedApplications]);

  function toggleSet<T>(setter: (s: Set<T>) => void, current: Set<T>, value: T) {
    const next = new Set(current);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
  }

  function clearFilters() {
    setSearch("");
    setSelectedCategory(null);
    setSelectedMaterials(new Set());
    setSelectedApplications(new Set());
    setPage(1);
  }

  // Pagination — slice the filtered set. Any filter/search change resets
  // the cursor to page 1 via the `currentPage` clamp below so the user
  // never lands on an empty page after narrowing the result set.
  const totalCount = filtered.length;
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, pageCount);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCount);
  const pageRows = filtered.slice(startIndex, endIndex);

  return (
    <div className="flex h-screen w-full bg-[var(--color-surface)] text-[var(--color-fg)]">
      {/* ---------------- Left sidebar: accordion facets ---------------- */}
      <aside className="flex h-full w-72 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-bg)]">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg)]">
            Filters
          </span>
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-bold uppercase tracking-wide text-[var(--color-accent)] hover:underline"
          >
            Clear
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <FacetAccordion title="Category" count={facets.categories.length} defaultOpen>
            <ul className="space-y-1">
              <li>
                <FacetRadio
                  label="All categories"
                  checked={selectedCategory === null}
                  onChange={() => setSelectedCategory(null)}
                />
              </li>
              {facets.categories.map((c) => (
                <li key={c}>
                  <FacetRadio
                    label={c}
                    checked={selectedCategory === c}
                    onChange={() => setSelectedCategory(c)}
                  />
                </li>
              ))}
            </ul>
          </FacetAccordion>

          <FacetAccordion title="Material" count={facets.materials.length}>
            <ul className="space-y-1">
              {facets.materials.map((m) => (
                <li key={m}>
                  <FacetCheckbox
                    label={m}
                    checked={selectedMaterials.has(m)}
                    onChange={() => toggleSet(setSelectedMaterials, selectedMaterials, m)}
                  />
                </li>
              ))}
            </ul>
          </FacetAccordion>

          <FacetAccordion title="Application" count={facets.applications.length}>
            <ul className="space-y-1">
              {facets.applications.map((a) => (
                <li key={a}>
                  <FacetCheckbox
                    label={a}
                    checked={selectedApplications.has(a)}
                    onChange={() => toggleSet(setSelectedApplications, selectedApplications, a)}
                  />
                </li>
              ))}
            </ul>
          </FacetAccordion>
        </div>
      </aside>

      {/* ---------------- Main: dense data grid ---------------- */}
      <main className="flex h-full flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3">
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by Part #, Material, ID/OD, application…"
            className="h-9 flex-1 rounded border border-[var(--color-border)] px-3 text-sm placeholder-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="h-9 rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 text-sm font-bold"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <span className="text-xs font-semibold text-[var(--color-text-muted)]">
            {filtered.length} of {products.length}
          </span>
          {cart.count > 0 && (
            <Link
              href="/quote"
              className="rounded bg-[var(--color-accent)] px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white hover:bg-[var(--color-accent-deep)]"
            >
              Quote ({cart.count}) →
            </Link>
          )}
        </div>

        <div className="flex-1 min-h-0 overflow-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-[var(--color-surface)] text-[11px] font-bold uppercase tracking-wide text-[var(--color-fg)]">
              <tr>
                <th className="border-b border-[var(--color-border)] p-2 text-left">SKU</th>
                <th className="border-b border-[var(--color-border)] p-2 text-left">Thumb</th>
                <th className="border-b border-[var(--color-border)] p-2 text-left">Name</th>
                <th className="border-b border-[var(--color-border)] p-2 text-left">Material</th>
                <th className="border-b border-[var(--color-border)] p-2 text-left">Hardness</th>
                <th className="border-b border-[var(--color-border)] p-2 text-left">Temp Range</th>
                <th className="border-b border-[var(--color-border)] p-2 text-left">Pressure</th>
                <th className="border-b border-[var(--color-border)] p-2 text-left">Dimensions</th>
                <th className="border-b border-[var(--color-border)] p-2 text-left">Variants</th>
                <th className="border-b border-[var(--color-border)] p-2 text-right">Price</th>
                <th className="border-b border-[var(--color-border)] p-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={11} className="p-6 text-center text-sm text-[var(--color-text-muted)]">
                    No products match the current filters.
                  </td>
                </tr>
              )}
              {pageRows.map((p) => {
                const firstVariant = p.variants[0];
                const sku = firstVariant?.code ?? p.slug.toUpperCase();
                const inQuote = cart.has(sku);
                const minUsd = pickMinUsd(p);
                return (
                  <tr
                    key={p.slug}
                    className="border-b border-[var(--color-border)] odd:bg-[var(--color-bg)] even:bg-[var(--color-surface)] hover:bg-[var(--color-surface)]"
                  >
                    <td className="p-2 font-bold">{sku}</td>
                    <td className="p-2">
                      <Link
                        href={`/products/${p.slug}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg)]"
                        title="View 3D"
                        aria-label={`View 3D model for ${p.name}`}
                      >
                        ▣
                      </Link>
                    </td>
                    <td className="p-2">
                      <Link
                        href={`/products/${p.slug}`}
                        className="font-semibold text-[var(--color-accent-deep)] underline-offset-2 hover:underline"
                      >
                        {p.name}
                      </Link>
                      <div className="text-xs text-[var(--color-text-muted)]">{p.category}</div>
                    </td>
                    <td className="p-2">{p.material}</td>
                    <td className="p-2">{pickKeySpec(p, ["hardness", "shore", "durometer"])}</td>
                    <td className="p-2">{pickKeySpec(p, ["temp"])}</td>
                    <td className="p-2">{pickKeySpec(p, ["pressure"])}</td>
                    <td className="p-2 text-[var(--color-text-muted)]">{dimensionSummary(p)}</td>
                    <td className="p-2">
                      <Link
                        href={`/products/${p.slug}`}
                        className="font-semibold text-[var(--color-accent-deep)] underline-offset-2 hover:underline"
                      >
                        See Variants [{p.variants.length}]
                      </Link>
                    </td>
                    <td className="p-2 text-right font-bold">
                      {minUsd > 0 ? `from ${formatPrice(minUsd, currency)}` : "—"}
                    </td>
                    <td className="p-2">
                      <button
                        type="button"
                        onClick={() =>
                          inQuote
                            ? cart.remove(sku)
                            : cart.add({
                                variantId: firstVariant?.code ?? p.slug,
                                sku,
                                name: p.name,
                                material: p.material,
                                basePriceUsd: firstVariant?.priceBook?.USD ?? null,
                              })
                        }
                        className={
                          inQuote
                            ? "rounded border border-[var(--color-accent)] px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-[var(--color-accent)]"
                            : "rounded bg-[var(--color-accent)] px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white hover:bg-[var(--color-accent-deep)]"
                        }
                      >
                        {inQuote ? "✓ In Quote" : "Add to Quote"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ---------------- Pagination footer ---------------- */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--color-border)] bg-[var(--color-bg)]">
          {/* Left — row density */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="pim-page-size"
              className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-wider"
            >
              Rows per page:
            </label>
            <select
              id="pim-page-size"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value) as PageSize);
                setPage(1);
              }}
              className="border border-[var(--color-border)] rounded-sm text-xs font-mono px-2 py-1 bg-[var(--color-bg)] text-[var(--color-fg)]"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          {/* Center — data state */}
          <p className="font-mono text-xs text-[var(--color-fg)] uppercase tracking-wider">
            {totalCount === 0
              ? "No products match"
              : `Showing ${startIndex + 1} – ${endIndex} of ${totalCount} products`}
          </p>

          {/* Right — nav */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
              Page {currentPage} / {pageCount}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="px-3 py-1 text-xs font-mono uppercase tracking-wider border border-[var(--color-border)] rounded-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-fg)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Prev
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={currentPage >= pageCount}
              className="px-3 py-1 text-xs font-mono uppercase tracking-wider border border-[var(--color-border)] rounded-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-fg)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function FacetAccordion({
  title,
  count,
  defaultOpen,
  children,
}: {
  title: string;
  count: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="group border-b border-[var(--color-border)] open:bg-[var(--color-bg)]"
    >
      <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-wide text-[var(--color-fg)] hover:bg-[var(--color-surface)]">
        <span>
          {title} <span className="ml-1 font-normal text-[var(--color-text-muted)]">({count})</span>
        </span>
        <span className="text-[var(--color-text-muted)] transition-transform group-open:rotate-90">›</span>
      </summary>
      <div className="px-4 pb-3 pt-1">{children}</div>
    </details>
  );
}

function FacetRadio({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 py-1 text-sm hover:text-[var(--color-fg)]">
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="h-3.5 w-3.5 accent-[var(--color-accent)]"
      />
      <span className={checked ? "font-semibold text-[var(--color-fg)]" : "text-[var(--color-text-muted)]"}>{label}</span>
    </label>
  );
}

function FacetCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 py-1 text-sm hover:text-[var(--color-fg)]">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-3.5 w-3.5 accent-[var(--color-accent)]"
      />
      <span className={checked ? "font-semibold text-[var(--color-fg)]" : "text-[var(--color-text-muted)]"}>{label}</span>
    </label>
  );
}
