import { generateObject } from "ai";
import { z } from "zod";

import { MODEL_FAST } from "@/lib/ai";
import { getEngineers, getProfiles } from "@/lib/data";
import { SearchResultSchema, type SearchResult } from "@/lib/schemas";
import {
  SEARCH_SYSTEM_PROMPT,
  buildSearchUserPrompt,
} from "@/lib/prompts/search";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ResponseSchema = z.object({
  results: z.array(SearchResultSchema),
});

export async function POST(req: Request) {
  let body: { query?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const query = body.query?.trim();
  if (!query) {
    return Response.json({ error: "query required" }, { status: 400 });
  }

  const [profiles, engineers] = await Promise.all([
    getProfiles(),
    getEngineers(),
  ]);

  if (profiles.length === 0) {
    return Response.json({ results: [] });
  }

  const userPrompt = buildSearchUserPrompt(query, profiles, engineers);

  let results: SearchResult[];
  try {
    const { object } = await generateObject({
      model: MODEL_FAST,
      schema: ResponseSchema,
      system: SEARCH_SYSTEM_PROMPT,
      prompt: userPrompt,
    });
    results = object.results;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Search failed";
    return Response.json({ error: message }, { status: 500 });
  }

  results.sort((a, b) => b.matchScore - a.matchScore);

  return Response.json({ results });
}
