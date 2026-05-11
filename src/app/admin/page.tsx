import Link from "next/link";
import { formatCurrency } from "@/lib/site-data";
import { getOwnerDashboardPayload } from "@/lib/api-data";

// =====================================================================
// Industrial Owner Dashboard
// ---------------------------------------------------------------------
// Aesthetic per spec:
//   * No floating cards, no shadows, no gradients.
//   * Information density first — KPIs render as a single-line list,
//     RFQs/customers render as native HTML <table>s with p-1/p-2 cells.
//   * Header strip is a status bar, not a hero block.
// =====================================================================

export default async function AdminDashboardPage() {
  const payload = await getOwnerDashboardPayload();
  const { dashboard, keyCustomers, recentRfqs, summary } = payload;

  const monthlyInternalCosts = Number(summary.monthlyInternalCosts);

  // Single-line KPI readouts — label / value / detail. Rendered as a
  // bordered <table> so columns line up vertically across the whole list.
  const kpis: Array<{ label: string; value: string; detail: string }> = [
    {
      label: "Server status",
      value: "ONLINE",
      detail: `Catalog ${summary.catalogMode} · Cost ${summary.costMode} · Import ${summary.importMode}`,
    },
    {
      label: "Active RFQs",
      value: String(dashboard.pendingRfqs),
      detail: "Awaiting owner follow-up",
    },
    {
      label: "Active customers",
      value: String(dashboard.activeCustomers),
      detail: "Live customer entities",
    },
    {
      label: "Cataloged variants",
      value: String(dashboard.catalogedVariants),
      detail: `${summary.productFamilies} parent products`,
    },
    {
      label: "Protected records",
      value: String(dashboard.protectedManufacturingRecords),
      detail: "Behind owner gate",
    },
    {
      label: "Monthly owner overhead",
      value: formatCurrency(monthlyInternalCosts, "USD"),
      detail: "Sum of internal cost buckets",
    },
    {
      label: "Raw material lines",
      value: String(summary.totalRawMaterialLines),
      detail: "Sourcing entries on file",
    },
    {
      label: "Competitor benchmarks",
      value: String(summary.totalCompetitorBenchmarks),
      detail: "Internal-only price comparisons",
    },
    {
      label: "Latest import",
      value: summary.importMode === "live" ? "Live batch" : "Template",
      detail: summary.latestImportTitle,
    },
  ];

  return (
    <div className="space-y-2">
      {/* ============================================================
          STATUS BAR — single tight strip, replaces the previous hero.
          ============================================================ */}
      <header className="flex items-center justify-between border border-[#CBD5E0] bg-white px-3 py-1.5">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-2 w-2 rounded-full bg-[#2F855A]" aria-hidden />
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#1A202C]">
            Owner Dashboard
          </p>
          <p className="text-[11px] text-[#4A5568]">
            Catalog: <span className="font-bold text-[#1A202C]">{summary.catalogMode}</span>
            {" · "}Cost: <span className="font-bold text-[#1A202C]">{summary.costMode}</span>
            {" · "}Import: <span className="font-bold text-[#1A202C]">{summary.importMode}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/rfqs"
            className="rounded border border-[#CBD5E0] bg-white px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#1A202C] hover:bg-[#EDF2F7]"
          >
            RFQ Pipeline
          </Link>
          <Link
            href="/admin/imports"
            className="rounded bg-[#2F855A] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white hover:bg-[#276749]"
          >
            Import Catalog
          </Link>
        </div>
      </header>

      {/* ============================================================
          KPI READOUT — dense single-line list. No card padding, no
          floating boxes. Values right-aligned for fast scanning.
          ============================================================ */}
      <section className="border border-[#CBD5E0] bg-white">
        <div className="border-b border-[#CBD5E0] bg-[#EDF2F7] px-2 py-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A202C]">
            Key performance indicators
          </p>
        </div>
        <table className="w-full border-collapse text-[12px]">
          <tbody>
            {kpis.map((row) => (
              <tr key={row.label} className="border-b border-[#EDF2F7] last:border-b-0">
                <th
                  scope="row"
                  className="w-56 p-1 text-left text-[11px] font-semibold uppercase tracking-wider text-[#4A5568]"
                >
                  {row.label}
                </th>
                <td className="w-44 p-1 text-right font-mono font-bold text-[#1A202C]">
                  {row.value}
                </td>
                <td className="p-1 text-[#4A5568]">{row.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ============================================================
          RECENT RFQ QUEUE — compact data table (no scrolling cards).
          ============================================================ */}
      <section className="border border-[#CBD5E0] bg-white">
        <div className="flex items-center justify-between border-b border-[#CBD5E0] bg-[#EDF2F7] px-2 py-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A202C]">
            Recent RFQ queue
          </p>
          <Link
            href="/admin/rfqs"
            className="text-[11px] font-bold uppercase tracking-wider text-[#2F855A] hover:underline"
          >
            Open pipeline →
          </Link>
        </div>
        <table className="w-full border-collapse text-[12px]">
          <thead className="bg-[#F7FAFC] text-[10px] font-bold uppercase tracking-wider text-[#1A202C]">
            <tr>
              <th className="border-b border-[#CBD5E0] p-1 text-left">Reference</th>
              <th className="border-b border-[#CBD5E0] p-1 text-left">Company</th>
              <th className="border-b border-[#CBD5E0] p-1 text-left">Product</th>
              <th className="border-b border-[#CBD5E0] p-1 text-left">Market</th>
              <th className="border-b border-[#CBD5E0] p-1 text-left">Quantity</th>
              <th className="border-b border-[#CBD5E0] p-1 text-left">Source</th>
              <th className="border-b border-[#CBD5E0] p-1 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentRfqs.length === 0 && (
              <tr>
                <td colSpan={7} className="p-2 text-center text-[#4A5568]">
                  No live RFQs yet — new submissions land here automatically.
                </td>
              </tr>
            )}
            {recentRfqs.map((rfq) => (
              <tr key={rfq.reference} className="border-b border-[#EDF2F7] hover:bg-[#F7FAFC]">
                <td className="p-1 font-mono font-bold">{rfq.reference}</td>
                <td className="p-1">{rfq.company}</td>
                <td className="p-1">{rfq.requestedProduct}</td>
                <td className="p-1">{rfq.market}</td>
                <td className="p-1">{rfq.quantity}</td>
                <td className="p-1 text-[#4A5568]">{rfq.source}</td>
                <td className="p-1">
                  <span className="inline-block rounded border border-[#CBD5E0] bg-[#EDF2F7] px-1 text-[10px] font-bold uppercase tracking-wider text-[#1A202C]">
                    {rfq.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ============================================================
          CUSTOMER PIPELINE — compact data table.
          ============================================================ */}
      <section className="border border-[#CBD5E0] bg-white">
        <div className="border-b border-[#CBD5E0] bg-[#EDF2F7] px-2 py-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A202C]">
            Customer pipeline snapshot
          </p>
        </div>
        <table className="w-full border-collapse text-[12px]">
          <thead className="bg-[#F7FAFC] text-[10px] font-bold uppercase tracking-wider text-[#1A202C]">
            <tr>
              <th className="border-b border-[#CBD5E0] p-1 text-left">Company</th>
              <th className="border-b border-[#CBD5E0] p-1 text-left">Segment</th>
              <th className="border-b border-[#CBD5E0] p-1 text-left">Market</th>
              <th className="border-b border-[#CBD5E0] p-1 text-left">Demand</th>
              <th className="border-b border-[#CBD5E0] p-1 text-left">Relationship</th>
            </tr>
          </thead>
          <tbody>
            {keyCustomers.length === 0 && (
              <tr>
                <td colSpan={5} className="p-2 text-center text-[#4A5568]">
                  No live customers yet.
                </td>
              </tr>
            )}
            {keyCustomers.map((customer) => (
              <tr key={customer.company} className="border-b border-[#EDF2F7] hover:bg-[#F7FAFC]">
                <td className="p-1 font-bold">{customer.company}</td>
                <td className="p-1 text-[#4A5568]">{customer.segment}</td>
                <td className="p-1 text-[#4A5568]">{customer.market}</td>
                <td className="p-1">{customer.demand}</td>
                <td className="p-1">
                  <span className="inline-block rounded border border-[#CBD5E0] bg-[#EDF2F7] px-1 text-[10px] font-bold uppercase tracking-wider text-[#1A202C]">
                    {customer.relationship}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ============================================================
          AUDIT / SYSTEM NOTES — compact data table, never a scrolling
          card. Currently sourced from summary metadata; swap for a
          real audit log table when the data shape lands.
          ============================================================ */}
      <section className="border border-[#CBD5E0] bg-white">
        <div className="border-b border-[#CBD5E0] bg-[#EDF2F7] px-2 py-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A202C]">
            Audit log (system events)
          </p>
        </div>
        <table className="w-full border-collapse text-[12px]">
          <thead className="bg-[#F7FAFC] text-[10px] font-bold uppercase tracking-wider text-[#1A202C]">
            <tr>
              <th className="border-b border-[#CBD5E0] p-1 text-left">Event</th>
              <th className="border-b border-[#CBD5E0] p-1 text-left">Detail</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[#EDF2F7]">
              <td className="p-1 font-mono">catalog.mode</td>
              <td className="p-1">{summary.catalogMode}</td>
            </tr>
            <tr className="border-b border-[#EDF2F7]">
              <td className="p-1 font-mono">cost.mode</td>
              <td className="p-1">{summary.costMode}</td>
            </tr>
            <tr className="border-b border-[#EDF2F7]">
              <td className="p-1 font-mono">import.mode</td>
              <td className="p-1">{summary.importMode}</td>
            </tr>
            <tr className="border-b border-[#EDF2F7]">
              <td className="p-1 font-mono">import.latest</td>
              <td className="p-1">{summary.latestImportTitle}</td>
            </tr>
            <tr>
              <td className="p-1 font-mono">import.detail</td>
              <td className="p-1 text-[#4A5568]">{summary.latestImportDetail}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
