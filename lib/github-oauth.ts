import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * GitHub OAuth helpers.
 *
 * - Generates CSRF state for the authorize redirect.
 * - Signs/verifies the access token cookie via HMAC-SHA256 with a server-only
 *   secret (`GITHUB_COOKIE_SECRET`). The token itself is NOT encrypted (the
 *   cookie is httpOnly + Secure + SameSite=Lax which is enough for a demo
 *   surface that holds a single user's token short-term), but tampering is
 *   detected via signature verification.
 * - Cookie names + scopes intentionally constant so the route handlers are
 *   the only owners of cookie semantics.
 */

const COOKIE_TOKEN = "gh_token";
const COOKIE_STATE = "gh_state";

const SCOPE = "read:user public_repo";

// 24h — long enough that the demo doesn't need to re-authorize mid-day.
const TOKEN_TTL_SECONDS = 60 * 60 * 24;
const STATE_TTL_SECONDS = 60 * 10;

function getSecret(): string {
  const s = process.env.GITHUB_COOKIE_SECRET;
  if (!s) throw new Error("GITHUB_COOKIE_SECRET is not set.");
  return s;
}

function sign(value: string): string {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/** Build an unguessable CSRF state and stash it in a short-lived cookie. */
export async function issueState(): Promise<string> {
  const state = randomBytes(24).toString("hex");
  const store = await cookies();
  store.set(COOKIE_STATE, state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: STATE_TTL_SECONDS,
  });
  return state;
}

/** Read the issued state cookie and clear it (single-use). */
export async function consumeState(): Promise<string | null> {
  const store = await cookies();
  const v = store.get(COOKIE_STATE)?.value ?? null;
  store.delete(COOKIE_STATE);
  return v;
}

/** Sign-and-store the access token cookie. */
export async function setTokenCookie(accessToken: string): Promise<void> {
  const sig = sign(accessToken);
  const store = await cookies();
  store.set(COOKIE_TOKEN, `${accessToken}.${sig}`, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: TOKEN_TTL_SECONDS,
  });
}

/** Verify-and-return the access token cookie, or null if missing/tampered. */
export async function readTokenCookie(): Promise<string | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_TOKEN)?.value;
  if (!raw) return null;
  const dot = raw.lastIndexOf(".");
  if (dot < 0) return null;
  const token = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  if (!safeEqual(sign(token), sig)) return null;
  return token;
}

export async function clearTokenCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_TOKEN);
}

export function buildAuthorizeUrl(state: string): string {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    throw new Error(
      "GITHUB_CLIENT_ID or GITHUB_REDIRECT_URI is not set."
    );
  }
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: SCOPE,
    state,
    allow_signup: "false",
  });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

/** POST to GitHub's token endpoint to exchange the OAuth code for a token. */
export async function exchangeCodeForToken(code: string): Promise<string> {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const redirectUri = process.env.GITHUB_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET / GITHUB_REDIRECT_URI must all be set."
    );
  }

  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`GitHub token exchange failed: HTTP ${res.status}`);
  }
  const json = (await res.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };
  if (!json.access_token) {
    throw new Error(
      `GitHub token exchange returned no access_token (${json.error ?? "unknown"}: ${json.error_description ?? "no description"})`
    );
  }
  return json.access_token;
}
