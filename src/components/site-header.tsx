import Link from "next/link";

const navigation = [
  { href: "/products", label: "Products" },
  { href: "/industries", label: "Industries" },
  { href: "/rfq", label: "RFQ" },
];

const marketTags = ["UAE", "Saudi", "Oman", "Qatar"];

export function SiteHeader() {
  return (
    <header className="section-shell sticky top-0 z-30 py-4">
      <div className="panel overflow-hidden rounded-[2.2rem] border border-white/65 shadow-[0_22px_54px_-38px_rgba(23,53,35,0.55)]">
        <div className="flex flex-col gap-3 border-b border-line px-5 py-3 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-accent-deep">
            Fresh-market inspiration for a cleaner industrial catalog
          </p>
          <div className="flex flex-wrap gap-2">
            {marketTags.map((market) => (
              <span key={market} className="market-stamp">
                {market}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-[1.35rem] bg-[linear-gradient(160deg,#2f7d3a_0%,#1c5428_100%)] text-lg font-semibold text-ink-inverse shadow-[0_18px_34px_-18px_rgba(28,84,40,0.8)]">
              RRM
            </span>
            <div>
              <p className="text-lg font-semibold text-foreground">RRM Industrial Rubber</p>
              <p className="mt-1 max-w-md text-sm leading-6 text-muted">
                Catalog aisles, dimensional detail, and RFQ-first ordering for GCC buyers.
              </p>
            </div>
          </Link>

          <div className="flex flex-col gap-4 lg:items-end">
            <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-line bg-white/70 px-4 py-2 transition-colors hover:border-accent hover:bg-[rgba(222,240,204,0.7)]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/owner-access"
                className="inline-flex rounded-full border border-line bg-white/75 px-4 py-2 text-sm font-semibold text-foreground"
              >
                Owner Access
              </Link>
              <Link
                href="/rfq"
                className="inline-flex rounded-full bg-[linear-gradient(135deg,#2f7d3a_0%,#1c5428_100%)] px-5 py-2.5 text-sm font-semibold text-ink-inverse shadow-[0_18px_32px_-20px_rgba(28,84,40,0.8)]"
              >
                Request Quote
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}