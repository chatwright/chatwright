---
format: https://specscore.md/feature-specification
status: Draft
---

# Feature: Chatwright Playground

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/playground?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/playground?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/playground?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/playground?op=request-change) |
**Status:** Draft
**Source Ideas:** chatwright

## Summary

An offline interface in which developers control human actors, keep several
conversations open, inspect live evidence and record useful interactions while a
Platform Emulator connects those actions to real local bots.

## Problem

Manual bot testing usually requires a real account, internet access, a deployed
or publicly tunnelled webhook and repeated identity switching. It is difficult
to compare concurrent chats, reproduce a session or turn what was learned into a
test or implementation specification.

## Behavior

### Consumer, not emulator

The Playground is a user interface and workflow consumer of Platform Emulators:

```text
Chatwright Playground
        ↓
Telegram Platform Emulator
        ↓
Real bot under development
```

The Playground provides manual testing, multiple chat windows, actor switching,
transcript and metric inspection, breakpoint controls and scenario recording.
The selected Platform Emulator provides the simulated messaging platform. The
Playground cannot write bot output directly into chat state.

### Several conversations at once

A developer can keep views such as Alice ↔ Bot A, Bob ↔ Bot A, Alice ↔ Bot B and
a group chat open simultaneously. Bot A ↔ Bot B is available only when the
selected platform supports it; otherwise it is an explicitly logical scenario
and not platform compatibility evidence.

### Human, scripted and AI actors

A human-controlled actor is a normal runtime actor whose next action comes from
the Playground. Scripted, replay and AI actors use the same Platform Emulator;
only the source of the next action changes. Manual messages and button choices
still generate platform updates, cross the real bot webhook and return through
the bot-facing platform API.

### Inspection and breakpoints

The Playground correlates client-visible chats with platform updates, webhook
attempts, API requests/responses, transcript entries and metrics. It may pause on
a turn, message type, regular expression, milestone, outbound call or scheduled
action and show authoritative runtime/platform state before continuing.

### Scenario recording

A recorded session captures actors, identities, messages, actions, timestamps,
metrics, platform events and milestones. Developers select observations and
convert the recording into deterministic tests, reusable scenarios,
implementation specifications or AI implementation prompts. Recording source
data does not make every observed phrase a permanent assertion.

## Dependencies

- [Platform Emulators](../platform-emulators/README.md)
- [Telegram Platform Emulator](../platform-emulators/telegram/README.md)
- [scenario-authoring](../scenario-authoring/README.md)
- [observability](../observability/README.md)
- [developer-tooling](../developer-tooling/README.md)

## Acceptance Criteria

### AC: playground-is-not-platform

Scenario: A developer sends a manual Telegram message
Given the Playground controls Alice in an emulated Telegram chat
When the developer sends `Hi`
Then the Playground submits a client action to the Telegram Platform Emulator
And only the emulator creates the update, delivers the webhook and changes chat state

### AC: manual-test-is-offline

Scenario: A developer tests a local Telegram bot
Given the bot, Playground and Telegram Platform Emulator are running locally
When the developer acts as Alice
Then the conversation requires no Telegram account, public webhook, deployment
or platform API access

### AC: multiple-conversations-are-visible

Scenario: A developer tests a multi-user flow
Given Alice and Bob have distinct chats with Bot A and Alice also chats with Bot B
When the developer switches actors and conversations
Then each history, identity and bot remains distinguishable
And all panels reflect one authoritative emulator state

### AC: recording-is-selective-and-portable

Scenario: A developer promotes a manual session
Given a completed recorded conversation
When they select messages, an action, a milestone and latency limit as requirements
Then the exported scenario preserves actors and platform events
And asserts only the selected observations

## Open Questions

- Which Playground capabilities belong in the open-source local product versus
  the local Studio and optional Cloud services?
- How should several local bot processes advertise webhook and platform API
  configuration without framework-specific setup?
- Which recorded platform details remain fixtures versus portable scenario intent?

---
*This document follows the https://specscore.md/feature-specification*
