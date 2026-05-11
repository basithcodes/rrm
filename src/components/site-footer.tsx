import Link from "next/link";
import { getPublicNavigationGroups, marketProfiles, publicNavigation } from "@/lib/public-site";

export function SiteFooter() {
  const footerRoutes = publicNavigation.slice(0, 4);
  const navigationGroups = getPublicNavigationGroups({ includeActions: true });

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
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {footerRoutes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className="rounded-[1.55rem] border border-line bg-white/76 px-4 py-4 transition-transform hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted">
                        {route.section}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-foreground">{route.label}</h3>
                    </div>
                    <span className="market-stamp">{route.badge}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted">{route.description}</p>
                </Link>
              ))}
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

            <div className="grid gap-3 rounded-[2rem] border border-line bg-white/55 p-6 sm:grid-cols-2 lg:grid-cols-3">
              {navigationGroups.map((group) => (
                <section
                  key={group.section}
                  className="rounded-[1.5rem] border border-line bg-white/72 p-4"
                >
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted">
                    {group.section}
                  </p>
                  <div className="mt-3 grid gap-2">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="rounded-[1rem] border border-transparent px-3 py-2 text-sm transition-colors hover:border-line hover:bg-white/85"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-foreground">{item.label}</p>
                            <p className="mt-1 text-xs leading-5 text-muted">{item.description}</p>
                          </div>
                          <span className="market-stamp">{item.badge}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}