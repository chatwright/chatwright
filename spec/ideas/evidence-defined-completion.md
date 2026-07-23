---
format: https://specscore.md/idea-specification
status: Approved
---

# Idea: Evidence-defined completion — stop on goal met, catch overshoot

**Status:** Approved
**Date:** 2026-07-23
**Owner:** alex
**Promotes To:** —
**Supersedes:** —
**Related Ideas:** extends:goal-driven-ai-bot-testing, extends:actor-model-arena

## Problem Statement

Task completion is currently actor-declared: the model proposes `task-done`.
That fails in both directions. A model can declare done prematurely (observed
live: a small model proposed `task-done` for "greet the bot" without
greeting), and a model can meet the goal and keep working — adding products
past the target state, or sending an unrequested "done" message to the bot.
The founder's example: tasks ending in "have 3 products to buy and 1
bought" — if the actor reaches that state and keeps adding, when is it
stopped, and how is the excess detected and attributed?

## Context

The pieces exist: DTQL data-state assertions evaluate machine-checkable
criteria; the journal timestamps and attributes every action; budgets and
stop reasons already give the loop deterministic termination; findings are
classified with evidence links. What is missing is the loop evaluating task
success criteria ITSELF, per action, instead of waiting for the actor's
claim.

## Recommended Direction

- **Machine-checkable criteria per task** (DTQL assertion or deterministic
  conversation predicate) alongside the prose criteria the actor sees.
- **Per-action evaluation**: after every executed action the loop evaluates
  the active task's criteria; when they hold, the task completes
  deterministically with a new stop reason (`goal-met-by-evidence`). The
  actor cannot continue a completed task; budgets remain the backstop for
  prose-only criteria.
- **Both failure directions become findings:**
  - *Premature done*: actor proposes `task-done` while criteria fail →
    recorded, task continues (exists today as navigation failure; keep).
  - *Actor-overshoot* (NEW finding class): any client action recorded after
    the evidence-met moment — including "courtesy" messages to the bot —
    plus a final-state diff (declared end state vs actual DTQL state)
    catching cumulative excess. Attribution rule: actor-caused state
    mismatch is never misfiled as a bot defect; the journal decides.
- **Overshoot probe (arena tie-in)**: optional mode — after evidence-met,
  request ONE more proposal, record it, never execute it. Yields a
  per-model "stops-when-done rate" for the actor model arena at the cost of
  one call.

## Alternatives Considered

- **Trust the actor's task-done.** Rejected: contradicts "evidence over
  claims"; both observed failure directions are real.
- **Evaluate criteria only at task end.** Rejected for mutating criteria:
  the moment of meeting is what defines overshoot; end-only evaluation
  cannot time-attribute excess actions.
- **Hard-fail campaigns on overshoot.** Rejected: overshoot is a finding
  about the actor, not a run failure; the run stays valid evidence.

## MVP Scope

- Loop-side per-action criteria evaluation + `goal-met-by-evidence` stop
  reason + actor-overshoot finding class (report schema is versioned;
  additive bump).
- Proof (principle 6): a scripted campaign whose provider keeps proposing
  actions after the criteria hold stops at the met moment, records the
  excess proposal as overshoot, and the bundle shows both; a premature-done
  script still records the existing navigation failure.
- Lands in runtime-go after the repo split settles (touches loop + report
  schema, both mid-move).

## Not Doing (and Why)

- AI-judged "did it do too much" semantics — overshoot is defined by
  evidence timestamps and state diffs only.
- Auto-rollback of overshoot actions — evidence records them; state
  branching/checkpoints already give clean-slate reruns.
- Conversation-predicate DSL beyond what scenarios already assert — DTQL
  and existing waits first.

## Key Assumptions to Validate

| Tier | Assumption | How to validate |
|---|---|---|
| Must-be-true | Per-action DTQL evaluation is affordable in-loop | Measure loop latency with a fake and a real executor on the Listus scenario |
| Should-be-true | Overshoot occurs with real local models | Arena runs with the probe enabled; report the rate |
| Might-be-true | stops-when-done rate discriminates models usefully | Compare across the founder's local line-up |

## SpecScore Integration

- **Existing Features affected:**
  [`goal-driven-ai-testing`](../features/chatwright/goal-driven-ai-testing/README.md)
  (goal/task contract, campaign reporting),
  [`observability`](../features/chatwright/observability/README.md)
  (finding classes), actor model arena (metrics).

## Open Questions

- Criteria evaluation cadence for expensive real-database executors — every
  action, or every mutating action only?
- Should `goal-met-by-evidence` also close the whole campaign when it was
  the last task, skipping the actor's wrap-up proposal entirely?

---
*This document follows the https://specscore.md/idea-specification*
