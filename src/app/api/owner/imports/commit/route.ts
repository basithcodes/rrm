import type { NextRequest } from "next/server";
import { isOwnerRequestAuthenticated } from "@/lib/auth";
import { jsonResponse, optionsResponse } from "@/lib/api-response";
import { importValidatedRows } from "@/lib/imports/service";
import type { NormalizedExtendedProductImport } from "@/lib/imports/csv";

type ImportCommitBody = {
  fileName?: unknown;
  rowCount?: unknown;
  successfulCount?: unknown;
  failedCount?: unknown;
  rows?: unknown;
};

function parseRows(rows: unknown) {
  if (!Array.isArray(rows)) {
    throw new Error("Import payload is not a valid row array.");
  }

  return rows as NormalizedExtendedProductImport[];
}

function parseNumberField(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

const ownerImportCommitMethods = ["POST", "OPTIONS"];

export async function POST(request: NextRequest) {
  if (!(await isOwnerRequestAuthenticated(request))) {
    return jsonResponse(
      request,
      { message: "Unauthorized" },
      {
        status: 401,
        credentials: true,
        methods: ownerImportCommitMethods,
      },
    );
  }

  let body: ImportCommitBody;

  try {
    body = (await request.json()) as ImportCommitBody;
  } catch {
    return jsonResponse(
      request,
      { message: "Invalid JSON body." },
      {
        status: 400,
        credentials: true,
        methods: ownerImportCommitMethods,
      },
    );
  }

  try {
    const result = await importValidatedRows({
      fileName: typeof body.fileName === "string" ? body.fileName : "uploaded.csv",
      rowCount: parseNumberField(body.rowCount),
      successfulCount: parseNumberField(body.successfulCount),
      failedCount: parseNumberField(body.failedCount),
      rows: parseRows(body.rows),
    });

    return jsonResponse(request, result, {
      credentials: true,
      methods: ownerImportCommitMethods,
    });
  } catch (error) {
    return jsonResponse(
      request,
      { message: error instanceof Error ? error.message : "Unable to import rows." },
      {
        status: 400,
        credentials: true,
        methods: ownerImportCommitMethods,
      },
    );
  }
}

export function OPTIONS(request: NextRequest) {
  return optionsResponse(request, {
    credentials: true,
    methods: ownerImportCommitMethods,
  });
}