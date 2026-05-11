import type { NextRequest } from "next/server";
import { getCatalogPayload } from "@/lib/api-data";
import { jsonResponse, optionsResponse } from "@/lib/api-response";

export function GET(request: NextRequest) {
  return jsonResponse(request, getCatalogPayload(), {
    methods: ["GET", "OPTIONS"],
  });
}

export function OPTIONS(request: NextRequest) {
  return optionsResponse(request, {
    methods: ["GET", "OPTIONS"],
  });
}