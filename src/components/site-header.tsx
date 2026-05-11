"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getCatalogAisles, getPublicNavigationGroups } from "@/lib/public-site";

const marketTags = ["UAE", "Saudi", "Oman", "Qatar"];
const browseLanes = getCatalogAisles()
  .slice(0, 5)
  .map((lane) => lane.category);

function isRouteActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const navigationGroups = getPublicNavigationGroups();

  return (
    <header className="section-shell sticky top-0 z-30 py-4">
      <div className="panel overflow-hidden rounded-[2.2rem] border border-white/65 shadow-[0_22px_54px_-38px_rgba(23,53,35,0.55)]">
        <div className="flex flex-col gap-3 border-b border-line px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-accent-deep">
            <span className="sm:hidden">Organized industrial catalog</span>
            <span className="hidden sm:inline">Organized industrial catalog for GCC procurement teams</span>
          </p>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
            {marketTags.map((market) => (
              <span key={market} className="market-stamp shrink-0">
                {market}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="flex items-start gap-3 sm:items-center sm:gap-4">
            <span className="brand-mark flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.1rem] text-base font-semibold sm:h-14 sm:w-14 sm:rounded-[1.35rem] sm:text-lg">
              RRM
            </span>
            <div className="min-w-0">
              <p className="text-base font-semibold text-foreground sm:text-lg">RRM Industrial Rubber</p>
              <p className="mt-1 max-w-md text-sm leading-5 text-muted sm:leading-6">
                Route-first catalog, material guidance, and RFQ-first ordering for GCC buyers.
              </p>
            </div>
          </Link>

          <div className="flex flex-col gap-3 lg:max-w-md lg:items-end">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
              <Link
                href="/owner-access"
                className="inline-flex w-full items-center justify-center rounded-full border border-line bg-white/75 px-4 py-2 text-sm font-semibold text-foreground sm:w-auto"
              >
                Owner Access
              </Link>
              <Link
                href="/rfq"
                className="brand-button inline-flex w-full items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold sm:w-auto"
              >
                Request Quote
              </Link>
            </div>

            <p className="max-w-md text-sm leading-6 text-muted lg:text-right">
              The site is grouped by decision type so buyers can move from route selection into the right working page without scanning every link.
            </p>
          </div>
        </div>

        <div className="border-t border-line px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-accent-deep">
                Site directory
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                Routes are grouped by the decision they solve first: browse the part family, compare compounds, review market context, understand platform scope, then hand off through RFQ.
              </p>
            </div>
            <Link href="/rfq" className="text-sm font-semibold text-accent-deep">
              Need a quote instead?
            </Link>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-4">
            {navigationGroups.map((group) => (
              <section
                key={group.section}
                className="rounded-[1.6rem] border border-line bg-white/76 px-4 py-4"
              >
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted">
                  {group.section}
                </p>
                <div className="mt-3 grid gap-2">
                  {group.items.map((item) => {
                    const active = isRouteActive(pathname, item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`rounded-[1.2rem] border px-3 py-3 transition-colors ${
                          active
                            ? "border-accent bg-[rgba(222,240,204,0.74)]"
                            : "border-line bg-white/80 hover:border-accent hover:bg-[rgba(222,240,204,0.7)]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{item.label}</p>
                            <p className="mt-1 text-xs leading-5 text-muted">{item.description}</p>
                          </div>
                          <span className="market-stamp">{item.badge}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-line px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-accent-deep">
            Popular catalog lanes
          </p>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
            {browseLanes.map((lane) => (
              <Link
                key={lane}
                href={`/products?category=${encodeURIComponent(lane)}`}
                className="shrink-0 rounded-full border border-line bg-white/72 px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-accent hover:bg-[rgba(222,240,204,0.7)]"
              >
                {lane}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}