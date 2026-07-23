---
format: https://specscore.md/decision-specification
status: Approved
---

# Decision: Community appreciation through independent metrics

**Status:** Approved
**Date:** 2026-07-23
**Owner:** alex
**Tags:** community, metrics, anti-gaming, product
**Source Idea:** executable-knowledge-platform
**Supersedes:** —
**Superseded By:** —

## Context

The platform designs appreciation in: usage counts, demo runs, successful
completions, saves, GitHub stars, likes, author profiles, badges,
leaderboards, trending and featured placements. The actor-model arena idea
already decided several mechanics for benchmark scenarios: stars as a
bookmark/discovery signal that never ranks, adoption as the ranking metric,
GitHub OAuth as identity, and a clone button as the comparability
mechanism. The founder's rule for the platform at large: keep metrics
independent; do not collapse everything into one opaque score. This
decision scaffolds the model only — no implementation now.

## Decision

### Independent metrics, named rankings

Each knowledge-graph node (decision
[0011](0011-executable-knowledge-graph.md)) may carry these counters, each
stored, displayed and ranked **separately**:

- **demo runs** — a runtime executed this node's demo.
- **completions** — a demo/scenario run reached its verified end.
- **saves** — an authenticated user saved a Recording derived from it.
- **clones** — the clone/copy affordance was used (the arena's clone
  button, generalised).
- **adoption** — distinct authenticated users who ran it (the arena's
  ranking metric, generalised).
- **stars** — GitHub stars on the backing repository, read from the GitHub
  API (never self-reported); on-platform "likes" are a separate counter
  for nodes without a repository.

There is **no composite score**. Every leaderboard, trending list or
featured slot names the single metric it ranks by ("most adopted this
month", "most cloned"); trending is a time-windowed delta of one metric.
Editorial "featured" placement is explicitly human and labelled as such.

### Identity and attribution

GitHub OAuth is the contributor identity (arena precedent). Author profiles
aggregate a person's nodes and their per-metric counts — never a combined
reputation number.

### Anti-gaming posture

- Anonymous events (demo runs) are accepted but coarse: rate-limited per
  origin, rounded for display, and never used as a ranking metric on their
  own.
- Ranking metrics (adoption, saves, clones) count **distinct authenticated
  users**, not raw events.
- Stars are verified against GitHub, not stored writes.
- Counter writes are server-side and append-only (auditable); displayed
  values may lag.
- Leaderboards prefer authenticated metrics and disclose their window and
  metric in the UI.

## Rationale

- Independent, named metrics keep every number **auditable and
  explainable**; a composite score invites gaming the weights and erodes
  trust the moment anyone asks "why is X above Y?".
- Distinct-authenticated-user counting for ranking metrics makes the cheap
  attacks (replay loops, bot traffic) ineffective without punishing
  anonymous visitors, who still contribute coarse usage signals.
- Verifying stars against GitHub outsources the hardest identity problem
  to a system contributors already trust.
- The arena idea already committed to stars-never-rank and
  adoption-as-ranking for scenarios; generalising the same model avoids
  two community systems diverging.

## Declined Alternatives

### A single reputation/quality score

Rejected (founder rule): opaque, gameable, and it flattens genuinely
different kinds of appreciation.

### Self-reported install/usage badges

Rejected: unverifiable numbers rot trust for the whole platform.

### Ranking by anonymous raw event counts

Rejected: trivially inflated; anonymous counters stay coarse signals only.

## Consequences at Decision Time

- The `chatwright/recipes` content model reserves a place for node metrics
  by reference (node id → counters service), keeping content files free of
  mutable numbers.
- The arena idea's scenario leaderboards become the first concrete instance
  of this general model rather than a parallel system.
- A follow-up session specifies storage, the events API and abuse handling
  ([research: knowledge platform](../research/knowledge-platform.md)); no
  backend is built now.

## Observed Consequences

None yet — recorded on the day the decision was made.

## Affected Features

- [`marketplace`](../features/chatwright/marketplace/README.md)
- [`cloud`](../features/chatwright/cloud/README.md)

## Open Questions

- Storage, the events API and abuse handling are backlog item I-73 in
  [research: knowledge platform](../research/knowledge-platform.md).

*This document follows the https://specscore.md/decision-specification*
