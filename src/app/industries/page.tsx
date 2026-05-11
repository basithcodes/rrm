import type { Metadata } from "next";
import { MarketingLayout } from "@/components/marketing-layout";
import { IndustriesAccordion } from "@/components/industries-accordion";
import { products } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Industries | RRM Industrial",
  description:
    "Filter the RRM industrial rubber catalog by industry tag — automotive, building systems, maintenance, and more.",
};

export default function IndustriesPage() {
  // Roll up the industry tags from every product so the accordion always
  // matches what's actually orderable.
  const counts = new Map<string, number>();
  for (const product of products) {
    for (const industry of product.industries) {
      counts.set(industry, (counts.get(industry) ?? 0) + 1);
    }
  }
  const industries = [...counts.entries()]
    .map(([name, productCount]) => ({ name, productCount }))
    .sort((a, b) => b.productCount - a.productCount);

  return (
    <MarketingLayout>
      <section className="mx-auto max-w-7xl px-4 py-4">
        <header className="mb-3 flex items-end justify-between gap-3 border-b border-slate-200 pb-2">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700">
              Filter by industry
            </p>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
              Industries
            </h1>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
            {industries.length} industries · {products.length} parent products
          </p>
        </header>

        <IndustriesAccordion products={products} industries={industries} />
      </section>
    </MarketingLayout>
  );
}
