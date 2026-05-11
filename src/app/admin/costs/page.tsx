import { formatCurrency, getTotalInternalCosts, internalCostBuckets, ownerProductRecords } from "@/lib/site-data";

export default function AdminCostsPage() {
  const totalInternalCosts = getTotalInternalCosts();

  return (
    <div className="grid gap-8">
      <section className="admin-surface-card rounded-[2.4rem] p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
              Costs
            </p>
            <h2 className="mt-4 display-title text-5xl font-semibold text-white">
              Rent, electricity, labor, maintenance, and reserve planning
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/72">
              Dummy owner-only cost data is now separated from the dashboard so overhead assumptions can be reviewed without mixing them into the public product pages.
            </p>
          </div>
          <div className="admin-deep-card rounded-[1.7rem] px-5 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/45">Monthly total</p>
            <p className="admin-metric-value mt-2 text-2xl font-semibold">
              {formatCurrency(totalInternalCosts, "USD")}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="admin-surface-card rounded-[2.4rem] p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
            Overhead buckets
          </p>
          <div className="mt-6 grid gap-4">
            {internalCostBuckets.map((bucket) => (
              <article key={bucket.title} className="admin-deep-card rounded-[1.8rem] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{bucket.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-white/65">{bucket.note}</p>
                  </div>
                  <p className="admin-metric-value text-sm font-semibold">
                    {formatCurrency(bucket.monthlyUsd, "USD")}
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white/65">
                    {bucket.costCenter}
                  </span>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white/65">
                    {bucket.allocationBasis}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="admin-surface-card rounded-[2.4rem] p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
            Product cost allocation
          </p>
          <div className="mt-6 grid gap-4">
            {ownerProductRecords.map((record) => (
              <article key={record.slug} className="admin-deep-card rounded-[1.8rem] p-5">
                <h3 className="text-lg font-semibold text-white">{record.slug}</h3>
                <div className="mt-4 grid gap-3">
                  {record.overheadAllocation.map((allocation) => (
                    <div
                      key={`${record.slug}-${allocation.label}`}
                      className="flex items-start justify-between gap-4 rounded-[1rem] border border-white/10 px-4 py-3"
                    >
                      <div>
                        <p className="font-semibold text-white">{allocation.label}</p>
                        <p className="mt-1 text-sm leading-6 text-white/65">{allocation.allocationBasis}</p>
                      </div>
                      <p className="admin-metric-value text-sm font-semibold">
                        {formatCurrency(allocation.monthlyUsd, "USD")}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}