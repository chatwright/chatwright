---
format: https://specscore.md/idea-specification
status: Draft
---

# Idea: Live-recording API/SDK — record real bot conversations as run bundles

**Status:** Draft
**Date:** 2026-07-22
**Owner:** alex
**Promotes To:** —
**Supersedes:** —
**Related Ideas:** extends:chatwright, extends:hybrid-runs

## Problem Statement

Run bundles today come only from emulated runs. The conversations where real
users hit real bugs — production traffic — vanish into unstructured logs. Bot
developers have no way to capture a real conversation with full fidelity and
replay, share or annotate it. Yet the bot process itself already sees both
directions of every conversation: platform updates in, API calls out —
exactly what a journal records.

## Context

The run-bundle format v1 is already a platform-neutral conversation
container: a declared `endpointProfile` string, an extensible `PartKind`
discriminator, an actors roster that includes `human`, and journal entries
with identity and timing. The player is local-file with no server dependency.
Chatwright's any-language positioning (the pybot proof) means recording must
not require Go. The model to follow is PostHog's: a small capture API is the
product's contract, and SDKs are thin conveniences over it.

## Recommended Direction

Offer a capture API bot developers call from their real bot — with SDKs as
thin wrappers — recording conversations as standard run bundles, replayable
in the Studio player:

- **Interface-first:** the contract is a small recording interface — submit
  conversation events (inbound update, outbound call, chat action) keyed to a
  chat/session; cut/flush a bundle — with out-of-the-box sink
  implementations behind it: a local `*.chatwright.json` file writer (the
  zero-dependency default), a database sink (DALgo-backed, so any database
  DALgo supports works), and an API wrapper posting to a collector (a local
  collector in the chatwright CLI; hosted ingestion is the later Cloud
  surface over the same wire contract — the PostHog-style capture API is one
  sink, not the contract itself). Bots in languages without an SDK use the
  capture API directly.
- **SDKs as wrappers; first: a `bots-go-framework` middleware** (owned
  dependency — improve it upstream, dogfood on Listus Bot and Sneat Bot in
  production), capturing inbound updates and outbound Bot API calls into
  journal entries. Standalone Go and JS SDKs can follow.
- **Fidelity declared:** recordings carry their own endpoint profile label
  (e.g. `live-recorded`) — the bundle format's `endpointProfile` is already a
  plain declared string, so no schema change. Recorded evidence is never
  interchangeable with `platform-emulated` evidence.
- **Part kind:** a future `recorded` part kind (journal-only section) — the
  `PartKind` string discriminator was designed for additive kinds.
- **Actors:** the real user becomes a `human` roster actor with the platform
  identity the update carries; the bot is the `bot` actor.
- **Privacy is first-class:** recording is opt-in (per chat / sampled),
  with redaction hooks before anything is written; the local-file player
  means recordings can be replayed and shared without ever uploading.
- **Funnel:** record for free → replay/annotate/share bundles ("see how
  instead of $4 the bot returned 4$") → discover the testing platform. Every
  shared recording markets the player.

## Alternatives Considered

- **Log scraping / platform-side export.** Rejected: platforms don't expose
  full both-direction history with timing; the bot process is the only
  vantage point that sees everything.
- **Server-side collection first.** Deferred: a Cloud collector is a natural
  paid follow-up, but the SDK must work file-local first (privacy, and no
  service dependency for OSS users).

## MVP Scope

- Middleware for `bots-go-framework` recording one Telegram bot's
  conversations to `*.chatwright.json` bundles (journal + actors + metadata;
  `live-recorded` profile).
- Proof (principle 6): Listus Bot in production records a real conversation;
  the bundle plays in the Studio player with attribution and timing intact.

## Not Doing (and Why)

- Recording→scenario synthesis (turning a recorded conversation into a
  deterministic regression scenario) — powerful, separate future idea; this
  idea only produces bundles.
- Cloud collection/storage — later, as a paid surface over the same format.
- Non-Telegram platforms — follow the emulator platform roadmap.

## Key Assumptions to Validate

| Tier | Assumption | How to validate |
|---|---|---|
| Must-be-true | bots-go-framework middleware can observe both directions without framework API breakage | Prototype on Listus Bot |
| Should-be-true | Redaction hooks make sharing acceptable for real conversations | Review a recorded Listus bundle for PII before any sharing |
| Might-be-true | Recorded timing replays naturally in the player | Play a real recording; compare felt rhythm with the live chat |

## SpecScore Integration

- **Existing Features affected:**
  [`observability`](../features/chatwright/observability/README.md) (bundle
  as universal conversation record),
  [`platform-emulators/telegram`](../features/chatwright/platform-emulators/telegram/README.md)
  (journal entry vocabulary shared with recordings).

## Open Questions

- Where does the middleware buffer entries, and when does it cut a bundle
  (per chat? per session window? on demand)?
- Can recorded conversations include the typing-indicator chat actions
  ([typing-indicator-fidelity](typing-indicator-fidelity.md)) from real bots?
- Consent UX: what does opt-in look like for a bot's end users, per platform
  rules (Telegram ToS) and GDPR?

---
*This document follows the https://specscore.md/idea-specification*
