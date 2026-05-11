import { MarketingLayout } from "@/components/marketing-layout";
import { industrySolutions } from "@/lib/site-data";

export default function IndustriesPage() {
  return (
    <MarketingLayout>
      <section className="section-shell py-10 md:py-14">
        <div className="panel rounded-[2rem] p-6 md:p-8">
          <span className="eyebrow">Industries</span>
          <h1 className="mt-5 display-title text-5xl font-semibold text-foreground md:text-6xl">
            Application-first entry points for serious buyers.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
            Buyers often arrive through their application problem, not through a part number. These industry pages are the right place to position quality, repeatability, and suitability for GCC conditions.
          </p>
        </div>
      </section>

      <section className="section-shell pb-16">
        <div className="grid gap-5 lg:grid-cols-2">
          {industrySolutions.map((industry) => (
            <article key={industry.name} className="panel rounded-[2rem] p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                {industry.focus}
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
      </section>
    </MarketingLayout>
  );
}