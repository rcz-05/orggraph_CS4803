/**
 * Model identifiers for the OrgGraph AI calls.
 *
 * Local development uses **OpenRouter** via `@openrouter/ai-sdk-provider`.
 * Default routes through `openrouter/free`, OpenRouter's free-tier meta-router
 * that picks a free model supporting the features we need (structured outputs,
 * etc).
 *
 * Auth lives in env var `OPENROUTER_API_KEY` (set in `.env.local`).
 */

import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const FREE_ROUTER = "openrouter/free";

export const MODEL_DEFAULT = openrouter.chat(FREE_ROUTER);
export const MODEL_FAST = openrouter.chat(FREE_ROUTER);

export type ModelId = typeof MODEL_DEFAULT | typeof MODEL_FAST;
