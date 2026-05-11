"use client";

// =====================================================================
// Global Hero Search
// ---------------------------------------------------------------------
// Wide instant SKU/product lookup placed at the centre of the homepage
// hero. Filters across product name, slug, category, material, and every
// known variant SKU. Results dropdown links straight to the parametric
// product detail page.
// =====================================================================

import Link from "next/link";
import { useMemo, useState } from "react";

export type HomeSearchEntry = {
  slug: string;
  name: string;
  category: string;
  material: string;
  skus: string[];
};

export function HomeSearch({ entries }: { entries: HomeSearchEntry[] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return entries
      .filter((entry) => {
        const hay = [
          entry.name,
          entry.slug,
          entry.category,
          entry.material,
          ...entry.skus,
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 8);
  }, [entries, query]);

  return (
    <div className="relative w-full">
      <div className="flex w-full items-stretch overflow-hidden rounded border border-white/15 bg-white shadow-[0_10px_40px_-20px_rgba(0,0,0,0.6)]">
        <span
          aria-hidden
          className="flex items-center px-4 text-[#4A5568]"
        >
          ⌕
        </span>
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            // Delay so click on dropdown link still fires.
            window.setTimeout(() => setOpen(false), 120);
          }}
          placeholder="Search by SKU, product, material, or category — e.g. NBR-220, EPDM door seal"
          className="h-14 w-full bg-transparent text-base text-[#1A202C] placeholder:text-[#718096] focus:outline-none"
          autoComplete="off"
          spellCheck={false}
        />
        <Link
          href="/products"
          className="hidden items-center bg-[#2F855A] px-6 text-sm font-bold uppercase tracking-wider text-white hover:bg-[#276749] sm:inline-flex"
        >
          Browse catalog
        </Link>
      </div>

      {open && query.trim() && (
        <div className="absolute left-0 right-0 z-50 mt-1 max-h-96 overflow-auto border border-[#CBD5E0] bg-white text-[#1A202C] shadow-lg">
          {matches.length === 0 ? (
            <p className="p-3 text-sm text-[#4A5568]">
              No products match &ldquo;{query}&rdquo;. Try a SKU prefix or material code.
            </p>
          ) : (
            <ul>
              {matches.map((entry) => (
                <li key={entry.slug} className="border-b border-[#EDF2F7] last:border-b-0">
                  <Link
                    href={`/products/${entry.slug}`}
                    className="flex items-center justify-between gap-3 px-3 py-2 hover:bg-[#EDF2F7]"
                  >
                    <div>
                      <p className="text-sm font-bold">{entry.name}</p>
                      <p className="text-[11px] uppercase tracking-wider text-[#4A5568]">
                        {entry.category} · {entry.material}
                      </p>
                    </div>
                    <span className="font-mono text-[11px] text-[#4A5568]">
                      {entry.skus.slice(0, 3).join(" · ")}
                      {entry.skus.length > 3 ? " …" : ""}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
