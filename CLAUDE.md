# CLAUDE.md — Rules for AI agents working in this repo

> If you are a coding agent (Claude Code, Cursor, Copilot, Codex, etc.), **read this file first**. Then read [`docs/PRD.md`](./docs/PRD.md) and [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) before writing code.

## Are you on a feature branch?
Run `git branch --show-current`. If the result is **not** `main`, also read:
- `BRANCH_CLAUDE.md` at the repo root (only exists on feature branches) — tells you which feature you own.
- The matching brief in `docs/branch-context/` for full scope, file ownership, and acceptance criteria.

The branching strategy and ownership map live in [`docs/BRANCHING.md`](./docs/BRANCHING.md). **Do not edit files outside your branch's owned paths** without opening a PR to `main` first.

## What this is
OrgGraph is a **CS 4803 capstone MVP**, demoed Sunday **2026-04-26**. Scope is intentionally small. We are not building a real enterprise SaaS — we are building a **demo-quality** end-to-end slice that visibly executes the three core flows in the PRD with seeded data.

## Critical conventions
- **Stack is fixed:** Next.js 16 App Router + React 19 + Tailwind v4 + shadcn/ui + framer-motion + lucide, matching the landing repo. Do not introduce alternative frameworks (no Vite, no Remix, no Pages Router).
- **Package manager:** npm. The lockfile is `package-lock.json`. Do not introduce pnpm or yarn lockfiles.
- **Mock-first:** all data is **seeded JSON in `data/`**. No real GitHub/Jira/Slack APIs, no auth, no database for the MVP. If you feel the need to add Postgres, stop and re-read the PRD.
- **AI calls:** use the **Vercel AI SDK v6** through the **Vercel AI Gateway** with plain `"provider/model"` strings (default `"anthropic/claude-sonnet-4-6"`; use `"anthropic/claude-haiku-4-5"` for cheap/fast). Do **not** import provider-specific packages (`@ai-sdk/anthropic`, `@ai-sdk/openai`) unless someone asks for direct provider wiring.
- **Brand match:** see [`docs/BRAND.md`](./docs/BRAND.md). Headings use the Caveat handwritten font, body uses Geist, post-it pastel cards (`#fce8e1`, `#e2edd9`, `#f5edd0`, `#dce4ef`) for accents. Do not invent new colors without checking.
- **Demo path is sacred:** SCRUM-2 defines an end-to-end demo path. If a change breaks the demo, fix the demo first, then ship. The judge sees the demo, not the codebase.

## What NOT to do
- ❌ Don't add auth, real OAuth to GitHub/Jira/Slack, or a real database. Demo time only.
- ❌ Don't build features outside the three MVP features unless [`docs/PRD.md`](./docs/PRD.md) §5 lists them as Included.
- ❌ Don't push the contents of `docs/pdfs/` or `docs/screenshots/` — they're gitignored for a reason (some PDFs contain personally-identifiable customer interview content).
- ❌ Don't refactor the landing page's visual system — match it.
- ❌ Don't write speculative abstractions ("ProfileServiceFactory", repository patterns over JSON files). Direct, dumb, demo-quality code wins.
- ❌ Don't add tests for visual components in this MVP. Type checking + a working demo is the bar.

## What to do
- ✅ Stay inside the file scaffold proposed in [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).
- ✅ When you finish a feature, update [`docs/MVP_PLAN.md`](./docs/MVP_PLAN.md) checklist.
- ✅ When you make a meaningful product or design decision, drop a one-liner under "Decisions log" at the bottom of [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).
- ✅ Match the landing page's voice in any in-app copy ("niche, amplified", "Make Invisible Work Visible", evidence-based, anti-self-promotion).

## Working with the user
- Rayan is the lead. He's done the design + customer discovery work, so he has the strongest mental model — defer to him on product decisions.
- The team is also using Atlassian Jira (project key `SCRUM-`). When you reference work, use the ticket ID.
- The user prefers: terse responses, no trailing summaries, one bundled PR over many small ones for related work, and no over-explanation of obvious code.
