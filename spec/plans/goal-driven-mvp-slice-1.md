---
format: https://specscore.md/plan-specification
status: Executing
---

# Plan: Goal-driven MVP — slice 1 (contract + observation)

**Status:** Executing
**Source:** idea:goal-driven-ai-bot-testing
**Features:** chatwright/goal-driven-ai-testing, chatwright/goal-driven-ai-testing/goal-and-task-contract, chatwright/observation-model, chatwright/observation-model/visible-conversation, chatwright/observation-model/actor-actions, chatwright/observation-model/observation-lineage
**Date:** 2026-07-22
**Owner:** alex
**Supersedes:** —

## Summary

Build the two foundations of MVP Priority #1 in parallel, quality-gated by
frozen contract tests: the goal/task contract (package `goal`) and the minimum
Observation Model slice folded over the emulator's append-only journal
(package `observe`, plus a structured journal read seam on
`platform.Emulator`). The AI actor loop, provider seam with record/replay,
DTQL bindings and campaign reporting follow in slice 2 and are out of scope
here.

## Lanes and exclusive path ownership

| Lane | Owns exclusively | Must not touch |
|---|---|---|
| A — goal contract | `goal/` (new package) | `observe/`, `platform/`, emulators |
| B — observation slice | `observe/` (new package), additive structured-read change in `platform/platform.go`, its implementation in `telegram/emulator.go` (+ WhatsApp where trivial) | `goal/`, existing assertion/test API semantics |

Both lanes: root repo conventions per [AGENTS.md](../../AGENTS.md); `gofmt`
clean, `go vet ./...`, `go test -race ./...` green at every commit; the 15+
existing frozen contract tests stay untouched and passing.

## Task 1 (Lane A): goal/task contract

Implement per
[goal-and-task-contract](../features/chatwright/goal-driven-ai-testing/goal-and-task-contract/README.md):

- `Goal` (id, title, description, ordered/independent `Task`s, constraints,
  `Budgets`), `Task` (id, title, `DependsOn`, prose success criteria,
  milestone names), `Budgets` (max steps, max wall duration, max repeated
  failures, optional max cost).
- Campaign runtime state: task statuses (pending → active → completed |
  failed | blocked | skipped), deterministic `StopReason`
  (goal-complete, budget-steps, budget-duration, repeated-failure,
  cancelled, error) and a `CampaignState` that tracks progress, applies
  budgets and refuses transitions that skip validation.
- Validation on construction: unique ids, dependency references resolve,
  dependency cycles rejected, budgets must be positive where set.
- No AI, no emulator, no I/O in this package — pure contract + state machine.

**Frozen contract tests (identities fixed, content owned by the lane):**
`TestGoalValidationRejectsDependencyCycle`,
`TestGoalValidationRejectsUnknownDependency`,
`TestTaskStatusTransitionsAreGuarded`,
`TestBudgetsProduceDeterministicStopReasons`,
`TestRepeatedFailureBudgetStopsCampaign`.

## Task 2 (Lane B): observation slice over the journal

Implement the minimum slice of the
[Observation Model](../features/chatwright/observation-model/README.md) —
visible messages + generic actions + explicit changes; context/journey memory
is out of scope (deferred per the model's own staging):

- Add a structured read seam to `platform.Emulator` (additive, pre-1.0):
  chronological journal entries per chat (direction, logical message id,
  version, text, actions, timestamps, uncaptured-call markers) — the existing
  human-readable `Transcript(chatID)` remains and should render from the same
  data.
- `observe.Observation`: monotonic observation sequence, chat reference,
  `VisibleMessage` list (stable logical ids + versions, edited flag),
  `AvailableAction` list (label + stable action id + the observation sequence
  they were seen at), and `Changes` since a previous observation (new message,
  edited message, actions changed) computed by the engine — actors never diff
  snapshots ([observation-lineage](../features/chatwright/observation-model/observation-lineage/README.md)).
- Stale-action validation helper: an action proposal carries the observation
  sequence it was chosen from; validating against the current journal detects
  staleness deterministically
  ([actor-actions](../features/chatwright/observation-model/actor-actions/README.md)).
- Raw platform payloads (callback data, wire fields) are not exposed on the
  observation surface — developers get them from the trace, actors do not.

**Frozen contract tests:**
`TestObservationChangesAreExplicit`,
`TestObservationMessageIdentityStableAcrossEdits`,
`TestStaleActionProposalIsDetected`,
`TestObservationHidesRawPlatformPayloads`,
`TestTranscriptAndJournalAgree`.

## Out of scope (slice 2+, do not start)

Observe–plan–act–validate loop; AI provider seam and record/replay; DTQL
run-scoped bindings; campaign report; Listus campaign wiring in `sneat-bots`.

## Gate

Both lanes merged to `main` with all frozen tests passing under `-race`;
`specscore spec lint` 0 violations; CHANGELOG Unreleased updated; no changes
to the public scenario API's existing behaviour.

---
*This document follows the https://specscore.md/plan-specification*
