import Link from "next/link";
import { MarketingLayout } from "@/components/marketing-layout";
import { customerSegments, industrySolutions } from "@/lib/site-data";

export default function IndustriesPage() {
  return (
    <MarketingLayout>
      <section className="section-shell py-10 md:py-12">
        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="panel rounded-[2.8rem] border border-white/65 p-6 md:p-8">
            <span className="eyebrow">Industries</span>
            <h1 className="mt-5 display-title text-5xl font-semibold text-foreground md:text-6xl">
              Application aisles for buyers who shop by problem, not part number.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
              A great vegetable store groups produce by use and freshness. This page borrows that
              idea for industrial buyers: each industry tile frames the environment, challenge, and
              likely product family in one glance.
            </p>
          </div>

          <div className="market-card-dark rounded-[2.8rem] p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
              How buyers arrive
            </p>
            <div className="mt-5 grid gap-4">
              {customerSegments.map((segment) => (
                <div key={segment.title} className="rounded-[1.45rem] border border-white/10 bg-white/10 p-4">
                  <p className="text-sm font-semibold text-white">{segment.title}</p>
                  <p className="mt-2 text-sm leading-6 text-white/75">{segment.channel}</p>
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
          <Link
            href="/rfq"
            className="inline-flex rounded-full bg-[linear-gradient(135deg,#2f7d3a_0%,#1c5428_100%)] px-6 py-3 text-sm font-semibold text-ink-inverse"
          >
            Request application support
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}