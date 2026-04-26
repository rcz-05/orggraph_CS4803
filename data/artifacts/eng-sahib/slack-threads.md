# Slack — selected threads (sahib)

## #platform-eng — 2026-01-23 — platform-cli launch

> **sahib**: 🚀 `platform-cli scaffold` is live. spin up a new service with `platform-cli scaffold my-service` — get TS, OTel, CI/CD, Helm, on-call stub all wired. feedback welcome in this thread.
>
> **david**: tried it on a small internal tool — went from idea to first deploy in 22 min. wild.
>
> **rayan**: nice. one ask — can we plug the fraud-platform service.yaml shape in as a template too? would save us a chunk of onboarding time on the next service we spin up.
>
> **sahib**: yep, opening a ticket for that.

## #internal-tooling — 2026-02-14 — CI speedup

> **sahib**: monorepo CI wall time went 18min → 7min today. PR #538. parallelized test stages + a shared node_modules cache. should mostly be invisible but if anyone sees flakes please ping me.

## #eng-mentorship — 2026-03-09 — leading a small project

> **eng-manager**: sahib, want to take point on the new service-template review process? you'd lead a small group (2 ICs) and own the rubric.
>
> **sahib**: yes. i've been wanting more of that kind of work.
