# Branch Brief — `feature/talent-search`

**Owner:** Arnav · **Ticket:** SCRUM-15 · **Feature:** Skill-based talent search & ranked results

> Your job: a manager-facing search box. Free-text query in (e.g. *"who has React experience?"*, *"fraud detection"*) → AI-ranked candidates out, with match score, matched skills, and transfer interest. Click a result → see the candidate's profile.

## Read first
1. [`docs/PRD.md`](../PRD.md) §3 Feature 2
2. [`docs/ARCHITECTURE.md`](../ARCHITECTURE.md) — AI calls section, especially the search route
3. [`docs/BRAND.md`](../BRAND.md) — sand is your accent (`#f5edd0`)
4. [`docs/BRANCHING.md`](../BRANCHING.md) — daily rebase flow
5. [`CLAUDE.md`](../../CLAUDE.md) — global agent rules

## What you're building
| Surface | Path | Notes |
| --- | --- | --- |
| Search page | `/app/search` | Manager view. Big input + ranked results below. |
| Ranking API | `/api/search` | POST `{ query }` → `SearchResult[]` ranked by `matchScore`. |
| Search prompt | `lib/prompts/search.ts` | Pass the query + all profiles in one LLM call. |
| Result row component | `components/search/ResultRow.tsx` | Score badge + matched-skill chips + transfer interest pill. |

## Acceptance criteria (from PRD)
- [ ] Free-text input.
- [ ] AI returns a ranked candidate list against seeded profiles.
- [ ] Each result row shows: name, match score, matched skill highlights, transfer interest flag.
- [ ] Clicking a result opens `/app/profile/[id]` (or an inline drawer — your call).
- [ ] Returns useful results in **< 5s** on demo hardware.

## Design notes
- Sand accent (`#f5edd0` card bg, `#e5d5a0` badge bg, `#7a6520` badge text).
- Hero: a single Caveat-font headline ("Find your next teammate.") + the input.
- Result rows are flat cards with a left-accent stripe in sand.
- Match score = small filled badge (0–100). Use color tone to hint quality (green ≥ 75, sand 50–74, gray < 50).
- Transfer-interest = small "Open to transfer" pill in sage when true.
- Loading: shadcn skeleton rows × 3 for ~1s while AI ranks.

## Demo path responsibilities
Per `docs/MVP_PLAN.md` demo script:
1. Switch from Engineer view → Manager view via the role switcher in the navbar.
2. Type *"fraud detection"* into search.
3. Top result is the seeded engineer who maintained a fraud system (matches the customer-discovery story).
4. Click the result → routes to `/app/profile/[id]`.

The seeded engineer for the fraud-detection story is in `data/engineers.json` (coordinate w/ Rayan on the id). Make sure your demo query reliably ranks them at the top.

## Cross-feature contracts
- You **read** `data/profiles.json` (produced by F1) and `data/engineers.json`.
- You **read** the `Profile` and `SearchResult` zod shapes from `lib/schemas.ts` (lives on main).
- Until F1 ships real profiles, work against `data/profiles.sample.json` (a hand-rolled fixture you commit on this branch).

## Out of scope for your branch
- Don't modify `/app/profile/*` or `/app/teams/*`.
- Don't change the `Profile` schema — propose changes via a PR to main.
- No "chat with the candidate's AI persona" — explicitly deferred per PRD.

## Suggested order of work
1. Stub `/app/search/page.tsx` with the input + a fake `useState` results list. Get the layout right.
2. `lib/prompts/search.ts` — ranking prompt. Use `generateObject` to enforce `SearchResult[]` shape.
3. `/api/search/route.ts` — load profiles, call Haiku via `lib/ai.ts`, return ranked array.
4. Wire the page to the API. Add loading skeleton + empty state.
5. Result row → click navigates to `/app/profile/[id]`.
6. Latency check on the deployed preview. If > 5s, shrink the prompt (drop low-confidence skills, drop long evidence quotes, summarize profile down to ~80 tokens each).

## Gotchas
- Use `MODEL_FAST` (`anthropic/claude-haiku-4-5`) — quality is fine for ranking and latency wins.
- Rank deterministically: prompt the model to return scores 0–100 and the array sorted descending. Sort again client-side as a safety net.
- Watch for the model padding scores when no candidates fit — handle empty results gracefully ("No internal candidates match yet — try broadening your query").
- Cap context: pass profiles as compact JSON, not pretty-printed.
