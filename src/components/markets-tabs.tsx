"use client";

// =====================================================================
// Markets Tabs
// ---------------------------------------------------------------------
// Tab strip — one tab per GCC market. Switching tabs re-renders the
// universal data grid keyed on the market currency so every price in
// the table converts on switch (the grid's own currency selector then
// lets the buyer override per-row).
// =====================================================================

import { useState } from "react";
import { ProductDataGrid } from "@/components/product-data-grid";
import type { Product } from "@/lib/site-data";

export function MarketsTabs({
  products,
  markets,
}: {
  products: Product[];
  markets: Array<{ name: string; currency: string }>;
}) {
  const [active, setActive] = useState(markets[0]?.name ?? "");
  const market = markets.find((m) => m.name === active) ?? markets[0];

  return (
    <div className="space-y-2">
      <div className="border-b border-slate-200">
        <ul className="flex flex-wrap gap-px bg-slate-200">
          {markets.map((m) => {
            const selected = m.name === active;
            return (
              <li key={m.name}>
                <button
                  type="button"
                  onClick={() => setActive(m.name)}
                  className={`flex items-center gap-2 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider transition-colors ${
                    selected
                      ? "bg-white text-emerald-700"
                      : "bg-slate-50 text-slate-700 hover:bg-white hover:text-emerald-700"
                  }`}
                >
                  <span>{m.name}</span>
                  <span
                    className={`rounded-sm border px-1 text-[10px] ${
                      selected
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    {m.currency}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* `key` forces the grid to re-mount with a fresh currency default
          when the operator switches markets. */}
      <ProductDataGrid
        key={market?.currency}
        products={products}
        emptyMessage={`No products catalogued for ${market?.name ?? "this market"}.`}
      />
    </div>
  );
}
