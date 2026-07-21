---
format: https://specscore.md/feature-specification
status: Draft
---

# Feature: Scenario authoring

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/scenario-authoring?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/scenario-authoring?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/scenario-authoring?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/scenario-authoring?op=request-change) |
**Status:** Draft
**Source Ideas:** chatwright

## Summary

Several authoring surfaces—Go first, structured documents and Starlark later—over
one hierarchical scenario model and execution semantics.

## Problem

Developers need an expressive native API, non-Go teams need portable scenarios,
and visual design needs structured data. Declaring one syntax as canonical too
early either freezes runtime experiments or promises impossible lossless
round-tripping between arbitrary code and a form editor.

## Behavior

### Go-first API

The Go API remains the first executable interface and may use fluent operations
such as sending text, expecting a bot message and choosing a semantic action.
Published examples are illustrative until the corresponding feature is approved;
the specification does not freeze exact constructors.

### Hierarchy and inheritance

Workspaces organise suites, features, scenarios, branches and steps. A subtree
may inherit platforms, bots, actors, setup, fixtures, environment variables,
personas, constraints, tags, timeout and metric budgets. The UI always shows the
effective value and its source; local overrides do not silently mutate ancestors.

### Portable structured model

A versioned structured representation supports visual editing, recording and
agent export. Starlark is planned for Phase 2 as a sandboxed, Python-like authoring
format. Chatwright does not promise arbitrary Go/Starlark-to-visual round-tripping.

### Status and coverage

Nodes may be draft, specified, implemented, passing, failing, flaky, skipped,
unsupported on a platform or awaiting investigation. Parent coverage aggregates
executed descendants and distinguishes not-run from unsupported.

## Dependencies

- [conversation-runtime](../conversation-runtime/README.md)
- [deterministic-testing](../deterministic-testing/README.md)
- SpecScore hierarchy/scoring research in [`spec/research`](../../../research/README.md)

## Acceptance Criteria

### AC: inheritance-is-explainable

Scenario: A child scenario overrides a timeout
Given a suite supplies Telegram, Alice and a five-second timeout
When a child scenario overrides only the timeout to one second
Then the editor shows the effective platform, actor and timeout
And identifies which ancestor or node supplied each value

### AC: structured-scenario-is-versioned

Scenario: A scenario document is loaded after a schema change
Given a document written by a supported earlier schema version
When Chatwright opens it
Then it is migrated or rejected with an actionable version error
And its original content is not silently discarded

### AC:coverage-does-not-hide-unsupported

Scenario: One branch cannot run on WhatsApp
Given a suite with passing Telegram results and an unsupported WhatsApp branch
When coverage is aggregated
Then unsupported is reported separately from passing, failing and not-run

## Open Questions

- Are suite/feature/scenario/branch/step the correct levels, and how should they
  map to SpecScore artefacts?
- Which Go Starlark implementation offers appropriate sandboxing, cancellation
  and debugging?
- Is the structured document source-of-truth for visual scenarios only, or for
  all portable scenarios?

---
*This document follows the https://specscore.md/feature-specification*
