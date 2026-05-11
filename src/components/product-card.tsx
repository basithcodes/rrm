import Link from "next/link";
import type { Product } from "@/lib/site-data";

export function ProductCard({
  product,
  footerExtras,
}: {
  product: Product;
  footerExtras?: React.ReactNode;
}) {
  const firstVariant = product.variants[0];
  const primarySupplyFormat = product.supplyFormats[0] ?? "Custom quote";

  return (
    <article className="panel group overflow-hidden rounded-[2.25rem] border border-white/65 transition-transform duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4 px-6 py-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            {product.category}
          </p>
          <h3 className="mt-3 display-title text-3xl font-semibold text-foreground">
            {product.name}
          </h3>
        </div>
        <span className="rounded-full border border-[rgba(214,137,53,0.28)] bg-accent-warm-soft px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent-berry">
          {product.material}
        </span>
      </div>

      <div className="produce-divider" />

      <div className="px-6 py-5">
        <p className="text-sm leading-7 text-muted">{product.summary}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {product.applications.slice(0, 3).map((application) => (
            <span
              key={application}
              className="rounded-full border border-line bg-white/70 px-3 py-1 text-xs font-semibold text-foreground"
            >
              {application}
            </span>
          ))}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.2rem] border border-line bg-white/72 px-4 py-4">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted">
              Variants
            </p>
            <p className="mt-2 text-xl font-semibold text-foreground">{product.variants.length}</p>
          </div>
          <div className="rounded-[1.2rem] border border-line bg-white/72 px-4 py-4">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted">
              Lead time
            </p>
            <p className="mt-2 text-xl font-semibold text-foreground">
              {product.standardLeadTimeDays} days
            </p>
          </div>
          <div className="rounded-[1.2rem] border border-line bg-white/72 px-4 py-4">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted">
              Supply format
            </p>
            <p className="mt-2 text-base font-semibold text-foreground">{primarySupplyFormat}</p>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="market-card-dark rounded-[1.85rem] p-5">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
              Quick spec check
            </p>
            <span className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/80">
              MOQ {firstVariant.minimumOrderQuantity}
            </span>
          </div>
          <p className="mt-3 text-lg font-semibold text-white">{firstVariant.code}</p>
          <p className="mt-2 text-sm leading-6 text-white/72">{firstVariant.description}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {firstVariant.dimensions.map((dimension) => (
              <div
                key={dimension.label}
                className="rounded-[1.2rem] border border-white/10 bg-white/10 px-3 py-3"
              >
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/58">
                  {dimension.label}
                </p>
                <p className="mt-2 text-sm font-semibold text-white">{dimension.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {product.certifications.slice(0, 2).map((certification) => (
            <span
              key={certification}
              className="rounded-full border border-line bg-white/70 px-3 py-1 text-xs font-semibold text-foreground"
            >
              {certification}
            </span>
          ))}
          {product.industries.slice(0, 2).map((industry) => (
            <span
              key={industry}
              className="rounded-full border border-line bg-[rgba(222,240,204,0.58)] px-3 py-1 text-xs font-semibold text-accent-deep"
            >
              {industry}
            </span>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Built for quote-first buying
            </p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent-deep">
              3D demo ready · {product.standardLeadTimeDays}-day lead time
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            {footerExtras ? <div className="flex flex-wrap gap-2 sm:justify-end">{footerExtras}</div> : null}
            <Link
              href={`/products/${product.slug}`}
              className="brand-button inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold"
            >
              View details
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}