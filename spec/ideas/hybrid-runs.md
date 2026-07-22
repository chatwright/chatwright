---
format: https://specscore.md/idea-specification
status: Draft
---

# Idea: Hybrid runs — deterministic and AI-goal parts in one run

**Status:** Draft
**Date:** 2026-07-22
**Owner:** alex
**Promotes To:** —
**Supersedes:** —
**Related Ideas:** extends:goal-driven-ai-bot-testing, extends:chatwright

## Problem Statement

Real testing sessions are neither purely scripted nor purely exploratory. The
expensive, well-known passages (onboarding, environment preparation, cleanup)
deserve deterministic execution — fast, token-free, flake-resistant — while the
behaviour under investigation deserves goal-driven AI exploration from exactly
the state those passages establish. Today a run is one or the other; composing
them means separate runs with no shared conversation, cast or evidence.

## Context

The architecture already holds every ingredient: deterministic and AI testing
share one runtime (decision 0004); actors are interchangeable within a
conversation; scenario fragments compose deterministic passages with recorded
provenance; the goal/task contract and actor loop drive the same emulator and
journal as the scenario API; and state checkpoints (decision 0009) already
mark meaningful boundaries. The run-bundle format (v1) encodes runs as ordered
**parts**, each with its own kind and journal boundary, with the actors roster
and conversation journal shared at run level — the evidence side of this idea
ships first, with today's writers emitting single-part runs.

Illustrative shape:

1. Part 1 — Onboarding (deterministic)
2. Part 2 — Shopping-list exploration (ai-goal)
3. Part 3 — Cleanup (deterministic)
4. Part 4 — Re-entry behaviour (ai-goal)

## Recommended Direction

Add a run-composition layer where an ordered sequence of parts executes over
one environment, one cast and one continuous journal:

- **Deterministic parts** execute scenario fragments (existing composition
  contract, provenance retained).
- **AI-goal parts** execute the actor loop with a goal/task contract and
  budgets scoped to the part.
- Part boundaries are recorded in evidence (journal index, timestamp,
  checkpoint reference where one was captured), giving the player natural
  chapters and giving findings a part context.
- Budgets: AI parts carry their own budgets; a run-level ceiling aggregates.
- Failure policy is declared per part: a failed deterministic part may abort
  the run or mark subsequent dependent parts as coverage gaps.
- State checkpoints at part boundaries compose with branching: an expensive
  deterministic prefix can be checkpointed once and several AI parts explored
  as siblings — the sequential and branching forms of the same reuse insight.

## Alternatives Considered

- **Run-level kind (deterministic vs campaign).** Rejected: forces separate
  runs for mixed sessions, splitting conversation, cast and evidence exactly
  where continuity matters most.
- **AI actors scripted to "follow the happy path" for known passages.**
  Rejected: burns tokens and adds nondeterminism precisely where determinism
  is free.
- **Fragments calling the AI loop internally as a step.** Deferred as
  mechanism; the part model keeps evidence, budgets and failure policy
  explicit at the composition surface rather than hidden inside a step.

## MVP Scope

- Bundle format: parts with kinds, journal boundaries, part-scoped goal/events
  (shipping in format v1; single-part writers today).
- Runtime: a minimal `Run(parts...)` composition executing deterministic
  fragments and AI-goal parts in order over one environment, recording part
  boundaries in evidence.
- Listus proof: onboarding (deterministic fragment, already exists) → one
  AI-goal exploration part → deterministic cleanup, in one bundle, replayable
  in the player with chapters.

## Not Doing (and Why)

- Parallel parts — sequential only until the concurrency model matures.
- Nested parts — flat ordered list first.
- Cross-part AI memory guarantees beyond the shared journal — observation
  context staging governs that separately.
- Retrofitting deterministic-run bundle emission — tracked separately; this
  idea consumes it when it lands.

## Key Assumptions to Validate

| Tier | Assumption | How to validate |
|---|---|---|
| Must-be-true | A deterministic fragment and the actor loop can hand over mid-conversation without state ambiguity | Listus proof: fragment-established state visible in the AI part's first observation |
| Should-be-true | Part-scoped budgets plus a run ceiling are sufficient cost control | Run the Listus proof with tight budgets; verify stop reasons attribute to the right part |
| Might-be-true | Checkpoint-at-boundary composes cleanly with sibling AI parts | Branch two AI parts from one onboarding checkpoint and compare evidence |

## SpecScore Integration

- **Existing Features affected:**
  [`goal-driven-ai-testing`](../features/chatwright/goal-driven-ai-testing/README.md)
  (campaigns become the ai-goal part kind),
  [`scenario-authoring/scenario-composition`](../features/chatwright/scenario-authoring/scenario-composition/README.md)
  (fragments as deterministic parts),
  [`state-branching`](../features/chatwright/state-branching/README.md)
  (checkpoints at part boundaries),
  [`observability`](../features/chatwright/observability/README.md) (part
  boundaries in evidence).

## Open Questions

- Does a part boundary imply a settled/drained runtime, and is that always
  provable?
- How do part-scoped actor rosters work when a later part introduces a new
  actor mid-run?
- Should deterministic parts be able to consume artefacts produced by an
  earlier AI part (e.g. cleanup of whatever the AI created), and through which
  contract?

---
*This document follows the https://specscore.md/idea-specification*
