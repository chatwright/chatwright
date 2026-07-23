---
format: https://specscore.md/idea-specification
status: Approved
---

# Idea: Proposal content constraints — evaluate what the actor sends

**Status:** Approved
**Date:** 2026-07-23
**Owner:** alex
**Promotes To:** —
**Supersedes:** —
**Related Ideas:** extends:goal-driven-ai-bot-testing, extends:evidence-defined-completion, extends:actor-model-arena

## Problem Statement

Nothing evaluates the CONTENT an AI actor sends to the bot. Asked to add
groceries, a model may add TVs and DVDs — structurally valid proposals, on
an available action, advancing nothing the goal asked for. Goal constraints
exist only as prose the actor reads; there is no machine check, no record of
violations, and no way to compare models on staying on-domain.

## Context

The loop already has a validate stage (stale-action and contract checks)
where a blocked proposal is recorded and re-prompted, bounded by the
non-progress streak and budgets. goal.Task carries prose `constraints` the
actor sees. DTQL assertions can already check resulting state. Content
constraints are the missing symmetric half of evidence-defined completion:
criteria judge the world after actions; constraints judge what the actor
may say on the way in.

## Recommended Direction

- **Machine-checkable content rules** declared per goal/task alongside the
  prose: scenario-declared vocabularies/allowlists ("items come from this
  list"), deny-patterns, and a predicate seam for custom rules — all
  deterministic; the test author controls the domain, so a groceries
  lexicon is a fair, exact check.
- **Enforced in the validate stage**: a violating proposal is blocked
  BEFORE reaching the bot, recorded as a `constraint-violation` finding
  (actor-attributed, new class), and re-prompted — counting toward
  NonProgressLimit and budgets exactly like other invalid proposals.
  Enforce is the default; an observe-only mode (send but flag) is a later
  option for exploratory/fuzz-style runs.
- **State-time backstop**: the documented DTQL pattern "all items in the
  final state ∈ allowed set" catches anything that slipped past or runs
  without declared proposal rules. Attribution rule as with overshoot:
  actor-caused pollution is never misfiled as a bot defect.
- **Arena metric**: on-domain rate / constraint-violation count per model
  joins the retry breakdown in the comparison report.
- **Semantic judgement** ("is oat milk a grocery?") — AI-judge only,
  later, explicitly labelled, never silently mixed with evidence-grade
  metrics.

## Alternatives Considered

- **Prose constraints only (status quo).** Rejected: unverifiable; models
  differ exactly here and nothing measures it.
- **Judge-model evaluation as the primary mechanism.** Rejected for MVP:
  contradicts evidence-over-claims; deterministic rules cover the test
  author's controlled domains.
- **Letting violations through and only diffing state.** Kept as backstop,
  rejected as the only layer: blocking keeps bot state clean and the
  violation moment time-attributed.

## MVP Scope

- Content-rule declaration on goal/task + validate-stage enforcement +
  `constraint-violation` finding class (versioned report bump shared with
  evidence-defined completion).
- Proof (principle 6): a scripted provider proposing "add plasma TV"
  against a groceries-vocabulary goal is blocked, recorded, re-prompted to
  a valid item; the bundle shows the violation event; final-state DTQL
  contains only allowed items.
- Lands in runtime-go after the split (loop + report schema, mid-move).

## Not Doing (and Why)

- Observe-only mode — later option, noted above.
- NLP/semantic matching in the deterministic layer — rules stay exact
  (vocabulary, pattern, predicate); fuzziness belongs to the labelled judge.
- Constraining bot output — this idea governs the actor's side only;
  bot-response assertions are the scenario API's existing job.

## Key Assumptions to Validate

| Tier | Assumption | How to validate |
|---|---|---|
| Must-be-true | Vocabulary/pattern rules express real test constraints (Listus groceries) | Author the Listus goal with a lexicon; count false blocks |
| Should-be-true | Local models violate content constraints measurably | Arena runs; per-model violation counts |
| Might-be-true | Observe-mode has real users (fuzzing bots with off-domain input) | Revisit when fuzz-testing feature activates |

## SpecScore Integration

- **Existing Features affected:**
  [`goal-driven-ai-testing`](../features/chatwright/goal-driven-ai-testing/README.md)
  (goal/task contract, campaign reporting), actor model arena (metrics),
  fuzz-testing (observe-mode overlap, future).

## Open Questions

- Rule scope: per-task, per-goal, or both with task overriding goal?
- Should click proposals be constrainable too (e.g. "never click delete-all
  actions"), or text-only first?

---
*This document follows the https://specscore.md/idea-specification*
