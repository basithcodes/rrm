import type { NextRequest } from "next/server";
import { isOwnerRequestAuthenticated } from "@/lib/auth";
import { jsonResponse, optionsResponse } from "@/lib/api-response";
import { parseImportPreview } from "@/lib/imports/preview";

type ImportPreviewBody = {
  csvText?: unknown;
  fileName?: unknown;
};

const ownerImportPreviewMethods = ["POST", "OPTIONS"];

export async function POST(request: NextRequest) {
  if (!(await isOwnerRequestAuthenticated(request))) {
    return jsonResponse(
      request,
      { message: "Unauthorized" },
      {
        status: 401,
        credentials: true,
        methods: ownerImportPreviewMethods,
      },
    );
  }

  let body: ImportPreviewBody;

  try {
    body = (await request.json()) as ImportPreviewBody;
  } catch {
    return jsonResponse(
      request,
      { message: "Invalid JSON body." },
      {
        status: 400,
        credentials: true,
        methods: ownerImportPreviewMethods,
      },
    );
  }

  const csvText = typeof body.csvText === "string" ? body.csvText : "";
  const fileName = typeof body.fileName === "string" && body.fileName.trim()
    ? body.fileName.trim()
    : "uploaded.csv";

  if (!csvText.trim()) {
    return jsonResponse(
      request,
      { message: "CSV text is required." },
      {
        status: 400,
        credentials: true,
        methods: ownerImportPreviewMethods,
      },
    );
  }

  return jsonResponse(request, parseImportPreview(csvText, fileName), {
    credentials: true,
    methods: ownerImportPreviewMethods,
  });
}

export function OPTIONS(request: NextRequest) {
  return optionsResponse(request, {
    credentials: true,
    methods: ownerImportPreviewMethods,
  });
}