# OrgGraph — CS 4803 Group 6

> **Make invisible work visible.**
> An AI-powered internal talent discovery platform that turns engineering work artifacts (GitHub PRs, Jira tickets, Slack threads, internal docs) into evidence-based expertise profiles, a manager-facing skill search, and an engineer-facing team discovery portal.

**Team:** Rayan Castilla, Tisha Thakkar, Arnav, Sahib
**Course:** CS 4803 — Capstone
**Showcase:** Sun **2026-04-26**
**Live landing page:** https://orggraphteam6landing.vercel.app/

---

## What this repo is

This is the **product application** repo for OrgGraph. The marketing landing page lives in a separate repo. Everything that gets demoed at the capstone — mocked connector onboarding, profile pipeline, talent search, team portal, manager view — is built here.

## MVP surfaces

| Feature | Surface | What it does |
| --- | --- | --- |
| **Engineer profiles** | `/app/profile`, `/app/profile/[id]`, `/app/profile/[id]/skill/[index]`, `/app/profile/[id]/project/[index]` | Auto-generates an evidence-based profile from seeded GitHub/Jira/Slack artifacts. Skills and project themes link to detail pages. Engineers edit draft preferences, then publishing locks the profile. In Manager view, candidate profiles show a Payments Architecture match box. |
| **Demo onboarding** | `/app/demo`, `/app/loading`, `/app/demo/profile` | Mock new-user flow for connecting GitHub, Jira, and Slack. The user must connect at least one tool, then sees a 12s loading screen (compressed from the original 2m34s pipeline for live-demo viability) whose progress jumps in 10% or 20% increments across 8 stages, and lands on a generated Arnav Chintawar profile using the same profile UI as `/app/profile`. These routes force Engineer view. |
| **Talent search** | `/app/search` | Manager-only free-text search ("fraud detection", "React design systems"). AI-ranks seeded profiles against the query, shows match score, matched skills, and transfer-interest. UI filters support **Open to transfer only** and minimum score thresholds. Engineer view is redirected away from this route. |
| **Team portal** | `/app/teams`, `/app/teams/[slug]`, `/app/teams/[slug]/projects/[index]` | Role-aware team browsing. Engineer view highlights **Best fit teams** from Rayan's profile and supports signaling interest with intent + message. Manager view swaps "My profile" for **My team**, makes Payments Architecture mission/projects editable, and exposes detailed project pages. |
| **Interest center** | `/app/interests` | Role-aware interest tracking. Engineer view shows Rayan's sent interests and follow-ups. Manager view shows the Payments Architecture inbox with read/unread, star, follow-up, and priority sorting. |

Switch between Engineer view and Manager view via the role switcher in the navbar (top-right). Default identity is `eng-rayan` via cookie — no real auth, demo only. Role-specific routing is intentional: Manager view owns Talent Search and My Team; Engineer view owns My Profile and team discovery.

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000/app
npm run build        # production build (type-check + bundle)
```

For LLM features (search ranking + the empty-state "Generate my profile" button) set `GOOGLE_GENERATIVE_AI_API_KEY` in `.env.local`:

```bash
GOOGLE_GENERATIVE_AI_API_KEY=AIza...
```

Get a free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey). The app uses the [Vercel AI SDK](https://ai-sdk.dev/) with [`@ai-sdk/google`](https://www.npmjs.com/package/@ai-sdk/google), routing both default (profile generation) and fast (search ranking) calls through `gemini-2.5-flash`. Free tier is ~250 requests/day, ~10 RPM — plenty for the demo.

To regenerate the cached profiles from the seeded artifacts:

```bash
npm run seed:profiles                # all 8 engineers
npm run seed:profiles eng-rayan      # just one
```

The committed `data/profiles.json` is the cache the demo reads. Per `docs/ARCHITECTURE.md` DR-004, the live demo never re-generates profiles — it only hits the search route at runtime.

## Stack

Next.js 16 (App Router) · React 19 · Tailwind v4 · shadcn/ui primitives · `@base-ui/react` · framer-motion · lucide-react · zod · Vercel AI SDK v6 · Google Gemini 2.5 Flash

No database, no auth, no real GitHub/Jira/Slack OAuth — all data is seeded JSON in `data/`. This is intentional per the PRD; the MVP is a demo-quality slice, not enterprise SaaS.

## Layout

```
app/                          # Next.js App Router
  app/                        # in-app routes (dashboard, profile, search, teams, interests)
  api/                        # /api/profile/generate, /api/search, /api/teams/signal, /api/engineers
components/
  shell/                      # navbar, role switcher
  shared/                     # PostitCard, CaveatHeading, Eyebrow
  ui/                         # shadcn primitives (button, card, input, badge, skeleton)
  interests/                  # InterestCenter
  demo/                       # mocked connector onboarding + loading guard
  profile/                    # ProfileView, PreferencesEditor, GenerateEmptyState, detail/edit helpers
  search/                     # SearchPageClient, ResultRow, MatchScoreBadge
  teams/                      # TeamCard, TeamFilters, SignalInterestButton, RecentInterestPanel
lib/
  ai.ts                       # Google Gemini client + model id
  data.ts                     # JSON loaders
  schemas.ts                  # zod contracts (Profile, Engineer, Team, SearchResult)
  signals.ts                  # session-scoped interest-signal helpers (writes outside project tree)
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

1. **New engineer onboarding** — open `/app/demo`, connect at least one mocked tool, continue through `/app/loading`, then land on `/app/demo/profile` for Arnav Chintawar. All three pages force Engineer view.
2. **Engineer view** — open `/app/profile`, review Rayan's generated profile, open skill/project detail pages, edit draft preferences, then publish.
3. **Manager view** — `/app/search` is available only to managers. Search *"fraud detection"* or *"React design systems"*, use Open to transfer / minimum-score filters, click a candidate, and show the Payments Architecture match box on their profile.
4. **Engineer view again** — `/app/teams` shows Best fit teams, filters, team detail pages, and project detail pages. Signal interest with a coffee-chat or role-interest intent plus a message.
5. **Manager view encore** — **My team** opens `/app/teams/payments-architecture`, where mission/current projects are editable and the manager can review `/app/interests` with read/star/follow-up workflow.

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
