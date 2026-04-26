# Slack — selected technical threads (rayan)

## #fraud-platform — 2025-10-14 — Stripe migration cutover plan

> **rayan**: posting the cutover plan here for visibility. tl;dr: dual-write Mon, shadow-compare Tue–Thu, flip flag Fri morning, kill-switch ready. anyone has objections, drop them here or in the RFC by EOD Wed.
>
> **jonas**: +1 from SRE side. on-call rotation has the kill-switch runbook printed.
>
> **priya**: confirmed perf gate — p99 fraud-rule eval ≤ 50ms over rolling 1hr before flip. dashboards ready.
>
> **rayan**: thx. one more thing — i'll be online Fri 6am–11pm for the cut. anyone else wants to lurk on the war room call, link in the calendar invite.

## #frontend-help — 2025-11-22 — mei asks about backend integration

> **mei**: hey #frontend-help — i'm trying to wire the new merchant onboarding form to the fraud-scoring API and getting intermittent 502s on the first request after a cold start. anyone seen this?
>
> **rayan**: 👋 not a frontend bug — that's the fraud-scoring service's cold-start. we don't have warmup probes on the canary instances. easy fix on our side, opening a ticket. in the meantime: retry once on 502 with a 200ms backoff and you'll be fine. sorry about that.
>
> **mei**: oh thank god, thought i was losing it. that worked.
>
> **rayan**: opened FRAUD-103 to add warmup probes. should be in this week.

## #platform-eng — 2026-01-29 — sarah-chen asks for help

> **sarah-chen**: anyone with bandwidth this sprint to land DEVPORTAL-22 (fraud platform service catalog)? we keep slipping it and it's blocking the Q1 portal launch.
>
> **rayan**: i can take it. it's adjacent to FRAUD-127 i'm doing anyway and i know the service.yaml shapes.
>
> **sarah-chen**: 🙏 you're a lifesaver. ping me if any of the metadata is unclear.

## #eng-mentorship — 2026-02-08 — david question

> **david**: hey rayan, do you have 20 min this week to talk through the rules-engine async refactor? i want to make sure i'm not missing something on the error-handling side before i open the PR.
>
> **rayan**: yeah totally. thursday 2pm? i can also share the design doc i wrote when we first split the engine — there's some context on why we chose the current sync model that'll help you decide what to keep vs. break.
>
> **david**: perfect. thanks.

## #incidents — 2025-11-04 — Stripe cutover war room (excerpt)

> **rayan**: cutover at T-0. dashboards green. flipping flag now.
>
> **rayan**: flag flipped 14:02 UTC. shadow-compare divergence at 0.04% (well under 0.5% threshold). p99 fraud-rule eval at 41ms. 🟢
>
> **jonas**: 24hr soak window starts now. on-call has the rollback runbook.
>
> **rayan** (next day): 24hrs in, still green. closing the war room. thanks everyone — special shoutout to priya for the perf gate, jonas for the SRE coverage, and the risk team for the dual-write review.
