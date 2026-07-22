---
format: https://specscore.md/feature-specification
status: Implementing
---

# Feature: Telegram Client Emulator

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/platform-emulators/telegram/client?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/platform-emulators/telegram/client?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/platform-emulators/telegram/client?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/platform-emulators/telegram/client?op=request-change) |
**Status:** Implementing
**Source Ideas:** chatwright

## Summary

The actor-facing port of the Telegram Platform Emulator: semantic client
actions in, client-view projections out, over the emulator's single platform
state engine. One instance can represent many Telegram users, identities, chats
and bots simultaneously and accept actions from human, scripted, replay or AI
actors.

## Problem

A bot's behaviour depends on more than one synthetic update. Developers need
coherent client-visible history, identities and concurrent chats to reproduce
multi-user workflows and understand what Telegram participants would observe.

## Behavior

### Users, identities and chats

The Client Emulator presents client-visible private and group chats, users,
platform identities, chat history and concurrent views involving multiple users
and bots — all projections over the emulator's single platform state engine; the
port owns no state of its own. Message identity and versions remain stable
across supported edits and deletes.

### Interaction horizon

The product area covers sending, editing and deleting messages where supported;
clicking inline buttons; replying; forwarding; attachments; locations; contacts;
reactions; and other Telegram client actions added to a declared compatibility
profile. The initial MVP profile implements only its documented subset.

### Actor drivers

Human-controlled, scripted and AI actors all issue the same semantic client
actions. One Client Emulator instance can serve several actors at once. Only the
actor implementation changes; the Telegram platform state and delivery path do
not.

### Playground interaction

The [Chatwright Playground](../../../playground/README.md) displays and controls
Client Emulator state for manual testing. The Playground is a consumer and
visual controller; it is not the Telegram Client Emulator itself.

## Dependencies

- [Telegram Platform Emulator](../README.md)
- [Telegram Server/API Emulator](../server-api/README.md)
- [conversation-runtime](../../../conversation-runtime/README.md)

## Acceptance Criteria

### AC: one-instance-represents-many-users

Scenario: Two users test the same bot concurrently
Given Alice and Bob have distinct Telegram identities and private chats
When both send messages through one Client Emulator instance
Then their histories, message identifiers and actor state remain distinct
And both interactions traverse the same Telegram Server/API Emulator

### AC: actor-driver-does-not-change-platform

Scenario: A recorded human action is replayed by a script
Given a human actor clicked an inline action through the Playground
When a scripted actor later performs the same semantic action
Then both actions produce equivalent Telegram platform behaviour
And no actor writes directly to transcript or chat state

### AC: manual-client-state-is-inspectable

Scenario: A developer opens several conversations
Given Alice ↔ Bot A, Bob ↔ Bot A and a supported group chat are active
When the developer switches panels in the Playground
Then each panel reflects the authoritative Client Emulator state
And prior history remains available without reconnecting to Telegram

## Open Questions

- Which Telegram client behaviours require platform-faithful UI semantics rather
  than a platform-neutral Playground control?
- How should unsupported bot-to-bot examples be represented in logical mode
  without implying Telegram delivery support?

---
*This document follows the https://specscore.md/feature-specification*
