import Link from "next/link";
import { MarketingLayout } from "@/components/marketing-layout";
import { formatCountLabel, getMaterialSummaries } from "@/lib/public-site";

const selectionRules = [
  {
    title: "Start with exposure",
    detail:
      "Choose the material family by weather, oil contact, temperature, movement, or sealing environment before narrowing to a part code.",
  },
  {
    title: "Check the family range",
    detail:
      "Each card shows how many product families and variant sizes sit behind the material so buyers understand depth before filtering.",
  },
  {
    title: "Jump back to catalog",
    detail:
      "Once the compound is clear, open the filtered catalog and compare real product families and variants side by side.",
  },
];

export default function MaterialsPage() {
  const materials = getMaterialSummaries();

  return (
    <MarketingLayout>
      <section className="section-shell py-10 md:py-12">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="panel rounded-[2.8rem] border border-white/65 p-6 md:p-8">
            <span className="eyebrow">Materials</span>
            <h1 className="mt-5 display-title text-5xl font-semibold text-foreground md:text-6xl">
              Material page: compare compound families before comparing SKUs.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
              This route is for buyers who know the operating condition but do not yet know the
              exact product code. Review the material family first, then jump into the filtered
              catalog once the compound direction is clear.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-sm font-semibold text-accent-deep">
              <Link href="/products" className="rounded-full border border-line bg-white/75 px-4 py-2">
                Open catalog
              </Link>
              <Link href="/industries" className="rounded-full border border-line bg-white/75 px-4 py-2">
                Browse industries
              </Link>
              <Link href="/rfq" className="rounded-full border border-line bg-white/75 px-4 py-2">
                Send RFQ
              </Link>
            </div>
          </div>

          <div className="market-card-dark rounded-[2.8rem] p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
              How to read this page
            </p>
            <div className="mt-5 grid gap-4">
              {selectionRules.map((rule, index) => (
                <article key={rule.title} className="rounded-[1.45rem] border border-white/10 bg-white/10 p-4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/58">
                    Step {index + 1}
                  </p>
                  <h2 className="mt-3 text-xl font-semibold text-white">{rule.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-white/74">{rule.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell pb-16">
        <div className="grid gap-5 lg:grid-cols-2">
          {materials.map((material) => (
            <article key={material.material} className="panel rounded-[2.2rem] border border-white/65 p-6 md:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    {formatCountLabel(material.productCount, "product family", "product families")}
                  </p>
                  <h2 className="mt-4 display-title text-4xl font-semibold text-foreground">
                    {material.material}
                  </h2>
                </div>
                <span className="rounded-full border border-[rgba(214,137,53,0.2)] bg-[rgba(246,213,158,0.32)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-accent-berry">
                  {formatCountLabel(material.variantCount, "variant")}
                </span>
              </div>

              <p className="mt-4 text-base font-semibold text-accent-deep">{material.focus}</p>
              <p className="mt-3 text-sm leading-7 text-muted">{material.detail}</p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.2rem] border border-line bg-white/72 px-4 py-4">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted">
                    Fastest lead time
                  </p>
                  <p className="mt-2 text-xl font-semibold text-foreground">
                    {material.fastestLeadTime} days
                  </p>
                </div>
                <div className="rounded-[1.2rem] border border-line bg-white/72 px-4 py-4">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted">
                    Categories
                  </p>
                  <p className="mt-2 text-base font-semibold text-foreground">
                    {material.categories.length}
                  </p>
                </div>
                <div className="rounded-[1.2rem] border border-line bg-white/72 px-4 py-4">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted">
                    Industries
                  </p>
                  <p className="mt-2 text-base font-semibold text-foreground">
                    {material.industries.length}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 xl:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    Product categories
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {material.categories.map((category) => (
                      <span
                        key={category}
                        className="rounded-full border border-line bg-white/70 px-3 py-1 text-xs font-semibold text-foreground"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    Common applications
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {material.applications.map((application) => (
                      <span
                        key={application}
                        className="rounded-full border border-line bg-[rgba(222,240,204,0.58)] px-3 py-1 text-xs font-semibold text-accent-deep"
                      >
                        {application}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/products?material=${encodeURIComponent(material.material)}`}
                  className="brand-button inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold"
                >
                  View {material.material} products
                </Link>
                <Link
                  href="/rfq"
                  className="inline-flex items-center justify-center rounded-full border border-line bg-white/80 px-5 py-3 text-sm font-semibold text-foreground"
                >
                  Send material-based RFQ
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </MarketingLayout>
  );
}