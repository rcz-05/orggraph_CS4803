# OrgGraph PRD (Product Requirements Document)

> Compressed and structured restatement of `docs/pdfs/design-documentation.pdf` and `docs/pdfs/feature-identification.pdf`. The PDFs are the source of truth; this file is the version checked into source control so agents and teammates can see it without opening the originals.

## 1. Product overview
**Name:** OrgGraph
**One-liner:** Make invisible work visible.
**Summary:** OrgGraph is an AI-powered internal talent discovery platform. It analyzes existing engineering work artifacts (GitHub PRs, Jira tickets, Slack discussions, technical docs) to build evidence-based expertise profiles, lets managers search for internal talent by real skills, and lets engineers explore teams and projects before any job is formally posted.

**Problem:** As engineering orgs scale (especially SMBs), knowledge of who-knows-what evaporates. Engineers can't prove invisible work (maintenance, mentoring, ownership). Managers default to LinkedIn over internal hiring. Promotion committees rely on manager narratives instead of evidence. The infrastructure exists (Jira, Slack, GitHub) — the **discovery layer** is broken.

**MVP goal:** Internal talent **mobility** + **promotion support** for engineering orgs. Make invisible work legible, give managers a real internal search, give engineers a real team-discovery surface.

## 2. Users
### Primary
- **Software engineers** — want growth, fairer promotions, easier internal transfers.
  - Need: prove invisible work, explore internal teams, signal interest, fair promotion process.
- **Hiring / team managers** — want to fill roles internally before going external.
  - Need: search by real skills, understand candidate fit fast, reduce time-to-hire.

### Secondary
- **Promotion committees / leadership** — want grounded contribution evidence to remove bias.
  - Need: objective evidence, visibility into expertise, lower risk of overlooking high-impact contributors.

### Research insights that shaped the product
- Microsoft engineer: *"It's very hard to prove what you actually do"* — has to personally pitch his own work upward.
- Amazon lead engineer: contribution tracking exists, but discovery layer on top is broken; teams are siloed.
- Jeeves VP of People: internal mobility doesn't get prioritized vs external hiring.
- Rounds.so founder: SMBs are the underserved market — large companies can build internal tooling, small ones can't.
- Hiring manager (composite): *"I'd rather post on LinkedIn than find someone internal."*

> **Design implication:** OrgGraph is **not** a top-down monitoring dashboard. It is a two-way discovery product between engineers and internal opportunities.

## 3. Core features (MVP)

### Feature 1 — Automated Skills & Expertise Profiles  ·  SCRUM-14  ·  Owner: Rayan
**Description:** Auto-generate structured expertise profiles for engineers by analyzing seeded GitHub / Jira / Slack artifacts via an LLM. Engineers review and edit the profile before publishing.

**Why it's foundational:** every other feature reads from these profiles.

**User stories:**
- *As an engineer*, I want a profile that reflects my real work so I don't have to rely on self-promotion.
- *As an engineer*, I want to add transfer preferences and interests so I can signal growth intent to managers.
- *As a promotion reviewer*, I want grounded contribution signals so evaluations are fairer.

**Acceptance criteria:**
- The system ingests mock GitHub / Jira / Slack data and runs it through an LLM.
- Output is a structured profile with: skills (with evidence), project themes, contribution evidence snippets.
- Engineer can review the draft and edit any section before "publishing".
- Profile has an editable **Preferences** section, including a toggle for *Open to internal transfer*.
- Profile is visible at `/app/profile/[id]`.

**Current demo implementation notes:**
- `/app/demo` shows a mocked new-user connector step for GitHub, Jira, and Slack. At least one connector must be selected before continuing. Connector handlers are dummy functions today, with a small config surface intended for future OAuth wiring.
- `/app/loading` simulates profile generation with a hard-coded 2m34s loading screen. It does not show a seconds countdown; progress advances in uneven timing and only jumps by 10% or 20% at a time.
- `/app/demo/profile` renders the generated Arnav Chintawar profile with the same profile UI used by `/app/profile`.
- All three demo onboarding routes force Engineer view so the flow does not inherit Manager view.

### Feature 2 — Skill-Based Internal Talent Search with AI Matching  ·  SCRUM-15  ·  Owner: Arnav
**Description:** A manager-facing search where natural-language queries (e.g. *"who has React experience?"*, *"fraud detection experience"*) return a ranked list of internal candidates with match relevance, key matched skills, and stated transfer interest.

**User stories:**
- *As a hiring manager*, I want to search by actual skill so I can interview internal candidates first and reduce external hiring.
- *As an engineer*, I want my expertise to surface in internal searches so I'm considered for fitting opportunities.

**Acceptance criteria:**
- Search input accepts free text.
- AI matches the query against all seeded profiles and returns a **ranked** list.
- Each result row shows: candidate name, match relevance score, matched skill highlights, transfer interest flag.
- Clicking a result opens the candidate profile inline (or navigates to `/app/profile/[id]`).
- Returns useful results in < 5s on demo hardware (latency budget for the live demo).

**Current demo implementation notes:**
- Talent Search is Manager-view only. Engineer-view navigation hides `/app/search`, and direct access redirects to `/app/teams`.
- Results include UI filters for **Open to transfer only** and minimum match score (`All`, `50+`, `70+`, `85+`).
- Candidate profiles opened from Manager view show a local match score card for the manager's Payments Architecture team.

### Feature 3 — Team & Project Discovery Portal  ·  SCRUM-16  ·  Owner: Sahib
**Description:** A portal for engineers to browse internal teams, see what they work on, and proactively signal interest before any job posting exists.

**User stories:**
- *As an engineer*, I want to browse teams and understand their tech and work before requesting a chat.
- *As an engineer*, I want to filter teams by tech stack or project type.
- *As a manager*, I want interested engineers to understand my team before they reach out.

**Acceptance criteria:**
- `/app/teams` lists teams with filter chips for tech stack and project type.
- `/app/teams/[slug]` shows: current projects, key technologies, owned services, skill gaps, "Signal interest" button.
- For demo, **2–3 well-seeded team pages are sufficient** (PRD explicitly says this can be lighter than features 1–2).

**Current demo implementation notes:**
- Engineer view highlights **Best fit teams** based on Rayan's profile before the regular filters.
- Team current projects link to `/app/teams/[slug]/projects/[index]` detail pages with owner, timeline, problem, approach, metrics, milestones, risks, and collaborators.
- Engineer signaling captures intent (`coffee-chat` or `role-interest`) plus a manager-facing message.
- Manager view has **My team** for Payments Architecture, editable mission/current projects, editable owned project detail pages, and `/app/interests` for read/star/follow-up workflow.

## 4. Success metrics (pilot)
| Category | Metric | Target |
| --- | --- | --- |
| Profile accuracy | Engineer rates profile accurate / mostly accurate | ≥ 70% |
| Search effectiveness | Manager searches returning ≥ 1 relevant candidate | ≥ 60% |
| Discovery engagement | Engineers exploring ≥ 1 team page | ≥ 40% |
| Mobility outcomes | Internal opportunity conversations initiated | ≥ 5 in pilot |

These are pilot/post-MVP metrics. For the **showcase demo**, success = the three features execute end-to-end live without breaking, with the seeded data telling a coherent story.

## 5. MVP scope
### Included
1. AI-generated expertise profiles from seeded artifacts (Feature 1).
2. Skill-based internal candidate search (Feature 2).
3. Basic AI matching between query and profiles (Feature 2).
4. Team & project discovery pages (Feature 3).
5. Engineer ability to review / edit / publish profile (Feature 1).
6. Role-specific demo surfaces: Engineer view for profile/team discovery; Manager view for talent search, managed-team editing, and interest inbox.
7. Mocked new-user connector demo for GitHub/Jira/Slack leading to a generated profile.

### Explicitly excluded
- Full org intelligence dashboards for executives.
- Knowledge concentration / risk dashboards.
- Succession planning tools.
- Promotion package exports.
- Fully automated two-way matching across the org.
- Enterprise-wide workforce planning.
- Broad HR analytics outside mobility/expertise visibility.
- Real OAuth into GitHub/Jira/Slack — **mock data only** for MVP.
- AI persona "chat with the candidate" — explicitly deferred per PRD.

## 6. User flows (from design doc)
1. **Engineer creates & reviews expertise profile** — Connect tools (mocked) → ingest artifacts → AI generates draft → engineer reviews → edit preferences → publish.
2. **Manager searches for internal talent** — Navigate to search → enter skill query → AI matches → view ranked results → open candidate profile → contact.
3. **Engineer explores teams & signals interest** — Browse best-fit teams / filter teams → open team page → review projects and fit → signal interest with intent/message → manager notified.
3a. **Manager reviews team interest** — Open team inbox → filter read/unread or starred → add follow-ups → open engineer profiles with team match score.
4. **Promotion reviewer evaluates engineer profile** *(supporting flow, not a primary MVP surface)* — Access profile → review evidence → decide.

## 7. Out of scope of this MVP, on the roadmap
- Phase 2: Manager dashboards, promotion packages, knowledge concentration & skill-gap analysis.
- Phase 3: Two-way automated matching, AI persona chat, recommendation engine on team pages.
