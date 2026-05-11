import type { NextRequest } from "next/server";
import { z } from "zod";

import { isOwnerRequestAuthenticated } from "@/lib/auth";
import { jsonResponse, optionsResponse } from "@/lib/api-response";
import { getPrismaClient, isDatabaseConfigured } from "@/lib/prisma";

// Admin-only endpoint for the isolated Trade_Secrets table.
//
// No other route handler, server component, or public payload is allowed to
// read from the `TradeSecret` model. Every method below enforces owner-level
// authentication before any database query runs, and the responses are
// deliberately scoped to the bare minimum trade-secret fields.

const ALLOWED_METHODS = ["GET", "POST", "DELETE", "OPTIONS"];

const upsertSchema = z.object({
  productId: z.string().min(1),
  chemicalFormula: z.string().min(1).max(4000),
  manufacturingCostUsd: z.coerce.number().nonnegative(),
  notes: z.string().max(4000).optional().nullable(),
});

async function ensureAuthorized(request: NextRequest) {
  if (await isOwnerRequestAuthenticated(request)) {
    return null;
  }

  return jsonResponse(
    request,
    { message: "Unauthorized." },
    { status: 401, methods: ALLOWED_METHODS, credentials: true },
  );
}

function ensureDatabase(request: NextRequest) {
  if (isDatabaseConfigured()) {
    return null;
  }

  return jsonResponse(
    request,
    { message: "DATABASE_URL is not configured." },
    { status: 503, methods: ALLOWED_METHODS, credentials: true },
  );
}

function serializeTradeSecret(record: {
  id: string;
  productId: string;
  chemicalFormula: string;
  manufacturingCostUsd: unknown;
  notes: string | null;
  updatedAt: Date;
}) {
  return {
    id: record.id,
    productId: record.productId,
    chemicalFormula: record.chemicalFormula,
    manufacturingCostUsd: Number(record.manufacturingCostUsd),
    notes: record.notes,
    updatedAt: record.updatedAt.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const unauthorized = await ensureAuthorized(request);
  if (unauthorized) return unauthorized;

  const misconfigured = ensureDatabase(request);
  if (misconfigured) return misconfigured;

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  const prisma = getPrismaClient();

  if (productId) {
    const record = await prisma.tradeSecret.findUnique({ where: { productId } });

    if (!record) {
      return jsonResponse(
        request,
        { message: "Trade secret not found." },
        { status: 404, methods: ALLOWED_METHODS, credentials: true },
      );
    }

    return jsonResponse(
      request,
      { tradeSecret: serializeTradeSecret(record) },
      { methods: ALLOWED_METHODS, credentials: true },
    );
  }

  const records = await prisma.tradeSecret.findMany({ orderBy: { updatedAt: "desc" } });

  return jsonResponse(
    request,
    { tradeSecrets: records.map(serializeTradeSecret) },
    { methods: ALLOWED_METHODS, credentials: true },
  );
}

export async function POST(request: NextRequest) {
  const unauthorized = await ensureAuthorized(request);
  if (unauthorized) return unauthorized;

  const misconfigured = ensureDatabase(request);
  if (misconfigured) return misconfigured;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(
      request,
      { message: "Invalid JSON body." },
      { status: 400, methods: ALLOWED_METHODS, credentials: true },
    );
  }

  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) {
    return jsonResponse(
      request,
      { message: "Validation failed.", issues: parsed.error.flatten() },
      { status: 422, methods: ALLOWED_METHODS, credentials: true },
    );
  }

  const prisma = getPrismaClient();

  const record = await prisma.tradeSecret.upsert({
    where: { productId: parsed.data.productId },
    create: {
      productId: parsed.data.productId,
      chemicalFormula: parsed.data.chemicalFormula,
      manufacturingCostUsd: parsed.data.manufacturingCostUsd,
      notes: parsed.data.notes ?? null,
    },
    update: {
      chemicalFormula: parsed.data.chemicalFormula,
      manufacturingCostUsd: parsed.data.manufacturingCostUsd,
      notes: parsed.data.notes ?? null,
    },
  });

  return jsonResponse(
    request,
    { tradeSecret: serializeTradeSecret(record) },
    { status: 200, methods: ALLOWED_METHODS, credentials: true },
  );
}

export async function DELETE(request: NextRequest) {
  const unauthorized = await ensureAuthorized(request);
  if (unauthorized) return unauthorized;

  const misconfigured = ensureDatabase(request);
  if (misconfigured) return misconfigured;

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return jsonResponse(
      request,
      { message: "productId query parameter is required." },
      { status: 400, methods: ALLOWED_METHODS, credentials: true },
    );
  }

  const prisma = getPrismaClient();

  await prisma.tradeSecret.delete({ where: { productId } }).catch(() => null);

  return jsonResponse(
    request,
    { deleted: true },
    { methods: ALLOWED_METHODS, credentials: true },
  );
}

export function OPTIONS(request: NextRequest) {
  return optionsResponse(request, { methods: ALLOWED_METHODS, credentials: true });
}
