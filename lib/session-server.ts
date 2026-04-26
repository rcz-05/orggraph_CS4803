import "server-only";
import { cookies } from "next/headers";

import {
  COOKIE_NAMES,
  DEFAULT_ENGINEER_ID,
  DEFAULT_ROLE,
  type Role,
} from "./session";

export async function getRole(): Promise<Role> {
  const store = await cookies();
  const v = store.get(COOKIE_NAMES.role)?.value;
  return v === "manager" ? "manager" : DEFAULT_ROLE;
}

export async function getCurrentEngineerId(): Promise<string> {
  const store = await cookies();
  return store.get(COOKIE_NAMES.engineer)?.value ?? DEFAULT_ENGINEER_ID;
}
