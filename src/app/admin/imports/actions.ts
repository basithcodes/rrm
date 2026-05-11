"use server";

import { importValidatedRows, type ImportBatchResult } from "@/lib/imports/service";
import type { NormalizedExtendedProductImport } from "@/lib/imports/csv";

export type ImportBatchActionState = ImportBatchResult;

function parseImportedRows(rowsJson: string) {
  const parsed = JSON.parse(rowsJson) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error("Import payload is not a valid row array.");
  }

  return parsed as NormalizedExtendedProductImport[];
}

export async function importPreviewRows(
  _previousState: ImportBatchActionState,
  formData: FormData,
): Promise<ImportBatchActionState> {
  const fileName = String(formData.get("fileName") ?? "uploaded.csv").trim() || "uploaded.csv";
  const rowCount = Number(formData.get("rowCount") ?? 0);
  const successfulCount = Number(formData.get("successfulCount") ?? 0);
  const failedCount = Number(formData.get("failedCount") ?? 0);
  const rowsJson = String(formData.get("rowsJson") ?? "");

  if (!rowsJson) {
    return {
      status: "error",
      message: "No validated rows were submitted for import.",
    };
  }

  return importValidatedRows({
    fileName,
    rowCount,
    successfulCount,
    failedCount,
    rows: parseImportedRows(rowsJson),
  });
}