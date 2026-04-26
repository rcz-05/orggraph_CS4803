/**
 * Demo-only session — shared constants safe for both client and server.
 *
 * For server-only cookie reads (`getRole`, `getCurrentEngineerId`), import from
 * `lib/session-server.ts` instead. Splitting prevents `next/headers` from
 * leaking into the client bundle when a client component just needs the cookie
 * name or the Role type.
 */

export type Role = "engineer" | "manager";

export const DEFAULT_ENGINEER_ID = "eng-rayan";
export const DEFAULT_ROLE: Role = "engineer";

export const COOKIE_NAMES = {
  role: "og_role",
  engineer: "og_engineer",
} as const;
