import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketingLayout } from "@/components/marketing-layout";
import { ProductViewer } from "@/components/product-viewer";
import { getProductBySlug, products } from "@/lib/site-data";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return { title: "Product not found | RRM Industrial Rubber" };
  }

  return {
    title: `${product.name} | RRM Industrial Rubber`,
    description: product.summary,
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <MarketingLayout>
      <section className="section-shell py-10 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[0.96fr_1.04fr] lg:items-start">
          <div className="space-y-6">
            <div className="panel rounded-[2.7rem] border border-white/65 p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="eyebrow">{product.category}</span>
                <span className="market-stamp">{product.material}</span>
                <span className="market-stamp">Lead time {product.standardLeadTimeDays} days</span>
              </div>
              <h1 className="mt-4 display-title text-5xl font-semibold text-foreground md:text-6xl">
                {product.name}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
                {product.description}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {product.features.map((feature) => (
                  <span
                    key={feature}
                    className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-foreground"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.6rem] border border-line bg-white/72 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    Variants
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-foreground">
                    {product.variants.length}
                  </p>
                </div>
                <div className="rounded-[1.6rem] border border-line bg-white/72 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    Supply formats
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-foreground">
                    {product.supplyFormats.length}
                  </p>
                </div>
                <div className="rounded-[1.6rem] border border-line bg-white/72 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    Certifications
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-foreground">
                    {product.certifications.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="panel rounded-[2.4rem] border border-white/65 p-6 md:p-8">
              <span className="eyebrow">Applications</span>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.7rem] border border-line bg-white/70 p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
                    Typical use cases
                  </p>
                  <ul className="mt-4 grid gap-3 text-sm leading-7 text-muted">
                    {product.applications.map((application) => (
                      <li key={application}>{application}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-[1.7rem] border border-line bg-white/70 p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
                    Industries served
                  </p>
                  <ul className="mt-4 grid gap-3 text-sm leading-7 text-muted">
                    {product.industries.map((industry) => (
                      <li key={industry}>{industry}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <ProductViewer product={product} />

            <div className="market-card-dark rounded-[2.4rem] p-6 md:p-8">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                Quote handling
              </span>
              <h2 className="mt-4 display-title text-3xl font-semibold text-white">
                Public detail, private pricing.
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/78">
                Buyers can inspect the form, applications, and dimensions from the public side. The
                price book, cost logic, and manufacturing intelligence remain protected.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {product.certifications.map((certification) => (
                  <span
                    key={certification}
                    className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80"
                  >
                    {certification}
                  </span>
                ))}
              </div>
              <Link
                href="/rfq"
                className="mt-6 inline-flex rounded-full border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white"
              >
                RFQ this product
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell pb-10 md:pb-14">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="panel rounded-[2.4rem] border border-white/65 p-6 md:p-8">
            <span className="eyebrow">Technical Profile</span>
            <div className="mt-6 overflow-hidden rounded-[1.8rem] border border-line bg-white/70">
              <table className="w-full border-collapse text-left">
                <thead className="bg-surface-strong text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  <tr>
                    <th className="px-4 py-3">Specification</th>
                    <th className="px-4 py-3">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-line align-top">
                    <td className="px-4 py-4 text-sm leading-7 text-muted">Base material</td>
                    <td className="px-4 py-4 text-sm font-semibold text-foreground">{product.material}</td>
                  </tr>
                  {product.technicalProfile.map((specification) => (
                    <tr key={specification.label} className="border-t border-line align-top">
                      <td className="px-4 py-4 text-sm leading-7 text-muted">
                        {specification.label}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-foreground">
                        {specification.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="panel rounded-[2.4rem] border border-white/65 p-6 md:p-8">
              <span className="eyebrow">Supply Format</span>
              <div className="mt-6 flex flex-wrap gap-2">
                {product.supplyFormats.map((format) => (
                  <span
                    key={format}
                    className="rounded-full border border-line bg-white/70 px-3 py-1 text-xs font-semibold text-foreground"
                  >
                    {format}
                  </span>
                ))}
              </div>
            </div>

            <div className="panel rounded-[2.4rem] border border-white/65 p-6 md:p-8">
              <span className="eyebrow">Quality Checks</span>
              <ul className="mt-6 grid gap-3 text-sm leading-7 text-muted">
                {product.qualityChecks.map((check) => (
                  <li key={check}>{check}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell pb-16">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="panel rounded-[2.4rem] border border-white/65 p-6 md:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="eyebrow">Dimensions and Variants</span>
                <h2 className="mt-5 display-title text-4xl font-semibold text-foreground">
                  Variant-aware quoting starts from the right shelf label.
                </h2>
              </div>
              <Link
                href="/rfq"
                className="hidden rounded-full bg-[linear-gradient(135deg,#2f7d3a_0%,#1c5428_100%)] px-5 py-3 text-sm font-semibold text-ink-inverse md:inline-flex"
              >
                RFQ this product
              </Link>
            </div>

            <div className="mt-8 overflow-hidden rounded-[1.8rem] border border-line bg-white/70">
              <table className="w-full border-collapse text-left">
                <thead className="bg-surface-strong text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  <tr>
                    <th className="px-4 py-3">Variant</th>
                    <th className="px-4 py-3">Dimensions</th>
                    <th className="px-4 py-3">MOQ</th>
                    <th className="px-4 py-3">Pricing</th>
                  </tr>
                </thead>
                <tbody>
                  {product.variants.map((variant) => (
                    <tr key={variant.code} className="border-t border-line align-top">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-foreground">{variant.code}</p>
                        <p className="mt-2 text-sm leading-7 text-muted">{variant.description}</p>
                      </td>
                      <td className="px-4 py-4">
                        <ul className="grid gap-2 text-sm leading-7 text-muted">
                          {variant.dimensions.map((dimension) => (
                            <li key={dimension.label} className="flex items-center justify-between gap-4">
                              <span>{dimension.label}</span>
                              <span className="font-medium text-foreground">{dimension.value}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-foreground">
                        {variant.minimumOrderQuantity}
                      </td>
                      <td className="px-4 py-4 text-sm leading-7 text-muted">
                        Quote only. Owner workspace tracks {variant.currenciesTracked.join(", ")}.
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="panel rounded-[2.4rem] border border-white/65 p-6 md:p-8">
              <span className="eyebrow">Visibility rules</span>
              <ul className="mt-6 grid gap-4 text-sm leading-7 text-muted">
                <li>Customer-facing pages exclude compound ratios and process notes.</li>
                <li>Owner workspace stores internal cost drivers and chemistry records.</li>
                <li>Competitor pricing stays in a separate private dataset.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}