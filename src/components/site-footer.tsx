import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="section-shell py-10 md:py-14">
      <div className="panel rounded-[2rem] px-6 py-8 md:px-8">
        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              RRM Industrial Rubber
            </p>
            <h2 className="mt-4 display-title max-w-2xl text-3xl font-semibold text-foreground md:text-4xl">
              Professional product presentation outside, protected manufacturing intelligence inside.
            </h2>
          </div>
          <div className="grid gap-3 text-sm text-muted md:justify-items-end">
            <Link href="/products" className="hover:text-foreground">
              Browse products
            </Link>
            <Link href="/industries" className="hover:text-foreground">
              Explore industries
            </Link>
            <Link href="/rfq" className="hover:text-foreground">
              Start an RFQ
            </Link>
            <Link href="/owner-access" className="hover:text-foreground">
              Owner workspace
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}