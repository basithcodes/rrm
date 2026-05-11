import { formatCurrency, getProductBySlug, ownerProductRecords } from "@/lib/site-data";

export default function AdminSourcingPage() {
  return (
    <div className="grid gap-8">
      <section className="admin-surface-card rounded-[2.4rem] p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
          Sourcing
        </p>
        <h2 className="mt-4 display-title text-5xl font-semibold text-white">
          Raw materials, suppliers, origins, and landed costs
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/72">
          This page keeps the dummy owner-only sourcing layer together: what raw material is used, where it comes from, how it is sourced, how much it costs, and how long it takes to arrive.
        </p>
      </section>

      <section className="grid gap-6">
        {ownerProductRecords.map((record) => {
          const product = getProductBySlug(record.slug);

          if (!product) {
            return null;
          }

          return (
            <article key={record.slug} className="admin-surface-card rounded-[2.4rem] p-6 md:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">{product.material}</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">{product.name}</h3>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65">{record.priceBookNotes}</p>
                </div>
                <span className="admin-chip">
                  {record.rawMaterials.length} materials
                </span>
              </div>

              <div className="mt-6 overflow-x-auto rounded-[1.8rem] border border-white/10 bg-[rgba(7,15,10,0.42)]">
                <table className="min-w-full border-collapse text-left text-sm">
                  <thead className="bg-white/5 text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                    <tr>
                      <th className="px-4 py-3">Material</th>
                      <th className="px-4 py-3">Percentage</th>
                      <th className="px-4 py-3">Supplier</th>
                      <th className="px-4 py-3">Origin</th>
                      <th className="px-4 py-3">Source type</th>
                      <th className="px-4 py-3">Landed cost</th>
                      <th className="px-4 py-3">Lead time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.rawMaterials.map((material) => (
                      <tr key={`${record.slug}-${material.name}`} className="border-t border-white/10 align-top text-white/75">
                        <td className="px-4 py-4 font-semibold text-white">{material.name}</td>
                        <td className="px-4 py-4">{material.percentage}</td>
                        <td className="px-4 py-4">{material.supplier}</td>
                        <td className="px-4 py-4">{material.origin}</td>
                        <td className="px-4 py-4">{material.sourceType}</td>
                        <td className="px-4 py-4">
                          {formatCurrency(material.landedCostUsdPerKg, "USD")}/kg
                        </td>
                        <td className="px-4 py-4">{material.leadTimeDays} days</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="mt-5 grid gap-2 rounded-[1.4rem] border border-white/8 bg-[rgba(255,255,255,0.03)] p-4 text-sm leading-7 text-white/65">
                {record.sourcingNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </article>
          );
        })}
      </section>
    </div>
  );
}