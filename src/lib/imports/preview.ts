import Papa from "papaparse";
import {
  normalizeExtendedProductImportRow,
  productImportHeaders,
  type NormalizedExtendedProductImport,
} from "@/lib/imports/csv";

export type ImportPreviewState = {
  fileName: string;
  rowCount: number;
  successfulCount: number;
  failedCount: number;
  missingHeaders: string[];
  rows: NormalizedExtendedProductImport[];
  errors: string[];
};

export function parseImportPreview(csvText: string, fileName: string): ImportPreviewState {
  const parseResult = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const fields = parseResult.meta.fields ?? [];
  const missingHeaders = productImportHeaders.filter((header) => !fields.includes(header));
  const errors = parseResult.errors.map((error) => {
    const rowLabel = error.row !== undefined ? `Row ${error.row + 2}` : "CSV parser";
    return `${rowLabel}: ${error.message}`;
  });

  if (missingHeaders.length > 0) {
    errors.unshift(`Missing required headers: ${missingHeaders.join(", ")}.`);
  }

  const rows: NormalizedExtendedProductImport[] = [];

  parseResult.data.forEach((row, index) => {
    const hasValues = Object.values(row).some((value) => String(value ?? "").trim().length > 0);

    if (!hasValues) {
      return;
    }

    try {
      rows.push(normalizeExtendedProductImportRow(row));
    } catch (error) {
      errors.push(
        `Row ${index + 2}: ${error instanceof Error ? error.message : "Unable to normalize row."}`,
      );
    }
  });

  const rowCount = parseResult.data.filter((row) =>
    Object.values(row).some((value) => String(value ?? "").trim().length > 0),
  ).length;

  return {
    fileName,
    rowCount,
    successfulCount: rows.length,
    failedCount: errors.length,
    missingHeaders,
    rows,
    errors,
  };
}