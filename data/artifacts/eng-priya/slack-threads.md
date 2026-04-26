# Slack — selected threads (priya)

## #ml-platform — 2025-12-11 — recsys migration

> **priya**: pgvector migration is live. p99 nearest-neighbor: 480ms → 38ms. saved ~$11k/mo on the bespoke index hosts. 🎯
>
> **arnav**: 🙏 thank you. one less thing for data-infra to babysit.

## #ai-tooling-curious — 2026-03-04 — applied AI interest

> **tisha**: anyone using the internal LLM gateway for non-ML use cases yet?
>
> **priya**: yes! we built a small internal eval harness — happy to walk you through it.
>
> **priya** (later): honestly i've been wanting to spend more time on the applied side. the ML-platform work is rewarding but i'd love to ship a feature, not just infra.

## #payments-fraud — 2025-09-22 — perf gate review

> **priya**: 👋 reviewing the Stripe migration plan. the perf gate (p99 fraud-rule eval ≤ 50ms over a rolling 1hr) is the right shape. one suggestion — also gate on tail latency divergence between the legacy and stripe paths during shadow-compare, not just the absolute number.
>
> **rayan**: good call, adding.
