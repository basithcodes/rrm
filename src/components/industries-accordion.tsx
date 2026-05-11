"use client";

// =====================================================================
// Industries Accordion
// ---------------------------------------------------------------------
// Stacked native <details> accordion — one row per industry. When
// expanded, the row reveals the universal ProductDataGrid pre-filtered
// to products tagged with that industry.
// =====================================================================

import { ProductDataGrid } from "@/components/product-data-grid";
import type { Product } from "@/lib/site-data";

export function IndustriesAccordion({
  products,
  industries,
}: {
  products: Product[];
  industries: Array<{ name: string; productCount: number }>;
}) {
  return (
    <div className="border border-slate-200 bg-white">
      {industries.map((industry, index) => (
        <details
          key={industry.name}
          className="group border-b border-slate-200 last:border-b-0"
          open={index === 0}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 bg-slate-50 px-3 py-2 hover:bg-emerald-50">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500 transition group-open:text-emerald-700">
                ▸
              </span>
              <span className="text-[13px] font-bold tracking-tight text-slate-900">
                {industry.name}
              </span>
            </div>
            <span className="rounded-sm border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-700">
              {industry.productCount} products
            </span>
          </summary>
          <div className="border-t border-slate-200">
            <ProductDataGrid
              products={products}
              defaultFilter={{ industry: industry.name }}
              emptyMessage={`No products catalogued for ${industry.name}.`}
            />
          </div>
        </details>
      ))}
    </div>
  );
}
