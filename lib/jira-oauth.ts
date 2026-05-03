import "server-only";

import {
  clearCookie,
  consumeStateCookie,
  generateState,
  readSignedCookie,
  safeReturnTo,
  setSignedCookie,
  setStateCookie,
} from "./oauth-cookie";

/**
 * Jira (Atlassian) OAuth 2.0 (3LO) helpers.
 *
 * Mirrors lib/github-oauth.ts but routes through Atlassian's OAuth server:
 * - Authorize: https://auth.atlassian.com/authorize
 * - Token:     https://auth.atlassian.com/oauth/token
 *
 * Cookies:
 * - jira_token   — signed, holds the access token (24h TTL).
 * - jira_state   — short-lived CSRF state.
 * - jira_return_to — short-lived path to redirect back to after callback.
 */

const COOKIE_TOKEN = "jira_token";
const COOKIE_STATE = "jira_state";
const COOKIE_RETURN_TO = "jira_return_to";

const SCOPE = "read:jira-user read:jira-work offline_access";
const DEFAULT_RETURN_TO = "/app/demo";
const AUTHORIZE_URL = "https://auth.atlassian.com/authorize";
const TOKEN_URL = "https://auth.atlassian.com/oauth/token";
const AUDIENCE = "api.atlassian.com";

export async function issueState(returnTo?: string | null): Promise<string> {
  const state = generateState();
  await setStateCookie(COOKIE_STATE, state);
  await setStateCookie(
    COOKIE_RETURN_TO,
    safeReturnTo(returnTo, DEFAULT_RETURN_TO)
  );
  return state;
}

export async function consumeState(): Promise<string | null> {
  return consumeStateCookie(COOKIE_STATE);
}

export async function consumeReturnTo(): Promise<string> {
  const v = await consumeStateCookie(COOKIE_RETURN_TO);
  return safeReturnTo(v, DEFAULT_RETURN_TO);
}

export async function setTokenCookie(accessToken: string): Promise<void> {
  await setSignedCookie(COOKIE_TOKEN, accessToken);
}

export async function readTokenCookie(): Promise<string | null> {
  return readSignedCookie(COOKIE_TOKEN);
}

export async function clearTokenCookie(): Promise<void> {
  await clearCookie(COOKIE_TOKEN);
}

export function buildAuthorizeUrl(state: string): string {
  const clientId = process.env.JIRA_CLIENT_ID;
  const redirectUri = process.env.JIRA_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    throw new Error(
      "JIRA_CLIENT_ID or JIRA_REDIRECT_URI is not set."
    );
  }
  const params = new URLSearchParams({
    audience: AUDIENCE,
    client_id: clientId,
    scope: SCOPE,
    redirect_uri: redirectUri,
    state,
    response_type: "code",
    prompt: "consent",
  });
  return `${AUTHORIZE_URL}?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string): Promise<string> {
  const clientId = process.env.JIRA_CLIENT_ID;
  const clientSecret = process.env.JIRA_CLIENT_SECRET;
  const redirectUri = process.env.JIRA_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "JIRA_CLIENT_ID / JIRA_CLIENT_SECRET / JIRA_REDIRECT_URI must all be set."
    );
  }

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Atlassian token exchange failed: HTTP ${res.status}`);
  }
  const json = (await res.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };
  if (!json.access_token) {
    throw new Error(
      `Atlassian token exchange returned no access_token (${json.error ?? "unknown"}: ${json.error_description ?? "no description"})`
    );
  }
  return json.access_token;
}
