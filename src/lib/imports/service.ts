import type { ImportBatchStatus } from "@prisma/client";
import { getPrismaClient, isDatabaseConfigured } from "@/lib/prisma";
import type { CurrencyCode } from "@/lib/site-data";
import type { NormalizedExtendedProductImport } from "@/lib/imports/csv";

export type ImportBatchResult = {
  status: "idle" | "imported" | "partial" | "unavailable" | "error";
  message: string;
};

export type ImportCommitInput = {
  fileName: string;
  rowCount: number;
  successfulCount: number;
  failedCount: number;
  rows: NormalizedExtendedProductImport[];
};

const databaseUnavailableMessage =
  "Database is configured but not reachable. Start PostgreSQL on localhost:5432 or update DATABASE_URL to a live server.";

function isDatabaseUnavailableError(error: unknown) {
  const queue: unknown[] = [error];
  const seen = new Set<unknown>();

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current || seen.has(current)) {
      continue;
    }

    seen.add(current);

    if (typeof current === "object") {
      const currentRecord = current as {
        code?: unknown;
        message?: unknown;
        cause?: unknown;
      };

      if (currentRecord.code === "ECONNREFUSED" || currentRecord.code === "P1001") {
        return true;
      }

      if (typeof currentRecord.message === "string") {
        const message = currentRecord.message;

        if (
          message.includes("Can't reach database server") ||
          message.includes("ECONNREFUSED") ||
          message.includes("Connection refused")
        ) {
          return true;
        }
      }

      if (currentRecord.cause) {
        queue.push(currentRecord.cause);
      }
    }
  }

  return false;
}

export function formatImportError(error: unknown) {
  if (isDatabaseUnavailableError(error)) {
    return databaseUnavailableMessage;
  }

  const message = error instanceof Error ? error.message : "Unable to import CSV rows.";

  if (
    message.includes("Can't reach database server") ||
    message.includes("ECONNREFUSED") ||
    message.includes("Connection refused")
  ) {
    return databaseUnavailableMessage;
  }

  return message;
}

function parsePercentage(value: string) {
  const normalized = value.replaceAll("%", "").trim();
  const parsed = Number(normalized);

  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid percentage value '${value}'.`);
  }

  return parsed;
}

function marketForCurrency(currency: CurrencyCode) {
  switch (currency) {
    case "AED":
      return "UAE" as const;
    case "SAR":
      return "SAUDI_ARABIA" as const;
    case "OMR":
      return "OMAN" as const;
    case "QAR":
      return "QATAR" as const;
    case "USD":
      return "GLOBAL" as const;
  }
}

function marketFromLabel(market: string, fallbackCurrency: CurrencyCode) {
  const normalized = market.trim().toLowerCase();

  if (!normalized) {
    return marketForCurrency(fallbackCurrency);
  }

  if (normalized.includes("saudi")) {
    return "SAUDI_ARABIA" as const;
  }

  if (normalized.includes("oman")) {
    return "OMAN" as const;
  }

  if (normalized.includes("qatar")) {
    return "QATAR" as const;
  }

  if (normalized.includes("uae") || normalized.includes("dubai") || normalized.includes("abu dhabi")) {
    return "UAE" as const;
  }

  if (normalized.includes("global")) {
    return "GLOBAL" as const;
  }

  return marketForCurrency(fallbackCurrency);
}

export async function importValidatedRows(input: ImportCommitInput): Promise<ImportBatchResult> {
  const fileName = input.fileName.trim() || "uploaded.csv";

  if (!isDatabaseConfigured()) {
    return {
      status: "unavailable",
      message:
        "Preview works, but CSV import is disabled because DATABASE_URL is not configured.",
    };
  }

  if (input.rows.length === 0) {
    return {
      status: "error",
      message: "There are no valid rows to import.",
    };
  }

  let batchId: string | null = null;

  try {
    const prisma = getPrismaClient();
    const batch = await prisma.importBatch.create({
      data: {
        fileName,
        sourceType: "CSV",
        status: "PENDING",
        rowCount: input.rowCount,
        successfulRowCount: input.successfulCount,
        failedRowCount: input.failedCount,
        notes: `Preview summary: ${input.successfulCount} valid row(s), ${input.failedCount} issue(s).`,
      },
    });
    batchId = batch.id;

    const groupedRows = new Map<string, NormalizedExtendedProductImport[]>();

    input.rows.forEach((row) => {
      const current = groupedRows.get(row.slug) ?? [];
      current.push(row);
      groupedRows.set(row.slug, current);
    });

    await prisma.$transaction(async (tx) => {
      for (const [slug, productRows] of groupedRows.entries()) {
        const firstRow = productRows[0];

        const product = await tx.product.upsert({
          where: { slug },
          create: {
            slug,
            name: firstRow.product.name,
            category: firstRow.product.category,
            material: firstRow.product.material,
            summary: firstRow.product.summary,
            description: firstRow.product.description,
            features: firstRow.product.features,
            certifications: firstRow.product.certifications,
            applications: firstRow.product.applications,
            industries: firstRow.product.industries,
            supplyFormats: firstRow.product.supplyFormats,
            qualityChecks: firstRow.product.qualityChecks,
            sourcingNotes: firstRow.owner.sourcingNotes,
            technicalProfile: firstRow.product.technicalProfile,
            ownerPriceBookNotes: firstRow.owner.priceBookNotes,
            status: "ACTIVE",
            ownerOnlyManufacturing: true,
          },
          update: {
            name: firstRow.product.name,
            category: firstRow.product.category,
            material: firstRow.product.material,
            summary: firstRow.product.summary,
            description: firstRow.product.description,
            features: firstRow.product.features,
            certifications: firstRow.product.certifications,
            applications: firstRow.product.applications,
            industries: firstRow.product.industries,
            supplyFormats: firstRow.product.supplyFormats,
            qualityChecks: firstRow.product.qualityChecks,
            sourcingNotes: firstRow.owner.sourcingNotes,
            technicalProfile: firstRow.product.technicalProfile,
            ownerPriceBookNotes: firstRow.owner.priceBookNotes,
            status: "ACTIVE",
            ownerOnlyManufacturing: true,
          },
        });

        const manufacturingRecord = await tx.manufacturingRecord.upsert({
          where: { productId: product.id },
          create: {
            productId: product.id,
            compoundCode: firstRow.owner.process.compoundCode || null,
            processNotes:
              firstRow.owner.sourcingNotes.join(" | ") ||
              `Imported via CSV batch ${batch.id}.`,
            cureSystem: firstRow.owner.process.cureSystem || null,
            curingNotes: firstRow.owner.process.cureSystem || null,
            qaNotes: firstRow.owner.process.qaChecks.join(" | ") || null,
            qaChecks: firstRow.owner.process.qaChecks,
            batchSizeKg: firstRow.owner.process.batchSizeKg ?? null,
            monthlyOutputKg: firstRow.owner.process.monthlyOutputKg ?? null,
            scrapRate: firstRow.owner.process.scrapRate || null,
            ownerOnly: true,
          },
          update: {
            compoundCode: firstRow.owner.process.compoundCode || null,
            processNotes:
              firstRow.owner.sourcingNotes.join(" | ") ||
              `Imported via CSV batch ${batch.id}.`,
            cureSystem: firstRow.owner.process.cureSystem || null,
            curingNotes: firstRow.owner.process.cureSystem || null,
            qaNotes: firstRow.owner.process.qaChecks.join(" | ") || null,
            qaChecks: firstRow.owner.process.qaChecks,
            batchSizeKg: firstRow.owner.process.batchSizeKg ?? null,
            monthlyOutputKg: firstRow.owner.process.monthlyOutputKg ?? null,
            scrapRate: firstRow.owner.process.scrapRate || null,
            ownerOnly: true,
          },
        });

        await tx.manufacturingIngredient.deleteMany({
          where: { manufacturingRecordId: manufacturingRecord.id },
        });

        if (firstRow.owner.rawMaterials.length > 0) {
          await tx.manufacturingIngredient.createMany({
            data: firstRow.owner.rawMaterials.map((rawMaterial) => ({
              manufacturingRecordId: manufacturingRecord.id,
              materialName: rawMaterial.name,
              percentage: parsePercentage(rawMaterial.percentage),
              supplierName: rawMaterial.supplier,
              origin: rawMaterial.origin,
              sourceType: rawMaterial.sourceType,
              landedCostUsdPerKg: rawMaterial.landedCostUsdPerKg,
              leadTimeDays: rawMaterial.leadTimeDays,
              supplierNotes: `${rawMaterial.sourceType} via ${rawMaterial.supplier}`,
            })),
          });
        }

        await tx.competitorProduct.deleteMany({ where: { productId: product.id } });

        for (const benchmark of firstRow.owner.competitorBenchmarks) {
          await tx.competitorProduct.create({
            data: {
              productId: product.id,
              competitorName: benchmark.competitor,
              competitorProductName: firstRow.product.name,
              sourceType: "CSV_IMPORT",
              sourceReference: fileName,
              capturedAt: new Date(),
              confidenceScore: 60,
              notes: benchmark.note,
              prices: {
                create: {
                  market: marketFromLabel(benchmark.market, benchmark.currency),
                  currency: benchmark.currency,
                  amount: benchmark.unitPrice,
                  minimumOrderQuantity: firstRow.variant.minimumOrderQuantity,
                },
              },
            },
          });
        }

        for (const row of productRows) {
          const variant = await tx.productVariant.upsert({
            where: { code: row.variant.code },
            create: {
              productId: product.id,
              code: row.variant.code,
              description: row.variant.description,
              minimumOrderQuantity: row.variant.minimumOrderQuantity,
            },
            update: {
              productId: product.id,
              description: row.variant.description,
              minimumOrderQuantity: row.variant.minimumOrderQuantity,
            },
          });

          await tx.variantDimension.deleteMany({ where: { variantId: variant.id } });

          if (row.variant.dimensions.length > 0) {
            await tx.variantDimension.createMany({
              data: row.variant.dimensions.map((dimension, index) => ({
                variantId: variant.id,
                label: dimension.label,
                value: dimension.value,
                sortOrder: index,
              })),
            });
          }

          await tx.productPrice.deleteMany({ where: { variantId: variant.id } });

          const prices = (Object.entries(row.priceBook) as Array<[CurrencyCode, number | undefined]>)
            .filter((entry): entry is [CurrencyCode, number] => entry[1] !== undefined)
            .map(([currency, amount]) => ({
              variantId: variant.id,
              market: marketForCurrency(currency),
              currency,
              amount,
              isPublic: false,
            }));

          if (prices.length > 0) {
            await tx.productPrice.createMany({ data: prices });
          }
        }
      }
    });

    const finalStatus: ImportBatchStatus = input.failedCount > 0 ? "PARTIAL" : "PROCESSED";

    await prisma.importBatch.update({
      where: { id: batch.id },
      data: {
        status: finalStatus,
        successfulRowCount: input.rows.length,
        failedRowCount: input.failedCount,
        notes: `Imported ${input.rows.length} valid row(s) across ${groupedRows.size} product group(s). Preview reported ${input.failedCount} issue(s).`,
      },
    });

    return {
      status: input.failedCount > 0 ? "partial" : "imported",
      message: `Imported ${input.rows.length} valid row(s) from ${fileName} into Prisma across ${groupedRows.size} product group(s).`,
    };
  } catch (error) {
    const message = formatImportError(error);

    if (isDatabaseUnavailableError(error)) {
      return {
        status: "unavailable",
        message,
      };
    }

    const prisma = getPrismaClient();

    try {
      if (batchId) {
        await prisma.importBatch.update({
          where: { id: batchId },
          data: {
            status: "FAILED",
            successfulRowCount: 0,
            failedRowCount: input.failedCount || input.rowCount,
            notes: `Import failed: ${message}`,
          },
        });
      } else {
        await prisma.importBatch.create({
          data: {
            fileName,
            sourceType: "CSV",
            status: "FAILED",
            rowCount: input.rowCount,
            successfulRowCount: 0,
            failedRowCount: input.failedCount || input.rowCount,
            notes: `Import failed: ${message}`,
          },
        });
      }
    } catch {
      // Ignore secondary batch logging failures.
    }

    return {
      status: "error",
      message,
    };
  }
}