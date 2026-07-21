---
format: https://specscore.md/feature-specification
status: Implementing
---

# Feature: Platform adapters

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/platform-adapters?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/platform-adapters?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/platform-adapters?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/platform-adapters?op=request-change) |
**Status:** Implementing
**Source Ideas:** chatwright

## Summary

A platform-neutral intent model plus fidelity-owned adapters that generate
inbound updates, emulate outbound APIs and map stateful platform behaviour for
Telegram first, WhatsApp-aware architecture second and future platforms later.

## Problem

Copying Telegram fields into the core would make near-term work easy and every
future adapter awkward. Conversely, hiding all platform differences produces an
untrustworthy emulator. Chatwright needs an explicit neutral seam with honest
platform extensions and unsupported states.

## Behavior

### Adapter contract

An adapter converts semantic inbound actions into platform webhook envelopes,
validates outbound API requests, returns realistic platform responses, mutates
simulated chat state, emits transcript/trace events and wakes expectations. It
also exposes platform-specific assertions and capabilities.

### Telegram first

The first reliable slice covers webhook text updates, private chat IDs, outbound
text, inline actions/callbacks and message edits. The investigation backlog
narrows subsequent support for media, replies, groups, duplicate delivery,
ordering, retry and errors; the MVP does not imply full Bot API emulation.

### WhatsApp-aware, not Telegram-shaped

The generic model accounts for WhatsApp webhook envelopes, interactive messages,
status updates, reply context, identity and conversation windows. Telegram
`callback_data` does not appear in neutral APIs; semantic action ID and label do.
The existing WhatsApp text adapter is experimental baseline evidence while full
implementation remains deferred.

### Faithful and logical modes

Platform-faithful mode enforces observed platform constraints, including
bot-to-bot limitations. Logical conversational mode may support abstract
distributed-bot scenarios that no single platform can deliver and is always
labelled as such.

## Dependencies

- [conversation-runtime](../conversation-runtime/README.md)
- Platform research in [`spec/research/platform-semantics.md`](../../../research/platform-semantics.md)

## Acceptance Criteria

### AC:fake-api-mutates-chat-state

Scenario: A Telegram bot sends and edits a message
Given a running Telegram adapter
When the bot calls the fake send and edit API endpoints
Then requests are validated, realistic responses are returned, one stateful
message is created then versioned, and waiters are notified

### AC:generic-action-is-not-telegram-specific

Scenario: A scenario chooses a semantic action
Given an action identified by label and stable ID
When it runs on Telegram and a supported WhatsApp adapter
Then each adapter maps its own callback/interactive mechanics
And the scenario does not reference Telegram callback data

### AC:unsupported-is-honest

Scenario: A scenario requires an unavailable platform capability
Given a selected adapter that cannot edit sent messages
When the scenario requires an edit
Then the run reports unsupported capability before or at the operation
And does not silently reinterpret the edit as a new message

## Open Questions

- What Telegram bot-to-bot behaviour is actually observable and reproducible?
- How strict should fake API request validation be when real platforms accept
  undocumented or version-dependent forms?
- How are platform API versions selected and captured in evidence?

---
*This document follows the https://specscore.md/feature-specification*
