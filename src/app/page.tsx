import Link from "next/link";
import { MarketingLayout } from "@/components/marketing-layout";
import { ProductCard } from "@/components/product-card";
import {
  customerSegments,
  getFeaturedProducts,
  industrySolutions,
  markets,
  products,
  qualityPillars,
} from "@/lib/site-data";

export default function Home() {
  const featuredProducts = getFeaturedProducts();
  const totalVariants = products.reduce((total, product) => total + product.variants.length, 0);
  const catalogMetrics = [
    { label: "Product families", value: String(products.length) },
    { label: "Variant sizes", value: String(totalVariants) },
    { label: "Markets", value: String(markets.length) },
    { label: "Tracked currencies", value: "5" },
  ];
  const catalogAisles = Array.from(
    products.reduce(
      (map, product) => {
        const current = map.get(product.category) ?? {
          category: product.category,
          productCount: 0,
          variantCount: 0,
          fastestLeadTime: product.standardLeadTimeDays,
          materials: new Set<string>(),
        };

        current.productCount += 1;
        current.variantCount += product.variants.length;
        current.fastestLeadTime = Math.min(current.fastestLeadTime, product.standardLeadTimeDays);
        current.materials.add(product.material);
        map.set(product.category, current);

        return map;
      },
      new Map<
        string,
        {
          category: string;
          productCount: number;
          variantCount: number;
          fastestLeadTime: number;
          materials: Set<string>;
        }
      >(),
    ).values(),
  )
    .map((item) => ({
      ...item,
      materials: Array.from(item.materials).slice(0, 2),
    }))
    .sort((left, right) => right.productCount - left.productCount || left.category.localeCompare(right.category))
    .slice(0, 4);
  const shoppingFlow = [
    {
      title: "Enter through a clear aisle",
      detail: "Start by category or market instead of forcing buyers to read every product card.",
    },
    {
      title: "Shortlist with technical cues",
      detail: "Variant count, lead time, and material show up before the RFQ conversation starts.",
    },
    {
      title: "Move directly into RFQ",
      detail: "Once buyers find the right family, the page keeps them one click away from a quote request.",
    },
  ];

  return (
    <MarketingLayout>
      <section className="section-shell py-8 md:py-12">
        <div className="panel relative overflow-hidden rounded-[3rem] border border-white/65 px-6 py-8 md:px-10 md:py-10">
          <div className="pointer-events-none absolute right-[-5rem] top-[-4rem] h-48 w-48 rounded-full bg-[rgba(246,213,158,0.38)] blur-3xl" />
          <div className="pointer-events-none absolute bottom-[-5rem] left-[-4rem] h-52 w-52 rounded-full bg-[rgba(222,240,204,0.6)] blur-3xl" />
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div className="space-y-8">
              <span className="eyebrow">Vegetable-store clarity, industrial-grade catalog</span>
              <div className="space-y-5">
                <h1 className="display-title max-w-4xl text-5xl font-semibold text-balance text-foreground md:text-7xl">
                  A fresh-market storefront for thousands of rubber products and fast RFQs.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-muted md:text-xl">
                  The inspiration comes from a great vegetable store: easy aisles, visible grades,
                  quick selection, and no clutter. Buyers can move from category to dimension to
                  quote request without losing context.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/products"
                  className="brand-button inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5"
                >
                  Explore the catalog
                </Link>
                <Link
                  href="/rfq"
                  className="inline-flex items-center justify-center rounded-full border border-line bg-white/80 px-6 py-3 text-sm font-semibold text-foreground"
                >
                  Start an order sheet
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {catalogMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-[1.6rem] border border-line bg-white/60 px-4 py-4"
                  >
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted">
                      {metric.label}
                    </p>
                    <p className="mt-3 text-3xl font-semibold text-foreground">{metric.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="market-card-dark rounded-[2.3rem] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                  Today on the board
                </p>
                <div className="mt-5 grid gap-4">
                  {featuredProducts.slice(0, 3).map((product) => (
                    <div key={product.slug} className="border-b border-white/10 pb-4 last:border-b-0 last:pb-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-white">{product.name}</p>
                          <p className="mt-1 text-sm leading-6 text-white/70">{product.summary}</p>
                        </div>
                        <span className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/80">
                          {product.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {markets.map((market) => (
                  <div
                    key={market.name}
                    className="rounded-[1.6rem] border border-line bg-white/68 p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-accent-deep">
                      {market.currency}
                    </p>
                    <p className="mt-3 text-xl font-semibold text-foreground">{market.name}</p>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {market.serviceLevel}
                    </p>
                  </div>
                ))}
              </div>
              <div className="rounded-[1.7rem] border border-line bg-white/70 p-5">
                <p className="text-sm uppercase tracking-[0.2em] text-accent-deep">
                  Protected owner data
                </p>
                <p className="mt-3 text-2xl font-semibold text-foreground">
                  Pricing, chemistry, and cost drivers stay on the operations side.
                </p>
                <p className="mt-3 text-sm leading-7 text-muted">
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
          {qualityPillars.map((pillar, index) => (
            <article
              key={pillar.title}
              className={`rounded-[1.8rem] border p-5 shadow-[0_18px_40px_-30px_rgba(23,53,35,0.35)] ${
                index % 2 === 0
                  ? "border-line bg-white/72"
                  : "border-[rgba(214,137,53,0.2)] bg-[rgba(246,213,158,0.3)]"
              }`}
            >
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

      <section className="section-shell py-10 md:py-14">
        <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="market-card-dark rounded-[2.4rem] p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
              How large catalogs stay usable
            </p>
            <h2 className="mt-4 display-title text-4xl font-semibold text-white md:text-5xl">
              The public storefront now behaves more like an engineered supply counter.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/74">
              The best industrial catalogs are beautiful because they are legible. They put browse
              lanes, fast technical cues, and quote actions in front of the buyer before the page
              turns into a wall of cards.
            </p>

            <div className="mt-6 grid gap-4">
              {shoppingFlow.map((step, index) => (
                <article
                  key={step.title}
                  className="rounded-[1.55rem] border border-white/10 bg-white/10 px-5 py-5"
                >
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/58">
                    Step {index + 1}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/74">{step.detail}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {catalogAisles.map((aisle) => (
              <Link
                key={aisle.category}
                href={`/products?category=${encodeURIComponent(aisle.category)}`}
                className="panel rounded-[2rem] border border-white/65 p-6 transition-transform hover:-translate-y-1"
              >
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted">
                  {aisle.productCount} families
                </p>
                <h3 className="mt-4 display-title text-3xl font-semibold text-foreground">
                  {aisle.category}
                </h3>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.35rem] border border-line bg-white/72 px-4 py-4">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted">
                      Variant sizes
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">
                      {aisle.variantCount}
                    </p>
                  </div>
                  <div className="rounded-[1.35rem] border border-line bg-white/72 px-4 py-4">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted">
                      Fastest lead time
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">
                      {aisle.fastestLeadTime} days
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {aisle.materials.map((material) => (
                    <span
                      key={material}
                      className="rounded-full border border-[rgba(214,137,53,0.28)] bg-accent-warm-soft px-3 py-1 text-xs font-semibold text-accent-berry"
                    >
                      {material}
                    </span>
                  ))}
                </div>
                <p className="mt-5 text-sm font-semibold text-accent-deep">Open aisle</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell py-10 md:py-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <span className="eyebrow">Featured Products</span>
            <h2 className="display-title text-4xl font-semibold text-foreground md:text-5xl">
              Displayed like clean produce crates, specified like industrial parts.
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
          <div className="panel rounded-[2.4rem] border border-white/65 p-6 md:p-8">
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
            <Link
              href="/rfq"
              className="brand-button mt-6 inline-flex rounded-full px-5 py-3 text-sm font-semibold"
            >
              Send a structured RFQ
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {industrySolutions.map((industry) => (
              <article key={industry.name} className="panel rounded-[2rem] border border-white/65 p-6">
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
                      className="rounded-full border border-line bg-white/70 px-3 py-1 text-xs font-semibold text-foreground"
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
