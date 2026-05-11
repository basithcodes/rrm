import Link from "next/link";
import { CatalogBrowser } from "@/components/catalog-browser";
import { MarketingLayout } from "@/components/marketing-layout";
import { getCatalogAisles, publicNavigation } from "@/lib/public-site";
import { products } from "@/lib/site-data";

type ProductsPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const initialSearchParams = await searchParams;
  const totalVariants = products.reduce((total, product) => total + product.variants.length, 0);
  const catalogAisles = getCatalogAisles().slice(0, 3);
  const supportRoutes = publicNavigation.filter((item) => item.href !== "/products").slice(0, 4);

  return (
    <MarketingLayout>
      <section className="section-shell py-10 md:py-12">
        <div className="panel rounded-[2.8rem] border border-white/65 p-6 md:p-8">
          <span className="eyebrow">Product Catalog</span>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div>
              <h1 className="display-title text-5xl font-semibold text-foreground md:text-6xl">
                Find the product family first, then narrow by size, material, and application.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
                This page is only for browsing the catalog. Use it when you already know you are
                looking for a part family and want to compare product cards, dimensions, and
                variant depth before moving into an RFQ.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {supportRoutes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className="rounded-[1.55rem] border border-line bg-white/76 px-4 py-4 transition-transform hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted">
                          {route.section}
                        </p>
                        <h2 className="mt-2 text-lg font-semibold text-foreground">
                          {route.label}
                        </h2>
                      </div>
                      <span className="market-stamp">{route.badge}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted">{route.description}</p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="market-card-dark rounded-[2rem] p-5 text-ink-inverse">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">
                Catalog rules
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
              <div className="mt-5 rounded-[1.45rem] border border-white/10 bg-white/10 p-4">
                <p className="text-[0.7rem] uppercase tracking-[0.18em] text-white/58">
                  Fast entry aisles
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {catalogAisles.map((aisle) => (
                    <Link
                      key={aisle.category}
                      href={`/products?category=${encodeURIComponent(aisle.category)}`}
                      className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-white"
                    >
                      {aisle.category}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell pb-16">
        <CatalogBrowser products={products} initialSearchParams={initialSearchParams} />
      </section>
    </MarketingLayout>
  );
}