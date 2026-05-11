import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const OWNER_SESSION_COOKIE = "rrm_owner_session";
const SESSION_DURATION = 60 * 60 * 24 * 7;
const OWNER_API_TOKEN_SCOPE = "rrm-owner-api";

function getSessionSecret() {
  return process.env.SESSION_SECRET ?? "development-session-secret";
}

function getOwnerAccessCode() {
  return process.env.OWNER_ACCESS_CODE ?? "rrm-owner-demo";
}

function createSessionToken() {
  return createHmac("sha256", getSessionSecret())
    .update(getOwnerAccessCode())
    .digest("hex");
}

function signOwnerTokenPayload(encodedPayload: string) {
  return createHmac("sha256", getSessionSecret())
    .update(`${OWNER_API_TOKEN_SCOPE}:${encodedPayload}`)
    .digest("base64url");
}

function readBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim() || null;
}

export function validateOwnerAccessCode(input: string) {
  const expected = Buffer.from(getOwnerAccessCode());
  const provided = Buffer.from(input);

  if (expected.length !== provided.length) {
    return false;
  }

  return timingSafeEqual(expected, provided);
}

export function createOwnerApiToken(expiresInSeconds = SESSION_DURATION) {
  const encodedPayload = Buffer.from(
    JSON.stringify({
      scope: OWNER_API_TOKEN_SCOPE,
      exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
    }),
    "utf-8",
  ).toString("base64url");

  return `${encodedPayload}.${signOwnerTokenPayload(encodedPayload)}`;
}

export function validateOwnerApiToken(token: string) {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return false;
  }

  const expectedSignature = signOwnerTokenPayload(encodedPayload);
  const expected = Buffer.from(expectedSignature);
  const provided = Buffer.from(signature);

  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf-8")) as {
      exp?: unknown;
      scope?: unknown;
    };

    return (
      payload.scope === OWNER_API_TOKEN_SCOPE &&
      typeof payload.exp === "number" &&
      payload.exp > Math.floor(Date.now() / 1000)
    );
  } catch {
    return false;
  }
}

export async function createOwnerSession() {
  const cookieStore = await cookies();

  cookieStore.set(OWNER_SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_DURATION,
    path: "/",
  });
}

export async function clearOwnerSession() {
  const cookieStore = await cookies();
  cookieStore.delete(OWNER_SESSION_COOKIE);
}

export async function isOwnerAuthenticated() {
  const cookieStore = await cookies();
  const session = cookieStore.get(OWNER_SESSION_COOKIE)?.value;

  return session === createSessionToken();
}

export async function isOwnerRequestAuthenticated(request: Request) {
  if (await isOwnerAuthenticated()) {
    return true;
  }

  const bearerToken = readBearerToken(request);

  return bearerToken ? validateOwnerApiToken(bearerToken) : false;
}

export function getOwnerSessionDuration() {
  return SESSION_DURATION;
}

export async function requireOwnerSession() {
  if (!(await isOwnerAuthenticated())) {
    redirect("/owner-access");
  }
}