import type { NextRequest } from "next/server";
import { isOwnerRequestAuthenticated } from "@/lib/auth";
import { getOwnerDashboardPayload } from "@/lib/api-data";
import { jsonResponse, optionsResponse } from "@/lib/api-response";

const ownerDashboardMethods = ["GET", "OPTIONS"];

export async function GET(request: NextRequest) {
  if (!(await isOwnerRequestAuthenticated(request))) {
    return jsonResponse(
      request,
      {
        message: "Unauthorized",
      },
      {
        status: 401,
        credentials: true,
        methods: ownerDashboardMethods,
      },
    );
  }

  return jsonResponse(request, await getOwnerDashboardPayload(), {
    credentials: true,
    methods: ownerDashboardMethods,
  });
}

export function OPTIONS(request: NextRequest) {
  return optionsResponse(request, {
    credentials: true,
    methods: ownerDashboardMethods,
  });
}