import { formatCurrency, getProductBySlug, ownerProductRecords } from "@/lib/site-data";

export default function AdminCompetitorsPage() {
  return (
    <div className="grid gap-8">
      <section className="admin-surface-card rounded-[2.4rem] p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
          Competitors
        </p>
        <h2 className="mt-4 display-title text-5xl font-semibold text-white">
          Private competitor benchmark pricing
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/72">
          Dummy benchmark entries are grouped here by product and market so the sales side can compare owner price books against regional competitor signals without exposing any of it publicly.
        </p>
      </section>

      <section className="grid gap-6">
        {ownerProductRecords.map((record) => {
          const product = getProductBySlug(record.slug);

          if (!product) {
            return null;
          }

          return (
            <article key={`${record.slug}-benchmarks`} className="admin-surface-card rounded-[2.4rem] p-6 md:p-8">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h3 className="text-2xl font-semibold text-white">{product.name}</h3>
                <span className="admin-chip">{record.competitorBenchmarks.length} benchmarks</span>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {record.competitorBenchmarks.map((benchmark) => (
                  <div
                    key={`${record.slug}-${benchmark.competitor}-${benchmark.market}`}
                    className="admin-deep-card rounded-[1.8rem] p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-white/45">{benchmark.market}</p>
                        <h4 className="mt-2 text-lg font-semibold text-white">{benchmark.competitor}</h4>
                      </div>
                      <p className="admin-metric-value text-sm font-semibold">
                        {formatCurrency(benchmark.unitPrice, benchmark.currency)}
                      </p>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-white/65">{benchmark.note}</p>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}