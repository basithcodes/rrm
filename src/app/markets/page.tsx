import Link from "next/link";
import { MarketingLayout } from "@/components/marketing-layout";
import { PublicRouteSupport } from "@/components/public-route-support";
import { marketProfiles } from "@/lib/public-site";

const commercialRules = [
  "Currencies and market coverage stay visible on the public site.",
  "Actual selling prices remain quote-only and stay inside the owner workflow.",
  "Each market page should help buyers decide how to enter the process, not force them to decode internal pricing logic.",
];

export default function MarketsPage() {
  return (
    <MarketingLayout>
      <section className="section-shell py-10 md:py-12">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="panel rounded-[2.8rem] border border-white/65 p-6 md:p-8">
            <span className="eyebrow">Markets</span>
            <h1 className="mt-5 display-title text-5xl font-semibold text-foreground md:text-6xl">
              Market page: see country context before the quote conversation starts.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
              This route is for buyers who need to understand GCC service coverage, buying rhythm,
              and the right entry path for their market before they send a structured request.
            </p>
            <PublicRouteSupport
              currentHref="/markets"
              title="Market handoff routes"
              description="Once the country context is clear, move to the route that resolves technical fit or starts the quote conversation."
              actions={[
                { href: "/products", label: "Browse catalog" },
                { href: "/rfq", label: "Start RFQ", variant: "primary" },
              ]}
            />
          </div>

          <div className="market-card-dark rounded-[2.8rem] p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
              Commercial rules
            </p>
            <div className="mt-5 grid gap-4 text-sm leading-7 text-white/78">
              {commercialRules.map((rule) => (
                <div key={rule} className="rounded-[1.45rem] border border-white/10 bg-white/10 p-4">
                  {rule}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell pb-16">
        <div className="grid gap-5 lg:grid-cols-2">
          {marketProfiles.map((market) => (
            <article key={market.name} className="panel rounded-[2.2rem] border border-white/65 p-6 md:p-8">
              <div className="flex items-center justify-between gap-4">
                <span className="market-stamp">{market.currency}</span>
                <span className="rounded-full border border-[rgba(214,137,53,0.2)] bg-[rgba(246,213,158,0.32)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-accent-berry">
                  {market.name}
                </span>
              </div>
              <h2 className="mt-5 display-title text-4xl font-semibold text-foreground">
                {market.name}
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted">{market.serviceLevel}</p>

              <div className="mt-6 grid gap-4">
                <div className="rounded-[1.35rem] border border-line bg-white/72 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    Buying pattern
                  </p>
                  <p className="mt-2 text-sm leading-7 text-muted">{market.buyingPattern}</p>
                </div>
                <div className="rounded-[1.35rem] border border-line bg-white/72 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    Best for
                  </p>
                  <p className="mt-2 text-sm leading-7 text-muted">{market.bestFor}</p>
                </div>
                <div className="rounded-[1.35rem] border border-line bg-white/72 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    Recommended next step
                  </p>
                  <p className="mt-2 text-sm leading-7 text-muted">{market.nextStep}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/products"
                  className="brand-button inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold"
                >
                  Browse products for {market.name}
                </Link>
                <Link
                  href="/rfq"
                  className="inline-flex items-center justify-center rounded-full border border-line bg-white/80 px-5 py-3 text-sm font-semibold text-foreground"
                >
                  Send RFQ in {market.currency}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </MarketingLayout>
  );
}