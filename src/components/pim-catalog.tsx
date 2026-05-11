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
    <div className="flex h-screen w-full bg-[#F7FAFC] text-[#1A202C]">
      {/* ---------------- Left sidebar: accordion facets ---------------- */}
      <aside className="flex h-full w-72 shrink-0 flex-col border-r border-[#CBD5E0] bg-white">
        <div className="flex items-center justify-between border-b border-[#CBD5E0] px-4 py-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1A202C]">
            Filters
          </span>
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-bold uppercase tracking-wide text-[#2F855A] hover:underline"
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
        <div className="flex items-center gap-3 border-b border-[#CBD5E0] bg-white px-4 py-3">
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by Part #, Material, ID/OD, application…"
            className="h-9 flex-1 rounded border border-[#CBD5E0] px-3 text-sm placeholder-[#4A5568] focus:border-[#2F855A] focus:outline-none focus:ring-1 focus:ring-[#2F855A]"
          />
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="h-9 rounded border border-[#CBD5E0] bg-white px-2 text-sm font-bold"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <span className="text-xs font-semibold text-[#4A5568]">
            {filtered.length} of {products.length}
          </span>
          {cart.count > 0 && (
            <Link
              href="/quote"
              className="rounded bg-[#2F855A] px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white hover:bg-[#276749]"
            >
              Quote ({cart.count}) →
            </Link>
          )}
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-[#EDF2F7] text-[11px] font-bold uppercase tracking-wide text-[#1A202C]">
              <tr>
                <th className="border-b border-[#CBD5E0] p-2 text-left">SKU</th>
                <th className="border-b border-[#CBD5E0] p-2 text-left">Thumb</th>
                <th className="border-b border-[#CBD5E0] p-2 text-left">Name</th>
                <th className="border-b border-[#CBD5E0] p-2 text-left">Material</th>
                <th className="border-b border-[#CBD5E0] p-2 text-left">Hardness</th>
                <th className="border-b border-[#CBD5E0] p-2 text-left">Temp Range</th>
                <th className="border-b border-[#CBD5E0] p-2 text-left">Pressure</th>
                <th className="border-b border-[#CBD5E0] p-2 text-left">Dimensions</th>
                <th className="border-b border-[#CBD5E0] p-2 text-left">Variants</th>
                <th className="border-b border-[#CBD5E0] p-2 text-right">Price</th>
                <th className="border-b border-[#CBD5E0] p-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={11} className="p-6 text-center text-sm text-[#4A5568]">
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
                    className="border-b border-[#CBD5E0] odd:bg-white even:bg-[#F7FAFC] hover:bg-[#EDF2F7]"
                  >
                    <td className="p-2 font-bold">{sku}</td>
                    <td className="p-2">
                      <Link
                        href={`/products/${p.slug}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#CBD5E0] bg-[#EDF2F7] text-[#1A202C]"
                        title="View 3D"
                        aria-label={`View 3D model for ${p.name}`}
                      >
                        ▣
                      </Link>
                    </td>
                    <td className="p-2">
                      <Link
                        href={`/products/${p.slug}`}
                        className="font-semibold text-[#276749] underline-offset-2 hover:underline"
                      >
                        {p.name}
                      </Link>
                      <div className="text-xs text-[#4A5568]">{p.category}</div>
                    </td>
                    <td className="p-2">{p.material}</td>
                    <td className="p-2">{pickKeySpec(p, ["hardness", "shore", "durometer"])}</td>
                    <td className="p-2">{pickKeySpec(p, ["temp"])}</td>
                    <td className="p-2">{pickKeySpec(p, ["pressure"])}</td>
                    <td className="p-2 text-[#4A5568]">{dimensionSummary(p)}</td>
                    <td className="p-2">
                      <Link
                        href={`/products/${p.slug}`}
                        className="font-semibold text-[#276749] underline-offset-2 hover:underline"
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
                                basePriceUsd: firstVariant?.priceBook?.USD ?? null,
                              })
                        }
                        className={
                          inQuote
                            ? "rounded border border-[#2F855A] px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-[#2F855A]"
                            : "rounded bg-[#2F855A] px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white hover:bg-[#276749]"
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
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-white">
          {/* Left — row density */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="pim-page-size"
              className="font-mono text-xs text-slate-500 uppercase tracking-wider"
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
              className="border border-slate-200 rounded-sm text-xs font-mono px-2 py-1 bg-white text-slate-700"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          {/* Center — data state */}
          <p className="font-mono text-xs text-slate-700 uppercase tracking-wider">
            {totalCount === 0
              ? "No products match"
              : `Showing ${startIndex + 1} – ${endIndex} of ${totalCount} products`}
          </p>

          {/* Right — nav */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-slate-500 uppercase tracking-wider">
              Page {currentPage} / {pageCount}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="px-3 py-1 text-xs font-mono uppercase tracking-wider border border-slate-200 rounded-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Prev
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={currentPage >= pageCount}
              className="px-3 py-1 text-xs font-mono uppercase tracking-wider border border-slate-200 rounded-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
      className="group border-b border-[#CBD5E0] open:bg-white"
    >
      <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-wide text-[#1A202C] hover:bg-[#F7FAFC]">
        <span>
          {title} <span className="ml-1 font-normal text-[#4A5568]">({count})</span>
        </span>
        <span className="text-[#4A5568] transition-transform group-open:rotate-90">›</span>
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
    <label className="flex cursor-pointer items-center gap-2 py-1 text-sm hover:text-[#1A202C]">
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="h-3.5 w-3.5 accent-[#2F855A]"
      />
      <span className={checked ? "font-semibold text-[#1A202C]" : "text-[#4A5568]"}>{label}</span>
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
    <label className="flex cursor-pointer items-center gap-2 py-1 text-sm hover:text-[#1A202C]">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-3.5 w-3.5 accent-[#2F855A]"
      />
      <span className={checked ? "font-semibold text-[#1A202C]" : "text-[#4A5568]"}>{label}</span>
    </label>
  );
}
