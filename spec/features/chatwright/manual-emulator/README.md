---
format: https://specscore.md/feature-specification
status: Draft
---

# Feature: Manual local emulator

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/manual-emulator?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/manual-emulator?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/manual-emulator?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/manual-emulator?op=request-change) |
**Status:** Draft
**Source Ideas:** chatwright

## Summary

An offline interface in which a developer controls one or more human actors,
talks to locally running bots through the simulated platform path, inspects live
evidence and records useful interactions as scenarios.

## Problem

Manual bot testing usually requires a real account, internet access, a deployed
or publicly tunnelled webhook and repeated identity switching. It is difficult to
compare two chats, reproduce the session or turn what was learned into CI tests.

## Behavior

### Human actors and panels

A human-controlled actor is a normal runtime actor whose next action comes from
the UI. The interface can show Alice ↔ Bot A, Bob ↔ Bot B, a group chat and a
logical bot-to-bot panel together. Platform-faithful mode enforces real platform
restrictions; abstract conversation mode is visibly labelled and may permit
logical interactions a platform cannot deliver.

### No shortcut around emulation

Manual messages, button choices and message edits traverse platform update
generation, the real bot webhook and the fake outbound API. The UI cannot write
directly to the transcript as if the bot sent a message.

### Recording

A session records actors, identities, messages, actions, edits, delays, platform
events, metrics and candidate milestones. The user chooses which observations
become assertions, then exports Go, structured scenarios or later Starlark.

### Breakpoint bridge

The emulator may pause on a turn, message type, regex, milestone, outbound call
or scheduled action. At a pause it exposes transcript, actor state, pending work,
metrics and the latest platform traffic, and can continue or inject a human
action.

## Dependencies

- [conversation-runtime](../conversation-runtime/README.md)
- [scenario-authoring](../scenario-authoring/README.md)
- [developer-tooling](../developer-tooling/README.md)

## Acceptance Criteria

### AC: manual-test-is-offline

Scenario: A developer tests a local Telegram bot
Given the bot and Chatwright are running locally
When the developer acts as Alice in the emulator
Then the conversation requires no Telegram account, public webhook, deployment
or platform API access

### AC: multiple-identities-are-visible

Scenario: A cross-bot notification is tested
Given Alice is chatting with Bot A and Bob with Bot B
When Alice triggers a notification received by Bob
Then both chats remain visible with their distinct actors, bots and identities

### AC: recording-is-selective

Scenario: A developer promotes a manual session
Given a completed recorded conversation
When they select two messages, one action and a latency limit as requirements
Then the exported scenario asserts only those selected observations

## Open Questions

- Is the basic emulator part of the open-source repository or a thin client for
  a hosted service?
- How should several local bot processes advertise webhook and API-base
  configuration without framework-specific setup?

---
*This document follows the https://specscore.md/feature-specification*
