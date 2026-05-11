import { MarketingLayout } from "@/components/marketing-layout";

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

export default function RfqPage() {
  return (
    <MarketingLayout>
      <section className="section-shell py-10 md:py-14">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="panel rounded-[2rem] p-6 md:p-8">
            <span className="eyebrow">Request for Quote</span>
            <h1 className="mt-5 display-title text-5xl font-semibold text-foreground md:text-6xl">
              Capture the information sales needs on the first pass.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
              The launch workflow is quote-first. Customers should be able to describe the product, quantity, market, and application in one structured request instead of sending fragmented messages.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {rfqFields.map((field) => (
                <div key={field} className="rounded-[1.25rem] border border-line bg-surface px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    Required field
                  </p>
                  <p className="mt-2 font-semibold text-foreground">{field}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6">
            <div className="panel rounded-[2rem] bg-[#17232d] p-6 text-ink-inverse md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
                Next implementation slice
              </p>
              <h2 className="mt-4 display-title text-3xl font-semibold text-white">
                Persist RFQs into the owner dashboard and customer history.
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/75">
                This page is now structured for the final RFQ schema. The next backend step is to save requests, assign them to customers, and route them to the protected admin workspace.
              </p>
            </div>

            <div className="panel rounded-[2rem] p-6 md:p-8">
              <span className="eyebrow">What happens next</span>
              <ul className="mt-6 grid gap-4 text-sm leading-7 text-muted">
                <li>Attach RFQ entries to a customer record and source channel.</li>
                <li>Store quantity, country, and variant detail for quote generation.</li>
                <li>Keep pricing and cost logic in the protected owner workflow.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}