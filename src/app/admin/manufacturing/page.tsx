import { formatCurrency, getProductBySlug, ownerProductRecords } from "@/lib/site-data";

export default function AdminManufacturingPage() {
  return (
    <div className="grid gap-8">
      <section className="admin-surface-card rounded-[2.4rem] p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
          Manufacturing
        </p>
        <h2 className="mt-4 display-title text-5xl font-semibold text-white">
          Compound, cure, batch, output, and QA dummy records
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/72">
          This is the owner-only process view for how products are made. It keeps compound codes, cure systems, batch sizes, output assumptions, scrap, and QA checks out of the public catalog.
        </p>
      </section>

      <section className="grid gap-6">
        {ownerProductRecords.map((record) => {
          const product = getProductBySlug(record.slug);

          if (!product) {
            return null;
          }

          return (
            <article key={`${record.slug}-manufacturing`} className="admin-surface-card rounded-[2.4rem] p-6 md:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">{record.process.compoundCode}</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">{product.name}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/65">{record.process.cureSystem}</p>
                </div>
                <span className="admin-chip">
                  Scrap rate {record.process.scrapRate}
                </span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-4">
                <div className="admin-deep-card rounded-[1.2rem] px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Batch size</p>
                  <p className="mt-2 font-semibold text-white">{record.process.batchSizeKg} kg</p>
                </div>
                <div className="admin-deep-card rounded-[1.2rem] px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Monthly output</p>
                  <p className="mt-2 font-semibold text-white">{record.process.monthlyOutputKg} kg</p>
                </div>
                <div className="admin-deep-card rounded-[1.2rem] px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Raw materials</p>
                  <p className="mt-2 font-semibold text-white">{record.rawMaterials.length} lines</p>
                </div>
                <div className="admin-deep-card rounded-[1.2rem] px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Allocated overhead</p>
                  <p className="admin-metric-value mt-2 font-semibold">
                    {formatCurrency(
                      record.overheadAllocation.reduce((total, item) => total + item.monthlyUsd, 0),
                      "USD",
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="admin-deep-card rounded-[1.8rem] p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">QA checks</p>
                  <ul className="mt-4 grid gap-2 text-sm leading-7 text-white/65">
                    {record.process.qaChecks.map((check) => (
                      <li key={check}>{check}</li>
                    ))}
                  </ul>
                </div>
                <div className="admin-deep-card rounded-[1.8rem] p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Raw material ratio snapshot</p>
                  <div className="mt-4 grid gap-3">
                    {record.rawMaterials.map((material) => (
                      <div
                        key={`${record.slug}-${material.name}-ratio`}
                        className="flex items-center justify-between gap-4 rounded-[1rem] border border-white/10 px-4 py-3"
                      >
                        <div>
                          <p className="font-semibold text-white">{material.name}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/45">
                            {material.supplier}
                          </p>
                        </div>
                        <p className="admin-metric-value text-sm font-semibold">{material.percentage}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}