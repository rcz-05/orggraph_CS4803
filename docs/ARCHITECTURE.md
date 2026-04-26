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
| AI | **AI SDK v6** through **Vercel AI Gateway** | One env var, multi-model fallback. Use `"anthropic/claude-sonnet-4-6"` for quality, `"anthropic/claude-haiku-4-5"` for cheap/fast. |
| Storage | **Seeded JSON** in `data/` (no DB) | Demo-only — explicit per PRD. Edits to profile state live in React + optionally write to a `data/_user-edits.json` runtime file. |
| Hosting | **Vercel** (Fluid Compute) | Same account as landing. Default Node 24 runtime, 300s function timeout. |
| Package manager | **npm** | Lockfile (`package-lock.json`) lives at repo root. Matches the landing repo's tooling. |

> If you find yourself reaching for a database, auth provider, or real GitHub/Jira/Slack OAuth — **stop** and re-read PRD §5.

## Routes
```
/                       → Marketing landing (mirror of orggraph_team6_landing or
                          a thin redirect to it — TBD Day 1, see Decision DR-001)
/app                    → Dashboard hub: tiles for "My profile", "Talent search",
                          "Team portal" (matches the demo path SCRUM-2)
/app/profile            → Logged-in engineer's own profile (Feature 1 — generate, edit, publish)
/app/profile/[id]       → View any engineer's profile (used by Feature 2 results)
/app/search             → Manager talent search (Feature 2)
/app/teams              → Team list with filters (Feature 3)
/app/teams/[slug]       → Team detail page (Feature 3)
/api/profile/generate   → POST — runs LLM over a seeded engineer's artifacts → structured profile JSON
/api/search             → POST — { query } → ranked candidate matches
/api/teams/signal       → POST — { teamSlug, engineerId } → no-op success for demo (returns ok:true)
```

For the demo we **fake auth** with a session cookie that picks an engineer ID from the seed (default: `eng-rayan`). Add a tiny role switcher in the navbar (`Engineer view ↔ Manager view`) so we can toggle on stage.

## Folder layout
```
orggraph_CS4803/
├── app/                          # Next.js App Router
│   ├── (marketing)/              # optional: copy landing here later
│   ├── app/
│   │   ├── layout.tsx            # in-app shell (sidebar + topbar + role switch)
│   │   ├── page.tsx              # /app dashboard hub
│   │   ├── profile/
│   │   │   ├── page.tsx          # /app/profile  (own)
│   │   │   └── [id]/page.tsx     # /app/profile/[id]
│   │   ├── search/page.tsx
│   │   └── teams/
│   │       ├── page.tsx
│   │       └── [slug]/page.tsx
│   ├── api/
│   │   ├── profile/generate/route.ts
│   │   ├── search/route.ts
│   │   └── teams/signal/route.ts
│   ├── globals.css               # mirror landing tokens
│   └── layout.tsx                # root layout, fonts
├── components/
│   ├── ui/                       # shadcn primitives (button, card, input, badge, separator)
│   ├── shell/                    # navbar, sidebar, role switcher, topbar
│   ├── profile/                  # ProfileHeader, SkillBlock, EvidenceCard, EditableSection
│   ├── search/                   # SearchInput, ResultRow, MatchScoreBadge
│   ├── teams/                    # TeamCard, TeamFilters, TeamDetail, SignalInterestButton
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
│   ├── engineers.json            # 8–12 engineers, basic identity
│   ├── teams.json                # 3–4 teams (PRD says 2–3 is enough for demo)
│   ├── artifacts/<engineerId>/   # mock GitHub PRs, Jira issues, Slack snippets per engineer
│   └── profiles.json             # generated profiles (committed for demo reliability)
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
    confidence: "low" | "medium" | "high";
    evidence: string[];           // short snippets pointing to artifacts
  }>;
  projectThemes: Array<{
    title: string;
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

### Team (Feature 3)
```ts
type Team = {
  slug: string;                   // "fraud-platform"
  name: string;
  mission: string;
  techStack: string[];            // ["TypeScript", "React", "Postgres", "Kafka"]
  projectTypes: string[];         // ["Backend", "Data infra"]
  currentProjects: Array<{ title: string; description: string }>;
  ownedServices: string[];
  skillGaps: string[];
  manager: { name: string; engineerId: string };
};
```

## AI calls

### `lib/ai.ts`
```ts
import { gateway } from 'ai';

export const MODEL_DEFAULT = 'anthropic/claude-sonnet-4-6';
export const MODEL_FAST    = 'anthropic/claude-haiku-4-5';
```
Set `AI_GATEWAY_API_KEY` in Vercel project env. Locally, `vercel env pull .env.local`.

### Profile generation (`/api/profile/generate`)
- Input: `engineerId` → loads identity + all `data/artifacts/<engineerId>/*` files.
- Prompt: instruct model to extract skills + evidence + project themes; output **structured JSON** matching the `Profile` zod schema (use `generateObject`).
- Output: `Profile` object. Cache by writing back to `data/profiles.json`.

### Search ranking (`/api/search`)
- Input: `{ query: string }`.
- Implementation: load all profiles from `data/profiles.json`; pass them all in a single LLM call (small N — fits easily in context); ask for ranked `SearchResult[]` JSON sorted by `matchScore`.
- Optional: a quick keyword pre-filter to short-list candidates before the LLM call; not necessary for MVP scale.

### Team signal (`/api/teams/signal`)
- Stub for demo. Just returns `{ ok: true, message: "Manager notified" }` and pushes a row into `data/_signals.json` (gitignored or committed — your call).

## Performance / latency
Demo machine, 5s budget per AI call:
- Profile generation: ~3–6s with Sonnet, ~1–3s with Haiku — **cache the output** so we never run it live.
- Search: 1–2s with Haiku for ~10 profiles in context.

**Pre-warm and cache**: ship `data/profiles.json` already generated. Live demo only triggers Search and Team signals.

## Decisions log
Add one-line entries here when product or architectural decisions are made.

- **DR-001** (TBD Day 1): Marketing landing — mirror in this repo or keep the separate Vercel site? Default: keep separate, `/` redirects to landing repo URL. Owner: Rayan.
- **DR-002**: Mock data only for MVP. No GitHub/Jira/Slack OAuth. Per PRD §5.
- **DR-003**: AI Gateway with `"anthropic/claude-sonnet-4-6"` default; Haiku for search ranking to keep latency low.
- **DR-004**: Pre-generate `data/profiles.json` — never call profile generation live during the demo.
