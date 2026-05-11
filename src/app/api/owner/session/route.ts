import type { NextRequest } from "next/server";
import {
  createOwnerApiToken,
  clearOwnerSession,
  createOwnerSession,
  getOwnerSessionDuration,
  isOwnerRequestAuthenticated,
  validateOwnerAccessCode,
} from "@/lib/auth";
import { jsonResponse, optionsResponse } from "@/lib/api-response";

type OwnerSessionBody = {
  passcode?: unknown;
};

const ownerSessionMethods = ["GET", "POST", "DELETE", "OPTIONS"];

export async function GET(request: NextRequest) {
  return jsonResponse(
    request,
    {
      authenticated: await isOwnerRequestAuthenticated(request),
    },
    {
      credentials: true,
      methods: ownerSessionMethods,
    },
  );
}

export async function POST(request: NextRequest) {
  let body: OwnerSessionBody;

  try {
    body = (await request.json()) as OwnerSessionBody;
  } catch {
    return jsonResponse(
      request,
      {
        authenticated: false,
        message: "Invalid JSON body.",
      },
      {
        status: 400,
        credentials: true,
        methods: ownerSessionMethods,
      },
    );
  }

  const passcode = typeof body.passcode === "string" ? body.passcode.trim() : "";

  if (!passcode || !validateOwnerAccessCode(passcode)) {
    return jsonResponse(
      request,
      {
        authenticated: false,
        message: "Invalid owner access code.",
      },
      {
        status: 401,
        credentials: true,
        methods: ownerSessionMethods,
      },
    );
  }

  await createOwnerSession();

  return jsonResponse(
    request,
    {
      authenticated: true,
      token: createOwnerApiToken(),
      expiresIn: getOwnerSessionDuration(),
    },
    {
      credentials: true,
      methods: ownerSessionMethods,
    },
  );
}

export async function DELETE(request: NextRequest) {
  await clearOwnerSession();

  return jsonResponse(
    request,
    {
      authenticated: false,
    },
    {
      credentials: true,
      methods: ownerSessionMethods,
    },
  );
}

export function OPTIONS(request: NextRequest) {
  return optionsResponse(request, {
    credentials: true,
    methods: ownerSessionMethods,
  });
}