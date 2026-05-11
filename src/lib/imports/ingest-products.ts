import Papa from "papaparse";
import type { PrismaClient } from "@prisma/client";

// ============================================================================
// CSV → Product/Variant ingestion
// ============================================================================
// This module turns a flat catalog CSV (one row per Variant) into the
// hierarchical Product → ProductVariant graph using Prisma upserts.
//
// Core rules:
//   - Rows are GROUPED by `parent_slug` (or, as a fallback, by `parent_name`
//     slugified). All rows sharing a parent become variants of ONE Product.
//   - The `dimensionsJson` column is built by a category-aware parser so
//     O-Rings store `{ ID, CS }`, Sheets store `{ Width, Thickness }`, etc.
//   - Upsert keys: Product by `slug`, ProductVariant by `code` (SKU). Re-running
//     the script is therefore idempotent and never duplicates rows.
//
// SECURITY: This loader does NOT touch the `ManufacturingData` (chemical
// formula / labour / machine cost) trade-secret table. Trade secrets are
// loaded by a separate, owner-only admin pipeline.
// ============================================================================

// ---------- public types ----------------------------------------------------

export type CsvRow = Record<string, string | undefined>;

export type CsvIngestSummary = {
  productsUpserted: number;
  variantsUpserted: number;
  rowsSkipped: number;
  errors: Array<{ row: number; message: string }>;
};

export type DimensionsJson = Record<string, string | number>;

// ---------- header normalisation --------------------------------------------

/**
 * Normalise raw CSV header strings ("Inner Diameter", "ID (mm)", "id_mm") to
 * a single canonical lower-snake key ("inner_diameter"). The dimension parser
 * uses this canonical key so authors can use whichever spelling they prefer.
 */
function canonical(header: string): string {
  return header
    .toLowerCase()
    .replace(/\(.*?\)/g, "") // strip "(mm)", "(in)" etc
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function read(row: CsvRow, ...candidates: string[]): string | undefined {
  for (const candidate of candidates) {
    const key = canonical(candidate);
    for (const rawKey of Object.keys(row)) {
      if (canonical(rawKey) === key) {
        const value = row[rawKey]?.toString().trim();
        if (value) return value;
      }
    }
  }
  return undefined;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ---------- category-aware dimensions parser --------------------------------

/**
 * Build the polymorphic `dimensionsJson` blob for a given variant row based
 * on the parent product's `category`. Adding a new product family is a matter
 * of registering a new entry below.
 */
export function buildDimensionsJson(category: string, row: CsvRow): DimensionsJson {
  const cat = category.toLowerCase();
  const out: DimensionsJson = {};

  const set = (key: string, ...candidates: string[]) => {
    const value = read(row, ...candidates);
    if (value) out[key] = value;
  };

  if (cat.includes("o-ring") || cat.includes("oring")) {
    set("ID", "inner_diameter", "id", "id_mm");
    set("CS", "cross_section", "cs", "cs_mm", "thickness");
    set("OD", "outer_diameter", "od");
  } else if (cat.includes("sheet") || cat.includes("roll")) {
    set("Width", "width", "width_mm");
    set("Length", "length", "length_mm");
    set("Thickness", "thickness", "thickness_mm");
  } else if (cat.includes("gasket") || cat.includes("seal") || cat.includes("profile")) {
    set("Width", "width", "width_mm");
    set("Thickness", "thickness", "thickness_mm");
    set("Length", "length", "length_mm");
    set("Profile", "profile", "shape");
  } else if (cat.includes("expansion") || cat.includes("joint") || cat.includes("hose")) {
    set("ID", "inner_diameter", "id");
    set("OD", "outer_diameter", "od");
    set("Length", "length", "length_mm");
    set("Pressure", "pressure", "working_pressure");
  } else if (cat.includes("mount") || cat.includes("pad") || cat.includes("vibration")) {
    set("Diameter", "diameter", "od");
    set("Height", "height", "height_mm");
    set("Load", "load", "load_kg", "rated_load");
  } else {
    // Fallback — pass through any column that *looks* dimensional. Anything
    // that doesn't match a known key just gets ignored (returned `out`
    // remains the parsed subset).
    for (const dim of [
      "Width",
      "Length",
      "Thickness",
      "Diameter",
      "Height",
      "ID",
      "OD",
      "CS",
    ]) {
      set(dim, dim);
    }
  }

  // Universal hardness/temp passthroughs — useful in every category.
  set("Hardness", "hardness", "shore_a", "durometer");
  set("Temp", "temperature_range", "temp_range");

  return out;
}

// ---------- price parsing ---------------------------------------------------

function parseUsd(value: string | undefined): number | null {
  if (!value) return null;
  const cleaned = value.replace(/[^0-9.\-]/g, "");
  if (!cleaned) return null;
  const parsed = parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

// ---------- the ingestion entrypoint ---------------------------------------

/**
 * Parse a CSV string and upsert its contents into the Product / ProductVariant
 * tables via the supplied PrismaClient. Returns a summary suitable for
 * logging or surfacing in an admin UI.
 *
 * Required CSV columns (any header casing):
 *   parent_slug | parent_name | category | material | sku | variant_description
 * Optional:
 *   summary, description, base_price_usd, moq, plus any dimension columns
 *   relevant to the category (see `buildDimensionsJson`).
 */
export async function ingestProductCsv(
  csv: string,
  prisma: PrismaClient,
): Promise<CsvIngestSummary> {
  const summary: CsvIngestSummary = {
    productsUpserted: 0,
    variantsUpserted: 0,
    rowsSkipped: 0,
    errors: [],
  };

  const parsed = Papa.parse<CsvRow>(csv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  if (parsed.errors.length > 0) {
    for (const err of parsed.errors) {
      summary.errors.push({
        row: err.row ?? -1,
        message: `CSV parse error: ${err.message}`,
      });
    }
  }

  // ---- 1. Group rows by parent ---------------------------------------------
  const groups = new Map<
    string,
    { parentRow: CsvRow; variantRows: Array<{ row: CsvRow; index: number }> }
  >();

  parsed.data.forEach((row, index) => {
    const parentName = read(row, "parent_name", "product_name", "name");
    const explicitSlug = read(row, "parent_slug", "slug");
    const slug = explicitSlug
      ? slugify(explicitSlug)
      : parentName
        ? slugify(parentName)
        : null;

    if (!slug || !parentName) {
      summary.rowsSkipped += 1;
      summary.errors.push({
        row: index + 2, // +2: header row + 1-indexed
        message: "Missing parent_slug/parent_name — row skipped.",
      });
      return;
    }

    const sku = read(row, "sku", "variant_code", "code");
    if (!sku) {
      summary.rowsSkipped += 1;
      summary.errors.push({
        row: index + 2,
        message: `Row for parent "${slug}" is missing a SKU — row skipped.`,
      });
      return;
    }

    let bucket = groups.get(slug);
    if (!bucket) {
      bucket = { parentRow: row, variantRows: [] };
      groups.set(slug, bucket);
    }
    bucket.variantRows.push({ row, index });
  });

  // ---- 2. Upsert each parent + its variants --------------------------------
  for (const [slug, group] of groups) {
    const parent = group.parentRow;
    const name = read(parent, "parent_name", "product_name", "name") ?? slug;
    const category = read(parent, "category") ?? "Uncategorised";
    const material = read(parent, "material") ?? "Unspecified";
    const summaryText = read(parent, "summary") ?? `${name} — ${material}`;
    const descriptionText = read(parent, "description") ?? summaryText;
    const modelUrl = read(parent, "three_d_model_url", "model_url", "glb_url");

    let productId: string;
    try {
      const product = await prisma.product.upsert({
        where: { slug },
        create: {
          slug,
          name,
          category,
          material,
          summary: summaryText,
          description: descriptionText,
          features: [],
          certifications: [],
          applications: [],
          industries: [],
          supplyFormats: [],
          qualityChecks: [],
          sourcingNotes: [],
          status: "ACTIVE",
          threeDModelUrl: modelUrl,
        },
        update: {
          name,
          category,
          material,
          summary: summaryText,
          description: descriptionText,
          threeDModelUrl: modelUrl,
        },
        select: { id: true },
      });
      productId = product.id;
      summary.productsUpserted += 1;
    } catch (err) {
      summary.errors.push({
        row: group.variantRows[0]?.index ?? -1,
        message: `Failed to upsert product "${slug}": ${(err as Error).message}`,
      });
      continue;
    }

    for (const { row, index } of group.variantRows) {
      const sku = read(row, "sku", "variant_code", "code")!; // guaranteed by step 1
      const variantDescription =
        read(row, "variant_description", "description") ?? `${name} ${sku}`;
      const moqRaw = read(row, "moq", "minimum_order_quantity") ?? "1";
      const moq = Number.parseInt(moqRaw.replace(/[^0-9]/g, ""), 10) || 1;
      const basePriceUsd = parseUsd(read(row, "base_price_usd", "price_usd", "usd"));
      const dimensionsJson = buildDimensionsJson(category, row);

      try {
        await prisma.productVariant.upsert({
          where: { code: sku },
          create: {
            code: sku,
            description: variantDescription,
            minimumOrderQuantity: moq,
            dimensionsJson,
            basePriceUsd,
            product: { connect: { id: productId } },
          },
          update: {
            description: variantDescription,
            minimumOrderQuantity: moq,
            dimensionsJson,
            basePriceUsd,
            product: { connect: { id: productId } },
          },
        });
        summary.variantsUpserted += 1;
      } catch (err) {
        summary.errors.push({
          row: index + 2,
          message: `Failed to upsert variant "${sku}": ${(err as Error).message}`,
        });
      }
    }
  }

  return summary;
}
