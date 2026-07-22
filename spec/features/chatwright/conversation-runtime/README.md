---
format: https://specscore.md/feature-specification
status: Implementing
---

# Feature: Conversation runtime

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/conversation-runtime?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/conversation-runtime?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/conversation-runtime?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/conversation-runtime?op=request-change) |
**Status:** Implementing
**Source Ideas:** chatwright

## Summary

The stateful, isolated environment that owns actors, conversations, optional
platform identities, endpoint sessions, messages/events, dependencies, event
queues, simulated time and a complete run lifecycle.

## Problem

A conversation is more than ordered strings. Bot behaviour depends on identities,
message IDs, edits, callbacks, retries, shared application state and asynchronous
work. If each test re-creates those pieces ad hoc, multi-user and multi-system
flows are unreliable and impossible to inspect consistently.

## Contents

| Child | Purpose |
|---|---|
| [headless-engine-harness](headless-engine-harness/README.md) | Exercise a real conversational engine directly through semantic events without inventing or claiming messenger-platform behavior |

## Behavior

### Environment ownership

One environment owns every resource created for a run: selected conversational
endpoints, optional platforms, bots/engines/agents, users, identities,
conversations/chats, endpoint state, shared dependencies, queues, event buses,
transcript entries and metrics. Teardown must close endpoints, processes,
servers and waiters even after a failed assertion.

### Endpoint and profile separation

A run declares how semantic actor events reach the system under test. A
platform-emulated profile uses a Platform Emulator and real bot webhook/API
boundary. A headless profile uses a declared conversational-engine endpoint.
Future profiles (for example process or terminal endpoints, currently parked at
the idea stage) would enter through this same seam per decision
[0008](../../../decisions/0008-declared-endpoint-profiles.md).

The runtime owns lifecycle and semantic evidence across profiles; each endpoint
owns its transport mechanics and declares capabilities. Evidence cannot silently
substitute one profile for another.

### Identity and actor separation

An actor chooses actions. A persona supplies behavioural context. A platform
identity represents an account. A user is a domain participant who may have
several identities. A bot is also a possible actor. The final API remains open,
but the runtime must not collapse these concepts into one struct.

### Stateful chats and messages

Chat identity is at least platform + bot account + platform chat identity. A
message keeps stable identity and versions across edits, and may carry replies,
threads, actions, media, delivery state and platform-specific metadata. Platform
Emulators own unsupported semantics.

### Scheduling and lifecycle

Runs distinguish simulated time, wall-clock safety timeouts and observed
latency. `RunUntilIdle`-style draining processes registered queues, timers and
webhook-triggered work deterministically; arbitrary goroutines cannot be assumed
observable without an explicit integration seam.

## Dependencies

- [platform-emulators](../platform-emulators/README.md)
- [observability](../observability/README.md)

## Acceptance Criteria

### AC: isolates-complete-run-state

Scenario: Two runs use the same logical identities
Given two environments with a user named Alice and a bot named Greeter
When both execute concurrently
Then their chats, message IDs, clocks, metrics and pending work do not intersect

### AC: stable-message-identity

Scenario: A bot edits an existing message
Given a captured bot message with an assigned platform message ID
When the bot performs a supported edit
Then the environment retains the same message identity with a new version
And the transcript records the edit rather than a second sent message

### AC: distinguish-three-times

Scenario: Virtual time advances during a run
Given delayed work and a one-second assertion deadline
When the environment advances simulated time
Then simulated scheduling, wall-clock timeout and observed latency remain
separately reportable

## Open Questions

- Which async sources must register with the environment before deterministic
  draining can promise that the run is idle?
- Can one user safely hold several identities on the same platform and bot?
- Which message state is canonical versus platform-specific extension data?
- Which semantic event types belong in the runtime core versus endpoint-specific
  extensions?

---
*This document follows the https://specscore.md/feature-specification*
