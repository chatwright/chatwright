---
format: https://specscore.md/feature-specification
status: Draft
---

# Feature: Agent implementation loop

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/agent-implementation-loop?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/agent-implementation-loop?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/agent-implementation-loop?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/agent-implementation-loop?op=request-change) |
**Status:** Draft
**Source Ideas:** chatwright

## Summary

Turn conversation design into a reviewable, evidence-driven implementation
loop: generate scenarios, export a bounded task to a coding agent, run Chatwright,
analyse failures, propose improvements and bring verified status back to the
scenario tree.

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

### First-class workflow

The long-term workflow is:

```text
design conversation → generate/review scenarios → generate implementation prompt
→ coding agent implements → run Chatwright → analyse failures
→ generate/review improvements → repeat
```

Humans approve scenario requirements and repository changes. Cloud Intelligence
may orchestrate generation and review, but the implementation contract and
accepted scenarios remain portable and executable locally.

### Implementation review

Chatwright can compare the proposed implementation and resulting evidence with
the selected scenario scope, identify untested claims or regressions, and create
a follow-up prompt. Review findings link to diffs and run evidence rather than
asserting quality from a prose summary alone.

### Implementer versus system under test

This feature uses a coding agent as an implementer of another product. When the
agent itself is the behavior being tested—its tool choices, permissions,
commands, diffs or terminal interaction—the scenario belongs to
[AI agent harnesses](../agent-harnesses/README.md). A workflow may use both, but
product acceptance evidence and agent-quality evidence retain separate
identities and cannot substitute for one another.

## Dependencies

- [scenario-authoring](../scenario-authoring/README.md)
- [deterministic-testing](../deterministic-testing/README.md)
- [developer-tooling](../developer-tooling/README.md)
- [cloud/intelligence](../cloud/intelligence/README.md), for optional managed orchestration

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

### AC:loop-keeps-human-approval-boundaries

Scenario: Failure analysis proposes a new requirement and code change
Given a completed agent run with evidence-linked findings
When Chatwright prepares the next iteration
Then proposed scenario changes and implementation changes are separately visible
And neither is accepted solely because an AI generated it

## Open Questions

- Which coding-agent task formats and hand-off protocols deserve first-class
  support rather than plain Markdown export?
- How should stale evidence be invalidated when the scenario or target code moves?

---
*This document follows the https://specscore.md/feature-specification*
