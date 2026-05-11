import Link from "next/link";
import { MarketingLayout } from "@/components/marketing-layout";
import { capabilityTracks } from "@/lib/public-site";
import { qualityPillars } from "@/lib/site-data";

const workZones = [
  {
    title: "Storefront",
    detail: "Public catalog, industries, materials, markets, and RFQ preparation.",
  },
  {
    title: "Owner workspace",
    detail: "Private pricing, sourcing, manufacturing, competitors, and RFQ handling.",
  },
  {
    title: "Data operations",
    detail: "Imports, live dashboard signals, and product record maintenance.",
  },
];

export default function CapabilitiesPage() {
  return (
    <MarketingLayout>
      <section className="section-shell py-10 md:py-12">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="panel rounded-[2.8rem] border border-white/65 p-6 md:p-8">
            <span className="eyebrow">Capabilities</span>
            <h1 className="mt-5 display-title text-5xl font-semibold text-foreground md:text-6xl">
              Capability page: understand what the platform does and where each task belongs.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
              This route explains the operating model behind the site. It is here to clarify the
              line between public discovery, owner-only controls, and the data workflows that keep a
              large catalog readable over time.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-sm font-semibold text-accent-deep">
              <Link href="/products" className="rounded-full border border-line bg-white/75 px-4 py-2">
                Catalog
              </Link>
              <Link href="/markets" className="rounded-full border border-line bg-white/75 px-4 py-2">
                Markets
              </Link>
              <Link href="/owner-access" className="rounded-full border border-line bg-white/75 px-4 py-2">
                Owner access
              </Link>
            </div>
          </div>

          <div className="market-card-dark rounded-[2.8rem] p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
              Three work zones
            </p>
            <div className="mt-5 grid gap-4">
              {workZones.map((zone) => (
                <article key={zone.title} className="rounded-[1.45rem] border border-white/10 bg-white/10 p-4">
                  <h2 className="text-xl font-semibold text-white">{zone.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-white/74">{zone.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell py-6 md:py-12">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {qualityPillars.map((pillar, index) => (
            <article
              key={pillar.title}
              className={`rounded-[1.8rem] border p-5 shadow-[0_18px_40px_-30px_rgba(23,53,35,0.35)] ${
                index % 2 === 0
                  ? "border-line bg-white/72"
                  : "border-[rgba(214,137,53,0.2)] bg-[rgba(246,213,158,0.3)]"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                {pillar.metric}
              </p>
              <h2 className="mt-4 display-title text-2xl font-semibold text-foreground">
                {pillar.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted">{pillar.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell pb-16">
        <div className="grid gap-5 lg:grid-cols-3">
          {capabilityTracks.map((track) => (
            <article key={track.title} className="panel rounded-[2.2rem] border border-white/65 p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                {track.eyebrow}
              </p>
              <h2 className="mt-4 display-title text-3xl font-semibold text-foreground">
                {track.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted">{track.detail}</p>
              <ul className="mt-5 grid gap-3 text-sm leading-7 text-muted">
                {track.bullets.map((bullet) => (
                  <li key={bullet} className="rounded-[1.2rem] border border-line bg-white/70 px-4 py-3">
                    {bullet}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </MarketingLayout>
  );
}