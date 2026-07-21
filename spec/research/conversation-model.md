# Research: Neutral conversation model

**Date:** 2026-07-21
**Owner:** alex
**Status:** Proposed
**Consumed by:** [`conversation-runtime`](../features/chatwright/conversation-runtime/README.md), [`platform-emulators`](../features/chatwright/platform-emulators/README.md)

## Purpose

Define the smallest semantic core that keeps ordinary scenarios portable while
preserving platform fidelity and multiple identities.

## Investigation backlog

| ID | Question | Required evidence and output |
|---|---|---|
| I-07 | What is the generic platform-neutral action model for buttons, list choices, links and future interaction types? | Telegram/WhatsApp comparison table and a proposal separating semantic label/ID from adapter payloads. |
| I-08 | Which message fields are canonical for text, reply, thread, edit, deletion, media, reaction and delivery state? | Versioned message model sketch plus explicit unsupported/extension strategy. |
| I-09 | How are private/group/channel chats identified across platform, bot account and platform chat identity? | Identity key rules tested against one user with several bots, several identities and cross-platform scenarios. |
| I-10 | Where are the boundaries between actor, persona, user, platform identity/account and bot? | Responsibility table plus construction examples for scripted, AI, human, replay and bot actors. |

## Evaluation rules

- Prefer semantic verbs that survive two platforms; do not generalise a concept
  that has no equivalent merely to make APIs look symmetric.
- Preserve raw platform metadata for diagnostics without making it the scenario's
  default assertion surface.
- Model a message edit as versioned identity, not as a second sent message.
- Keep actor driver/state separate from the real or simulated identity it uses.

## Open Questions

The backlog above is intentionally unresolved.
