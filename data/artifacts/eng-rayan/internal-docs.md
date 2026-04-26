# Authored / co-authored internal docs (rayan)

## RFC 0011 — Stripe Payment Intents migration (author)
- **Status**: Accepted, implemented in PR #1283
- **Summary**: Two-phase migration plan (dual-write → shadow-compare → cut) for moving the legacy in-house payment processor to Stripe Payment Intents. Includes a feature-flagged rollback path and a perf gate (p99 fraud-rule eval ≤ 50ms) on the cutover criteria.
- **Why this doc matters**: this RFC was the alignment artifact across Risk, Ledger, SRE, and Fraud Platform. Without it the migration would have stalled in cross-team review.

## RFC 0014 — Idempotency for fraud-scoring API (author)
- **Status**: Accepted, implemented in PR #1401
- **Summary**: Adds a Redis-backed dedup layer in front of the fraud-scoring API gateway. 24hr TTL, keyed on `(merchant_id, transaction_id, attempt_id)`. Closes a class of double-scoring bugs that were inflating decline rates for ~3% of mobile-checkout retries.

## docs/api/fraud-scoring.md (primary author + maintainer)
- The canonical API doc for the fraud-scoring service. Used by Risk, Ledger, and Mobile Checkout teams. Covers request/response schemas, error codes, idempotency contract, latency SLOs, and a runbook for common integration issues.

## docs/runbooks/fraud-scoring-incident.md (co-author with jonas)
- The on-call runbook for the fraud-scoring service. Covers: rule-evaluator timeouts, rules-engine OOM, Postgres lock contention on `transactions`, Stripe API 5xx fallback, and the kill-switch flow.

## Internal blog post — "Why we kept the fraud-rules engine in-process" (Q1 2026 eng newsletter)
- A short writeup of the decision to keep the rules engine in-process rather than splitting it as a side-car during the Stripe migration. Argued for the latency budget (preserves <50ms p99 add) over the architectural purity of separation. Got cited in two later design reviews.
