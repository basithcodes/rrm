import Link from "next/link";
import { formatCurrency } from "@/lib/site-data";
import { getOwnerDashboardPayload } from "@/lib/api-data";

export default async function AdminDashboardPage() {
  const payload = await getOwnerDashboardPayload();
  const { dashboard: ownerDashboard, internalCostBuckets, keyCustomers, ownerProductRecords, products, recentRfqs } = payload;
  const totalInternalCosts = internalCostBuckets.reduce(
    (sum, bucket) => sum + Number(bucket.monthlyUsd),
    0,
  );
  const totalVariantCount = products.reduce((total, product) => total + product.variants.length, 0);
  const totalRawMaterials = ownerProductRecords.reduce(
    (total, record) => total + record.rawMaterials.length,
    0,
  );
  const totalCompetitorBenchmarks = ownerProductRecords.reduce(
    (total, record) => total + record.competitorBenchmarks.length,
    0,
  );

  const adminModules = [
    {
      href: "/admin/pricing",
      title: "Pricing",
      detail: "Owner-only regional prices, variant price matrices, and internal price-book notes.",
      stat: `${totalVariantCount} variant prices`,
    },
    {
      href: "/admin/costs",
      title: "Costs",
      detail: "Monthly overhead for rent, labor, electricity, maintenance, and equipment reserve.",
      stat: formatCurrency(totalInternalCosts, "USD"),
    },
    {
      href: "/admin/sourcing",
      title: "Sourcing",
      detail: "Raw materials, suppliers, origin countries, landed costs, and sourcing notes.",
      stat: `${totalRawMaterials} raw material lines`,
    },
    {
      href: "/admin/manufacturing",
      title: "Manufacturing",
      detail: "Compound codes, cure systems, batch sizes, output, scrap, and QA checks.",
      stat: `${ownerDashboard.protectedManufacturingRecords} protected records`,
    },
    {
      href: "/admin/competitors",
      title: "Competitors",
      detail: "Dummy benchmark pricing by market for comparable products.",
      stat: `${totalCompetitorBenchmarks} benchmark entries`,
    },
    {
      href: "/admin/imports",
      title: "Imports",
      detail: "CSV template, owner-only columns, and normalized import preview for the expanded dataset.",
      stat: "Extended CSV template",
    },
  ];

  return (
    <div className="grid gap-8">
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="admin-surface-card rounded-[2.4rem] p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
            Dashboard
          </p>
          <h2 className="mt-4 display-title text-5xl font-semibold text-white">
            A cleaner back-room dashboard for pricing, sourcing, and protected records.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72">
            This area is server-side gated before render. It is the right place to keep internal price books, chemistry notes, competitor records, and RFQ handling logic out of the public experience.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="admin-chip">Private price books</span>
            <span className="admin-chip">Protected manufacturing</span>
            <span className="admin-chip">RFQ queue</span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
          <article className="admin-deep-card rounded-[1.8rem] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-white/55">Open RFQs</p>
            <p className="admin-metric-value mt-3 text-4xl font-semibold">{ownerDashboard.pendingRfqs}</p>
          </article>
          <article className="admin-deep-card rounded-[1.8rem] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-white/55">Active customers</p>
            <p className="admin-metric-value mt-3 text-4xl font-semibold">{ownerDashboard.activeCustomers}</p>
          </article>
          <article className="admin-deep-card rounded-[1.8rem] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-white/55">Cataloged variants</p>
            <p className="admin-metric-value mt-3 text-4xl font-semibold">{ownerDashboard.catalogedVariants}</p>
          </article>
          <article className="admin-deep-card rounded-[1.8rem] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-white/55">Protected records</p>
            <p className="admin-metric-value mt-3 text-4xl font-semibold">
              {ownerDashboard.protectedManufacturingRecords}
            </p>
          </article>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="admin-surface-card rounded-[2.4rem] p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
            Owner modules
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {adminModules.map((module) => (
              <Link
                key={module.href}
                href={module.href}
                className="admin-deep-card rounded-[1.8rem] p-5 transition hover:border-[rgba(246,213,158,0.28)] hover:bg-[rgba(246,213,158,0.06)]"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">{module.stat}</p>
                <h3 className="mt-3 text-xl font-semibold text-white">{module.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/65">{module.detail}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="admin-surface-card rounded-[2.4rem] p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
            Workspace summary
          </p>
          <div className="mt-6 grid gap-4">
            <article className="admin-deep-card rounded-[1.8rem] p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">Catalog overview</p>
              <h3 className="mt-3 text-xl font-semibold text-white">{products.length} products in dummy catalog</h3>
              <p className="mt-3 text-sm leading-7 text-white/65">
                The product seed layer now includes dimensions, supply formats, technical profiles, and 3D preview metadata.
              </p>
            </article>
            <article className="admin-deep-card rounded-[1.8rem] p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">Cost summary</p>
              <h3 className="mt-3 text-xl font-semibold text-white">
                {formatCurrency(totalInternalCosts, "USD")} monthly owner-only overhead
              </h3>
              <p className="mt-3 text-sm leading-7 text-white/65">
                Rent, electricity, labor, maintenance, and equipment reserve are now split out into their own cost page.
              </p>
            </article>
            <article className="admin-deep-card rounded-[1.8rem] p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">Import status</p>
              <h3 className="mt-3 text-xl font-semibold text-white">Extended CSV import template ready</h3>
              <p className="mt-3 text-sm leading-7 text-white/65">
                The import helper now supports owner-only columns for sourcing, process records, QA, and competitor benchmarks.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="admin-surface-card rounded-[2.4rem] p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
            Recent RFQ queue
          </p>
          <div className="mt-6 grid gap-4">
            {recentRfqs.map((rfq, index) => (
              <article key={rfq.reference} className="admin-deep-card rounded-[1.8rem] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                      Queue item {index + 1} · {rfq.reference}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-white">{rfq.company}</h3>
                    <p className="mt-2 text-sm leading-7 text-white/65">{rfq.requestedProduct}</p>
                  </div>
                  <span className="admin-chip">
                    {rfq.status}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white/65">
                    {rfq.market}
                  </span>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white/65">
                    {rfq.quantity}
                  </span>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white/65">
                    {rfq.source}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="admin-surface-card rounded-[2.4rem] p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
            Customer pipeline snapshot
          </p>
          <div className="mt-6 grid gap-4">
            {keyCustomers.map((customer) => (
              <article key={customer.company} className="admin-deep-card rounded-[1.8rem] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{customer.company}</h3>
                    <p className="mt-2 text-sm leading-7 text-white/65">{customer.demand}</p>
                  </div>
                  <span className="admin-chip">
                    {customer.relationship}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white/65">
                    {customer.segment}
                  </span>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white/65">
                    {customer.market}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}