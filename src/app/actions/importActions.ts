"use server";

// =====================================================================
// Bulk Catalog Import — Server Action
// ---------------------------------------------------------------------
// Accepts an array of parsed CSV rows from the operator's drag-drop
// upload screen and upserts them into Product / ProductVariant /
// ManufacturingData. Each row is processed individually so a single
// validation failure can never crash the whole batch — failures are
// collected into a structured error log and returned to the client.
//
// CSV column contract (per spec):
//   Required: Parent_Name, Category, Material, SKU
//   Optional: BasePrice_USD, Chemistry_Notes, LaborCost, MachineCost,
//             Description, MOQ
//   Dynamic : Dim_<anything>  → folded into ProductVariant.dimensionsJson
//
// SECURITY: this action is owner-only — re-asserts the HMAC session
// inside the action body even though the route layout already gates it.
// =====================================================================

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isOwnerAuthenticated } from "@/lib/auth";
import { getPrismaClient, isDatabaseConfigured } from "@/lib/prisma";

export type ImportRowError = {
  rowIndex: number;
  sku: string;
  reason: string;
};

export type CatalogImportResult =
  | {
      ok: true;
      summary: {
        rowsProcessed: number;
        productsCreated: number;
        productsUpdated: number;
        variantsCreated: number;
        variantsUpdated: number;
        manufacturingRecordsUpserted: number;
        failedRows: number;
      };
      errors: ImportRowError[];
      message: string;
    }
  | { ok: false; message: string; errors?: ImportRowError[] };

// Free-form row schema. Extra Dim_* columns are kept via .passthrough().
const rowSchema = z
  .object({
    Parent_Name: z.string().trim().min(1, "Parent_Name is required"),
    Category: z.string().trim().min(1, "Category is required"),
    Material: z.string().trim().min(1, "Material is required"),
    SKU: z.string().trim().min(1, "SKU is required"),
    BasePrice_USD: z.union([z.string(), z.number()]).optional().nullable(),
    Chemistry_Notes: z.string().optional().nullable(),
    LaborCost: z.union([z.string(), z.number()]).optional().nullable(),
    MachineCost: z.union([z.string(), z.number()]).optional().nullable(),
    Description: z.string().optional().nullable(),
    MOQ: z.union([z.string(), z.number()]).optional().nullable(),
  })
  .passthrough();

function toNumberOrNull(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const n = typeof value === "number" ? value : parseFloat(String(value).replace(/[, ]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function slugify(name: string, category: string) {
  const base = `${name}-${category}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "product";
}

function extractDimensions(row: Record<string, unknown>) {
  // Any column whose name starts with `Dim_` is folded into a single
  // dimensions object on the variant. The leading `Dim_` is stripped.
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(row)) {
    if (!key.startsWith("Dim_")) continue;
    if (value === undefined || value === null || value === "") continue;
    out[key.slice(4)] = String(value);
  }
  return out;
}

export async function executeCatalogImport(
  rows: Array<Record<string, unknown>>,
): Promise<CatalogImportResult> {
  // Defence in depth — the layout already ran requireOwnerSession but a
  // server action can be invoked from anywhere, so check again here.
  if (!(await isOwnerAuthenticated())) {
    return { ok: false, message: "Unauthorized — owner session required." };
  }

  if (!isDatabaseConfigured()) {
    return {
      ok: false,
      message:
        "DATABASE_URL is not configured. Configure Prisma before running an import.",
    };
  }

  if (!Array.isArray(rows) || rows.length === 0) {
    return { ok: false, message: "No rows received from the client." };
  }

  const prisma = getPrismaClient();
  const errors: ImportRowError[] = [];

  let productsCreated = 0;
  let productsUpdated = 0;
  let variantsCreated = 0;
  let variantsUpdated = 0;
  let manufacturingRecordsUpserted = 0;

  // Track parent products we've already touched in this batch so we
  // don't double-count create/update for variants that share a parent.
  const productLookup = new Map<string, { id: string; createdInBatch: boolean }>();

  for (let i = 0; i < rows.length; i++) {
    const rawRow = rows[i];
    let sku = "";
    try {
      const parsed = rowSchema.parse(rawRow);
      sku = parsed.SKU.trim();

      const parentKey = `${parsed.Parent_Name.trim().toLowerCase()}|${parsed.Category.trim().toLowerCase()}`;

      // Each row's three upserts (Product / ProductVariant /
      // ManufacturingData) run inside an interactive Prisma transaction
      // so a single failure rolls back the whole row — we never end up
      // with an orphaned variant or a half-written trade-secret record.
      const txResult = await prisma.$transaction(async (tx) => {
        // ── 1. Upsert Product (by slug derived from name+category) ───
        let productEntry = productLookup.get(parentKey);
        let productCreated = false;
        let productUpdated = false;
        if (!productEntry) {
          const slug = slugify(parsed.Parent_Name, parsed.Category);
          const existing = await tx.product.findUnique({ where: { slug } });
          const upserted = await tx.product.upsert({
            where: { slug },
            create: {
              slug,
              name: parsed.Parent_Name.trim(),
              category: parsed.Category.trim(),
              material: parsed.Material.trim(),
              summary: parsed.Description?.trim() || `${parsed.Parent_Name} (${parsed.Category})`,
              description: parsed.Description?.trim() || "",
            },
            update: {
              name: parsed.Parent_Name.trim(),
              category: parsed.Category.trim(),
              material: parsed.Material.trim(),
              ...(parsed.Description?.trim()
                ? { summary: parsed.Description.trim(), description: parsed.Description.trim() }
                : {}),
            },
          });
          productEntry = { id: upserted.id, createdInBatch: !existing };
          if (existing) productUpdated = true;
          else productCreated = true;
        }

        // ── 2. Upsert ProductVariant (by SKU) ───────────────────────
        const dimensions = extractDimensions(rawRow);
        const basePriceUsd = toNumberOrNull(parsed.BasePrice_USD);
        const moq = toNumberOrNull(parsed.MOQ);

        const existingVariant = await tx.productVariant.findUnique({
          where: { code: sku },
          select: { id: true },
        });

        const variant = await tx.productVariant.upsert({
          where: { code: sku },
          create: {
            code: sku,
            productId: productEntry.id,
            description: parsed.Description?.trim() || sku,
            minimumOrderQuantity: moq != null && moq > 0 ? Math.floor(moq) : 1,
            dimensionsJson: dimensions,
            basePriceUsd: basePriceUsd != null ? basePriceUsd : null,
          },
          update: {
            productId: productEntry.id,
            ...(parsed.Description?.trim() ? { description: parsed.Description.trim() } : {}),
            ...(moq != null && moq > 0 ? { minimumOrderQuantity: Math.floor(moq) } : {}),
            dimensionsJson: dimensions,
            ...(basePriceUsd != null ? { basePriceUsd } : {}),
          },
        });

        const variantCreated = !existingVariant;
        const variantUpdated = Boolean(existingVariant);

        // ── 3. Upsert ManufacturingData (trade secrets, by variantId) ─
        const labor = toNumberOrNull(parsed.LaborCost);
        const machine = toNumberOrNull(parsed.MachineCost);
        const chemistry = parsed.Chemistry_Notes?.trim();
        let manufacturingTouched = false;

        if (chemistry || labor != null || machine != null) {
          await tx.manufacturingData.upsert({
            where: { variantId: variant.id },
            create: {
              variantId: variant.id,
              chemicalFormula: chemistry || "",
              laborCostUsd: labor ?? 0,
              machineCostUsd: machine ?? 0,
            },
            update: {
              ...(chemistry ? { chemicalFormula: chemistry } : {}),
              ...(labor != null ? { laborCostUsd: labor } : {}),
              ...(machine != null ? { machineCostUsd: machine } : {}),
            },
          });
          manufacturingTouched = true;
        }

        return {
          productEntry,
          productCreated,
          productUpdated,
          variantCreated,
          variantUpdated,
          manufacturingTouched,
        };
      });

      // Counter mutations only happen after the transaction commits, so
      // a row that fails mid-transaction never inflates the summary.
      if (!productLookup.has(parentKey)) {
        productLookup.set(parentKey, txResult.productEntry);
      }
      if (txResult.productCreated) productsCreated += 1;
      if (txResult.productUpdated) productsUpdated += 1;
      if (txResult.variantCreated) variantsCreated += 1;
      if (txResult.variantUpdated) variantsUpdated += 1;
      if (txResult.manufacturingTouched) manufacturingRecordsUpserted += 1;
    } catch (error) {
      errors.push({
        rowIndex: i + 1,
        sku: sku || String(rawRow?.SKU ?? "(missing SKU)"),
        reason: error instanceof Error ? error.message : "Unknown row error.",
      });
    }
  }

  const rowsProcessed = rows.length - errors.length;

  // Refresh public catalog + admin grids so newly imported variants are
  // visible immediately.
  revalidatePath("/products");
  revalidatePath("/admin");
  revalidatePath("/admin/imports");
  revalidatePath("/admin/secrets");

  return {
    ok: true,
    summary: {
      rowsProcessed,
      productsCreated,
      productsUpdated,
      variantsCreated,
      variantsUpdated,
      manufacturingRecordsUpserted,
      failedRows: errors.length,
    },
    errors,
    message: `Import complete: ${productsCreated} new products, ${variantsCreated + variantsUpdated} variants upserted (${variantsCreated} new / ${variantsUpdated} updated), ${manufacturingRecordsUpserted} trade-secret rows refreshed${errors.length ? `, ${errors.length} row${errors.length === 1 ? "" : "s"} skipped` : ""}.`,
  };
}
