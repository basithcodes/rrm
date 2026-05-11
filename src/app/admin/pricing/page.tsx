import { formatCurrency, ownerProductRecords, products } from "@/lib/site-data";

export default function AdminPricingPage() {
  return (
    <div className="grid gap-8">
      <section className="admin-surface-card rounded-[2.4rem] p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
          Pricing
        </p>
        <h2 className="mt-4 display-title text-5xl font-semibold text-white">
          Owner-only regional price books
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/72">
          Dummy variant prices are tracked in AED, SAR, OMR, QAR, and USD. Public pages stay quote-first while this workspace keeps the full internal matrix and price-book notes.
        </p>
      </section>

      <section className="grid gap-6">
        {products.map((product) => {
          const ownerRecord = ownerProductRecords.find((record) => record.slug === product.slug);

          return (
            <article key={product.slug} className="admin-surface-card rounded-[2.4rem] p-6 md:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">{product.category}</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">{product.name}</h3>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65">
                    {ownerRecord?.priceBookNotes ?? "Price-book notes not available."}
                  </p>
                </div>
                <span className="admin-chip">
                  {product.variants.length} variants
                </span>
              </div>

              <div className="admin-table-surface mt-6 overflow-x-auto rounded-[1.8rem] border border-white/10">
                <table className="min-w-full border-collapse text-left text-sm">
                  <thead className="bg-white/5 text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                    <tr>
                      <th className="px-4 py-3">Variant</th>
                      <th className="px-4 py-3">Dimensions</th>
                      <th className="px-4 py-3">MOQ</th>
                      <th className="px-4 py-3">AED</th>
                      <th className="px-4 py-3">SAR</th>
                      <th className="px-4 py-3">OMR</th>
                      <th className="px-4 py-3">QAR</th>
                      <th className="px-4 py-3">USD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.variants.map((variant) => (
                      <tr key={variant.code} className="border-t border-white/10 align-top text-white/75">
                        <td className="px-4 py-4 font-semibold text-white">{variant.code}</td>
                        <td className="px-4 py-4">
                          <ul className="grid gap-1 text-xs leading-6">
                            {variant.dimensions.map((dimension) => (
                              <li key={dimension.label}>
                                {dimension.label}: {dimension.value}
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td className="px-4 py-4 font-semibold text-white">{variant.minimumOrderQuantity}</td>
                        <td className="px-4 py-4">{formatCurrency(variant.priceBook.AED, "AED")}</td>
                        <td className="px-4 py-4">{formatCurrency(variant.priceBook.SAR, "SAR")}</td>
                        <td className="px-4 py-4">{formatCurrency(variant.priceBook.OMR, "OMR")}</td>
                        <td className="px-4 py-4">{formatCurrency(variant.priceBook.QAR, "QAR")}</td>
                        <td className="px-4 py-4">{formatCurrency(variant.priceBook.USD, "USD")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}