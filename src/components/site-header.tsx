import Link from "next/link";

const navigation = [
  { href: "/products", label: "Products" },
  { href: "/industries", label: "Industries" },
  { href: "/rfq", label: "RFQ" },
];

export function SiteHeader() {
  return (
    <header className="section-shell sticky top-0 z-30 py-5">
      <div className="panel flex items-center justify-between rounded-full px-5 py-3 shadow-[0_12px_40px_-28px_rgba(20,33,43,0.45)]">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#17232d] text-sm font-semibold text-ink-inverse">
            RRM
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">RRM Industrial Rubber</p>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              UAE, Saudi, Oman, Qatar
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted md:flex">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/owner-access"
            className="hidden rounded-full border border-line px-4 py-2 text-sm font-semibold text-foreground sm:inline-flex"
          >
            Owner Access
          </Link>
          <Link
            href="/rfq"
            className="inline-flex rounded-full bg-accent px-4 py-2 text-sm font-semibold text-ink-inverse"
          >
            Request Quote
          </Link>
        </div>
      </div>
    </header>
  );
}