"use server";

// Server action: B2B RFQ submission.
// =====================================================================
// Wraps Customer + Rfq + RfqItem creation in a single Prisma transaction
// and snapshots the entire form payload into Rfq.customerDetailsJson so the
// PDF / future audit can reconstruct exactly what the buyer saw.
//
// Trade-secret isolation: this action only reads ProductVariant rows to
// resolve SKUs. It NEVER touches the ManufacturingData / TradeSecret
// tables.
// =====================================================================

import { z } from "zod";
import { getPrismaClient, isDatabaseConfigured } from "@/lib/prisma";

const cartItemSchema = z.object({
  sku: z.string().trim().min(1),
  name: z.string().trim().min(1),
  quantity: z.coerce.number().int().min(1).max(100000),
  basePriceUsd: z.number().nullable().optional(),
});

const submitRfqSchema = z.object({
  companyName: z.string().trim().min(1, "Company name is required."),
  contactName: z.string().trim().min(1, "Contact person is required."),
  email: z.string().trim().email("A valid email is required."),
  phone: z.string().trim().optional().default(""),
  deliveryPort: z.string().trim().min(1, "Target delivery port is required."),
  market: z
    .enum(["GLOBAL", "UAE", "SAUDI_ARABIA", "OMAN", "QATAR"])
    .default("GLOBAL"),
  notes: z.string().trim().optional().default(""),
  items: z.array(cartItemSchema).min(1, "Add at least one variant to your quote."),
});

export type SubmitRfqInput = z.input<typeof submitRfqSchema>;

export type SubmitRfqResult =
  | { ok: true; rfqId: string }
  | { ok: false; error: string };

export async function submitRfq(input: SubmitRfqInput): Promise<SubmitRfqResult> {
  if (!isDatabaseConfigured()) {
    return { ok: false, error: "Database is not configured on the server." };
  }

  const parsed = submitRfqSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join(" · "),
    };
  }

  const data = parsed.data;
  const prisma = getPrismaClient();

  // Resolve cart SKUs to real ProductVariant rows where possible. SKUs that
  // don't resolve still get an RfqItem (with `requestedProductName` set) so
  // the sales team can chase the right part number.
  const variants = await prisma.productVariant.findMany({
    where: { code: { in: data.items.map((i) => i.sku) } },
    select: { id: true, code: true },
  });
  const variantBySku = new Map(variants.map((v) => [v.code, v.id]));

  try {
    const result = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.create({
        data: {
          companyName: data.companyName,
          contactName: data.contactName,
          email: data.email,
          phone: data.phone || null,
          market: data.market,
          notes: data.notes || null,
          sourceChannel: "public-quote-form",
        },
        select: { id: true },
      });

      const rfq = await tx.rfq.create({
        data: {
          customerId: customer.id,
          requestedMarket: data.market,
          notes: data.notes || null,
          sourceChannel: "public-quote-form",
          customerDetailsJson: {
            companyName: data.companyName,
            contactName: data.contactName,
            email: data.email,
            phone: data.phone,
            deliveryPort: data.deliveryPort,
            market: data.market,
            notes: data.notes,
            submittedAt: new Date().toISOString(),
            items: data.items,
          },
          items: {
            create: data.items.map((item) => ({
              quantity: item.quantity,
              variantId: variantBySku.get(item.sku) ?? null,
              requestedProductName: variantBySku.get(item.sku)
                ? null
                : `${item.name} [${item.sku}]`,
            })),
          },
        },
        select: { id: true },
      });

      return rfq;
    });

    return { ok: true, rfqId: result.id };
  } catch (err) {
    return {
      ok: false,
      error: `Failed to submit RFQ: ${(err as Error).message}`,
    };
  }
}
