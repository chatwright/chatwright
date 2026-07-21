---
format: https://specscore.md/feature-specification
status: Draft
---

# Feature: Agent implementation loop

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/agent-implementation-loop?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/agent-implementation-loop?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/agent-implementation-loop?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/agent-implementation-loop?op=request-change) |
**Status:** Draft
**Source Ideas:** chatwright

## Summary

Export a selected scenario or hierarchy as a bounded implementation task for a
coding agent, attach executable acceptance evidence, and bring the resulting run
status back to the scenario tree.

## Problem

Prose implementation prompts omit edge cases and quickly drift from tests.
Handing an entire product hierarchy to an agent creates excessive scope, while a
raw failing test lacks product intent, actors, constraints and repository rules.

## Behavior

### Selectable scope

A user can export one scenario, a subtree, all MVP scenarios or the failing
subset for a target platform. The export includes product context, actors,
initial state, goals, milestones, constraints, timing, acceptance criteria,
executable scenario references and repository instructions.

### Implementation contract

The task requires the selected Chatwright scenarios and existing relevant tests
to pass. It constrains observable behaviour, not internal architecture, unless a
scenario or decision explicitly requires an integration boundary.

### Evidence loop

An agent can inspect the target repository, implement, run Chatwright, read
failure evidence and iterate. The returned result records commit/revision,
scenario version, execution mode and pass/fail/flaky/unsupported status; it does
not mark a scenario implemented from an unaudited prose claim.

## Dependencies

- [scenario-authoring](../scenario-authoring/README.md)
- [deterministic-testing](../deterministic-testing/README.md)
- [developer-tooling](../developer-tooling/README.md)

## Acceptance Criteria

### AC: export-is-bounded

Scenario: A user exports one failing subtree
Given a hierarchy containing unrelated passing and draft scenarios
When the user selects the cancellation failures
Then the task includes only required shared context and that subtree's scenarios
And does not instruct the agent to implement unrelated draft work

### AC: status-requires-evidence

Scenario: An agent reports completion
Given an implementation commit and a Chatwright run
When status is imported
Then each updated scenario references the exact scenario revision and run result
And an unexecuted scenario cannot become passing

### AC:prompt-preserves-repository-rules

Scenario: A target repository has agent instructions
Given a selected implementation task
When Chatwright creates the export
Then repository instructions and relevant architecture decisions are included or
referenced ahead of implementation suggestions

## Open Questions

- Which coding-agent task formats and hand-off protocols deserve first-class
  support rather than plain Markdown export?
- How should stale evidence be invalidated when the scenario or target code moves?

---
*This document follows the https://specscore.md/feature-specification*
