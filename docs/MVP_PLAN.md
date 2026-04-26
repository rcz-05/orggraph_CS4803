# MVP Build Plan — Wed → Sun

> Today is **Wed 2026-04-23**. Showcase deliverable is **Sun night, 2026-04-26**. That's ~3.5 working days. The plan is sized to that window, not to a hypothetical infinite runway.

## Guiding principles
1. **Demo path > everything else.** Every decision is judged against "does this make the live demo more reliable / more compelling?"
2. **Ship a working slice end-to-end before polishing.** Day-1 goal is a clickable, ugly, fake-data version of all three flows.
3. **Mock data, no auth, no DB.** Per PRD §5 and CLAUDE.md.
4. **Cache anything LLM-generated** so live demo never blocks on a slow API call.
5. **Parallelize by feature owner.** Three branches off `main`, daily merge.

## Day-by-day

### Day 1 — Wednesday night (today, ~3 hrs)
**Goal:** repo + scaffold + everyone can build locally. No real features yet.

- [x] (Rayan) Scaffold Next.js 16 app — package.json + tsconfig + next.config.ts + postcss + globals.css mirroring landing tokens. ✅ shipped to main.
- [ ] (Rayan) Copy fonts/tokens from `orggraph_team6_landing/src/app/globals.css` into `app/globals.css`. Add `@fontsource/caveat`.
- [ ] (Rayan) Install: `framer-motion lucide-react @base-ui/react clsx tailwind-merge class-variance-authority zod ai`.
- [x] (Rayan) shadcn primitives ported from landing — `button card input badge separator skeleton`. ✅
- [ ] (Rayan) Build `components/shell/` (navbar with role switcher) and a stub `/app` dashboard hub with the 4 post-it tiles (link only, no logic).
- [ ] (Rayan) Wire AI Gateway: add `AI_GATEWAY_API_KEY` env var (Vercel + `.env.local`), create `lib/ai.ts`.
- [ ] (Rayan) Seed `data/engineers.json` (8–12 engineers, basic identity + preferences) and `data/teams.json` (3 teams).
- [ ] (Rayan) Seed `data/artifacts/<engineerId>/` with 3–5 mock files per engineer (one or two engineers fully fleshed out, others lighter).
- [ ] First commit + push. Branch protections on `main` not necessary for this week.

**Definition of done:** anyone on the team can `npm install && npm run dev` and see the dashboard hub.

### Day 2 — Thursday (full day)
**Goal:** Feature 1 (Rayan) and Feature 3 (Sahib) skeletons running on seeded data. Feature 2 (Arnav) starts.

- [ ] **(Rayan) Feature 1 — profile pipeline**
  - `lib/prompts/profile.ts` — system + user prompt that takes raw artifacts and emits a `Profile` JSON.
  - `lib/seed-runner.ts` — node script: loop engineers, generate profiles, write `data/profiles.json`. Run once.
  - `/app/profile` and `/app/profile/[id]` pages — render summary, skills, project themes, evidence cards. Edit-in-place for the *Preferences* block (React state only for MVP).
  - Reuse landing's post-it visual language.
- [ ] **(Sahib) Feature 3 — team portal**
  - `/app/teams` list with chip filters (tech stack, project type) over `data/teams.json`.
  - `/app/teams/[slug]` detail with current projects, key tech, owned services, skill gaps, "Signal interest" button.
  - `/api/teams/signal` — stub returning `{ ok: true }`, optionally appends to `data/_signals.json`.
- [ ] **(Arnav) Feature 2 — search scaffold**
  - `/app/search` page with the input + result list shell (no AI yet).
  - `lib/prompts/search.ts` drafted.
  - `/api/search` stubbed to return hardcoded results.
- [ ] **(Tisha) Demo path doc**
  - Write `docs/DEMO_SCRIPT.md` (3 min walkthrough): engineer logs in → profile is auto-generated → toggles "open to transfer" → switch to Manager view → search "fraud detection" → click top result → switch back → engineer browses Teams → opens "Fraud Platform" → signals interest → toast "Manager notified". Tie to seeded names so it always tells the same story.

**End-of-day merge to `main`.** Demo path #1 should at least click through, even if data is fake.

### Day 3 — Friday (full day)
**Goal:** Feature 2 fully wired, all three features integrate, polish pass starts.

- [ ] **(Arnav) Feature 2 — finish AI matching**
  - `/api/search` calls Haiku via AI Gateway with all profiles + the query, returns ranked `SearchResult[]`.
  - Rank UI: skill highlights, transfer-interest badge, click → `/app/profile/[id]` (or inline drawer).
  - Latency check: < 5s on demo machine. If slow, pre-warm or shrink prompt.
- [ ] **(Rayan) Feature 1 — finish edit/publish**
  - "Generate" button on empty state (also calls API live for the demo *if* needed — but keep cached version as default).
  - Edit any section, "Publish" toggles a published flag; visual badge "Draft" vs "Published".
- [ ] **(Sahib) Feature 3 — polish**
  - Add 1–2 more team pages so filter chips actually filter something meaningful.
  - Replace stub signal toast with a styled toast + add the signal to a small "Recent activity" footer for visual richness.
- [ ] **(Tisha + Rayan) UX polish pass — SCRUM-3**
  - Consistent spacing, typography, post-it accents per BRAND.md.
  - Loading skeletons on every async surface.
  - Empty states with Caveat micro-copy.
  - Mobile breakpoints don't have to be pixel-perfect — judges use a laptop.
- [ ] Deploy preview to Vercel. Make sure `AI_GATEWAY_API_KEY` is set on the Vercel project.

**End-of-day:** full demo path runs cleanly on the deployed preview.

### Day 4 — Saturday (full day)
**Goal:** rehearsal, polish, fallback assets, finalize pitch.

- [ ] **(Tisha) SCRUM-17 — dry run** the demo path 3x. Time it. Catch every bug.
- [ ] **Record a 3-minute screen capture** of the demo path as a fallback if Wi-Fi or AI Gateway fails on showcase day. Save to `public/demo-fallback.mp4` (gitignored if too large; otherwise commit).
- [ ] **(Rayan) SCRUM-1 — pitch deck** finalize: problem, customer discovery quotes, the three features, success metrics, what's next. 5–7 slides max. Include 2–3 anonymized customer quotes verbatim.
- [ ] **(Rayan) SCRUM-3 — physical assets**: table poster/banner mock, one-pager handout PDF.
- [ ] **(Arnav) SCRUM-4 — logistics**: equipment checklist (laptop, charger, USB-C, mobile hotspot, backup laptop?), table layout, attire confirmation.
- [ ] Lock the demo data — no edits to seed files after Saturday night.

### Day 5 — Sunday (final pass)
**Goal:** final check, push to production, breathe.

- [ ] Smoke test on **production URL** (not preview). Run the full demo path end-to-end.
- [ ] Verify AI Gateway env var is set in Production (not just Preview) on Vercel.
- [ ] Verify `data/profiles.json` is committed and matches what the seeded artifacts would produce.
- [ ] Capture final screenshots for the README + pitch deck.
- [ ] Submit / publish whatever the showcase requires.
- [ ] Sleep.

## Tracker — feature-by-feature

### Feature 1: Engineer profile pipeline (SCRUM-14, Rayan)
- [ ] Seed engineers.json
- [ ] Seed artifacts per engineer
- [ ] Prompt + zod schema
- [ ] Seed-runner script
- [ ] `data/profiles.json` committed
- [ ] `/app/profile` UI
- [ ] `/app/profile/[id]` UI
- [ ] Edit + publish flow
- [ ] Empty-state generate button

### Feature 2: Skill-based talent search (SCRUM-15, Arnav)
- [ ] Search page UI
- [ ] `/api/search` route
- [ ] Search prompt + ranking logic
- [ ] Result row component (score, skills, transfer badge)
- [ ] Click → profile drawer or `/app/profile/[id]`
- [ ] Latency under 5s

### Feature 3: Team discovery portal (SCRUM-16, Sahib)
- [ ] Seed teams.json (3 teams)
- [ ] `/app/teams` list + filters
- [ ] `/app/teams/[slug]` detail
- [ ] Signal interest button + toast
- [ ] `/api/teams/signal` stub

### Cross-cutting
- [ ] SCRUM-2: end-to-end demo path verified
- [ ] SCRUM-3: UX polish + table assets
- [ ] SCRUM-1: pitch deck
- [ ] SCRUM-4: logistics + equipment
- [ ] SCRUM-17: dry run completed

## Risks & mitigations
| Risk | Mitigation |
| --- | --- |
| AI Gateway slow / down on demo day | Pre-cache `data/profiles.json`. Search uses Haiku for low latency. Have screen-recorded fallback. |
| Wi-Fi flaky at showcase | Mobile hotspot in equipment checklist. Demo video as fallback. |
| Scope creep into Phase 2 | CLAUDE.md hard rule: nothing outside PRD §5 Included. |
| Data feels fake / underwhelming | Seed the artifacts to match real customer interview stories (Microsoft engineer's invisible-work, fraud-system maintainer). The demo *is* the customer-discovery payoff. |
| One feature owner blocked | Daily 15-min standup. Three branches → daily merge to `main` Wed/Thu/Fri night. |
