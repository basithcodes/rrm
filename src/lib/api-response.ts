import type { NextRequest } from "next/server";

type ResponseOptions = {
  status?: number;
  credentials?: boolean;
  methods?: string[];
};

function isLocalOrigin(origin: string) {
  try {
    const parsed = new URL(origin);
    return parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

function buildCorsHeaders(request: NextRequest, options?: ResponseOptions) {
  const headers = new Headers();
  const origin = request.headers.get("origin");

  headers.set("Vary", "Origin");
  headers.set("Access-Control-Allow-Methods", (options?.methods ?? ["GET", "OPTIONS"]).join(", "));
  headers.set("Access-Control-Allow-Headers", "Content-Type");

  if (origin && isLocalOrigin(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);

    if (options?.credentials) {
      headers.set("Access-Control-Allow-Credentials", "true");
    }
  }

  return headers;
}

export function jsonResponse(request: NextRequest, payload: unknown, options?: ResponseOptions) {
  const headers = buildCorsHeaders(request, options);
  headers.set("Content-Type", "application/json; charset=utf-8");

  return new Response(JSON.stringify(payload), {
    status: options?.status ?? 200,
    headers,
  });
}

export function optionsResponse(request: NextRequest, options?: ResponseOptions) {
  return new Response(null, {
    status: options?.status ?? 204,
    headers: buildCorsHeaders(request, options),
  });
}