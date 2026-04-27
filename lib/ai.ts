/**
 * Model identifiers for the OrgGraph AI calls.
 *
 * Uses Google's Gemini 2.5 Flash via the official AI SDK Google provider.
 * Free tier: ~250 requests/day, ~10 RPM — comfortably more than enough for the
 * showcase demo and for the cached `data/profiles.json` regeneration script.
 *
 * Auth lives in env var `GOOGLE_GENERATIVE_AI_API_KEY` (set in `.env.local`,
 * and in Vercel project env for Production + Preview).
 * Get a free key at https://aistudio.google.com/apikey.
 */

import { google } from "@ai-sdk/google";

// Default = Gemini 2.5 Flash for profile generation (richer reasoning, cached
// to data/profiles.json so latency doesn't matter at demo time).
//
// Fast = Gemini 2.5 Flash-Lite for live search ranking — purpose-built for
// low-latency classification/ranking tasks. Skips the heavy "thinking" pass
// the regular Flash model does, which keeps /api/search comfortably under the
// 5s demo budget. Both share the same free-tier API key.
export const MODEL_DEFAULT = google("gemini-2.5-flash");
export const MODEL_FAST = google("gemini-2.5-flash-lite");

export type ModelId = typeof MODEL_DEFAULT | typeof MODEL_FAST;
