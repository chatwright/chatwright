---
format: https://specscore.md/plan-specification
status: Executing
---

# Plan: Goal-driven MVP — slice 2 (loop, provider replay, bindings, report)

**Status:** Executing
**Source:** idea:goal-driven-ai-bot-testing
**Features:** chatwright/goal-driven-ai-testing, chatwright/goal-driven-ai-testing/autonomous-exploration, chatwright/goal-driven-ai-testing/dtql-state-verification, chatwright/goal-driven-ai-testing/campaign-reporting, chatwright/ai-driven-testing
**Date:** 2026-07-22
**Owner:** alex
**Supersedes:** —

## Summary

Turn slice 1's foundations (goal contract, observation slice) into a runnable
campaign: the observe–plan–act–validate loop over a provider seam with
record/replay, DTQL run-scoped bindings, and the evidence-backed campaign
report. Exit: the first reproducible Listus campaign. Slice 1 merged 2026-07-22 (goal 864e82c, observe 280e20c); lanes C and D
execute combined in one implementation lane.

## Design decisions (binding for the lanes)

### Provider seam

One narrow interface in a new `actor/` package:

- `Provider.Propose(ctx, Prompt) (Proposal, Usage, error)` — `Prompt` carries
  the goal/task context, the current `observe.Observation` (semantic surface
  only — never raw platform payloads) and bounded recent history; `Proposal`
  is a typed action (send text | click action id | declare task done | give
  up) with a free-text rationale; `Usage` carries model id, token counts and
  latency.
- Providers are dumb transports; ALL safety lives in the loop: budgets and
  stop reasons come from `goal.CampaignState`, proposal validation from the
  observation slice's stale-action check, and Chatwright remains authoritative
  (an invalid proposal is recorded and re-prompted, never silently mutated).

### Record/replay (the determinism mechanism)

- Every `Propose` call is recorded to a cassette: key =
  hash(provider config + prompt content), value = proposal + usage. Modes:
  `record` (live provider, write), `replay` (cassette only — CI default,
  cache miss = test failure with the missing key's prompt summary), `live`
  (no recording; exploratory only).
- Cassettes are JSON under `testdata/cassettes/`, human-readable and
  reviewable in PRs; secrets are never written (provider auth lives outside
  the prompt).
- Rationale: provider seeds are unreliable across vendors; replay is what
  makes "evidence-backed" claims re-examinable and campaigns runnable in CI
  at zero token cost.

### Loop shape

`observe → plan (Provider.Propose) → validate (stale-action + contract
guards) → act (scenario API) → record outcome → repeat`, with deterministic
stop via `goal.Budgets` (steps, wall duration via injected clock, repeated
failures) and non-progress detection (N consecutive invalid or no-effect
proposals). Every iteration appends a structured loop event (observation seq,
proposal, validation verdict, action result, usage) — the raw material of the
report.

### Report

`campaign.Report` (JSON-serialisable, versioned): per-task outcomes with the
contract's statuses, findings classified as verified-defect (backed by
deterministic or DTQL evidence) | ai-navigation-failure | coverage-gap, every
finding linking observation sequences and loop events, plus aggregate usage.
This schema is the seed of the machine-readable run bundle — design it as an
exported contract, not an internal struct.

## Lanes (dispatch after slice 1 merges)

| Lane | Owns | Depends on |
|---|---|---|
| C — actor loop + provider seam + record/replay (`actor/`) | `actor/` package; a scripted fake Provider for tests | slice 1 `goal/` + `observe/` |
| D — campaign report (`campaign/`) | `campaign/` package (report schema + assembly from loop events) | Lane C's loop-event type (freeze it first) |
| E — DTQL run-scoped bindings | per the Listus plan's task 2A, in its lanes (`sneat-bots`/DTQL repos — not this repo) | Listus plan; not blocked by C/D |

Frozen contract tests (Lane C): `TestLoopStopsOnEachBudget`,
`TestInvalidProposalIsRecordedAndReprompted`,
`TestReplayModeFailsOnCacheMiss`, `TestCassetteRoundTripIsDeterministic`,
`TestNonProgressDetectionStops`. (Lane D): `TestReportClassifiesFindings`,
`TestReportLinksEvidenceBySequence`, `TestReportSchemaIsVersioned`.

## Out of scope

AI judges/evaluation of UX quality (deterministic + DTQL evidence only in this
slice); persona traits beyond a system-prompt string; parallel actors;
Sneat Bot campaign (follows Listus).

## Status note (2026-07-22)

Lanes C and D are complete (`f2fe064`): the scripted-provider gate test runs a
campaign against greetbot through the real Telegram emulator to a completed
report, in replay-capable form at zero token cost. Remaining before this plan
closes: the recorded live Listus campaign replay (needs the real provider and
the Listus-side lanes tracked in the Listus reference plan).

## Gate

A scripted-provider campaign runs end to end against the greetbot fixture in
CI (replay mode, zero tokens); a recorded live Listus campaign replays
identically; `specscore spec lint` 0 violations.

---
*This document follows the https://specscore.md/plan-specification*
