# Demo Script — 3 minutes

> SCRUM-2. Do this exact path on stage. Seeded data is wired so each click lands on a story beat. **Default cookie identity:** `eng-rayan`. **Default role:** Engineer.

## Pre-flight (do this 5 minutes before)
- `npm run dev` — confirm http://localhost:3000/app loads.
- Confirm `data/profiles.json` has 8 entries (`Get-Content data/profiles.json | Measure-Object -Line`).
- In a private browser window, hit `/app` so the role cookie defaults to Engineer.
- Have the role switcher in muscle memory — it lives top-right of the navbar.

## Beat 1 — The engineer (0:00 – 0:50)
1. Land on `/app`. Read the eyebrow + Caveat headline aloud: *"What's your hidden expertise?"*
2. Click the peach **My profile** post-it.
3. On `/app/profile`:
   - Point at the Caveat name + the **Open to transfer** sage pill.
   - Scroll to **Skills**: call out a high-confidence skill that matches a real artifact (e.g. "Postgres index optimization — see PR #1340, dropped p99 query time 40%").
   - Scroll to **Project Themes** and **Evidence** — emphasize the artifact refs.
4. In the Preferences block: toggle **Open to internal transfer** off → on (shows session-only edit). Click **Publish profile** → badge flips Draft → Published.

> Talking point: *"This isn't a resume. Every line traces back to a real PR, ticket, or thread. Engineers stop having to pitch their own work."*

## Beat 2 — The manager (0:50 – 2:00)
5. Top-right navbar: switch to **Manager view**.
6. Click **Talent search** in the nav (or the dashboard tile).
7. On `/app/search`:
   - Type **`fraud detection`** in the input.
   - Click the search button (or hit Enter).
   - Wait ~2–3s. Rayan should be top-1 with a green match score.
   - Read the `reason` aloud — it cites specific evidence.
   - Point at the **Open to transfer** pill on Rayan's row.
8. Click the row → lands on `/app/profile/eng-rayan` (read-only render).

> Talking point: *"The manager queried in plain language. The match isn't keyword soup — it's evidence-backed. The 'open to transfer' pill is the bridge to outreach."*

## Beat 3 — The two-way close (2:00 – 3:00)
9. Switch back to **Engineer view**.
10. Navbar → **Teams** (or dashboard tile).
11. On `/app/teams`:
    - Apply filter chip **Backend** (or **Payments**).
    - Click into **Fraud Platform**.
12. On `/app/teams/fraud-platform`:
    - Read the mission aloud.
    - Hover the **Skill gaps** panel and call out 1–2 gaps that overlap with Rayan's profile skills (e.g. "Postgres index optimization", "Idempotency / replay protection").
    - Click **Signal interest** → toast slides in from the bottom: *"Fraud Platform's manager has been notified."*

> Closing line: *"Two-sided discovery. The manager finds the engineer; the engineer finds the team. Same evidence, same product, no recruiter in the loop."*

## Beat 4 — Manager sees the signal land (3:00 – 3:25, optional encore)
13. Still on `/app/teams/payments-architecture` (Rayan's own team — added so the manager view has something to land on).
14. Top-right navbar: switch to **Manager view**.
15. Page reloads. The "Signal interest" CTA is gone. In its place: a slate-blue **Recent interest** panel listing engineers who just signaled, with a relative timestamp and a link to each profile.
16. Click the engineer row → routes back to `/app/profile/[id]`.

> Talking point: *"The other half of the loop. The manager doesn't get a notification — they get a panel of warm leads, anchored to the same team page where the engineer expressed interest."*

## Lock-in
- **Don't** edit `data/profiles.json` after this script runs cleanly twice.
- **Don't** edit `data/teams.json` after the skill-gap overlap is confirmed.
- **Don't** swap models in `lib/ai.ts` — Haiku is calibrated for the latency budget.

## If something breaks on stage
| Symptom | Action |
| --- | --- |
| `/app/search` errors | Check `AI_GATEWAY_API_KEY` in `.env.local` (and Vercel env). Pivot to: open the cached `/app/profile/eng-rayan` directly. |
| Search latency >5s | Refresh the page; first call after a cold start is slowest. |
| Signal interest 500 | Check `data/_signals.json` is writable. Recover by demoing the toast on a different team. |
| Wi-Fi flake | Switch to mobile hotspot. Worst case: play `public/demo-fallback.mp4` if it was recorded. |
