import { MarketingLayout } from "@/components/marketing-layout";
import { ProductCard } from "@/components/product-card";
import { products } from "@/lib/site-data";

export default function ProductsPage() {
  const categories = Array.from(new Set(products.map((product) => product.category)));

  return (
    <MarketingLayout>
      <section className="section-shell py-10 md:py-14">
        <div className="panel rounded-[2rem] p-6 md:p-8">
          <span className="eyebrow">Product Catalog</span>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <div>
              <h1 className="display-title text-5xl font-semibold text-foreground md:text-6xl">
                Simple catalog structure for complex rubber products.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
                Each product page is prepared for many dimensions, many variants, application tags, and a quote-first pricing workflow across GCC markets.
              </p>
            </div>

            <div className="grid gap-3 rounded-[1.5rem] bg-[#17232d] p-5 text-ink-inverse">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">
                Current launch rules
              </p>
              <ul className="grid gap-3 text-sm leading-7 text-white/75">
                <li>Public pages show dimensions, applications, and product detail.</li>
                <li>Prices remain private and move through RFQ or owner workflow.</li>
                <li>Manufacturing chemistry and cost inputs remain owner-only.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell pb-16">
        <div className="mb-6 flex flex-wrap gap-3">
          {categories.map((category) => (
            <span
              key={category}
              className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold text-foreground"
            >
              {category}
            </span>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>
    </MarketingLayout>
  );
}