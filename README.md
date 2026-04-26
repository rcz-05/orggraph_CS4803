# OrgGraph — CS 4803 Group 6

> **Make invisible work visible.**
> An AI-powered internal talent discovery platform that turns engineering work artifacts (GitHub PRs, Jira tickets, Slack threads, internal docs) into evidence-based expertise profiles, a manager-facing skill search, and an engineer-facing team discovery portal.

**Team:** Rayan Castilla, Tisha Thakkar, Arnav, Sahib
**Course:** CS 4803 — Capstone
**Showcase:** Sun **2026-04-26**
**Live landing page:** https://orggraphteam6landing.vercel.app/

---

## What this repo is

This is the **product application** repo for OrgGraph. The marketing landing page lives in a separate repo. Everything that gets demoed at the capstone — profile pipeline, talent search, team portal, manager view — is built here.

## The three MVP features

| Feature | Surface | What it does |
| --- | --- | --- |
| **Engineer profiles** | `/app/profile`, `/app/profile/[id]` | Auto-generates an evidence-based profile from seeded GitHub/Jira/Slack artifacts. Every skill cites a specific PR, ticket, or thread. Engineers edit preferences (interests, growth goals, *open to transfer*) and publish. |
| **Talent search** | `/app/search` | Manager-facing free-text search ("fraud detection", "React design systems"). AI-ranks all 8 seeded profiles against the query, shows match score, matched skills, and transfer-interest. Click → engineer profile. |
| **Team portal** | `/app/teams`, `/app/teams/[slug]` | Engineer-facing list of 5 internal teams with tech-stack and project-type filters. Detail page shows mission, current projects, owned services, skill gaps, and a "Signal interest" CTA. In Manager view the CTA is replaced with a **Recent Interest** panel listing engineers who recently signaled. |

Switch between Engineer view and Manager view via the role switcher in the navbar (top-right). Default identity is `eng-rayan` via cookie — no real auth, demo only.

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000/app
npm run build        # production build (type-check + bundle)
```

For LLM features (search ranking + the empty-state "Generate my profile" button) set `OPENROUTER_API_KEY` in `.env.local`:

```bash
OPENROUTER_API_KEY=sk-or-v1-...
```

The app uses the [Vercel AI SDK](https://ai-sdk.dev/) with [`@openrouter/ai-sdk-provider`](https://www.npmjs.com/package/@openrouter/ai-sdk-provider), routing both default (profile generation) and fast (search ranking) calls through OpenRouter's `openrouter/free` meta-router — which auto-picks a free model that supports structured outputs.

To regenerate the cached profiles from the seeded artifacts:

```bash
npm run seed:profiles                # all 8 engineers
npm run seed:profiles eng-rayan      # just one
```

The committed `data/profiles.json` is the cache the demo reads. Per `docs/ARCHITECTURE.md` DR-004, the live demo never re-generates profiles — it only hits the search route at runtime.

## Stack

Next.js 16 (App Router) · React 19 · Tailwind v4 · shadcn/ui primitives · `@base-ui/react` · framer-motion · lucide-react · zod · Vercel AI SDK v6 · OpenRouter

No database, no auth, no real GitHub/Jira/Slack OAuth — all data is seeded JSON in `data/`. This is intentional per the PRD; the MVP is a demo-quality slice, not enterprise SaaS.

## Layout

```
app/                          # Next.js App Router
  app/                        # in-app routes (dashboard, profile, search, teams)
  api/                        # /api/profile/generate, /api/search, /api/teams/signal, /api/engineers
components/
  shell/                      # navbar, role switcher
  shared/                     # PostitCard, CaveatHeading, Eyebrow
  ui/                         # shadcn primitives (button, card, input, badge, skeleton)
  profile/                    # ProfileView, PreferencesEditor, GenerateEmptyState
  search/                     # ResultRow, MatchScoreBadge
  teams/                      # TeamCard, TeamFilters, SignalInterestButton, RecentInterestPanel
lib/
  ai.ts                       # OpenRouter client + model id
  data.ts                     # JSON loaders
  schemas.ts                  # zod contracts (Profile, Engineer, Team, SearchResult)
  signals.ts                  # interest-signal read/write helpers (writes outside project tree)
  prompts/                    # profile + search prompts
  profile-pipeline.ts         # shared profile-gen logic (used by seed runner + API route)
  seed-runner.ts              # one-shot: regenerate profiles → data/profiles.json
data/
  engineers.json              # 8 engineers (identity + preferences)
  teams.json                  # 5 teams (3 baseline + payments-architecture + security-platform)
  profiles.json               # cached AI-generated profiles (committed)
  artifacts/<engineerId>/     # mock GitHub PRs, Jira tickets, Slack snippets per engineer
docs/
  PRD.md, ARCHITECTURE.md, BRAND.md, MVP_PLAN.md, BRANCHING.md
  CUSTOMER_DISCOVERY.md, DEMO_SCRIPT.md
  branch-context/             # per-feature briefs
```

## The demo path

See `docs/DEMO_SCRIPT.md` for the full 3-minute walkthrough, mapped to seeded ids and queries:

1. **Engineer view** — open `/app/profile`, review Rayan's auto-generated profile, toggle "Open to transfer", click Publish.
2. **Manager view** — search *"fraud detection"* → Rayan ranks top with grounded reasoning → click → his profile.
3. **Engineer view again** — `/app/teams` → filter Backend → open Fraud Platform → skill gaps overlap Rayan's profile skills → click "Signal interest" → toast confirms.
4. **Manager view encore** — open `/app/teams/payments-architecture` (Rayan's team) → the just-signaled engineer appears in the **Recent Interest** panel.

## Onboarding for teammates / agents

Read these in order:
1. [`docs/PRD.md`](./docs/PRD.md) — product spec, user stories, acceptance criteria
2. [`docs/CUSTOMER_DISCOVERY.md`](./docs/CUSTOMER_DISCOVERY.md) — what 20 customer interviews told us
3. [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — stack, folder layout, data model, AI calls
4. [`docs/BRAND.md`](./docs/BRAND.md) — design tokens, typography, voice
5. [`docs/MVP_PLAN.md`](./docs/MVP_PLAN.md) — day-by-day build plan
6. [`docs/DEMO_SCRIPT.md`](./docs/DEMO_SCRIPT.md) — the 3-minute walkthrough
7. [`CLAUDE.md`](./CLAUDE.md) — rules for any AI coding agent working in this repo

The original PDFs (PRD, customer discovery write-up, feature justification, pitch deck) live in `docs/pdfs/` and are gitignored.
