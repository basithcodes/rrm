import Link from "next/link";
import { MarketingLayout } from "@/components/marketing-layout";
import { ProductCard } from "@/components/product-card";
import { getCatalogAisles, homeRouteCards } from "@/lib/public-site";
import { getFeaturedProducts, products } from "@/lib/site-data";

export default function Home() {
  const featuredProducts = getFeaturedProducts().slice(0, 3);
  const totalVariants = products.reduce((total, product) => total + product.variants.length, 0);
  const overviewMetrics = [
    { label: "Product families", value: String(products.length) },
    { label: "Variant sizes", value: String(totalVariants) },
    { label: "Public pages", value: String(homeRouteCards.length) },
  ];
  const catalogAisles = getCatalogAisles().slice(0, 4);
  const homepageSteps = [
    {
      title: "Pick the right page first",
      detail:
        "Catalog, industries, materials, markets, capabilities, and RFQ now live on separate routes.",
    },
    {
      title: "Use the page for one job",
      detail:
        "Each route is narrowed to one decision: product family, industry fit, material, market, capability, or quote request.",
    },
    {
      title: "Hand off through RFQ",
      detail:
        "Once the family is clear, move into the structured RFQ flow with quantity, market, and application notes.",
    },
  ];

  return (
    <MarketingLayout>
      <section className="section-shell py-8 md:py-12">
        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="panel relative overflow-hidden rounded-[3rem] border border-white/65 px-6 py-8 md:px-10 md:py-10">
            <div className="pointer-events-none absolute right-[-5rem] top-[-4rem] h-48 w-48 rounded-full bg-[rgba(246,213,158,0.38)] blur-3xl" />
            <div className="pointer-events-none absolute bottom-[-5rem] left-[-4rem] h-52 w-52 rounded-full bg-[rgba(222,240,204,0.6)] blur-3xl" />
            <div className="relative space-y-8">
              <span className="eyebrow">Industrial rubber platform</span>
              <div className="space-y-5">
                <h1 className="display-title max-w-4xl text-5xl font-semibold text-balance text-foreground md:text-7xl">
                  Start in the right aisle instead of reading one overloaded homepage.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-muted md:text-xl">
                  The site is organized by task. Use the catalog for parts, industries for use
                  cases, materials for compound choice, markets for GCC context, capabilities for
                  platform scope, and RFQ for the commercial handoff.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/products"
                  className="brand-button inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5"
                >
                  Open the catalog
                </Link>
                <Link
                  href="/materials"
                  className="inline-flex items-center justify-center rounded-full border border-line bg-white/80 px-6 py-3 text-sm font-semibold text-foreground"
                >
                  Compare materials
                </Link>
              </div>
            </div>
          </div>

          <div className="market-card-dark rounded-[3rem] p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
              Use the site in three moves
            </p>
            <div className="mt-5 grid gap-4">
              {homepageSteps.map((step, index) => (
                <article
                  key={step.title}
                  className="rounded-[1.55rem] border border-white/10 bg-white/10 px-5 py-5"
                >
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/58">
                    Step {index + 1}
                  </p>
                  <h2 className="mt-3 text-xl font-semibold text-white">{step.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-white/74">{step.detail}</p>
                </article>
              ))}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {overviewMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-[1.6rem] border border-white/10 bg-white/10 px-4 py-4"
                >
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/58">
                    {metric.label}
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-white">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell py-8 md:py-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <span className="eyebrow">Page map</span>
            <h2 className="display-title text-4xl font-semibold text-foreground md:text-5xl">
              Go directly to the page that matches the decision you need to make.
            </h2>
          </div>
          <Link href="/rfq" className="text-sm font-semibold text-accent-deep">
            Need a quote instead?
          </Link>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {homeRouteCards.map((card, index) => (
            <Link
              key={card.href}
              href={card.href}
              className={`rounded-[2rem] border p-6 transition-transform hover:-translate-y-1 ${
                index % 3 === 1
                  ? "border-[rgba(214,137,53,0.2)] bg-[rgba(246,213,158,0.3)]"
                  : "panel border-white/65"
              }`}
            >
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted">
                {card.eyebrow}
              </p>
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-accent-deep">
                {card.stat}
              </p>
              <h2 className="mt-3 display-title text-3xl font-semibold text-foreground">
                {card.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted">{card.detail}</p>
              <p className="mt-5 text-sm font-semibold text-accent-deep">Open page</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-shell py-8 md:py-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <span className="eyebrow">Popular catalog lanes</span>
            <h2 className="display-title text-4xl font-semibold text-foreground md:text-5xl">
              Start with the broad family, then let the catalog page do the narrowing.
            </h2>
          </div>
          <Link href="/products" className="text-sm font-semibold text-accent-deep">
            Browse full catalog
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {catalogAisles.map((aisle) => (
            <Link
              key={aisle.category}
              href={`/products?category=${encodeURIComponent(aisle.category)}`}
              className="panel rounded-[2rem] border border-white/65 p-5 transition-transform hover:-translate-y-1"
            >
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted">
                {aisle.productCount} families
              </p>
              <h3 className="mt-4 display-title text-3xl font-semibold text-foreground">
                {aisle.category}
              </h3>
              <div className="mt-5 grid gap-3">
                <div className="rounded-[1.2rem] border border-line bg-white/72 px-4 py-4">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted">
                    Variant sizes
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{aisle.variantCount}</p>
                </div>
                <div className="rounded-[1.2rem] border border-line bg-white/72 px-4 py-4">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted">
                    Fastest lead time
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{aisle.fastestLeadTime} days</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {aisle.materials.map((material) => (
                  <span
                    key={material}
                    className="rounded-full border border-[rgba(214,137,53,0.28)] bg-accent-warm-soft px-3 py-1 text-xs font-semibold text-accent-berry"
                  >
                    {material}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-shell py-10 md:py-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <span className="eyebrow">Featured products</span>
            <h2 className="display-title text-4xl font-semibold text-foreground md:text-5xl">
              A quick preview of the product detail level before you dive into the full catalog.
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
    </MarketingLayout>
  );
}