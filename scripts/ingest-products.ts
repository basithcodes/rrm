#!/usr/bin/env node
/**
 * Standalone CSV ingestion runner.
 *
 * Usage:
 *   DATABASE_URL=postgres://... npx tsx scripts/ingest-products.ts data/sample-products.csv
 *
 * Notes:
 *   - Re-running on the same CSV is safe: every row is upserted by `slug`
 *     (Product) and `code` (ProductVariant), so duplicates are impossible.
 *   - This script does NOT touch the ManufacturingData / TradeSecret tables.
 *     Trade secrets are loaded by a separate, owner-only admin pipeline.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { ingestProductCsv } from "../src/lib/imports/ingest-products";

async function main() {
  const csvArg = process.argv[2];
  if (!csvArg) {
    console.error("Usage: npx tsx scripts/ingest-products.ts <path-to-csv>");
    process.exit(1);
  }

  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set. Aborting.");
    process.exit(1);
  }

  const csvPath = resolve(process.cwd(), csvArg);
  const csv = readFileSync(csvPath, "utf8");

  const pool = new Pool({ connectionString: databaseUrl });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    const summary = await ingestProductCsv(csv, prisma);
    console.log(JSON.stringify(summary, null, 2));
    if (summary.errors.length > 0) process.exitCode = 2;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
