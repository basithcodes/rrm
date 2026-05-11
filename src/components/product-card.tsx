import Link from "next/link";
import type { Product } from "@/lib/site-data";

export function ProductCard({ product }: { product: Product }) {
  const firstVariant = product.variants[0];

  return (
    <article className="panel group rounded-[1.75rem] p-5 shadow-[0_20px_50px_-36px_rgba(20,33,43,0.45)] transition-transform hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            {product.category}
          </p>
          <h3 className="mt-3 display-title text-3xl font-semibold text-foreground">
            {product.name}
          </h3>
        </div>
        <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-deep">
          {product.material}
        </span>
      </div>

      <p className="mt-4 text-sm leading-7 text-muted">{product.summary}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {product.applications.slice(0, 3).map((application) => (
          <span
            key={application}
            className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-foreground"
          >
            {application}
          </span>
        ))}
      </div>

      <div className="mt-6 rounded-[1.25rem] bg-[#17232d] p-4 text-ink-inverse">
        <p className="text-xs uppercase tracking-[0.18em] text-white/55">Variant preview</p>
        <p className="mt-3 text-sm font-semibold text-white">{firstVariant.code}</p>
        <ul className="mt-3 grid gap-2 text-sm text-white/75">
          {firstVariant.dimensions.map((dimension) => (
            <li key={dimension.label} className="flex items-center justify-between gap-4">
              <span>{dimension.label}</span>
              <span className="font-medium text-white">{dimension.value}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {product.certifications.slice(0, 2).map((certification) => (
          <span
            key={certification}
            className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-foreground"
          >
            {certification}
          </span>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            RFQ pricing only
          </p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent-deep">
            3D demo ready • {product.standardLeadTimeDays}-day lead time
          </p>
        </div>
        <Link
          href={`/products/${product.slug}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-accent-deep"
        >
          View details
          <span aria-hidden>→</span>
        </Link>
      </div>
    </article>
  );
}