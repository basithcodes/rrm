// =============================================================================
// /admin/rfqs — Sales Pipeline
// =============================================================================
// Owner-gated pipeline view. The parent admin layout calls
// `requireOwnerSession()` so we know an HMAC-validated owner is rendering
// this page. We re-assert the gate inside the status-update server action
// for defence in depth.
//
// Trade-secret isolation: this page reads Rfq + RfqItem + ProductVariant.
// It does NOT join the ManufacturingData / TradeSecret tables.
// =============================================================================

import { requireOwnerSession } from "@/lib/auth";
import { getPrismaClient, isDatabaseConfigured } from "@/lib/prisma";
import {
  RfqPipelineTable,
  type RfqRow,
} from "@/components/admin/rfq-pipeline-table";

type CartItemSnapshot = {
  sku?: string;
  name?: string;
  quantity?: number;
  basePriceUsd?: number | null;
};

type CustomerSnapshot = {
  companyName?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  deliveryPort?: string;
  market?: string;
  notes?: string;
  items?: CartItemSnapshot[];
};

export const dynamic = "force-dynamic";

export default async function AdminRfqsPage() {
  await requireOwnerSession();

  if (!isDatabaseConfigured()) {
    return (
      <div className="rounded border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        Database is not configured. Set <code>DATABASE_URL</code> and reload.
      </div>
    );
  }

  const prisma = getPrismaClient();
  const rfqs = await prisma.rfq.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      items: { include: { variant: true } },
    },
  });

  const rows: RfqRow[] = rfqs.map((rfq) => {
    const snapshot = (rfq.customerDetailsJson as CustomerSnapshot | null) ?? {};
    const items =
      snapshot.items && snapshot.items.length > 0
        ? snapshot.items.map((item) => ({
            sku: item.sku ?? "—",
            name: item.name ?? "—",
            quantity: item.quantity ?? 0,
            basePriceUsd: item.basePriceUsd ?? null,
          }))
        : rfq.items.map((line) => ({
            sku: line.variant?.code ?? line.requestedProductName ?? "—",
            name: line.requestedProductName ?? line.variant?.description ?? "—",
            quantity: line.quantity,
            basePriceUsd: line.variant?.basePriceUsd
              ? Number(line.variant.basePriceUsd)
              : null,
          }));

    return {
      id: rfq.id,
      createdAt: rfq.createdAt.toISOString().slice(0, 10),
      status: rfq.status as RfqRow["status"],
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      customer: {
        companyName: snapshot.companyName ?? rfq.customer.companyName,
        contactName: snapshot.contactName ?? rfq.customer.contactName ?? "—",
        email: snapshot.email ?? rfq.customer.email ?? "—",
        phone: snapshot.phone ?? rfq.customer.phone ?? "",
        deliveryPort: snapshot.deliveryPort ?? "—",
        market: snapshot.market ?? rfq.requestedMarket,
        notes: snapshot.notes ?? rfq.notes ?? "",
      },
      items,
    };
  });

  return (
    <div className="space-y-4">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-wider text-white/60">
          Sales pipeline
        </p>
        <h1 className="mt-1 display-title text-3xl font-semibold text-white">
          Requests for Quote
        </h1>
        <p className="mt-2 text-sm text-white/70">
          {rows.length} RFQ{rows.length === 1 ? "" : "s"} in the queue. Click a row to
          inspect the requested SKUs and update its status.
        </p>
      </header>

      <RfqPipelineTable rows={rows} />
    </div>
  );
}
