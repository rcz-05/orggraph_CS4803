# Demo Script — 3 minutes

> SCRUM-2. Do this exact path on stage. Seeded data is wired so each click lands on a story beat. **Default cookie identity:** `eng-rayan`. **Default role:** Engineer.

## Pre-flight (do this 5 minutes before)
- `npm run dev` — confirm http://localhost:3000/app loads.
- Confirm `data/profiles.json` includes `eng-rayan` and `eng-arnav-chintawar`.
- In a private browser window, hit `/app` so the role cookie defaults to Engineer.
- Have the role switcher in muscle memory — it lives top-right of the navbar. Role switching is route-aware: Manager search → Engineer redirects to Teams; Engineer profile → Manager redirects to My team.

## Optional cold open — New engineer setup
1. Open `/app/demo`.
2. Click one or more mocked connector buttons: **GitHub**, **Jira**, **Slack**.
3. The **Continue** button stays disabled until at least one tool is connected.
4. Continue to `/app/loading`. The loading screen has no seconds countdown. Progress advances in uneven pauses, but every jump is exactly 10% or 20%.
5. After the 12s compressed flow, it redirects to `/app/demo/profile`, an Arnav Chintawar generated profile rendered with the same UI as `/app/profile`.

> Note: `/app/demo`, `/app/loading`, and `/app/demo/profile` force Engineer view so this flow does not inherit Manager view from a previous demo beat.

## Beat 1 — The engineer (0:00 – 0:50)
1. Land on `/app`. Read the eyebrow + Caveat headline aloud: *"What's your hidden expertise?"*
2. Click the peach **My profile** post-it.
3. On `/app/profile`:
   - Point at the Caveat name + the **Open to transfer** sage pill.
   - Click a skill card and a project theme card to show the detail pages.
   - Scroll to **Project Themes** and **Evidence** — emphasize the artifact refs.
4. In the Preferences block: click **Edit preferences**, toggle **Open to internal transfer**, then **Save changes**. Click **Publish profile** → badge flips Draft → Published and editing locks.

> Talking point: *"This isn't a resume. Every line traces back to a real PR, ticket, or thread. Engineers stop having to pitch their own work."*

## Beat 2 — The manager (0:50 – 2:00)
5. Top-right navbar: switch to **Manager view**.
6. Click **Talent search** in the nav (or the dashboard tile).
7. On `/app/search`:
   - Type **`fraud detection`** in the input.
   - Click the search button (or hit Enter).
   - Wait ~2–3s. Rayan should be top-1 with a green match score.
   - Toggle **Open to transfer only** or try a minimum score filter to show manager controls.
   - Read the `reason` aloud — it cites specific evidence.
   - Point at the **Open to transfer** pill on Rayan's row.
8. Click the row → lands on `/app/profile/eng-rayan`. Point out the **Manager match · Payments Architecture** box.

> Talking point: *"The manager queried in plain language. The match isn't keyword soup — it's evidence-backed. The 'open to transfer' pill is the bridge to outreach."*

## Beat 3 — The two-way close (2:00 – 3:00)
9. Switch back to **Engineer view**.
10. Navbar → **Teams** (or dashboard tile).
11. On `/app/teams`:
    - Point out **Best fit teams** — this appears only in Engineer view and is based on Rayan's profile.
    - Apply filter chip **Backend** (or **Payments**).
    - Click into **Fraud Platform**.
12. On `/app/teams/fraud-platform`:
    - Read the mission aloud.
    - Click a current project to show `/app/teams/fraud-platform/projects/[index]`.
    - Hover the **Skill gaps** panel and call out 1–2 gaps that overlap with Rayan's profile skills (e.g. "Postgres index optimization", "Idempotency / replay protection").
    - Choose **Coffee chat** or **Interested in a role**, add a short message, then click **Signal interest** → toast confirms.

> Closing line: *"Two-sided discovery. The manager finds the engineer; the engineer finds the team. Same evidence, same product, no recruiter in the loop."*

## Beat 4 — Manager sees the signal land (3:00 – 3:25, optional encore)
13. Top-right navbar: switch to **Manager view**. If you are on an engineer-only route, it redirects to the correct manager surface.
14. Open **My team** (`/app/teams/payments-architecture`).
15. Mission and current project title/description are editable session-only. Each project still links to its project detail page, where manager-owned project details are editable.
16. Open **Interests**. Manager inbox is scoped to Payments Architecture, with read/unread, star, follow-up, and priority sorting. Click an engineer row → routes back to `/app/profile/[id]`.

> Talking point: *"The other half of the loop. The manager doesn't get a notification — they get a panel of warm leads, anchored to the same team page where the engineer expressed interest."*

## Lock-in
- **Don't** edit `data/profiles.json` after this script runs cleanly twice.
- **Don't** edit `data/teams.json` after the skill-gap overlap is confirmed.
- **Don't** swap models in `lib/ai.ts` away from `gemini-2.5-flash` without checking structured-output behavior.

## If something breaks on stage
| Symptom | Action |
| --- | --- |
| `/app/search` errors | Check `GOOGLE_GENERATIVE_AI_API_KEY` in `.env.local` (or Vercel env). Pivot to: open the cached `/app/profile/eng-rayan` directly. |
| Search latency >5s | Refresh the page; first call after a cold start is slowest. |
| Signal interest 500 | Restart dev server to reset process-scoped temp signal state. Recover by demoing the seeded `/app/interests` rows. |
| Wi-Fi flake | Switch to mobile hotspot. Worst case: play `public/demo-fallback.mp4` if it was recorded. |
