# Branch Brief — `feature/profile-pipeline`

**Owner:** Rayan · **Ticket:** SCRUM-14 · **Feature:** Engineer profile generation pipeline

> Your job: turn seeded GitHub/Jira/Slack artifacts into structured, evidence-based engineer profiles, with an editable review UI. This feature is the **foundation** the other two read from — F2 search ranks against your `data/profiles.json`, F3 team pages link to your `/app/profile/[id]`.

## Read first
1. [`docs/PRD.md`](../PRD.md) §3 Feature 1
2. [`docs/ARCHITECTURE.md`](../ARCHITECTURE.md) — data model + AI calls section
3. [`docs/BRAND.md`](../BRAND.md) — peach is your accent (`#fce8e1`)
4. [`docs/BRANCHING.md`](../BRANCHING.md) — daily rebase flow
5. [`CLAUDE.md`](../../CLAUDE.md) — global agent rules

## What you're building
| Surface | Path | Notes |
| --- | --- | --- |
| Engineer's own profile | `/app/profile` | Reads logged-in engineer (default `eng-rayan` via cookie). Edit + Publish. |
| Public profile view | `/app/profile/[id]` | Read-only render for managers (used by F2 results). |
| Generation API | `/api/profile/generate` | POST `{ engineerId }` → returns `Profile` JSON. |
| Generation prompt | `lib/prompts/profile.ts` | System + user prompt. Use `generateObject` with the `Profile` zod schema. |
| Seed runner | `lib/seed-runner.ts` | One-shot Node script: regenerate ALL profiles → write `data/profiles.json`. Run once, commit the result. |
| Mock artifacts | `data/artifacts/<engineerId>/*.json` | 3–5 files per engineer. Mix GitHub PRs, Jira tickets, Slack snippets. |

## Acceptance criteria (from PRD)
- [ ] System ingests mock GitHub/Jira/Slack data and runs it through an LLM.
- [ ] Output is structured: `summary` + `skills[]` (with confidence + evidence) + `projectThemes[]` + `contributionEvidence[]`.
- [ ] Engineer can review a draft and edit any section before publishing.
- [ ] Editable **Preferences** section, including a `openToTransfer` toggle.
- [ ] `data/profiles.json` is committed so the demo never blocks on a slow generation call.

## Design notes
- Peach accent (`#fce8e1` card bg, `#f5c4b8` badge bg, `#9e4433` badge text).
- Caveat font for engineer name + section titles. Geist for body.
- Each evidence card looks like a post-it (rounded-2xl, slight rotate, faint shadow).
- "Draft" vs "Published" pill near the engineer name (use shadcn Badge).
- Empty state on `/app/profile` when no profile exists yet: big "Generate my profile" button (peach) + Caveat micro-text "sketching your profile…" while loading.

## Demo path responsibilities
Per `docs/MVP_PLAN.md` Day 2 demo script, your surfaces appear in this order:
1. Engineer logs in → sees auto-generated profile (cached, instant).
2. Toggles "Open to transfer" → state persists for the session.
3. Later: manager view clicks a search result → lands on `/app/profile/[id]` of the picked engineer.

The cached `data/profiles.json` is what makes #1 and #3 instant. **Do not** call the generation API live during the demo — it's there for the "Generate" button on the empty state only.

## Cross-feature contracts you provide
- `lib/schemas.ts` is shared (lives on main). The `Profile` shape there is the contract F2 search consumes. If you want to evolve the schema, open a PR to main first so Arnav stays in sync.
- `data/profiles.json` is the file F2 reads. Keep it committed and up to date.

## Out of scope for your branch
- Don't touch `/app/search/*` or `/app/teams/*`.
- Don't add real GitHub/Jira/Slack OAuth. Mock data only.
- Don't add a database. Profiles cache to a JSON file, edits live in React state.
- No "AI persona chat" — explicitly deferred per PRD.

## Suggested order of work
1. `data/engineers.json` — 8–12 engineers w/ identity + `preferences`.
2. `data/artifacts/<engineerId>/` — at least 2 engineers fully fleshed out (the demo subjects), the rest lighter.
3. `lib/prompts/profile.ts` + `lib/schemas.ts` `Profile` zod schema.
4. `lib/seed-runner.ts` — generate, write `data/profiles.json`. Commit it.
5. `/app/profile/[id]/page.tsx` — read-only render.
6. `/app/profile/page.tsx` — same render + edit-in-place for preferences + Publish.
7. `/api/profile/generate/route.ts` — for the empty-state button.

## Gotchas
- Be ruthless about token usage in the prompt — small artifacts, focused JSON output. Sonnet is plenty smart; don't over-prompt.
- Make `Profile` strictly typed via zod; AI SDK `generateObject` enforces shape so the UI doesn't break.
- Pre-commit `data/profiles.json` so a teammate cloning the repo can demo without an API key locally.
