import type { Metadata } from "next";
import Link from "next/link";
import { MarketingLayout } from "@/components/marketing-layout";
import { HomeSearch, type HomeSearchEntry } from "@/components/home-search";
import { products } from "@/lib/site-data";

// =====================================================================
// Public Homepage — GCC Authority Surface
// ---------------------------------------------------------------------
//   * Dark slate hero with dominant global SKU search.
//   * Trust banner (ISO / FDA / GCC deployment).
//   * Fast category routing grid built from the live catalog.
// =====================================================================

export const metadata: Metadata = {
  title:
    "Precision Industrial Rubber & Sealing Solutions for the GCC | RRM Industrial",
  description:
    "RRM Industrial supplies O-rings, extrusion profiles, mounts, gaskets, and custom sealing solutions across the UAE, Saudi Arabia, Oman, and Qatar. ISO 9001 certified, FDA compliant materials, rapid GCC deployment.",
};

const trustBadges = [
  {
    label: "ISO 9001 Certified",
    detail: "Quality-managed production for industrial buyers.",
  },
  {
    label: "FDA Compliant Materials",
    detail: "Food-grade EPDM, silicone, and NBR available on request.",
  },
  {
    label: "Rapid GCC Deployment",
    detail: "UAE, KSA, Oman, and Qatar dispatch within standard lead time.",
  },
  {
    label: "REACH / RoHS Ready",
    detail: "Compounds documented for EU re-export programmes.",
  },
];

export default function Home() {
  // Build a slim search index — the client component only needs slug/name
  // metadata + the list of variant SKUs for instant lookup.
  const searchEntries: HomeSearchEntry[] = products.map((product) => ({
    slug: product.slug,
    name: product.name,
    category: product.category,
    material: product.material,
    skus: product.variants.map((variant) => variant.code),
  }));

  // Group products by category to populate the fast-navigation grid.
  const categoryMap = new Map<
    string,
    { count: number; sample: { slug: string; name: string } | null }
  >();
  for (const product of products) {
    const entry = categoryMap.get(product.category) ?? {
      count: 0,
      sample: null,
    };
    entry.count += 1;
    if (!entry.sample) {
      entry.sample = { slug: product.slug, name: product.name };
    }
    categoryMap.set(product.category, entry);
  }
  const categories = [...categoryMap.entries()]
    .map(([name, info]) => ({ name, ...info }))
    .sort((a, b) => b.count - a.count);

  return (
    <MarketingLayout>
      {/* ============================================================
          HERO — dark slate/navy authority surface.
          ============================================================ */}
      <section className="relative isolate overflow-hidden bg-[#0B1120] text-white">
        {/* Subtle blueprint grid backdrop — keeps the surface industrial
            without competing with the search bar. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.16) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 right-1/4 h-96 w-96 rounded-full bg-[rgba(15,118,110,0.35)] blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-[rgba(239,139,83,0.18)] blur-3xl"
        />

        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 py-20 text-center md:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#2F855A]" />
            Trusted GCC Sealing Supplier
          </span>

          <h1 className="mt-6 max-w-4xl text-balance font-display text-4xl font-semibold leading-tight tracking-tight text-white md:text-6xl">
            Precision Industrial Rubber &amp; Sealing Solutions for the GCC.
          </h1>

          <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-white/72 md:text-lg">
            O-rings, extrusion profiles, vibration mounts, and custom-moulded
            parts engineered for UAE, Saudi Arabia, Oman, and Qatar industrial
            buyers. Search any SKU below for instant specifications.
          </p>

          {/* Dominant centred global search bar. */}
          <div className="mt-10 w-full max-w-3xl">
            <HomeSearch entries={searchEntries} />
            <p className="mt-3 text-[11px] uppercase tracking-wider text-white/55">
              {products.length} parent products ·
              {" "}
              {searchEntries.reduce((sum, entry) => sum + entry.skus.length, 0)} indexed SKUs
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/products"
              className="rounded border border-white/20 bg-white/5 px-4 py-2 text-sm font-bold uppercase tracking-wider text-white hover:bg-white/10"
            >
              Open full PIM catalog
            </Link>
            <Link
              href="/rfq"
              className="rounded bg-[#2F855A] px-4 py-2 text-sm font-bold uppercase tracking-wider text-white hover:bg-[#276749]"
            >
              Request a Quote
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          TRUST BANNER — grayscale credentials strip.
          ============================================================ */}
      <section className="border-y border-[#CBD5E0] bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-[#CBD5E0] md:grid-cols-4">
          {trustBadges.map((badge) => (
            <div
              key={badge.label}
              className="flex flex-col items-center bg-white px-3 py-5 text-center"
            >
              <span className="font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-[#1A202C]">
                {badge.label}
              </span>
              <span className="mt-1 text-[11px] leading-snug text-[#4A5568]">
                {badge.detail}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================
          FAST NAVIGATION GRID — direct routing into category families.
          ============================================================ */}
      <section className="bg-[#F7FAFC] py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-6 flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#2F855A]">
                Route yourself
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-[#1A202C] md:text-3xl">
                Jump straight to the right product family
              </h2>
            </div>
            <Link
              href="/products"
              className="text-[12px] font-bold uppercase tracking-wider text-[#2F855A] hover:underline"
            >
              See all categories →
            </Link>
          </div>

          <ul className="grid grid-cols-1 gap-px bg-[#CBD5E0] sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <li key={category.name} className="bg-white">
                <Link
                  href={
                    category.sample
                      ? `/products/${category.sample.slug}`
                      : "/products"
                  }
                  className="block p-5 hover:bg-[#EDF2F7]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#4A5568]">
                        Category
                      </p>
                      <p className="mt-1 text-lg font-bold text-[#1A202C]">
                        {category.name}
                      </p>
                    </div>
                    <span className="rounded border border-[#CBD5E0] bg-[#F7FAFC] px-2 py-0.5 font-mono text-[11px] font-bold text-[#1A202C]">
                      {category.count} {category.count === 1 ? "family" : "families"}
                    </span>
                  </div>
                  {category.sample && (
                    <p className="mt-3 text-[12px] text-[#4A5568]">
                      Featured: <span className="font-semibold text-[#1A202C]">{category.sample.name}</span>
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </MarketingLayout>
  );
}
