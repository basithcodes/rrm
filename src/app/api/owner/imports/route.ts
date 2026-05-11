import type { NextRequest } from "next/server";
import { getImportMetaPayload } from "@/lib/api-data";
import { isOwnerRequestAuthenticated } from "@/lib/auth";
import { jsonResponse, optionsResponse } from "@/lib/api-response";

const ownerImportsMethods = ["GET", "OPTIONS"];

export async function GET(request: NextRequest) {
  if (!(await isOwnerRequestAuthenticated(request))) {
    return jsonResponse(
      request,
      { message: "Unauthorized" },
      {
        status: 401,
        credentials: true,
        methods: ownerImportsMethods,
      },
    );
  }

  return jsonResponse(request, getImportMetaPayload(), {
    credentials: true,
    methods: ownerImportsMethods,
  });
}

export function OPTIONS(request: NextRequest) {
  return optionsResponse(request, {
    credentials: true,
    methods: ownerImportsMethods,
  });
}