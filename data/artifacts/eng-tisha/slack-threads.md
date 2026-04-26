# Slack — selected threads (tisha)

## #design-systems — 2026-02-19 — dark mode rollout

> **tisha**: dark-mode parity for the growth funnel landed today 🌑 zero per-component overrides — all token-driven. if you're working on a new screen, please use the `--ds-color-*` tokens directly so we don't regress.
>
> **mei**: 🙌 thank you. i'm about to start on the new onboarding flow, this saves me a week.

## #ai-tooling-curious — 2026-03-04 — interest signal

> **tisha**: anyone using the internal LLM gateway for non-ML use cases yet? i've been prototyping a copy-suggestion tool for growth experiments and want to understand what other teams are doing before i go too deep.
>
> **priya**: yes! we built a small internal eval harness — happy to walk you through it. the gateway is fine for low-volume; latency is the constraint.
>
> **tisha**: that'd be amazing. dm'd you 🙏

## #fraud-platform — 2026-01-29 — cross-team rotation

> **tisha**: heading into a 2-sprint rotation here. rayan, sending you my schema-split PR for review when it's ready — first migration of this scale i've done.
>
> **rayan**: 🫡 happy to. drop the design doc whenever you have one and i'll review it before the PR opens.

## #growth-eng — 2026-01-12 — RSC migration win

> **tisha**: experiments dashboard TTI went 2.4s → 0.9s after the RSC migration 🎉 cold-load P75, no client-side changes for consumers. PR #2104 merged this morning.
>
> **eng-manager**: this is great. can you write up a quick blog post for the eng newsletter? the rest of the org is still on Pages Router and could use the playbook.

## #frontend-security — 2026-03-12 — strict CSP rollout plan

> **tisha**: posting the rollout plan for SEC-218 / strict CSP across web-platform 🛡️ tl;dr: nonce-based allowlist with `'strict-dynamic'`, three phases (report-only → internal enforce → user-facing enforce), per-team violation dashboard so partner teams can self-serve fixes. doc: `docs/security/csp-runbook.md`. q's welcome before i flip the report-only flag thursday.
>
> **mei**: question — is the new onboarding flow going to break? i have a few inline-script tags i wasn't sure how to refactor.
>
> **tisha**: shouldn't break — i made the nonce-context auto-thread through `<script>` tags rendered server-side. ping me on the PR if anything trips and i'll pair on it. also there's a runbook example for the inline-script case in the doc above.
>
> **david**: 🙌 we'll lift the nonce-context pattern for the internal admin tooling we're spinning up. is the rollout pattern reusable?
>
> **tisha**: yep, all of it is generic — happy to write you a quickstart, just open a SEC-225 sub-task and i'll attach.

## #sec-review — 2026-03-25 — quarterly frontend security audit signoff

> **tisha**: q1 frontend security audit wrapped today. signed off on 4 cross-team PRs after review:
>
> - PR #1456 (rayan, dev-portal) — verified no XSS surface in the markdown renderer used for service descriptions.
> - PR #2178 (mei, onboarding flow) — flagged a `dangerouslySetInnerHTML` for translated copy, refactored to use a sanitized renderer instead. mei landed the fix same day.
> - PR #2240 (sahib, internal portal) — reviewed CSP compatibility, flagged 1 inline-script that needed nonce-aware refactor. fixed.
> - PR #2255 (jonas, runbook viewer) — verified the auth-cookie usage matches our `__Host-` migration plan, no regressions.
>
> next steps: SEC-225 to extend strict CSP to the internal admin surfaces (jonas + david interested in coordinating). sec audit checklist updated in `docs/security/xss-audit-checklist.md`.
>
> **rayan**: appreciate the rigor. happy to make security review a hard gate on dev-portal PRs going forward — want to draft the policy together?
>
> **tisha**: 🙏 yes, opened SEC-228 for that.
