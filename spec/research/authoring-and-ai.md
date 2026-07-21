# Research: Emulator, authoring and AI workflows

**Date:** 2026-07-21
**Owner:** alex
**Status:** Proposed
**Consumed by:** [`manual-emulator`](../features/chatwright/manual-emulator/README.md), [`scenario-authoring`](../features/chatwright/scenario-authoring/README.md), [`ai-driven-testing`](../features/chatwright/ai-driven-testing/README.md), [`agent-implementation-loop`](../features/chatwright/agent-implementation-loop/README.md)

## Purpose

Test the long-term product workflow—design, run, inspect, record, evaluate and
export—without freezing a visual or scripting format before runtime semantics are
stable.

## Investigation backlog

| ID | Question | Required evidence and output |
|---|---|---|
| I-20 | What architecture lets a browser-based local emulator control human actors while the runtime remains authoritative? | Local transport/security spike and multi-panel interaction prototype. |
| I-21 | Which recorded events are source data versus candidate assertions, and how does a user select the latter? | Recorded-session schema and a usability walkthrough producing a maintainable scenario. |
| I-22 | Which Go Starlark implementation satisfies sandboxing, cancellation, modules, debugging and licence needs? | Options matrix and executable spike for a representative multi-turn scenario. |
| I-23 | What structured visual scenario format supports versioning, branches, reusable actors and export without claiming arbitrary code round-tripping? | Schema draft, migration story and visual-editor round-trip for supported constructs. |
| I-24 | What provider abstraction covers AI actions, tool choices, context, cancellation, token usage and reproducibility metadata? | Two-provider spike or documented compatibility matrix with explicit gaps. |
| I-25 | How reliable are AI goal/UX evaluations, and how are disagreements, confidence and transcript evidence represented? | Blind evaluation set, inter-evaluator agreement results and escalation policy. |
| I-26 | What minimum bundle lets coding agents implement or fix a selected scenario without overreaching? | Export examples for one scenario, subtree and failing set; evaluate agent scope adherence. |
| I-27 | What hierarchy and inheritance semantics work for suites, features, scenarios, branches and steps? | Tree model with override provenance, coverage aggregation and at least three real product examples. |
| I-28 | How do scenario status, execution evidence and coverage relate to SpecScore features, scores and lifecycle? | Mapping proposal tested against this repository; avoid treating a passing test as complete product approval. |

## Prototype hypothesis

The connected PrimeNG prototype under [`prototype/`](../../prototype/README.md)
tests one navigation hypothesis: hierarchy → live emulator → scenario definition
→ run evidence should preserve context and use the same actors/run IDs. It is a
mock, not evidence that the data model is settled.

## Open Questions

The backlog above is intentionally unresolved.
