# Architecture

> Stack, folder layout, data model, and AI calls. Read [`./PRD.md`](./PRD.md) first for product context.

## Stack
| Layer | Choice | Why |
| --- | --- | --- |
| Framework | **Next.js 16 (App Router)** + React 19 | Matches the landing repo. App Router gives Server Components for data + Client Components for interactivity. |
| Styling | **Tailwind v4** + `tw-animate-css` | Identical to landing — design tokens carry over. |
| Components | **shadcn/ui** + `@base-ui/react` | Already in use on the landing repo; lets us match in seconds. |
| Animation | **framer-motion** | Used on landing — keeps motion language consistent. |
| Icons | **lucide-react** | Same as landing. |
| Fonts | **Geist** (sans) + **Caveat** (handwritten headings, via `@fontsource/caveat`) | Already loaded on landing; replicate. |
| AI | **AI SDK v6** through **OpenRouter** (`@openrouter/ai-sdk-provider`) | One env var, free-router fallback for local demo. `MODEL_DEFAULT` and `MODEL_FAST` both use `openrouter/free`. |
| Storage | **Seeded JSON** in `data/` + session-scoped temp JSON for interest signals | Demo-only — explicit per PRD. Profile/team edits live in React state. Interest actions write outside the repo under `os.tmpdir()` with the current process id so server restart resets demo data. |
| Hosting | **Vercel** (Fluid Compute) | Same account as landing. Default Node 24 runtime, 300s function timeout. |
| Package manager | **npm** | Lockfile (`package-lock.json`) lives at repo root. Matches the landing repo's tooling. |

> If you find yourself reaching for a database, auth provider, or real GitHub/Jira/Slack OAuth — **stop** and re-read PRD §5.

## Routes
```
/                       → Marketing landing (mirror of orggraph_team6_landing or
                          a thin redirect to it — TBD Day 1, see Decision DR-001)
/app                    → Role-aware dashboard hub. Engineer: My profile, Teams,
                          Sent interests. Manager: My team, Talent search,
                          Teams, Team inbox.
/app/demo               → Mocked new-user connector screen for GitHub, Jira, Slack.
                          Requires at least one connected tool and forces Engineer view.
/app/loading            → Demo loading screen. Hard-coded 154s duration, non-uniform
                          progress jumps of exactly 10% or 20%, then redirects to /app/demo/profile.
/app/demo/profile       → Generated Arnav Chintawar profile using the same ProfileView
                          and PreferencesEditor UI as the normal profile page.
/app/profile            → Logged-in engineer's own profile (Feature 1 — generate, edit, publish)
/app/profile/[id]       → View any engineer's profile (used by Feature 2 results)
/app/profile/[id]/skill/[index]
                        → Skill detail page with summary/description editing while draft
/app/profile/[id]/project/[index]
                        → Profile project-theme detail page
/app/search             → Manager-only talent search (Feature 2). Engineer role redirects to /app/teams.
/app/teams              → Team list with filters. Engineer view adds Best fit teams.
/app/teams/[slug]       → Team detail page. Manager's own team has editable mission/projects.
/app/teams/[slug]/projects/[index]
                        → Team project detail page with richer project context; manager's own team can edit project details session-only.
/app/interests          → Role-aware interest center. Engineer: sent interests. Manager: managed-team inbox.
/api/profile/generate   → POST — runs LLM over a seeded engineer's artifacts → structured profile JSON
/api/search             → POST — { query } → ranked candidate matches
/api/teams/signal       → POST — { teamSlug, engineerId, intent, message }.
                          PATCH — read/star/follow-up updates for interest records.
```

For the demo we **fake auth** with a session cookie that picks an engineer ID from the seed (default: `eng-rayan`). The role switcher (`Engineer view ↔ Manager view`) also handles unsafe route transitions: switching from Manager search to Engineer redirects to `/app/teams`, and switching from Engineer profile to Manager redirects to `/app/teams/payments-architecture`. The new-user demo routes (`/app/demo`, `/app/loading`, `/app/demo/profile`) set the role cookie back to Engineer view so the funnel is stable even if the presenter was previously in Manager view.

## Folder layout
```
orggraph_CS4803/
├── app/                          # Next.js App Router
│   ├── (marketing)/              # optional: copy landing here later
│   ├── app/
│   │   ├── layout.tsx            # in-app shell (sidebar + topbar + role switch)
│   │   ├── page.tsx              # /app dashboard hub
│   │   ├── demo/
│   │   │   ├── page.tsx          # mocked connector onboarding
│   │   │   └── profile/page.tsx  # generated Arnav Chintawar profile
│   │   ├── loading/page.tsx      # 154s demo loading screen
│   │   ├── profile/
│   │   │   ├── page.tsx          # /app/profile  (own)
│   │   │   └── [id]/page.tsx     # /app/profile/[id]
│   │   ├── interests/page.tsx
│   │   ├── search/page.tsx           # server role guard; client UI lives in components/search
│   │   └── teams/
│   │       ├── page.tsx
│   │       ├── [slug]/page.tsx
│   │       └── [slug]/projects/[index]/page.tsx
│   ├── api/
│   │   ├── profile/generate/route.ts
│   │   ├── search/route.ts
│   │   └── teams/signal/route.ts
│   ├── globals.css               # mirror landing tokens
│   └── layout.tsx                # root layout, fonts
├── components/
│   ├── ui/                       # shadcn primitives (button, card, input, badge, separator)
│   ├── shell/                    # navbar, sidebar, role switcher, topbar
│   ├── demo/                     # DemoConnectors, DemoLoading, Engineer-view guard
│   ├── interests/                # InterestCenter
│   ├── profile/                  # ProfileView, PreferencesEditor, detail pages, ManagerMatchCard
│   ├── search/                   # SearchPageClient, ResultRow, MatchScoreBadge
│   ├── teams/                    # TeamCard, TeamFilters, SignalInterestButton, RecentInterestPanel
│   └── shared/                   # Eyebrow, CaveatHeading, PostitCard (reuse landing styling)
├── lib/
│   ├── ai.ts                     # gateway client + model id constants
│   ├── prompts/
│   │   ├── profile.ts            # profile-generation system + user prompt
│   │   └── search.ts             # search ranking prompt
│   ├── data.ts                   # JSON loaders for engineers, teams, artifacts
│   ├── schemas.ts                # zod schemas: Profile, SearchResult, Team
│   └── seed-runner.ts            # one-shot: regenerate all profiles from artifacts → data/profiles.json
├── data/
│   ├── engineers.json            # seeded engineers, including demo Arnav Chintawar
│   ├── teams.json                # 3–4 teams (PRD says 2–3 is enough for demo)
│   ├── artifacts/<engineerId>/   # mock GitHub PRs, Jira issues, Slack snippets per engineer
│   └── profiles.json             # generated profiles, including demo Arnav Chintawar
├── public/                       # logos, screenshots
├── docs/                         # this folder
├── package.json
├── package-lock.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
└── README.md
```

## Data model

### Engineer (seed identity)
```ts
type Engineer = {
  id: string;                    // "eng-rayan"
  name: string;
  title: string;                 // "Senior Software Engineer"
  team: string;                  // team slug
  avatarUrl?: string;
  yearsAtCompany: number;
  preferences: {
    openToTransfer: boolean;
    interests: string[];          // ["AI infra", "fraud systems"]
    growthGoals: string[];
  };
};
```

### Generated profile (Feature 1 output)
```ts
type Profile = {
  engineerId: string;
  generatedAt: string;            // ISO timestamp
  summary: string;                // 2–3 sentence narrative
  skills: Array<{
    name: string;                 // "React", "Fraud detection"
    summary: string;
    description: string;
    confidence: "low" | "medium" | "high";
    evidence: string[];           // short snippets pointing to artifacts
  }>;
  projectThemes: Array<{
    title: string;
    summary: string;
    description: string;
    artifactRefs: string[];       // e.g. "github:pr-1283", "jira:FRAUD-44"
  }>;
  contributionEvidence: Array<{
    type: "github" | "jira" | "slack" | "doc";
    summary: string;
    url?: string;
  }>;
};
```

### Search result (Feature 2 output)
```ts
type SearchResult = {
  engineerId: string;
  matchScore: number;             // 0–100
  matchedSkills: string[];
  reason: string;                 // 1-sentence "why this match"
  openToTransfer: boolean;
};
```

The manager profile view computes a local Payments Architecture match card from `Profile`, `Engineer.preferences`, and the managed team's stack/projects/skill gaps. It is not an LLM call.

### Team (Feature 3)
```ts
type Team = {
  slug: string;                   // "fraud-platform"
  name: string;
  mission: string;
  techStack: string[];            // ["TypeScript", "React", "Postgres", "Kafka"]
  projectTypes: string[];         // ["Backend", "Data infra"]
  currentProjects: Array<{
    title: string;
    description: string;
    status: string;
    owner: string;
    timeline: string;
    problem: string;
    approach: string[];
    successMetrics: string[];
    milestones: string[];
    risks: string[];
    collaborators: string[];
  }>;
  ownedServices: string[];
  skillGaps: string[];
  manager: { name: string; engineerId: string };
};
```

### Interest signal
```ts
type Signal = {
  id: string;
  teamSlug: string;
  engineerId: string;
  at: string;
  intent: "coffee-chat" | "role-interest";
  message: string;
  read: boolean;
  starred: boolean;
  followUps: Array<{
    at: string;
    author: "manager" | "engineer";
    message: string;
  }>;
};
```

Signal data is demo-scoped in `lib/signals.ts`: seed inbox data exists for the Payments Architecture manager view, seed sent-interest data exists for Rayan's engineer view, and runtime writes go to a process-specific temp file. Restarting the dev server resets to seed data.

## AI calls

### `lib/ai.ts`
```ts
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});
const FREE_ROUTER = 'openrouter/free';

export const MODEL_DEFAULT = openrouter.chat(FREE_ROUTER);
export const MODEL_FAST    = openrouter.chat(FREE_ROUTER);
```
Set `OPENROUTER_API_KEY` in `.env.local`.

### Profile generation (`/api/profile/generate`)
- Input: `engineerId` → loads identity + all `data/artifacts/<engineerId>/*` files.
- Prompt: instruct model to extract skills + evidence + project themes; output **structured JSON** matching the `Profile` zod schema (use `generateObject`).
- Output: `Profile` object. Cache by writing back to `data/profiles.json`.

### Search ranking (`/api/search`)
- Input: `{ query: string }`.
- Implementation: load all profiles from `data/profiles.json`; pass them all in a single LLM call (small N — fits easily in context); ask for ranked `SearchResult[]` JSON sorted by `matchScore`.
- The prompt intentionally omits no-signal candidates under 30. The UI filters returned results by Open to transfer and minimum score (`All`, `50+`, `70+`, `85+`).

### Team signal (`/api/teams/signal`)
- POST creates an interest signal with `intent` and `message`.
- PATCH updates read/unread, starred, and follow-up messages.
- Runtime writes use `os.tmpdir()` with the server process id, not `data/_signals.json`.

## Performance / latency
Demo machine, 5s budget per AI call:
- Profile generation: model-dependent; **cache the output** so we never run it live.
- Search: one OpenRouter free-router structured-output call over the 8 committed profiles.

**Pre-warm and cache**: ship `data/profiles.json` already generated. Live demo only triggers Search and Team signals.

## Decisions log
Add one-line entries here when product or architectural decisions are made.

- **DR-001** (TBD Day 1): Marketing landing — mirror in this repo or keep the separate Vercel site? Default: keep separate, `/` redirects to landing repo URL. Owner: Rayan.
- **DR-002**: Mock data only for MVP. No GitHub/Jira/Slack OAuth. Per PRD §5.
- **DR-003**: Local AI calls use OpenRouter's `openrouter/free` through AI SDK v6. `OPENROUTER_API_KEY` is the required env var.
- **DR-004**: Pre-generate `data/profiles.json` — never call profile generation live during the demo.
- **DR-005**: Role surfaces are intentionally different. Engineer view hides Talent Search and shows My Profile / Best fit teams / sent interests. Manager view shows Talent Search / My Team / team inbox.
- **DR-006**: Interest data is process-session scoped in temp storage so demo interactions persist during a run and reset on server restart.
