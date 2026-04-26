# Branch Brief — `feature/team-portal`

**Owner:** Sahib · **Ticket:** SCRUM-16 · **Feature:** Team & Project Discovery Portal

> Your job: an engineer-facing portal to browse internal teams. List + filters → click a team → see what they work on, their stack, skill gaps, and a "Signal interest" button. PRD explicitly says **2–3 well-seeded teams are enough** for the demo — don't over-build.

## Read first
1. [`docs/PRD.md`](../PRD.md) §3 Feature 3
2. [`docs/ARCHITECTURE.md`](../ARCHITECTURE.md) — Team data model + signal API
3. [`docs/BRAND.md`](../BRAND.md) — slate-blue is your accent (`#dce4ef`)
4. [`docs/BRANCHING.md`](../BRANCHING.md) — daily rebase flow
5. [`CLAUDE.md`](../../CLAUDE.md) — global agent rules

## What you're building
| Surface | Path | Notes |
| --- | --- | --- |
| Team list | `/app/teams` | Card grid + chip filters (tech stack, project type). |
| Team detail | `/app/teams/[slug]` | Mission, current projects, key tech, owned services, skill gaps, "Signal interest" button. |
| Signal API | `/api/teams/signal` | POST `{ teamSlug, engineerId }` → returns `{ ok: true, message: "Manager notified" }`. Append to `data/_signals.json` for visual confirmation. |
| Team seed | `data/teams.json` | 3 teams (lean toward fewer + richer over many + thin). |

## Acceptance criteria (from PRD)
- [ ] `/app/teams` lists teams with filter chips for tech stack and project type.
- [ ] `/app/teams/[slug]` shows: current projects, key technologies, owned services, skill gaps, "Signal interest" CTA.
- [ ] Signal interest triggers a styled toast and a no-op-but-look-real backend call.
- [ ] At least 2–3 teams seeded with enough depth that filters meaningfully change the list.

## Design notes
- Slate-blue accent (`#dce4ef` card bg, `#b5c5d6` badge bg, `#3a566e` badge text).
- Team list cards are post-it style — slight rotate on hover, not at rest (keep it scannable).
- Team detail page is two-column on desktop: left = mission + current projects; right = stack + owned services + skill gaps + the CTA.
- "Signal interest" button = primary black filled, full-width on mobile. After click → state flips to "Interest signaled · Manager notified" with a check icon.
- Skill gaps section lives in a tinted slate-blue panel — visually different from the rest so it pops as the "opportunity" hook.

## Demo path responsibilities
Per `docs/MVP_PLAN.md` demo script:
1. Engineer (after viewing their profile) clicks "Browse teams" tile in the dashboard.
2. Lands on `/app/teams`, applies filter (e.g. "Backend" or "Postgres").
3. Opens the **Fraud Platform** team page (slug pre-agreed).
4. Sees skill gaps the engineer's profile actually fills (this is where the magic story clicks).
5. Clicks "Signal interest" → toast confirms.

Coordinate the **Fraud Platform** team's skill gaps with Rayan so they overlap with the demo engineer's profile skills.

## Cross-feature contracts
- You read `data/teams.json` (you own it).
- For the "Browse teams" tile linking from `/app/profile/...`, that link lives on the dashboard hub on main. You don't need to add it.
- Engineers referenced by `team.manager.engineerId` should match ids in `data/engineers.json` (Rayan owns engineers).

## Out of scope for your branch
- Don't touch `/app/profile/*` or `/app/search/*`.
- No AI calls on this branch — pure CRUD over JSON. (Optional stretch: "AI-recommended teams" is on the Phase 3 roadmap, not the MVP.)
- No real notifications system. The signal API just writes to a JSON file.

## Suggested order of work
1. Flesh out `data/teams.json` with 3 teams. One must be "Fraud Platform" with skill gaps that match the demo engineer.
2. `/app/teams/page.tsx` — render the list with hardcoded filters (chips → state → filter). Don't reach for state libraries; `useState` is fine.
3. `/app/teams/[slug]/page.tsx` — detail layout per design notes.
4. `/api/teams/signal/route.ts` — file-write stub.
5. "Signal interest" client wiring + toast.
6. Polish: hover states, skeletons, empty filter state.

## Gotchas
- The PRD is explicit: **2–3 teams is fine**. Don't seed 10. Density > breadth — make each team feel real.
- Don't try to build "AI recommendations based on engineer profile" — that's Phase 3 per PRD §7.
- The signal API is a stub. Returning `{ ok: true }` is the success criterion. Don't build a notification system.
