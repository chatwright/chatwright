---
format: https://specscore.md/decision-specification
status: Approved
---

# Decision: Deterministic and AI testing share one runtime; Go precedes Starlark

**Status:** Approved
**Date:** 2026-07-21
**Owner:** alex
**Tags:** deterministic, ai, actors, starlark
**Source Idea:** chatwright
**Supersedes:** —
**Superseded By:** —

## Context

Critical invariants and conversational usability need different test styles.
Building separate runtimes would fragment state, evidence and scenario ownership.
Choosing a portable language before semantics settle would also turn early API
experiments into compatibility promises.

## Decision

Deterministic scripted tests, human-controlled testing, replay and AI goal tests
are first-class directions over one environment, actor interface, transcript and
metric model. They differ in how the next action is chosen and how success is
evaluated, not in how messages reach the bot.

Go is the Phase 1 authoring and implementation language. A versioned structured
scenario format and Starlark are planned for Phase 2 after runtime semantics are
proven. The preferred vocabulary includes `Scripted(Persona("Alice"))` and
`AIActor(Persona("Alice"))`, but illustrative syntax does not freeze final APIs.

Initial milestones are deterministic: after N messages, keyword/regex or message
type. Initial metrics are latency, token usage, message size and message count at
message, actor/user, bot, chat and total-run scopes. `Within(duration)` is the
preferred timing shortcut over the same observed latency data.

## Rationale

One runtime makes exploratory findings reproducible and lets deterministic facts
constrain AI judgement. Go enables rapid integration with the current seed while
the later formats can target stable concepts.

## Declined Alternatives

### AI testing replaces deterministic assertions

Rejected because exactly-once effects, permissions and hard timing budgets need
repeatable, non-probabilistic evidence.

### Starlark in Phase 1

Rejected because it would force language/runtime decisions before the Go API and
state model have earned stability.

## Consequences at Decision Time

- AI evaluation must link to shared run evidence and identify uncertainty.
- Actor/persona/identity boundaries require explicit investigation.
- Database-operation metrics remain out of initial scope.

## Observed Consequences

The repository has a Go-first scripted API and latency-aware assertions. It does
not yet implement human/AI actor abstractions, Starlark, structured scenarios,
token metrics or milestone infrastructure.

## Affected Features

- [`deterministic-testing`](../features/chatwright/deterministic-testing/README.md)
- [`ai-driven-testing`](../features/chatwright/ai-driven-testing/README.md)
- [`manual-emulator`](../features/chatwright/manual-emulator/README.md)
- [`scenario-authoring`](../features/chatwright/scenario-authoring/README.md)

## Open Questions

- What minimum structured intermediate representation can serve recording,
  visual editing and agent export without constraining native Go tests?

---
*This document follows the https://specscore.md/decision-specification*
