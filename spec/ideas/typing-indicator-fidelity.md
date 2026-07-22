---
format: https://specscore.md/idea-specification
status: Approved
---

# Idea: Typing-indicator fidelity — chat actions in the journal and bundle

**Status:** Approved
**Date:** 2026-07-22
**Owner:** alex
**Promotes To:** —
**Supersedes:** —
**Related Ideas:** extends:chatwright

## Problem Statement

Real bots signal activity between messages — Telegram's `sendChatAction`
("typing…", "uploading photo…") is part of how a conversation actually feels.
The emulator currently accepts messages and edits but records no chat
actions, so a run bundle cannot reproduce a conversation's authentic rhythm:
a player replaying the bundle must either fabricate a typing indicator
(inauthentic timing, against the fidelity principle) or omit it (lifeless
playback). Playback surfaces that depend on believable pacing — the Studio
player, embedded players, video export — need the real signal recorded.

## Context

The journal already has an extensible entry model: `platform.JournalEntryKind`
is an additive enum, and bundles carry `platform.JournalEntry` records
verbatim, so a new entry kind flows into the run-bundle format without any
schema change. The validating fake Bot API is the natural place to accept
`sendChatAction`, and the append-only journal the natural place to record it
with its timestamp — giving playback the actual gap between "bot started
typing" and "message arrived".

## Recommended Direction

- Accept `sendChatAction` in the Telegram fake Bot API (validated like other
  methods).
- Record it as a new additive journal entry kind (e.g.
  `JournalEntryChatAction` — a string constant, per the repo convention that
  JSON artefacts never carry integer enums) with the action string, timestamp
  and originator identity, in the chat's ordinary append-only journal.
- Bundles carry it automatically (journal entries are embedded verbatim); the
  player maps it to its bot-typing animation primitive, using recorded timing
  when present and only falling back to a synthesised indicator when a bundle
  predates this capability — the two must be distinguishable.
- Observation surface: chat actions are trace-level, not actor-facing —
  excluded from `observe.Observation` (an AI actor should not burn context on
  typing signals) unless a later idea argues otherwise.

## Alternatives Considered

- **Synthesise typing indicators in the player only.** Rejected as the
  end-state: fabricated timing presented as playback violates "fidelity is
  declared"; acceptable only as the labelled fallback for old bundles.
- **Record chat actions outside the journal (side channel).** Rejected: the
  journal is the single append-only record of the conversation; a second
  timeline would fork evidence.

## MVP Scope

- `sendChatAction` accepted + validated (Telegram), journal entry kind added,
  timestamp + `FromID` populated.
- Proof (principle 6): the greetbot fixture sends a chat action before its
  reply; an e2e test asserts the journal and a written bundle carry it in
  order; the player renders recorded typing timing.

## Not Doing (and Why)

- Per-action-type animations beyond "typing" (upload photo, record voice…) —
  recorded verbatim, rendered generically until a surface needs more.
- Client-side chat actions (the human/AI actor "typing") — the client ports
  do not send them today; revisit with the composer/embed ideas.
- Surfacing chat actions to the AI actor's observation — trace-level only.

## Key Assumptions to Validate

| Tier | Assumption | How to validate |
|---|---|---|
| Must-be-true | A new JournalEntryKind is additive for existing consumers | Existing frozen journal/bundle tests pass unchanged with the new kind present in fixtures |
| Should-be-true | Recorded action→message gaps produce natural playback pacing | Replay the greetbot proof bundle in the player and review the felt rhythm |
| Might-be-true | Bots under test commonly send chat actions at all | Check Listus Bot / Sneat Bot handlers during the Listus campaign work |

## SpecScore Integration

- **Existing Features affected:**
  [`observability`](../features/chatwright/observability/README.md) (journal
  entry kinds), platform emulation fidelity docs
  ([`docs/compatibility/telegram.md`](../../docs/compatibility/telegram.md)
  gains a supported-method row when implemented).

## Open Questions

- How does a player distinguish "bundle predates chat actions" from "bot sent
  none"? (Likely: chatwright version in bundle metadata, or a per-run
  capability note.)
- Should `JournalEntryKind` gain stable string labels for JSON readability
  before more kinds accumulate, given bundles embed entries verbatim with
  integer kinds?

---
*This document follows the https://specscore.md/idea-specification*
