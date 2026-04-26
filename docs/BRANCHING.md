# Branching Strategy

## TL;DR
- `main` — protected. Everything ships through here. The scaffold + design system + seed data lives here.
- `feature/profile-pipeline` — Rayan — SCRUM-14 — owns `/app/profile/*` + `lib/prompts/profile.ts` + `data/artifacts/`.
- `feature/talent-search` — Arnav — SCRUM-15 — owns `/app/search/*` + `lib/prompts/search.ts`.
- `feature/team-portal` — Sahib — SCRUM-16 — owns `/app/teams/*` + `data/teams.json`.

## Critical sequencing (read this first)
The branches were cut **before the Day-1 scaffold lands**. So:

1. **Wednesday night (Rayan, on `main`):** scaffold Next.js, copy design tokens from landing repo, install deps, set up AI Gateway, seed `data/engineers.json` and stub artifact files. Push to `main`.
2. **Thursday morning (everyone):** `git fetch origin && git checkout feature/<your-branch> && git rebase origin/main`. You now have the working scaffold + design system on your branch.
3. **Daily after that:** rebase onto `origin/main` first thing each day. If you introduce a shared dep (e.g. a new shadcn component), prefer to add it via a tiny PR to `main` instead of pulling it in only on your branch.

## Who owns what (no overlap if everyone stays in their lane)
| Path | Owner | Branch |
| --- | --- | --- |
| `app/profile/**` | Rayan | feature/profile-pipeline |
| `app/api/profile/**` | Rayan | feature/profile-pipeline |
| `lib/prompts/profile.ts` | Rayan | feature/profile-pipeline |
| `lib/seed-runner.ts` | Rayan | feature/profile-pipeline |
| `data/artifacts/**` | Rayan | feature/profile-pipeline |
| `data/profiles.json` | Rayan (generated) | feature/profile-pipeline |
| `app/search/**` | Arnav | feature/talent-search |
| `app/api/search/**` | Arnav | feature/talent-search |
| `lib/prompts/search.ts` | Arnav | feature/talent-search |
| `app/teams/**` | Sahib | feature/team-portal |
| `app/api/teams/**` | Sahib | feature/team-portal |
| `data/teams.json` | Sahib | feature/team-portal |
| `components/shell/**` | Rayan (initial), shared after | main |
| `components/ui/**` | shared | main (PRs only) |
| `app/globals.css`, `tailwind.config.*`, `next.config.ts` | shared | main (PRs only) |
| `app/layout.tsx` | shared | main (PRs only) |
| `lib/ai.ts`, `lib/data.ts`, `lib/schemas.ts` | shared | main (PRs only) |
| `data/engineers.json` | shared | main (PRs only — talk in standup before editing) |
| `package.json`, `package-lock.json` | shared | main (PRs only — coordinate adds) |

> **If you need to touch a `main` row from a feature branch, open a tiny PR to `main` first**, get a same-day +1, then continue on your feature branch. This keeps merge conflicts on Friday near zero.

## Cross-feature dependencies
- **F2 → F1:** Talent Search reads `data/profiles.json` produced by Feature 1. Until F1 ships a real profile schema, F2 can build against `lib/schemas.ts` Profile shape (defined on main) and a hand-written `data/profiles.sample.json` fixture.
- **F3 → F1:** Team pages link out to engineer profiles by id. Use the route `/app/profile/[id]` even if it's a 404 stub — F1 will fill it in.
- **All → shell:** the `app/layout.tsx` for `/app/*` (sidebar + role switcher) ships from main during Day 1 scaffold. Everyone consumes it.

## Daily flow
```bash
# Morning sync
git fetch origin
git checkout feature/<your-branch>
git rebase origin/main          # pull in shared changes

# Work on your feature ...

# End of day
git push origin feature/<your-branch>
```

## Merge to main
- Open a PR per feature, not per commit.
- Reviewer: at least one teammate, ideally Rayan (cross-cuts product + design + scaffold).
- Squash-merge to keep `main` history clean for the showcase.
- All three features should be merged to `main` no later than **Friday end-of-day** so Saturday is pure polish + dry runs.

## Branch-specific agent context
Each branch has a `BRANCH_CLAUDE.md` at the repo root that tells coding agents which feature to focus on. The detailed brief for each owner lives at:
- `docs/branch-context/profile-pipeline.md` (Rayan)
- `docs/branch-context/talent-search.md` (Arnav)
- `docs/branch-context/team-portal.md` (Sahib)
