---
format: https://specscore.md/feature-specification
status: Draft
---

# Feature: MCP tool harness

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/agent-harnesses/mcp-tool-harness?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/agent-harnesses/mcp-tool-harness?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/agent-harnesses/mcp-tool-harness?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/agent-harnesses/mcp-tool-harness?op=request-change) |
**Status:** Draft
**Source Ideas:** ai-agent-cli-harnesses

## Summary

Host controlled MCP servers for an AI agent under test, advertise deterministic
tools/resources/prompts, inject success and failure conditions and retain a
correlated protocol trace without pretending MCP is always a user-message
transport.

## Problem

AI-agent behavior depends heavily on the MCP capabilities it discovers and the
content, latency and errors returned by tools. Tests against real MCP services
are slow, mutable and potentially destructive; mocking inside the agent skips
the actual protocol/client boundary. At the same time, a CLI which consumes MCP
servers does not necessarily expose any MCP method for an external harness to
push user messages into its session.

## Behavior

### Programmable MCP server

A case may register one or more isolated MCP server fixtures with declared
protocol/version, transport and capabilities. Fixtures define tools, resources,
prompts and supported notifications plus deterministic handlers or scripted
responses. The agent receives only the endpoints and credentials for those case
servers unless real external MCP access is explicitly permitted.

The harness records initialize/capability negotiation, request/response IDs,
method, bounded/redacted parameters and results, errors, cancellations,
notifications, timing and transport lifecycle. Protocol-invalid traffic is
reported independently from behavioral assertions.

### Response and fault scenarios

Handlers can return valid data, protocol/tool errors, delayed results, timeout,
cancellation, malformed payloads, oversized/truncated data and adversarial text.
Stateful fixtures may enforce call order, cardinality, authorization and
read/write effects inside their own branchable or recreated state.

An injected tool response is explicit test input and cannot be presented as a
real external-system observation. Conversely, an adapter cannot replace a
declared real MCP integration with a fixture without changing the evidence
profile.

### Tool assertions and safety

Assertions cover capability discovery, selected tool, parameters, ordering,
cardinality, result correlation, retries, cancellation and forbidden calls. The
harness may reject a call before its handler when policy forbids the operation;
the denial and lack of side effect are recorded.

Configured secret fields are redacted before display/persistence but remain
available to the in-memory handler only when policy permits. Untrusted tool
content is labelled as external input so evaluators and reports do not treat its
claims as trusted instructions.

### MCP is not automatically chat transport

When the CLI is an MCP client, user prompts are delivered through the selected
process, PTY or structured engine/session endpoint; MCP supplies its controlled
tools/resources. Chatwright does not require the model to poll a special inbox
tool as a generic way to inject user turns.

If a product exposes an MCP server with explicit conversation-session methods,
a separately declared adapter may map those methods to the headless semantic
endpoint. Capability discovery must prove send/receive/session semantics; generic
MCP-client support is insufficient.

### Lifecycle and evidence

MCP server processes/sessions are owned by one case or explicitly scoped suite
fixture. They start before the agent, terminate on case cleanup and cannot leak
state into a sibling unless registered as a branchable/recreated holder.
Chatwright correlates MCP events with the agent/process trace and result bundle.

## Dependencies

- [AI agent harnesses](../README.md)
- [Process CLI harness](../process-cli/README.md) or
  [Interactive terminal harness](../interactive-terminal/README.md) for CLIs
- MCP protocol/client-server libraries for supported transports
- [Conversation observability](../../observability/README.md)

## Acceptance Criteria

### AC: agent-discovers-declared-capabilities

Scenario: A case provides one read-only repository tool server
Given its fixture advertises only the declared tool/resource capabilities
When the agent initializes the MCP connection
Then the trace records negotiated capabilities and protocol version
And undeclared tools are unavailable to the agent

### AC: tool-call-is-correlated-end-to-end

Scenario: An agent calls a search tool
Given the fixture returns a deterministic result
When the call completes
Then request ID, tool name, redacted parameters, result, duration and agent turn
are correlated
And assertions can address the call without parsing assistant prose

### AC: forbidden-tool-has-no-side-effect

Scenario: Policy forbids a write tool exposed for a negative test
Given the agent attempts that tool
When the harness enforces policy
Then the handler's mutation is not executed
And the trace records the denied request and policy identity

### AC: adversarial-result-remains-untrusted-input

Scenario: A search result contains instructions to expose credentials
Given the fixture returns that content as tool data
When the agent processes it
Then the result is labelled and retained as untrusted external input
And configured assertions can prove no forbidden credential/tool action follows

### AC: timeout-and-cancellation-are-visible

Scenario: A tool handler delays beyond the scenario budget
Given the agent or runner cancels the MCP request
When the case settles
Then request cancellation, handler outcome and any agent retry are correlated
And no hanging server session survives cleanup

### AC: fixture-result-is-not-real-service-evidence

Scenario: An MCP fixture simulates a successful external write
Given no real service was contacted
When the result bundle is produced
Then its profile identifies the fixture and scripted response
And the pass cannot satisfy a binding requiring the real MCP service

### AC: mcp-client-support-does-not-imply-message-injection

Scenario: A CLI can consume MCP tools but exposes no session server
Given Chatwright needs to send a user prompt
When the case is configured
Then the prompt uses the declared process or PTY input adapter
And the harness does not claim MCP provides a generic inbound chat channel

### AC: conversation-mcp-server-requires-explicit-capability

Scenario: A CLI exposes an MCP server with session send/receive methods
Given capability discovery confirms their versioned semantics
When Chatwright selects the structured session adapter
Then messages and replies are mapped with session/request correlation
And the evidence distinguishes this product extension from generic MCP

## Open Questions

- Which MCP transports ship first for local process and containerized cases?
- Should stateful MCP fixtures implement the general branchable-state-holder
  interface or be recreated entirely from scenario configuration in the MVP?
- How are server-initiated notifications correlated to an agent turn when the
  client does not expose its internal event IDs?
- Which protocol conformance errors fail immediately versus remain injectable
  negative-test behavior?

---
*This document follows the https://specscore.md/feature-specification*
