"use client";

// =====================================================================
// Universal Product Data Grid
// ---------------------------------------------------------------------
// Embeddable, dense product table — designed to drop into materials /
// industries / markets pages with a pre-filtered product list. Reuses
// the same row schema as the full-screen PIM catalog (SKU, dimensions,
// hardness, temp, pressure, price, add-to-quote) but renders without
// the catalog's sidebar so it can sit underneath a tab/accordion.
//
// Filtering contract:
//   <ProductDataGrid
//      products={allProducts}
//      defaultFilter={{ material: "EPDM" }}
//      defaultFilter={{ application: "Building systems" }}
//   />
// Filters are applied once on mount; the grid still exposes a free-text
// search box for further narrowing within the filtered scope.
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
const CURRENCIES = ["AED", "USD", "SAR", "OMR", "QAR"] as const;
type Currency = (typeof CURRENCIES)[number];

const PAGE_SIZE_OPTIONS = [25, 50, 100] as const;
type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

export type ProductGridFilter = {
  material?: string;
  category?: string;
  application?: string;
  industry?: string;
};

function formatPrice(usd: number, currency: Currency) {
  if (!Number.isFinite(usd) || usd <= 0) return "—";
  const v = usd * (USD_RATES[currency] ?? 1);
  return `${currency} ${v.toFixed(currency === "OMR" ? 3 : 2)}`;
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

function applyFilter(products: Product[], filter?: ProductGridFilter) {
  if (!filter) return products;
  return products.filter((p) => {
    if (filter.material && p.material !== filter.material) return false;
    if (filter.category && p.category !== filter.category) return false;
    if (filter.application && !p.applications.some((a) => a === filter.application)) {
      return false;
    }
    if (filter.industry && !p.industries.some((i) => i === filter.industry)) {
      return false;
    }
    return true;
  });
}

export function ProductDataGrid({
  products,
  defaultFilter,
  emptyMessage = "No products match this filter.",
}: {
  products: Product[];
  defaultFilter?: ProductGridFilter;
  emptyMessage?: string;
}) {
  const scoped = useMemo(() => applyFilter(products, defaultFilter), [products, defaultFilter]);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [currency, setCurrency] = useState<Currency>("AED");
  const [pageSize, setPageSize] = useState<PageSize>(25);
  const [page, setPage] = useState(1);
  const cart = useQuoteCart();

  const filtered = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return scoped;
    return scoped.filter((p) => {
      const hay = [
        p.name,
        p.category,
        p.material,
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
  }, [scoped, deferredSearch]);

  // Pagination — the clamp on `currentPage` keeps the cursor inside the
  // valid window when the user narrows the filter or shrinks page size.
  const totalCount = filtered.length;
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, pageCount);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCount);
  const pageRows = filtered.slice(startIndex, endIndex);

  return (
    <div className="border border-slate-200 bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Filter SKU / dimension / application…"
          className="h-7 flex-1 min-w-48 rounded-sm border border-slate-300 bg-white px-2 text-[12px] focus:border-emerald-600 focus:outline-none"
        />
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value as Currency)}
          className="h-7 rounded-sm border border-slate-300 bg-white px-1 font-mono text-[11px] font-bold"
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <span className="font-mono text-[11px] text-slate-500">
          {filtered.length} of {scoped.length}
        </span>
        {cart.count > 0 && (
          <Link
            href="/quote"
            className="rounded-sm bg-emerald-700 px-2 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-white hover:bg-emerald-800"
          >
            Quote ({cart.count}) →
          </Link>
        )}
      </div>

      {/* Table */}
      <div className="overflow-auto">
        <table className="w-full border-collapse text-[12px]">
          <thead className="sticky top-0 z-10 bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-900">
            <tr>
              <th className="border-b border-slate-200 p-1 text-left">SKU</th>
              <th className="border-b border-slate-200 p-1 text-left">Name</th>
              <th className="border-b border-slate-200 p-1 text-left">Material</th>
              <th className="border-b border-slate-200 p-1 text-left">Hardness</th>
              <th className="border-b border-slate-200 p-1 text-left">Temp</th>
              <th className="border-b border-slate-200 p-1 text-left">Pressure</th>
              <th className="border-b border-slate-200 p-1 text-left">Dimensions</th>
              <th className="border-b border-slate-200 p-1 text-right">Variants</th>
              <th className="border-b border-slate-200 p-1 text-right">Price</th>
              <th className="border-b border-slate-200 p-1 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={10} className="p-3 text-center text-[12px] text-slate-500">
                  {emptyMessage}
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
                  className="border-b border-slate-100 odd:bg-white even:bg-slate-50 hover:bg-emerald-50"
                >
                  <td className="p-1 font-mono font-bold">{sku}</td>
                  <td className="p-1">
                    <Link
                      href={`/products/${p.slug}`}
                      className="font-semibold text-emerald-800 underline-offset-2 hover:underline"
                    >
                      {p.name}
                    </Link>
                    <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                      {p.category}
                    </div>
                  </td>
                  <td className="p-1 font-mono">{p.material}</td>
                  <td className="p-1 font-mono">{pickKeySpec(p, ["hardness", "shore", "durometer"])}</td>
                  <td className="p-1 font-mono">{pickKeySpec(p, ["temp"])}</td>
                  <td className="p-1 font-mono">{pickKeySpec(p, ["pressure"])}</td>
                  <td className="p-1 font-mono text-slate-600">{dimensionSummary(p)}</td>
                  <td className="p-1 text-right">
                    <Link
                      href={`/products/${p.slug}`}
                      className="font-mono text-[11px] font-bold text-emerald-700 hover:underline"
                    >
                      {p.variants.length} →
                    </Link>
                  </td>
                  <td className="p-1 text-right font-mono font-bold">
                    {minUsd > 0 ? `from ${formatPrice(minUsd, currency)}` : "—"}
                  </td>
                  <td className="p-1">
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
                          ? "rounded-sm border border-emerald-700 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-700"
                          : "rounded-sm bg-emerald-700 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white hover:bg-emerald-800"
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

      {/* Pagination footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 bg-white">
        <div className="flex items-center gap-2">
          <label className="font-mono text-xs text-slate-500 uppercase tracking-wider">
            Rows per page:
          </label>
          <select
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
        <p className="font-mono text-xs text-slate-700 uppercase tracking-wider">
          {totalCount === 0
            ? "No products match"
            : `Showing ${startIndex + 1} – ${endIndex} of ${totalCount} products`}
        </p>
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
    </div>
  );
}
