"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import { Eyebrow } from "@/components/shared/eyebrow";
import { CaveatHeading } from "@/components/shared/caveat-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ResultRow } from "@/components/search/result-row";
import type { Engineer, SearchResult } from "@/lib/schemas";

const SUGGESTIONS = [
  "fraud detection",
  "Postgres performance",
  "React design systems",
  "LLM eval pipelines",
];
const SCORE_FILTERS = [
  { label: "All scores", value: 0 },
  { label: "50+", value: 50 },
  { label: "70+", value: 70 },
  { label: "85+", value: 85 },
];

export function SearchPageClient() {
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState(false);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [engineers, setEngineers] = useState<Map<string, Engineer>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [openToTransferOnly, setOpenToTransferOnly] = useState(false);
  const [minimumScore, setMinimumScore] = useState(0);
  const filteredResults =
    results?.filter(
      (result) =>
        (!openToTransferOnly || result.openToTransfer) &&
        result.matchScore >= minimumScore
    ) ??
    null;

  useEffect(() => {
    fetch("/api/engineers")
      .then((r) => (r.ok ? r.json() : []))
      .then((list: Engineer[]) => {
        setEngineers(new Map(list.map((e) => [e.id, e])));
      })
      .catch(() => {});
  }, []);

  async function runSearch(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    setPending(true);
    setError(null);
    setSubmittedQuery(trimmed);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Search failed (${res.status})`);
      }
      const data = (await res.json()) as { results: SearchResult[] };
      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setResults([]);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-10 py-4">
      <header className="flex flex-col gap-3">
        <Eyebrow>Talent search · manager view</Eyebrow>
        <CaveatHeading as="h1">Find your next teammate.</CaveatHeading>
        <p className="max-w-2xl text-[14px] leading-[1.65] text-[#666]">
          Describe what you need in plain language. We&apos;ll rank internal
          engineers against the seeded profiles and surface real evidence — no
          self-promotion, no recruiter spin.
        </p>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          runSearch(query);
        }}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-2 rounded-2xl bg-[#f5edd0] p-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a6520]" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='e.g. "fraud detection", "who has React experience?"'
              className="h-12 border-0 bg-white pl-10 text-[15px]"
              autoFocus
            />
          </div>
          <Button type="submit" size="lg" disabled={pending}>
            {pending ? "Ranking…" : "Search"}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[12px] text-[#666]">
          <span>Try:</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setQuery(s);
                runSearch(s);
              }}
              className="rounded-full bg-[#f5f5f5] px-2.5 py-1 text-[11px] text-[#444] hover:bg-[#e5d5a0] hover:text-[#7a6520]"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#eee] bg-[#fafafa] px-4 py-3">
          <button
            type="button"
            onClick={() => setOpenToTransferOnly((value) => !value)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
              openToTransferOnly
                ? "border-[#b8cdb0] bg-[#e2edd9] text-[#3d6132]"
                : "border-[#e5e5e5] bg-white text-[#666]"
            }`}
            aria-pressed={openToTransferOnly}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                openToTransferOnly ? "bg-[#3d6132]" : "bg-[#ccc]"
              }`}
            />
            Open to transfer only
          </button>
          {results !== null && openToTransferOnly && (
            <span className="text-[11px] text-[#777]">
              Showing {filteredResults?.length ?? 0} of {results.length} ranked
              candidates.
            </span>
          )}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[11px] font-medium text-[#777]">
              Minimum score
            </span>
            {SCORE_FILTERS.map((filter) => {
              const active = minimumScore === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setMinimumScore(filter.value)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                    active
                      ? "border-[#7a6520] bg-[#f5edd0] text-[#7a6520]"
                      : "border-[#e5e5e5] bg-white text-[#666]"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>
      </form>

      <section className="flex flex-col gap-3">
        {pending && (
          <>
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </>
        )}

        {!pending && error && (
          <div className="rounded-2xl border border-[#f5c4b8] bg-[#fce8e1] p-5 text-[13px] text-[#9e4433]">
            <p className="font-semibold">Search failed.</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        {!pending && !error && filteredResults !== null && filteredResults.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#ddd] p-10 text-center">
            <p
              className="text-[20px] text-[#999]"
              style={{ fontFamily: "var(--font-caveat), cursive" }}
            >
              {openToTransferOnly && results && results.length > 0
                ? "No ranked candidates are open to transfer right now."
                : minimumScore > 0 && results && results.length > 0
                  ? "No candidates meet this match-score threshold."
                  : "No internal candidates match yet — try broadening your query."}
            </p>
            {submittedQuery && (
              <p className="mt-2 text-[12px] text-[#bbb]">
                Searched: &ldquo;{submittedQuery}&rdquo;
              </p>
            )}
          </div>
        )}

        {!pending && !error && filteredResults !== null && filteredResults.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <Eyebrow>
                {filteredResults.length} candidate
                {filteredResults.length === 1 ? "" : "s"} for
                &ldquo;{submittedQuery}&rdquo;
              </Eyebrow>
            </div>
            {filteredResults.map((r) => (
              <ResultRow
                key={r.engineerId}
                result={r}
                engineer={engineers.get(r.engineerId) ?? null}
              />
            ))}
          </>
        )}

        {!pending && !error && results === null && (
          <p className="text-[12px] text-[#bbb]">
            Results will appear here. The first search may take 2–5s while we
            rank against seeded profiles.
          </p>
        )}
      </section>
    </div>
  );
}
