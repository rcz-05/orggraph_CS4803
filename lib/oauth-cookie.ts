import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Shared OAuth cookie primitives used by both GitHub and Jira providers.
 *
 * - HMAC-SHA256 signs the token cookie value so tampering is detectable.
 * - The token itself is NOT encrypted (cookie is httpOnly + Secure +
 *   SameSite=Lax which is enough for a demo surface holding a single user's
 *   token short-term).
 * - All providers share the same `OAUTH_COOKIE_SECRET` env var. Falls back to
 *   `GITHUB_COOKIE_SECRET` for backward compat with the original wiring.
 */

function getSecret(): string {
  const s =
    process.env.OAUTH_COOKIE_SECRET ?? process.env.GITHUB_COOKIE_SECRET;
  if (!s) {
    throw new Error(
      "OAUTH_COOKIE_SECRET (or legacy GITHUB_COOKIE_SECRET) is not set."
    );
  }
  return s;
}

export function sign(value: string): string {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function generateState(bytes = 24): string {
  return randomBytes(bytes).toString("hex");
}

const SIG_DELIMITER = ".";

/** Encode `value.signature` for cookie storage. */
export function packSigned(value: string): string {
  return `${value}${SIG_DELIMITER}${sign(value)}`;
}

/** Verify-and-extract original value, or null if missing/tampered. */
export function unpackSigned(raw: string | undefined): string | null {
  if (!raw) return null;
  const dot = raw.lastIndexOf(SIG_DELIMITER);
  if (dot < 0) return null;
  const value = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  if (!safeEqual(sign(value), sig)) return null;
  return value;
}

const SECURE = process.env.NODE_ENV === "production";

/**
 * Standard cookie options for OAuth tokens (httpOnly, secure in prod, lax,
 * 24h TTL).
 */
export function tokenCookieOptions(maxAgeSeconds = 60 * 60 * 24) {
  return {
    httpOnly: true,
    secure: SECURE,
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

/** Standard cookie options for short-lived state (10 min). */
export function stateCookieOptions(maxAgeSeconds = 60 * 10) {
  return {
    httpOnly: true,
    secure: SECURE,
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

/**
 * `return_to` param is restricted to in-app paths only — never an absolute URL,
 * never an external host. Defaults to the provided fallback if invalid.
 */
export function safeReturnTo(
  raw: string | null | undefined,
  fallback: string
): string {
  if (!raw) return fallback;
  if (!raw.startsWith("/")) return fallback;
  if (raw.startsWith("//")) return fallback; // protocol-relative, blocked
  return raw;
}

export async function setSignedCookie(
  name: string,
  value: string,
  maxAgeSeconds?: number
): Promise<void> {
  const store = await cookies();
  store.set(name, packSigned(value), tokenCookieOptions(maxAgeSeconds));
}

export async function readSignedCookie(name: string): Promise<string | null> {
  const store = await cookies();
  return unpackSigned(store.get(name)?.value);
}

export async function setStateCookie(
  name: string,
  value: string
): Promise<void> {
  const store = await cookies();
  store.set(name, value, stateCookieOptions());
}

export async function consumeStateCookie(name: string): Promise<string | null> {
  const store = await cookies();
  const v = store.get(name)?.value ?? null;
  store.delete(name);
  return v;
}

export async function clearCookie(name: string): Promise<void> {
  const store = await cookies();
  store.delete(name);
}
