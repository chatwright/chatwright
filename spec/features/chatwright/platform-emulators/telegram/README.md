---
format: https://specscore.md/feature-specification
status: Implementing
---

# Feature: Telegram Platform Emulator

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/platform-emulators/telegram?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/platform-emulators/telegram?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/platform-emulators/telegram?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/platform-emulators/telegram?op=request-change) |
**Status:** Implementing
**Source Ideas:** chatwright

## Summary

Run a complete local Telegram platform for bot development, testing and
experimentation within an explicit supported compatibility profile. Telegram is
emulated; the bot under development is the real application.

## Contents

| Child | Purpose |
|---|---|
| [Telegram Client Emulator](client/README.md) | Users, identities, chats and actions as Telegram clients observe and produce them |
| [Telegram Server/API Emulator](server-api/README.md) | Updates, webhooks, Bot API endpoints and delivery behaviour over the shared platform state engine |

The public product hierarchy intentionally stops at these two children.
Protocol fixtures, transports, state stores and method handlers belong in
architecture and investigation documents rather than further product branches.

## Problem

Local Telegram bot development normally still depends on Telegram accounts,
credentials, network access and a public webhook or tunnel. Handler-only mocks
cannot demonstrate whether the actual bot understands Telegram updates and calls
the Bot API correctly.

## Behavior

### Telegram MVP

The Chatwright MVP consists of the Telegram Platform Emulator and both of its
children: the Client Emulator and Server/API Emulator. Telegram is the reference
implementation for the wider Platform Emulator architecture.

The first compatibility profile is deliberately narrow: private users and bots,
text messages, inline actions/callbacks, in-place edits, real HTTP webhook
delivery, fake Bot API endpoints, stable platform identifiers and correlated
evidence. The hierarchy describes the complete product area; support expands
only when behaviour is modelled faithfully and tested.

### One state engine, two ports

Internally the Telegram Platform Emulator keeps a single authoritative platform
state engine: chats, users, messages with one per-chat message-identifier
sequence, the update queue and the event journal. The two public children are
ports over that engine, not stateful services of their own — the Client
Emulator presents actor-facing actions and client-view projections; the
Server/API Emulator presents the bot-facing wire surface and delivery
behaviour. Neither port owns a separate copy of platform state.

### Offline development loop

Developers can run the emulator, their real bot and the Playground or automated
scenario entirely locally. They can inspect chats, Telegram updates, Bot API
requests, responses, errors, state changes, transcripts and metrics without a
Telegram account or public webhook.

### Faithful and logical capabilities

Telegram-faithful behaviour is the default and enforces known platform rules.
Logical conversation mode may explore useful multi-bot interactions Telegram
cannot natively deliver, but it is labelled and cannot be reported as Telegram
compatibility evidence.

## Dependencies

- [Platform Emulators](../README.md)
- [conversation-runtime](../../conversation-runtime/README.md)
- [Telegram semantics research](../../../../research/platform-semantics.md)

## Acceptance Criteria

### AC: telegram-loop-is-local

Scenario: A developer greets a local Telegram bot
Given the Telegram Platform Emulator and real bot are running locally
When an emulated Telegram user sends `Hi`
Then a Telegram-compatible update crosses the bot's real HTTP webhook
And the reply arrives through the emulator's fake Bot API and appears in chat

### AC: mvp-has-both-halves

Scenario: The Telegram MVP compatibility profile is evaluated
Given a declared supported user interaction
When it runs end to end
Then the Client Emulator carries the user/chat-facing action and its projection
And the Server/API Emulator carries update delivery and the bot-facing API surface
And both operate on the emulator's single platform state engine

### AC: profile-does-not-claim-full-parity

Scenario: A Telegram capability is outside the current profile
Given the feature exists on Telegram but is not yet supported by Chatwright
When a developer attempts to use it
Then the emulator reports it as unsupported or planned
And the MVP is not described as full Telegram feature parity

## Open Questions

- Which exact Bot API version and client behaviours define the first named
  compatibility profile?
- Which group-chat behaviours enter immediately after the private-chat slice?

---
*This document follows the https://specscore.md/feature-specification*
