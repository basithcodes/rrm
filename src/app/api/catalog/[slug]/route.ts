import type { NextRequest } from "next/server";
import { getProductDetailPayload } from "@/lib/api-data";
import { jsonResponse, optionsResponse } from "@/lib/api-response";

export async function GET(request: NextRequest, context: RouteContext<"/api/catalog/[slug]">) {
  const { slug } = await context.params;
  const payload = getProductDetailPayload(slug);

  if (!payload) {
    return jsonResponse(
      request,
      {
        message: "Product not found.",
      },
      {
        status: 404,
        methods: ["GET", "OPTIONS"],
      },
    );
  }

  return jsonResponse(request, payload, {
    methods: ["GET", "OPTIONS"],
  });
}

export function OPTIONS(request: NextRequest) {
  return optionsResponse(request, {
    methods: ["GET", "OPTIONS"],
  });
}