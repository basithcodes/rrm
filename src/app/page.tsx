import Link from "next/link";
import { MarketingLayout } from "@/components/marketing-layout";
import { ProductCard } from "@/components/product-card";
import {
  customerSegments,
  getFeaturedProducts,
  industrySolutions,
  markets,
  qualityPillars,
} from "@/lib/site-data";

export default function Home() {
  const featuredProducts = getFeaturedProducts();

  return (
    <MarketingLayout>
      <section className="section-shell py-8 md:py-14">
        <div className="panel relative overflow-hidden rounded-[2rem] border px-6 py-10 shadow-[0_22px_80px_-42px_rgba(20,33,43,0.5)] md:px-10 md:py-14">
          <div className="absolute inset-y-0 right-0 hidden w-2/5 bg-[radial-gradient(circle_at_top,rgba(184,95,45,0.18),transparent_52%)] md:block" />
          <div className="grid gap-10 lg:grid-cols-[1.3fr_0.9fr] lg:items-end">
            <div className="space-y-8">
              <span className="eyebrow">GCC Rubber Supply Platform</span>
              <div className="space-y-5">
                <h1 className="display-title max-w-3xl text-5xl font-semibold leading-[0.94] text-balance text-foreground md:text-7xl">
                  Industrial rubber products, quotation workflow, and owner-only manufacturing knowledge in one system.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-muted md:text-xl">
                  Launching with a simple catalog, variant-aware product pages, RFQ capture,
                  and a protected operations workspace for pricing, chemistry, and internal cost control.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-ink-inverse transition-transform hover:-translate-y-0.5"
                >
                  Explore Products
                </Link>
                <Link
                  href="/rfq"
                  className="inline-flex items-center justify-center rounded-full border border-line bg-surface px-6 py-3 text-sm font-semibold text-foreground"
                >
                  Request a Quote
                </Link>
              </div>
            </div>

            <div className="grid gap-4 rounded-[1.75rem] bg-[#17232d] p-5 text-ink-inverse shadow-[0_24px_80px_-44px_rgba(20,33,43,0.8)]">
              <div className="grid grid-cols-2 gap-4">
                {markets.map((market) => (
                  <div
                    key={market.name}
                    className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-white/55">
                      {market.currency}
                    </p>
                    <p className="mt-3 text-xl font-semibold text-white">{market.name}</p>
                    <p className="mt-2 text-sm leading-6 text-white/70">
                      {market.serviceLevel}
                    </p>
                  </div>
                ))}
              </div>
              <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-5">
                <p className="text-sm uppercase tracking-[0.2em] text-white/55">
                  Protected owner data
                </p>
                <p className="mt-3 text-2xl font-semibold text-white">
                  Pricing, chemistry, and cost drivers stay on the operations side.
                </p>
                <p className="mt-3 text-sm leading-7 text-white/72">
                  Public pages show product applications, dimensions, and 3D-ready media. Internal
                  records track labor, utilities, warehouse rent, equipment, and compound know-how.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell py-6 md:py-12">
        <div className="grid gap-4 md:grid-cols-4">
          {qualityPillars.map((pillar) => (
            <article key={pillar.title} className="panel rounded-[1.5rem] p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                {pillar.metric}
              </p>
              <h2 className="mt-4 display-title text-2xl font-semibold text-foreground">
                {pillar.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted">{pillar.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell py-10 md:py-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <span className="eyebrow">Featured Products</span>
            <h2 className="display-title text-4xl font-semibold text-foreground md:text-5xl">
              Built for simple browsing, detailed quoting, and variant-specific follow-up.
            </h2>
          </div>
          <Link href="/products" className="text-sm font-semibold text-accent-deep">
            See full catalog
          </Link>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {featuredProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      <section className="section-shell py-10 md:py-16">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="panel rounded-[2rem] p-6 md:p-8">
            <span className="eyebrow">Who We Sell To</span>
            <div className="mt-6 space-y-5">
              {customerSegments.map((segment) => (
                <div key={segment.title} className="border-b border-line pb-5 last:border-b-0 last:pb-0">
                  <h3 className="text-xl font-semibold text-foreground">{segment.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted">{segment.detail}</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent-deep">
                    Primary route: {segment.channel}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {industrySolutions.map((industry) => (
              <article key={industry.name} className="panel rounded-[1.75rem] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  {industry.focus}
                </p>
                <h3 className="mt-4 display-title text-3xl font-semibold text-foreground">
                  {industry.name}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted">{industry.challenge}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {industry.products.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-foreground"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
