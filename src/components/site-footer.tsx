import Link from "next/link";

const footerLinks = [
  { href: "/products", label: "Browse products" },
  { href: "/industries", label: "Explore industries" },
  { href: "/rfq", label: "Start an RFQ" },
  { href: "/owner-access", label: "Owner workspace" },
];

const markets = ["UAE", "Saudi Arabia", "Oman", "Qatar"];

export function SiteFooter() {
  return (
    <footer className="section-shell py-12 md:py-16">
      <div className="panel overflow-hidden rounded-[2.75rem] border border-white/65">
        <div className="grid gap-8 px-6 py-8 md:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <span className="eyebrow">Market board finish</span>
            <h2 className="mt-5 display-title max-w-3xl text-4xl font-semibold text-foreground md:text-5xl">
              A fresher storefront for serious industrial buying.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted md:text-base">
              The public experience now behaves more like a clean produce market: strong sections,
              clear labels, visible grades, and a simple path from browsing to order sheet.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex rounded-full bg-[linear-gradient(135deg,#2f7d3a_0%,#1c5428_100%)] px-5 py-3 text-sm font-semibold text-ink-inverse"
              >
                Browse catalog
              </Link>
              <Link
                href="/rfq"
                className="inline-flex rounded-full border border-line bg-white/80 px-5 py-3 text-sm font-semibold text-foreground"
              >
                Send RFQ
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="market-card-dark rounded-[2rem] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                Operating markets
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {markets.map((market) => (
                  <span
                    key={market}
                    className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/80"
                  >
                    {market}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm leading-7 text-white/78">
                GCC-facing support for automotive, industrial equipment, building systems, and
                maintenance procurement teams.
              </p>
            </div>

            <div className="grid gap-3 rounded-[2rem] border border-line bg-white/55 p-6 text-sm text-muted sm:grid-cols-2">
              {footerLinks.map((item) => (
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