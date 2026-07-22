---
format: https://specscore.md/feature-specification
status: Draft
---

# Feature: AI agent harnesses

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/agent-harnesses?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/agent-harnesses?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/agent-harnesses?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/agent-harnesses?op=request-change) |
**Status:** Draft
**Source Ideas:** ai-agent-cli-harnesses

## Summary

Test the tool boundary of AI agents through controlled, programmable MCP
servers with a full protocol trace. The wider family — driving agent CLIs as
conversational systems through batch process and interactive terminal adapters
— is deliberately parked at the idea stage until the messaging wedge has
external users.

## Contents

| Child | Purpose |
|---|---|
| [mcp-tool-harness](mcp-tool-harness/README.md) | Host programmable MCP tools/resources and record or inject their behavior deterministically |

## Problem

Agentic products call MCP tools whose outcomes are nondeterministic and whose
misuse is invisible to text assertions. Tests need a controlled tool boundary
that can advertise capabilities, inject success/error/timeout/adversarial
results and record every request and response — without granting a test
uncontrolled access to real tools or a developer machine.

## Behavior

### Scope of this feature today

Only the MCP tool harness is specified as a feature. It serves two consumers:
bots and conversational engines that consume MCP tools (tool calls become
deterministic anchors in otherwise nondeterministic conversations), and —
later — agent CLIs under test.

### Parked scope

The process CLI adapter (argv/stdin with structured event capture) and the
interactive terminal adapter (real PTY for prompts, streaming, approvals) are
recorded in the source idea
([`ai-agent-cli-harnesses`](../../../ideas/ai-agent-cli-harnesses.md)); their
full draft specifications are preserved privately and re-enter through the
declared endpoint-profile seam (decision
[0008](../../../decisions/0008-declared-endpoint-profiles.md)) if promoted.
This feature does not claim them.

## Dependencies

- [Conversation runtime](../conversation-runtime/README.md)
- [Deterministic testing](../deterministic-testing/README.md)
- [Conversation observability](../observability/README.md)

## Acceptance Criteria

### AC: forbidden-side-effect-fails-safely

Scenario: A system under test attempts a tool operation forbidden by policy
Given the MCP catalog enforces that policy
When the attempt occurs
Then the side effect does not happen
And the trace records the attempted operation and enforcement result

### AC: parked-scope-remains-honest

Scenario: A reader evaluates agent-CLI testing support
Given only the MCP tool harness is specified
When they read this feature and its index entries
Then batch and terminal agent adapters are presented as a parked idea
And no roadmap or coverage claim implies they are in progress

## Open Questions

- When the messaging wedge has external users, do the parked adapters return as
  children here or as a separate endpoint-profile family?
- Which MCP capability-negotiation behaviours must the harness emulate
  faithfully versus declare unsupported?

---
*This document follows the https://specscore.md/feature-specification*
