---
format: https://specscore.md/decision-specification
status: Approved
---

# Decision: The messaging platform is emulated; the bot under test is real

**Status:** Approved
**Date:** 2026-07-21
**Owner:** alex
**Tags:** product, platform-emulator, playground, boundary
**Source Idea:** chatwright
**Supersedes:** —
**Superseded By:** —

## Context

“Bot emulator”, “manual emulator”, “fake bot” and “platform adapter” can blur
which system Chatwright replaces. That ambiguity weakens product positioning and
encourages shortcuts that inject bot messages into transcripts without testing
the developer's actual application or platform client.

## Decision

Chatwright emulates messaging platforms. Developers test real bots.

The Platform Emulator is a local implementation of the messaging platform from
the perspective of users, applications and bots. It generates platform-shaped
activity, delivers it to the real bot, accepts the bot's real platform API calls
and owns the resulting platform state.

The Chatwright Playground is a consumer and controller of Platform Emulators. It
does not become authoritative for Telegram, WhatsApp, Slack or Discord state.
Deterministic, human, replay and AI actors change how a next action is selected;
they do not change which platform implementation delivers it.

“Bot Emulator” is reserved for explicit scenarios in which another bot is an
emulated actor inside the simulated platform. It is not a name for Chatwright's
primary product boundary.

## Rationale

This model retains the production-relevant seams—webhooks, platform APIs,
identity, ordering and state—while allowing fully local and deterministic runs.
It also separates a reusable platform capability from any one UI such as the
Playground or hosted Studio.

## Declined Alternatives

### Treat the Playground as the emulator

Rejected because a UI-owned transcript would create a separate manual-testing
path and could not be reused unchanged by CI, scripted actors or AI actors.

### Emulate the bot application

Rejected as the default because the bot is the software whose real behaviour,
integration boundaries and platform calls Chatwright exists to test.

### Market internal adapters as the product hierarchy

Rejected because adapters are implementation mechanisms. The public hierarchy
is Platform Emulators, with Telegram exposing only Client and Server/API
children.

## Consequences at Decision Time

- Product documentation repeats the platform/bot distinction consistently.
- Platform Emulator state is authoritative across Playground and automated runs.
- Each emulator declares a compatibility profile rather than implying full parity.
- UI and actor implementations cannot bypass platform delivery for convenience.

## Observed Consequences

The current seed already delivers Telegram-shaped updates to a real HTTP handler
and captures the real bot's fake Bot API calls. The product hierarchy and naming
previously described those capabilities mainly as adapters and a manual emulator;
this decision makes the platform boundary explicit.

## Affected Features

- [`platform-emulators`](../features/chatwright/platform-emulators/README.md)
- [`telegram`](../features/chatwright/platform-emulators/telegram/README.md)
- [`playground`](../features/chatwright/playground/README.md)
- [`deterministic-testing`](../features/chatwright/deterministic-testing/README.md)

## Open Questions

- Which UI-visible terminology best distinguishes faithful platform behaviour
  from explicitly logical conversation mode?

---
*This document follows the https://specscore.md/decision-specification*
