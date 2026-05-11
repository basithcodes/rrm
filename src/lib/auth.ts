import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const OWNER_SESSION_COOKIE = "rrm_owner_session";
const SESSION_DURATION = 60 * 60 * 24 * 7;

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

export function validateOwnerAccessCode(input: string) {
  const expected = Buffer.from(getOwnerAccessCode());
  const provided = Buffer.from(input);

  if (expected.length !== provided.length) {
    return false;
  }

  return timingSafeEqual(expected, provided);
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

export async function requireOwnerSession() {
  if (!(await isOwnerAuthenticated())) {
    redirect("/owner-access");
  }
}