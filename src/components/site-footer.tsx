import Link from "next/link";
import { marketProfiles, publicFooterLinks } from "@/lib/public-site";

export function SiteFooter() {
  return (
    <footer className="section-shell py-12 md:py-16">
      <div className="panel overflow-hidden rounded-[2.75rem] border border-white/65">
        <div className="grid gap-8 px-6 py-8 md:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <span className="eyebrow">Market board finish</span>
            <h2 className="mt-5 display-title max-w-3xl text-4xl font-semibold text-foreground md:text-5xl">
              A cleaner route map for serious industrial buying.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted md:text-base">
              Each page now does one job: catalog discovery, industry fit, material guidance,
              market context, platform capabilities, or RFQ handoff.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="brand-button inline-flex rounded-full px-5 py-3 text-sm font-semibold"
              >
                Browse catalog
              </Link>
              <Link
                href="/materials"
                className="inline-flex rounded-full border border-line bg-white/80 px-5 py-3 text-sm font-semibold text-foreground"
              >
                Compare materials
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="market-card-dark rounded-[2rem] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                Operating markets
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {marketProfiles.map((market) => (
                  <span
                    key={market.name}
                    className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/80"
                  >
                    {market.name}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm leading-7 text-white/78">
                GCC-facing support for automotive, industrial equipment, building systems, and
                maintenance procurement teams.
              </p>
            </div>

            <div className="grid gap-3 rounded-[2rem] border border-line bg-white/55 p-6 text-sm text-muted sm:grid-cols-2 lg:grid-cols-3">
              {publicFooterLinks.map((item) => (
                <Link key={item.href} href={item.href} className="font-medium hover:text-foreground">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}