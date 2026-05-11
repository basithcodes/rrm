// Streams the formal RFQ PDF for a given RFQ id.
// Reads the snapshot stored in `Rfq.customerDetailsJson` so the document
// reflects exactly what the buyer submitted.

import { NextResponse, type NextRequest } from "next/server";
import { getPrismaClient, isDatabaseConfigured } from "@/lib/prisma";
import { renderRfqPdf, type RfqPdfPayload } from "@/lib/rfq/pdf";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

type CartItemSnapshot = {
  sku: string;
  name: string;
  quantity: number;
  basePriceUsd: number | null;
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

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Database is not configured." },
      { status: 503 },
    );
  }

  const prisma = getPrismaClient();
  const rfq = await prisma.rfq.findUnique({
    where: { id },
    include: { items: { include: { variant: true } } },
  });

  if (!rfq) {
    return NextResponse.json({ error: "RFQ not found." }, { status: 404 });
  }

  const snapshot = (rfq.customerDetailsJson as CustomerSnapshot | null) ?? {};

  const items: RfqPdfPayload["items"] =
    snapshot.items && snapshot.items.length > 0
      ? snapshot.items
      : rfq.items.map((line) => ({
          sku: line.variant?.code ?? line.requestedProductName ?? "—",
          name: line.requestedProductName ?? line.variant?.description ?? "—",
          quantity: line.quantity,
          basePriceUsd: line.variant?.basePriceUsd
            ? Number(line.variant.basePriceUsd)
            : null,
        }));

  const payload: RfqPdfPayload = {
    rfqId: rfq.id,
    createdAt: rfq.createdAt,
    customer: {
      companyName: snapshot.companyName ?? "—",
      contactName: snapshot.contactName ?? "—",
      email: snapshot.email ?? "—",
      phone: snapshot.phone,
      deliveryPort: snapshot.deliveryPort ?? "—",
      market: snapshot.market ?? rfq.requestedMarket,
      notes: snapshot.notes,
    },
    items,
  };

  const buffer = await renderRfqPdf(payload);

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="RRM-RFQ-${rfq.id}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
