import { MarketingLayout } from "@/components/marketing-layout";
import { ProductCard } from "@/components/product-card";
import { products } from "@/lib/site-data";

export default function ProductsPage() {
  const categories = Array.from(new Set(products.map((product) => product.category)));
  const totalVariants = products.reduce((total, product) => total + product.variants.length, 0);

  return (
    <MarketingLayout>
      <section className="section-shell py-10 md:py-12">
        <div className="panel rounded-[2.8rem] border border-white/65 p-6 md:p-8">
          <span className="eyebrow">Product Catalog</span>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div>
              <h1 className="display-title text-5xl font-semibold text-foreground md:text-6xl">
                Catalog aisles that feel organized the moment a buyer lands.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
                The layout takes cues from a premium vegetable store: categories are obvious,
                the product cards feel sorted, and each item moves buyers naturally from overview
                to dimensions to RFQ.
              </p>
            </div>

            <div className="market-card-dark rounded-[2rem] p-5 text-ink-inverse">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">
                Catalog numbers
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.35rem] border border-white/10 bg-white/10 px-4 py-4">
                  <p className="text-[0.7rem] uppercase tracking-[0.18em] text-white/58">
                    Product families
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-white">{products.length}</p>
                </div>
                <div className="rounded-[1.35rem] border border-white/10 bg-white/10 px-4 py-4">
                  <p className="text-[0.7rem] uppercase tracking-[0.18em] text-white/58">
                    Variant sizes
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-white">{totalVariants}</p>
                </div>
                <div className="rounded-[1.35rem] border border-white/10 bg-white/10 px-4 py-4">
                  <p className="text-[0.7rem] uppercase tracking-[0.18em] text-white/58">
                    Public rule
                  </p>
                  <p className="mt-2 text-base font-semibold text-white">Quote first</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell pb-16">
        <div className="grid gap-6 xl:grid-cols-[0.34fr_0.66fr]">
          <aside className="grid gap-6 self-start xl:sticky xl:top-36">
            <div className="panel rounded-[2.2rem] border border-white/65 p-6">
              <span className="eyebrow">Catalog aisles</span>
              <div className="mt-5 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <span
                    key={category}
                    className="rounded-full border border-line bg-white/70 px-4 py-2 text-sm font-semibold text-foreground"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>

            <div className="market-card-dark rounded-[2.2rem] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                Launch rules
              </p>
              <ul className="mt-5 grid gap-3 text-sm leading-7 text-white/78">
                <li>Public pages show dimensions, applications, and technical fit.</li>
                <li>Prices stay off the shelf and move through RFQ or owner workflow.</li>
                <li>Manufacturing chemistry and cost inputs remain owner-only.</li>
              </ul>
            </div>
          </aside>

          <div className="grid gap-5 lg:grid-cols-2">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}