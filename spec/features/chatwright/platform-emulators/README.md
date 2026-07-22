---
format: https://specscore.md/feature-specification
status: Specifying
---

# Feature: Platform Emulators

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/platform-emulators?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/platform-emulators?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/platform-emulators?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/platform-emulators?op=request-change) |
**Status:** Specifying
**Source Ideas:** chatwright

## Summary

Local implementations of messaging platforms from the perspective of users,
applications and bots. Chatwright emulates the messaging platform; developers
run and test their real bot application against it.

## Contents

| Platform Emulator | Status | Product role |
|---|---|---|
| [Telegram Platform Emulator](telegram/README.md) | Implementing | MVP and reference implementation |
| [WhatsApp Platform Emulator](whatsapp/README.md) | Draft | Planned future emulator |

## Problem

Bot development against a live messaging platform requires accounts, internet
access, public endpoints, mutable remote state and platform credentials. Narrow
handler mocks remove those costs but also remove the platform boundary where
webhook, ordering, identity, API and state bugs occur.

## Behavior

### The platform is emulated; the bot is real

A Platform Emulator accepts user or actor activity, generates platform-shaped
updates, delivers them to the real bot webhook, receives the bot's real platform
API requests and applies their effects to local platform state. It is not a Bot
Emulator. Emulating another bot as an actor is an optional scenario capability
inside the simulated platform, not the product boundary.

### Complete loop, explicit compatibility profile

Each emulator provides a complete local execution loop for its declared
compatibility profile. “Complete local platform” does not imply immediate parity
with every public, private or historical feature of the real service. Supported,
partially supported, logical-only and unavailable capabilities remain explicit.

### One platform, several consumers

Deterministic tests, the Chatwright Playground, replay and AI actors use the same
emulator and platform state. Changing the actor driver must not replace the
platform path with a transcript shortcut or a separate test transport.

### Shared infrastructure without false uniformity

Future emulators reuse platform-neutral identities, actors, chats, messages,
scheduling, state, evidence and capability declarations where semantics truly
match. Platform-specific behaviour remains owned by the relevant emulator.

## Dependencies

- [conversation-runtime](../conversation-runtime/README.md)
- [observability](../observability/README.md)
- [Decision 0006: the platform is emulated; the bot is real](../../../decisions/0006-platform-emulated-bot-real.md)
- [Platform Emulator investigations](../../../research/platform-emulators.md)

## Acceptance Criteria

### AC: real-bot-crosses-emulated-platform

Scenario: A developer runs a local bot against a Platform Emulator
Given the developer's real bot process and a supported emulator are local
When a user actor sends a message
Then the emulator delivers a platform-compatible update to the bot
And the bot calls the emulator's platform API rather than a Chatwright bot stub

### AC: consumers-share-platform-state

Scenario: A manual session becomes an automated scenario
Given a conversation recorded through the Playground
When it is replayed by a scripted actor
Then both runs use the same Platform Emulator contract and state semantics
And only the source of the actor's next action changes

### AC: compatibility-is-honest

Scenario: A scenario requires an unsupported platform capability
Given the selected compatibility profile cannot perform the operation
When the scenario is prepared or executed
Then the result identifies the unsupported capability
And does not silently approximate it as different platform behaviour

## Open Questions

- Which shared abstractions remain useful after Telegram and WhatsApp semantics
  are compared in detail? Further platforms (Slack, Discord and others) enter
  through the same seams if the [public roadmap's later
  options](../../../../docs/roadmap.md#later-options-not-commitments) are ever
  taken up.
- How should compatibility profiles and versions be named, negotiated and
  included in run evidence?

---
*This document follows the https://specscore.md/feature-specification*
