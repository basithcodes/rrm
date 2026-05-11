"use client";

// =====================================================================
// Materials Tabs
// ---------------------------------------------------------------------
// Industrial tab strip — one tab per material in the catalog. Active
// tab renders the universal ProductDataGrid pre-filtered to that
// material. No descriptive prose, no marketing cards.
// =====================================================================

import { useState } from "react";
import { ProductDataGrid } from "@/components/product-data-grid";
import type { Product } from "@/lib/site-data";

export function MaterialsTabs({
  products,
  materials,
}: {
  products: Product[];
  materials: Array<{ name: string; productCount: number }>;
}) {
  const [active, setActive] = useState<string>(materials[0]?.name ?? "");

  return (
    <div className="space-y-2">
      <div className="border-b border-slate-200">
        <ul className="flex flex-wrap gap-px bg-slate-200">
          {materials.map((m) => {
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
                    className={`rounded-sm border px-1 py-0 text-[10px] ${
                      selected
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    {m.productCount}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <ProductDataGrid
        products={products}
        defaultFilter={{ material: active }}
        emptyMessage={`No products catalogued for ${active}.`}
      />
    </div>
  );
}
