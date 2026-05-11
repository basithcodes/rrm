import Link from "next/link";
import { MarketingLayout } from "@/components/marketing-layout";
import { PublicRouteSupport } from "@/components/public-route-support";
import { PublicRfqForm } from "@/components/public-rfq-form";

const rfqFields = [
  "Company name",
  "Contact person",
  "Email and phone",
  "Country and delivery city",
  "Product or variant code",
  "Requested quantity",
  "Application details",
  "Drawing or sample reference",
];

const rfqSteps = [
  "Buyer submits one clean request with quantity, market, and fit details.",
  "Sales reviews the application and checks the matching product family or variant.",
  "Private pricing and cost logic stay inside the owner workspace before the quote is sent.",
];

export default function RfqPage() {
  return (
    <MarketingLayout>
      <section className="section-shell py-10 md:py-12">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="panel rounded-[2.8rem] border border-white/65 p-6 md:p-8">
            <span className="eyebrow">Request for Quote</span>
            <h1 className="mt-5 display-title text-5xl font-semibold text-foreground md:text-6xl">
              Send one structured request with the details needed to quote properly.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
              This page is the handoff point from public browsing into the private quote workflow.
              Use it after you have identified the right product family, material direction, or
              market context and want the sales team to work from a clean brief.
            </p>
            <PublicRouteSupport
              currentHref="/rfq"
              title="Before you submit"
              description="If the brief still needs technical narrowing, take the route that resolves that question first and come back once the request is clean."
              maxItems={3}
            />

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {rfqFields.map((field, index) => (
                <div key={field} className="rounded-[1.45rem] border border-line bg-white/72 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    Field {index + 1}
                  </p>
                  <p className="mt-2 font-semibold text-foreground">{field}</p>
                </div>
              ))}
            </div>

            <PublicRfqForm />
          </div>

          <div className="grid gap-6">
            <div className="market-card-dark rounded-[2.4rem] p-6 text-ink-inverse md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
                What happens next
              </p>
              <h2 className="mt-4 display-title text-3xl font-semibold text-white">
                Structured requests move into the private quote workflow.
              </h2>
              <ul className="mt-4 grid gap-3 text-sm leading-7 text-white/78">
                {rfqSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </div>

            <div className="panel rounded-[2.4rem] border border-white/65 p-6 md:p-8">
              <span className="eyebrow">Helpful before sending</span>
              <PublicRouteSupport currentHref="/rfq" maxItems={3} />
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}