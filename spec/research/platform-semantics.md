# Research: Telegram and platform semantics

**Date:** 2026-07-21
**Owner:** alex
**Status:** Proposed
**Consumed by:** [`platform-adapters`](../features/chatwright/platform-adapters/README.md)

## Purpose

Ground the first adapter in documented and observed Telegram behaviour, with
special attention to outbound emulation and bot-to-bot claims.

## Observed baseline

The seed generates Telegram text/callback updates and emulates a small subset of
Bot API calls (`sendMessage`, `editMessageText`, with lenient acknowledgement for
other methods). It captures text/actions/edits. Lenient acknowledgement is useful
for early experiments but is not yet the validating fake API promised by the MVP.

## Investigation backlog

| ID | Question | Required evidence and output |
|---|---|---|
| I-04 | Which Telegram update fields, IDs, timestamps and webhook security behaviours are required for the first supported scenarios? | Protocol fixture set generated from official Bot API documentation and real captured/redacted examples where permitted. |
| I-05 | Which outbound Telegram methods, content encodings, validation errors and result envelopes must the fake API emulate first? | Narrow method/fidelity matrix and failing conformance fixtures; replace blanket success for methods in supported scope. |
| I-06 | What bot-to-bot activity can Telegram actually deliver or expose, and which desired flows require logical conversational mode? | Cited platform findings and explicit faithful/logical scenario examples; no unsupported capability asserted as fact. |

## WhatsApp architecture checks

Although implementation is deferred, review the neutral model against Cloud API
webhook envelopes, interactive reply IDs/titles, reply context, status updates,
media, template rules, identities and conversation windows. Record every neutral
concept that would otherwise encode Telegram mechanics.

## Open Questions

The backlog above is intentionally unresolved.
