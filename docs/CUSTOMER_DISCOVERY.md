# Customer Discovery — Key Learnings

> Compressed from `docs/pdfs/customer-discovery-learnings.pdf` (Rayan) and `docs/pdfs/customer-discovery-pitch.pdf` (team). 20 interviews total across the team.

## What changed our minds
We started thinking OrgGraph was a **top-down leadership dashboard** product. Customer discovery flipped it: the sharper, more painful, more validatable problem is **engineer-side and manager-side internal mobility & promotion fairness**. Leadership analytics is downstream of that — Phase 2.

## Interview highlights (Rayan's 5 conversations)
| Source | Role | Key insight |
| --- | --- | --- |
| Microsoft | Software engineer | *"It's very hard to prove what you actually do."* Has to personally pitch his work upward to get noticed; no system captures the signal. |
| Amazon | Lead engineer | Contribution tracking infra **exists** at Amazon; the **discovery layer on top is broken**. Teams are siloed; engineers move only if they have deep tenure & connections. Engineers get replaced by interns instead of being internally rematched. |
| Jeeves | VP of People | Internal mobility consistently de-prioritized vs external hiring. No major crisis yet, but the gap is real. |
| Jeeves | Senior PM / VP of Product | Multi-function leadership has constant blind spots; existing HR tooling helps but doesn't solve discovery. |
| Rounds.so | Founder | **SMBs are the underserved market** — big cos build their own internal tools, smaller cos can't, and they hit visibility issues much earlier than expected. |

## Cross-cutting findings (all 20 interviews)
- **Engineers** can't prove invisible work (maintenance, code review, mentoring, system ownership). Current metrics like commit count are "very ineffective" → promotion subjectivity.
- **Hiring managers**: *"I'd rather post on LinkedIn than find someone internal."* Existing internal search is by name/title/team only.
- **Promotion committees** lean entirely on manager narratives — likeability ends up beating evidence.
- **Concrete cost**: external hiring carries a **30–40% premium** vs internal. Internal mobility infra exists, the discovery layer is broken.

## Three-sided problem, asymmetric consequences
Each side of OrgGraph's audience has the same structural pain (organizational blindness) but different consequences:
- **Engineer:** career stagnation, unfair promotion outcomes.
- **Manager:** wasted hiring time, costly external hires, missed internal candidates.
- **Leadership:** knowledge concentration risk, surprise resignations of irreplaceable people.

The MVP **only** addresses engineer + manager. Leadership consequences are Phase 2.

## What this implies for the product
1. **Trust must be designed-in.** Auto-generated profiles only work if engineers believe the system represents them fairly. Profiles are **drafts that engineers approve** — never published silently.
2. **Two-way discovery** is the moat — not just managers searching, but engineers proactively browsing teams.
3. **Seed for the demo with stories that match the customer interviews** — e.g. an engineer with strong fraud-detection / system-maintenance evidence the manager's search surfaces. The demo is the pitch.
4. **SMBs first** in any go-to-market framing. Don't position as a Microsoft/Amazon enterprise dashboard.

## Open follow-up questions (post-demo)
- Will engineers trust an AI-generated profile from GitHub + Slack data? Privacy concerns?
- "What would have to go wrong for the mobility gap to become a crisis?" — push interviewees harder on consequences.
- Validate willingness-to-pay with at least one SMB.
