import Link from "next/link";
import { MarketingLayout } from "@/components/marketing-layout";
import { PublicRouteSupport } from "@/components/public-route-support";
import { customerSegments, industrySolutions } from "@/lib/site-data";

export default function IndustriesPage() {
  return (
    <MarketingLayout>
      <section className="section-shell py-10 md:py-12">
        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="panel rounded-[2.8rem] border border-white/65 p-6 md:p-8">
            <span className="eyebrow">Industries</span>
            <h1 className="mt-5 display-title text-5xl font-semibold text-foreground md:text-6xl">
              Start from the operating environment when the exact part number is not known yet.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
              This page is for application-led browsing. Each industry card groups the working
              environment, challenge, and likely product families so buyers can move from problem
              context to the right product page or RFQ without scanning unrelated details.
            </p>
            <PublicRouteSupport
              currentHref="/industries"
              title="Route options"
              description="If the operating environment is only part of the answer, jump to the route that resolves the next decision more directly."
              actions={[
                { href: "/products", label: "Browse matching products" },
                { href: "/rfq", label: "Request application support", variant: "primary" },
              ]}
            />
          </div>

          <div className="market-card-dark rounded-[2.8rem] p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
              Typical entry points
            </p>
            <div className="mt-5 grid gap-4">
              {customerSegments.map((segment) => (
                <div key={segment.title} className="rounded-[1.45rem] border border-white/10 bg-white/10 p-4">
                  <p className="text-sm font-semibold text-white">{segment.title}</p>
                  <p className="mt-2 text-sm leading-6 text-white/75">Primary route: {segment.channel}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell pb-16">
        <div className="grid gap-5 lg:grid-cols-2">
          {industrySolutions.map((industry, index) => (
            <article key={industry.name} className="panel rounded-[2.2rem] border border-white/65 p-6 md:p-8">
              <div className="flex items-center justify-between gap-4">
                <span className="market-stamp">Aisle {index + 1}</span>
                <span className="rounded-full border border-[rgba(214,137,53,0.2)] bg-[rgba(246,213,158,0.32)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-accent-berry">
                  {industry.focus}
                </span>
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Industry focus
              </p>
              <h2 className="mt-4 display-title text-4xl font-semibold text-foreground">
                {industry.name}
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted">{industry.challenge}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {industry.products.map((product) => (
                  <span
                    key={product}
                    className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-foreground"
                  >
                    {product}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/products"
              className="inline-flex rounded-full border border-line bg-white/80 px-6 py-3 text-sm font-semibold text-foreground"
            >
              Browse matching products
            </Link>
            <Link
              href="/rfq"
              className="brand-button inline-flex rounded-full px-6 py-3 text-sm font-semibold"
            >
              Request application support
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}