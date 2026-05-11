// =============================================================================
// /admin/secrets — Trade Secret Vault
// =============================================================================
// CRITICAL: This Server Component is the ONLY non-API surface that joins
// the ManufacturingData relation onto ProductVariant. The chemical formula
// + labour/machine cost columns are the company's most sensitive
// commercial assets.
//
// STRICT RULE — DO NOT:
//   * export this select shape from a public/catalog/RFQ API route
//   * pass `manufacturingData` (or any of its fields) into a serializer used
//     by the public Next.js site or the Flutter client
//   * embed this page inside any layout that is reachable without
//     `requireOwnerSession()`
//
// The parent admin layout enforces the HMAC owner-session check; this page
// re-asserts it for defence in depth.
// =============================================================================

import { requireOwnerSession } from "@/lib/auth";
import { getPrismaClient, isDatabaseConfigured } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminSecretsPage() {
  await requireOwnerSession();

  if (!isDatabaseConfigured()) {
    return (
      <div className="rounded border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        Database is not configured. Set <code>DATABASE_URL</code> and reload.
      </div>
    );
  }

  const prisma = getPrismaClient();

  // === SENSITIVE QUERY ===
  // Joins ManufacturingData into the variant tree. Result must NEVER leave
  // this owner-gated server component.
  const variants = await prisma.productVariant.findMany({
    orderBy: [{ product: { name: "asc" } }, { code: "asc" }],
    include: {
      product: { select: { id: true, name: true, category: true, material: true } },
      manufacturingData: true,
    },
  });

  const withSecrets = variants.filter((v) => v.manufacturingData !== null);
  const withoutSecrets = variants.filter((v) => v.manufacturingData === null);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-wider text-rose-300">
          Owner only · Highly classified
        </p>
        <h1 className="mt-1 display-title text-3xl font-semibold text-white">
          Trade Secret Vault
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-white/70">
          Variant-level chemical formulas and broken-down internal cost. This data
          must never appear in a public API response, the catalog UI, or the Flutter
          client. Anyone who has reached this page has already been verified by the
          owner HMAC session.
        </p>
      </header>

      <section className="overflow-hidden rounded border border-rose-300/40 bg-white">
        <div className="flex items-center justify-between border-b border-rose-300/40 bg-rose-50 px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-rose-900">
            Variants with manufacturing data ({withSecrets.length})
          </p>
        </div>
        <table className="w-full border-collapse text-sm">
          <thead className="bg-[#EDF2F7] text-[11px] font-bold uppercase tracking-wide text-[#1A202C]">
            <tr>
              <th className="border-b border-[#CBD5E0] p-2 text-left">SKU</th>
              <th className="border-b border-[#CBD5E0] p-2 text-left">Product</th>
              <th className="border-b border-[#CBD5E0] p-2 text-left">Material</th>
              <th className="border-b border-[#CBD5E0] p-2 text-left">
                Chemical formula
              </th>
              <th className="border-b border-[#CBD5E0] p-2 text-right">
                Labour USD
              </th>
              <th className="border-b border-[#CBD5E0] p-2 text-right">
                Machine USD
              </th>
              <th className="border-b border-[#CBD5E0] p-2 text-right">
                Total cost USD
              </th>
            </tr>
          </thead>
          <tbody>
            {withSecrets.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-sm text-[#4A5568]">
                  No ManufacturingData rows yet. Seed them via the owner-only admin
                  pipeline.
                </td>
              </tr>
            )}
            {withSecrets.map((v) => {
              const md = v.manufacturingData!;
              const total = md.laborCostUsd + md.machineCostUsd;
              return (
                <tr key={v.id} className="border-b border-[#CBD5E0]">
                  <td className="p-2 font-mono font-bold">{v.code}</td>
                  <td className="p-2">{v.product.name}</td>
                  <td className="p-2 text-[#4A5568]">{v.product.material}</td>
                  <td className="p-2 font-mono text-xs">{md.chemicalFormula}</td>
                  <td className="p-2 text-right">USD {md.laborCostUsd.toFixed(2)}</td>
                  <td className="p-2 text-right">
                    USD {md.machineCostUsd.toFixed(2)}
                  </td>
                  <td className="p-2 text-right font-bold">
                    USD {total.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {withoutSecrets.length > 0 && (
        <section className="rounded border border-[#CBD5E0] bg-white p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#4A5568]">
            Variants without manufacturing data ({withoutSecrets.length})
          </p>
          <p className="mt-1 text-xs text-[#4A5568]">
            These variants ship without recorded chemical formula or cost — add a
            ManufacturingData row to bring them into the vault.
          </p>
          <ul className="mt-3 grid grid-cols-2 gap-1 text-xs lg:grid-cols-4">
            {withoutSecrets.map((v) => (
              <li key={v.id} className="font-mono text-[#1A202C]">
                {v.code}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
