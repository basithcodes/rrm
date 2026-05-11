import type { Metadata } from "next";
import { MarketingLayout } from "@/components/marketing-layout";
import { MarketsTabs } from "@/components/markets-tabs";
import { marketProfiles } from "@/lib/public-site";
import { products } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Markets | RRM Industrial",
  description:
    "Filter the RRM industrial rubber catalog by GCC market — UAE (AED), Saudi Arabia (SAR), Oman (OMR), Qatar (QAR).",
};

export default function MarketsPage() {
  const tabs = marketProfiles.map((market) => ({
    name: market.name,
    currency: market.currency,
  }));

  return (
    <MarketingLayout>
      <section className="mx-auto max-w-7xl px-4 py-4">
        <header className="mb-3 flex items-end justify-between gap-3 border-b border-slate-200 pb-2">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700">
              GCC Coverage
            </p>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
              Markets
            </h1>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
            {tabs.length} markets · {products.length} parent products
          </p>
        </header>

        <MarketsTabs products={products} markets={tabs} />
      </section>
    </MarketingLayout>
  );
}
