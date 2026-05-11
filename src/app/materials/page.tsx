import type { Metadata } from "next";
import { MarketingLayout } from "@/components/marketing-layout";
import { MaterialsTabs } from "@/components/materials-tabs";
import { products } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Materials | RRM Industrial",
  description:
    "Filter the RRM industrial rubber catalog by compound — EPDM, NBR, Silicone, Neoprene, and more.",
};

export default function MaterialsPage() {
  // Build the material list directly from the catalog so this page is
  // always in sync with what's actually orderable.
  const counts = new Map<string, number>();
  for (const product of products) {
    counts.set(product.material, (counts.get(product.material) ?? 0) + 1);
  }
  const materials = [...counts.entries()]
    .map(([name, productCount]) => ({ name, productCount }))
    .sort((a, b) => b.productCount - a.productCount);

  return (
    <MarketingLayout>
      <section className="mx-auto max-w-7xl px-4 py-4">
        <header className="mb-3 flex items-end justify-between gap-3 border-b border-slate-200 pb-2">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700">
              Filter by compound
            </p>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
              Materials
            </h1>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
            {materials.length} compounds · {products.length} parent products
          </p>
        </header>

        <MaterialsTabs products={products} materials={materials} />
      </section>
    </MarketingLayout>
  );
}
