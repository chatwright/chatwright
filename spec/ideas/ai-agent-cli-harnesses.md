---
format: https://specscore.md/idea-specification
status: Specifying
---

# Idea: Test AI-agent CLIs as conversational systems

**Status:** Specifying
**Date:** 2026-07-22
**Owner:** alex
**Promotes To:** chatwright/agent-harnesses, chatwright/agent-harnesses/mcp-tool-harness
**Supersedes:** —
**Related Ideas:** extends:chatwright, depends_on:headless-conversational-engine-testing

> **Parked scope (2026-07-22):** the process-CLI and interactive-terminal
> adapters are parked until the messaging wedge has external users; their full
> draft specifications are preserved privately (backstage
> `parked/agent-harnesses/`). Only the MCP tool harness proceeds as a draft
> feature. Any promotion re-enters through the declared endpoint-profile seam
> (decision 0008).

## Problem Statement

How might Chatwright test non-interactive and interactive AI-agent command-line
tools as multi-turn conversational systems, including their MCP tool behavior,
workspace effects and permission boundaries, without reducing them to brittle
terminal snapshots or granting tests uncontrolled access to a developer machine?

## Context

AI harnesses increasingly expose batch commands, structured event streams,
interactive terminals and MCP clients or servers. Their important behavior is
conversational: they ask clarifying questions, stream reasoning/results, request
approval, call tools, edit files, run commands and report completion. Ordinary
CLI tests can assert exit status and text but struggle to correlate those events
or branch the same task across models, permission policies and tool outcomes.

Chatwright already supplies scenario composition, scripted/AI actors, evidence,
branching and semantic assertions. Extending its endpoint model to processes and
terminals would make the AI harness itself the system under test. This differs
from the existing agent implementation loop, where Chatwright hands a task to an
agent in order to implement another product.

MCP is valuable but must be represented accurately. A CLI acting only as an MCP
client does not thereby expose a generic channel for injecting user prompts.
Chatwright can host programmable MCP servers and record the CLI's tool/resource
traffic while driving user input through batch stdin or a PTY. MCP becomes the
conversation transport only when the product explicitly exposes a session API
with send/receive operations.

## Recommended Direction

Create an AI Agent Harness feature family over the shared Conversation Runtime:

- **Process CLI adapter:** non-interactive argv/stdin/file input with
  stdout/stderr and structured JSON/JSONL event capture.
- **Interactive terminal adapter:** a real PTY for prompts, streaming,
  clarification, approvals, resizing and signals.
- **MCP tool harness:** controlled MCP servers which advertise capabilities,
  inject tool/resource outcomes and record every request and response.

All profiles produce one semantic agent trace containing user messages,
assistant output, tool calls/results, commands, file changes, permission
requests, usage, timing and terminal/process events where available. Raw terminal
or stream bytes remain accessible for fidelity, but assertions prefer structured
events and observable workspace state.

### Workspace and safety model

Each case receives an explicit disposable workspace, environment allowlist,
secret policy, process limits, command/network policy and cleanup result. The
harness never inherits arbitrary credentials or the caller's home directory by
default. Real external tools and networks are opt-in capabilities; controlled
MCP tools are the deterministic default for behavioral cases.

The first branch implementation recreates a workspace from a fixture, snapshot
or Git worktree and starts a fresh agent process. It does not snapshot a live PTY
or opaque model session. A conversational prefix may be replayed when required,
with replay provenance retained.

### Acceptance evidence

Assertions may cover:

- final response and exit/settlement state;
- required or forbidden tools and commands;
- tool parameters and ordering;
- approval before a sensitive operation;
- files changed, diff boundaries and tests executed;
- SpecScore acceptance criteria or Rehearse outcomes;
- database/application state through registered holders and DTQL;
- time, token and cost budgets;
- resistance to malicious tool output or prompt injection.

Chatwright owns the multi-turn protocol and rich evidence. Rehearse can invoke a
scenario and normalize its result as acceptance evidence; it need not implement
PTY, MCP or agent trace semantics.

## Alternatives Considered

- **Use Rehearse shell blocks alone.** Appropriate for simple exit/file checks,
  but insufficient for interactive turns, structured agent events, controlled
  tool responses and branchable multi-turn evidence.
- **Assert exact terminal snapshots.** Rejected as the primary oracle because
  ANSI sequences, progress rendering, timing and model wording are volatile.
- **Require every CLI to expose MCP as a server.** Rejected because many are MCP
  clients only and MCP does not define a universal user-chat session API.
- **Drive an MCP-client CLI by asking the model to poll a message tool.** Rejected
  as a generic transport because delivery then depends on model behavior and is
  neither prompt-neutral nor deterministic.
- **Instrument only internal agent libraries.** Fast, but misses packaging,
  configuration, approvals, terminal behavior and the actual tool boundary.
- **Grant the agent the developer's normal environment.** Rejected because a
  test could read secrets, alter unrelated files or create external side effects.
- **Snapshot live processes for branches.** Deferred because PTY, subprocess,
  network and hosted-model state cannot be cloned portably or safely.

## MVP Scope

- Non-interactive process adapter with argv/stdin and JSONL event decoder.
- Disposable workspace fixture plus file/diff/command evidence.
- Programmable local MCP tool server with request/response trace and injected
  success, error, timeout and adversarial results.
- One coding-agent scenario covering a bounded repository task, test execution,
  final response and allowed-file policy.
- One MCP safety scenario proving forbidden tools and malicious tool output do
  not create unauthorized side effects.
- Versioned result profile including CLI/version, model/configuration, sandbox
  policy and available MCP capabilities.
- PTY feature specified now but implemented after the structured batch slice is
  stable.

## Not Doing (and Why)

- Claiming all AI CLIs share one native event schema—adapters map supported
  product events into Chatwright's semantic trace.
- Capturing or asserting private chain-of-thought.
- Generic arbitrary-code sandbox implementation inside this feature—the harness
  consumes a declared sandbox/process boundary and records its policy.
- Automatic network or credential access.
- Exact reproduction of hosted model output.
- Live process/PTY snapshotting for branches.
- Treating MCP-client support as proof of inbound user-message injection.
- Replacing the existing agent implementation loop; that workflow may later use
  these harnesses to verify the implementer agent itself.

## Key Assumptions to Validate

| Tier | Assumption | How to validate |
|---|---|---|
| Must-be-true | A useful semantic agent trace can normalize batch, PTY and MCP observations without discarding their raw evidence. | Map one real CLI through structured and PTY profiles and enumerate unrepresentable events. |
| Must-be-true | Disposable workspaces and controlled MCP tools prevent unintended host/external changes. | Run adversarial scenarios and verify filesystem, environment, network and tool policy boundaries. |
| Must-be-true | MCP tool traffic can be deterministic even when model output varies. | Replay fixed tool catalogs/results across repeated runs and compare calls, state effects and evidence. |
| Should-be-true | Most valuable agent behavior can be asserted through tools, diffs, tests and final state rather than exact prose. | Encode several real agent regressions and measure dependence on semantic evaluators. |
| Should-be-true | Structured batch mode provides enough initial value before PTY support. | Test one agent CLI corpus through JSONL/non-interactive mode and catalogue scenarios blocked only by interaction. |
| Might-be-true | The same scenario can compare agent CLIs or model configurations fairly. | Run a bounded task across two adapters with identical workspace/tool/policy inputs and inspect comparability. |

## SpecScore Integration

- **Feature family:** [AI agent harnesses](../features/chatwright/agent-harnesses/README.md)
- **Batch adapter:** [Process CLI harness](../features/chatwright/agent-harnesses/process-cli/README.md)
- **Interactive adapter:** [Interactive terminal harness](../features/chatwright/agent-harnesses/interactive-terminal/README.md)
- **Tool boundary:** [MCP tool harness](../features/chatwright/agent-harnesses/mcp-tool-harness/README.md)
- **Different workflow:** [Agent implementation loop](../features/chatwright/agent-implementation-loop/README.md)
- **Acceptance evidence:** [Rehearse adapter](../features/chatwright/developer-tooling/rehearse-adapter/README.md)

## Open Questions

- Which structured event fields are stable across agent CLIs without standardizing
  private reasoning or provider-specific internals?
- Which sandbox provider should be the first reference implementation for process
  and network isolation?
- How are interactive prompt/approval states declared so adapters do not rely on
  English terminal substrings?
- Should a CLI exposing a genuine MCP session server use a separate structured
  endpoint adapter or a mode of the MCP tool harness?
- Which filesystem snapshot strategy works across Git and non-Git workspaces
  before general file state holders exist?

---
*This document follows the https://specscore.md/idea-specification*
