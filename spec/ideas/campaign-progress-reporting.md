---
format: https://specscore.md/idea-specification
status: Approved
---

# Idea: Campaign progress reporting — stage and how far, live

**Status:** Approved
**Date:** 2026-07-23
**Owner:** alex
**Promotes To:** —
**Supersedes:** —
**Related Ideas:** extends:goal-driven-ai-bot-testing, extends:hybrid-runs, extends:actor-model-arena

## Problem Statement

A running campaign is a black box: nothing reports which stage it is at or
how far along it is. The founder hit this waiting on the first arena run —
twelve campaigns, no way to say "model 2 of 4, task 1/2, half the step
budget burned" without digging into artefacts.

## Context

Campaigns are nondeterministic in length, so a single percentage would lie.
But they are budget-bounded and structurally staged: parts (hybrid runs),
tasks with dependencies, loop iterations, and budgets (steps, duration,
cost, repeated failures) give honest denominators. Everything needed is
already computed in the loop — it just is not surfaced until the run ends.

## Recommended Direction

- **Three honest gauges, never one fake percent:**
  1. *Goal progress* — current part k/n, current task j/m, tasks completed;
     with evidence-defined completion, task completion is crisp.
  2. *Budget burn* — steps, elapsed, cost, repeated failures as fractions
     of their maxima (budgets make "how much room is left" always
     well-defined).
  3. *Health* — non-progress streak, retry counts by cause.
- **Additive callback seam**: an optional progress hook on the loop/run
  config (structured snapshot per iteration and per part/task boundary);
  no change to bundles — progress is derived state, not evidence.
- **Consumers**: CLI live stage line; the arena harness (per-cell progress
  and matrix position, e.g. "model 2/4 · repeat 1/3 · task 1/2 · steps
  5/12"); Studio Playground live view later.
- Lands in runtime-go post-split (loop + run composition are mid-move).

## Alternatives Considered

- **Single percentage.** Rejected: goal-driven runs have no honest total;
  a fake percent violates evidence-over-claims in spirit.
- **Polling artefacts (bundle files appearing).** Works as a stopgap (used
  today for the arena) but only reports at cell granularity, not within a
  campaign.

## MVP Scope

- Progress hook + snapshot type in the loop and run composition; the arena
  harness and any CLI runner print stage lines from it.
- Proof (principle 6): a scripted campaign's printed progress line sequence
  is asserted in a test (deterministic with the injected clock), and the
  arena's next run visibly reports matrix + in-campaign progress.

## Not Doing (and Why)

- Persisting progress snapshots into bundles — derived, not evidence.
- ETA prediction — model latency variance makes it a guess; budget-burn
  fractions convey remaining room honestly.
- Streaming partial observations to UIs — Playground live view is its own
  feature.

## Key Assumptions to Validate

| Tier | Assumption | How to validate |
|---|---|---|
| Must-be-true | A per-iteration hook adds no meaningful loop overhead | Benchmark loop with/without a no-op hook |
| Should-be-true | The three gauges answer "where is it stuck" in practice | Use during the next arena run and Listus campaign |
| Might-be-true | Playground live view can reuse the same snapshot type | Prototype when that feature activates |

## SpecScore Integration

- **Existing Features affected:**
  [`goal-driven-ai-testing`](../features/chatwright/goal-driven-ai-testing/README.md)
  (loop), [`observability`](../features/chatwright/observability/README.md)
  (developer-facing progress), actor model arena (harness output).

## Open Questions

- Snapshot delivery: callback only, or also a polling accessor for callers
  that cannot take a callback?

---
*This document follows the https://specscore.md/idea-specification*
