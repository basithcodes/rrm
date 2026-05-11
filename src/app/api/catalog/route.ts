import type { NextRequest } from "next/server";
import { getCatalogPayload } from "@/lib/api-data";
import { jsonResponse, optionsResponse } from "@/lib/api-response";
import { getPrismaClient, isDatabaseConfigured } from "@/lib/prisma";

// =====================================================================
// GET /api/catalog
// ---------------------------------------------------------------------
// Read-only public catalog feed. Used by:
//   * the public Next.js storefront,
//   * the Flutter warehouse / kiosk app (`RrmApiClient.fetchCatalog`).
//
// Source of truth:
//   * If DATABASE_URL is configured → Prisma `product.findMany` with
//     nested `variants`.
//   * Otherwise → seed payload from `getCatalogPayload()` so local /
//     CI / preview deployments still answer.
//
// SECURITY: never join `tradeSecret` or `manufacturingData` here. This
// endpoint is unauthenticated.
// =====================================================================

export const dynamic = "force-dynamic";

type ApiVariant = {
  sku: string;
  code: string;
  description: string;
  minimumOrderQuantity: number;
  basePriceUsd: number | null;
  dimensionsJson: Record<string, string>;
};

type ApiProduct = {
  slug: string;
  name: string;
  category: string;
  material: string;
  summary: string;
  variantCount: number;
  variants: ApiVariant[];
};

async function loadCatalogFromDb(): Promise<{ products: ApiProduct[] }> {
  const prisma = getPrismaClient();
  const rows = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" },
    select: {
      slug: true,
      name: true,
      category: true,
      material: true,
      summary: true,
      variants: {
        orderBy: { code: "asc" },
        select: {
          code: true,
          description: true,
          minimumOrderQuantity: true,
          dimensionsJson: true,
          basePriceUsd: true,
        },
      },
    },
  });

  const products: ApiProduct[] = rows.map((p) => ({
    slug: p.slug,
    name: p.name,
    category: p.category,
    material: p.material,
    summary: p.summary,
    variantCount: p.variants.length,
    variants: p.variants.map((v) => ({
      sku: v.code,
      code: v.code,
      description: v.description,
      minimumOrderQuantity: v.minimumOrderQuantity,
      basePriceUsd: v.basePriceUsd != null ? Number(v.basePriceUsd) : null,
      dimensionsJson:
        v.dimensionsJson && typeof v.dimensionsJson === "object"
          ? (v.dimensionsJson as Record<string, string>)
          : {},
    })),
  }));

  return { products };
}

export async function GET(request: NextRequest) {
  const payload = isDatabaseConfigured()
    ? await loadCatalogFromDb().catch(() => getCatalogPayload())
    : getCatalogPayload();

  return jsonResponse(request, payload, {
    methods: ["GET", "OPTIONS"],
  });
}

export function OPTIONS(request: NextRequest) {
  return optionsResponse(request, {
    methods: ["GET", "OPTIONS"],
  });
}
