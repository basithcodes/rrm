import type { Metadata } from "next";
import type { ReactElement } from "react";
import Link from "next/link";
import { MarketingLayout } from "@/components/marketing-layout";
import { HomeSearch, type HomeSearchEntry } from "@/components/home-search";
import { products } from "@/lib/site-data";

// =====================================================================
// Public Homepage — Industrial Engineering Surface
// ---------------------------------------------------------------------
//   * Pure white shell, no pastel halos, no rounded blobs.
//   * Slate-900 hero with a dominant centred SKU search bar.
//   * Trust strip — grayscale credentials, thin slate borders only.
//   * Dense category grid — 6 columns on desktop, sharp emerald hover.
// =====================================================================

export const metadata: Metadata = {
  title:
    "Precision Industrial Rubber & Sealing Solutions | RRM Industrial",
  description:
    "RRM Industrial supplies O-rings, extrusion profiles, mounts, gaskets, and custom sealing parts across the UAE, Saudi Arabia, Oman, and Qatar. ISO 9001 certified, FDA compliant materials, rapid GCC deployment.",
};

const trustBadges = [
  { label: "ISO 9001", detail: "Quality-managed production" },
  { label: "FDA Grade", detail: "Food-contact compounds available" },
  { label: "REACH / RoHS", detail: "EU re-export documentation" },
  { label: "GCC Dispatch", detail: "UAE · KSA · Oman · Qatar" },
];

// Tiny inline SVGs render as schematic-style category glyphs — cheap,
// crisp, and don't pull in an icon dependency.
const categoryGlyphs: Record<string, ReactElement> = {
  ring: (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="10" cy="10" r="7" />
      <circle cx="10" cy="10" r="3" />
    </svg>
  ),
  bar: (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="2" y="7" width="16" height="6" />
      <line x1="6" y1="7" x2="6" y2="13" />
      <line x1="14" y1="7" x2="14" y2="13" />
    </svg>
  ),
  joint: (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M2 10h4l2-3 4 6 2-3h4" />
    </svg>
  ),
  sheet: (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="4" width="14" height="12" />
      <line x1="3" y1="9" x2="17" y2="9" />
    </svg>
  ),
  mount: (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="6" y="4" width="8" height="6" />
      <line x1="4" y1="14" x2="16" y2="14" />
      <line x1="6" y1="10" x2="6" y2="14" />
      <line x1="14" y1="10" x2="14" y2="14" />
    </svg>
  ),
  seal: (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="4" width="14" height="12" />
      <rect x="6" y="7" width="8" height="6" />
    </svg>
  ),
};

function pickGlyph(category: string): ReactElement {
  const c = category.toLowerCase();
  if (c.includes("o-ring") || c.includes("seal") && c.includes("ring")) return categoryGlyphs.ring;
  if (c.includes("extrusion") || c.includes("profile")) return categoryGlyphs.bar;
  if (c.includes("joint") || c.includes("connector")) return categoryGlyphs.joint;
  if (c.includes("sheet") || c.includes("roll")) return categoryGlyphs.sheet;
  if (c.includes("mount") || c.includes("pad")) return categoryGlyphs.mount;
  return categoryGlyphs.seal;
}

export default function Home() {
  const searchEntries: HomeSearchEntry[] = products.map((product) => ({
    slug: product.slug,
    name: product.name,
    category: product.category,
    material: product.material,
    skus: product.variants.map((variant) => variant.code),
  }));
  const totalSkus = searchEntries.reduce((sum, entry) => sum + entry.skus.length, 0);

  // Group products by category for the dense routing grid.
  const categoryMap = new Map<
    string,
    { count: number; sample: { slug: string; name: string } | null }
  >();
  for (const product of products) {
    const entry = categoryMap.get(product.category) ?? { count: 0, sample: null };
    entry.count += 1;
    if (!entry.sample) entry.sample = { slug: product.slug, name: product.name };
    categoryMap.set(product.category, entry);
  }
  const categories = [...categoryMap.entries()]
    .map(([name, info]) => ({ name, ...info }))
    .sort((a, b) => b.count - a.count);

  return (
    <MarketingLayout>
      {/* ============================================================
          HERO — slate-900 authority block.
          ============================================================ */}
      <section className="border-b border-slate-200 bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-400">
              Industrial Sealing Supplier · GCC
            </p>
            <h1 className="mt-4 text-balance text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl">
              Precision Industrial Rubber &amp; Sealing Solutions.
            </h1>
            <p className="mt-4 text-pretty text-base leading-7 text-slate-300 md:text-lg">
              Engineered for the GCC. Direct routing, RFQ ordering, and material guidance.
            </p>

            {/* Dominant centred global search bar. */}
            <div className="mt-8">
              <HomeSearch entries={searchEntries} />
              <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-slate-400">
                {products.length} parent products · {totalSkus} indexed SKUs
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <Link
                href="/products"
                className="rounded-sm border border-slate-700 bg-slate-800 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white transition-colors hover:border-emerald-500"
              >
                Open PIM Catalog
              </Link>
              <Link
                href="/rfq"
                className="rounded-sm bg-emerald-600 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-emerald-500"
              >
                Request a Quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          TRUST STRIP — grayscale credentials, thin borders.
          ============================================================ */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-slate-200 border-x border-slate-200 sm:grid-cols-4">
          {trustBadges.map((badge) => (
            <div key={badge.label} className="flex flex-col items-center px-3 py-4 text-center">
              <span className="font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-slate-900">
                {badge.label}
              </span>
              <span className="mt-1 text-[11px] text-slate-500">{badge.detail}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================
          CATEGORY GRID — dense engineering routing surface.
          ============================================================ */}
      <section className="bg-slate-50 py-10">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-4 flex items-end justify-between gap-3 border-b border-slate-200 pb-2">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700">
                Catalog Routing
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
                Jump straight to the right product family
              </h2>
            </div>
            <Link
              href="/products"
              className="font-mono text-[11px] font-bold uppercase tracking-wider text-emerald-700 hover:underline"
            >
              All categories →
            </Link>
          </div>

          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => (
              <li key={category.name}>
                <Link
                  href={
                    category.sample ? `/products/${category.sample.slug}` : "/products"
                  }
                  className="group flex h-full flex-col gap-2 rounded-md border border-slate-200 bg-white p-3 text-slate-900 transition-colors hover:border-emerald-600 hover:bg-emerald-50"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 group-hover:text-emerald-700">
                      {pickGlyph(category.name)}
                    </span>
                    <span className="rounded-sm border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-700">
                      {category.count}
                    </span>
                  </div>
                  <p className="text-[13px] font-bold leading-tight tracking-tight text-slate-900">
                    {category.name}
                  </p>
                  {category.sample && (
                    <p className="mt-auto truncate font-mono text-[10px] uppercase tracking-wider text-slate-500">
                      {category.sample.name}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============================================================
          QUICK STATS STRIP — single dense readout. No bento boxes.
          ============================================================ */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-slate-200 border-x border-slate-200 sm:grid-cols-4">
          {[
            { label: "Parent products", value: String(products.length) },
            { label: "Indexed SKUs", value: String(totalSkus) },
            { label: "Categories", value: String(categories.length) },
            { label: "GCC markets", value: "4" },
          ].map((row) => (
            <div key={row.label} className="px-3 py-4">
              <p className="font-mono text-[24px] font-bold leading-none tracking-tight text-slate-900">
                {row.value}
              </p>
              <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {row.label}
              </p>
            </div>
          ))}
        </div>
      </section>
    </MarketingLayout>
  );
}
