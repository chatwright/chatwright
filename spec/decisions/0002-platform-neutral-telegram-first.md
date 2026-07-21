---
format: https://specscore.md/decision-specification
status: Approved
---

# Decision: Platform-neutral core, Telegram first, full WhatsApp deferred

**Status:** Approved
**Date:** 2026-07-21
**Owner:** alex
**Tags:** platform, adapter, telegram, whatsapp
**Source Idea:** chatwright
**Supersedes:** —
**Superseded By:** —

## Context

Telegram provides the first concrete implementation path, but concepts such as
callback data, message edits and chat identity are not universal. The repository
also contains an early WhatsApp text adapter even though the concept brief defers
full WhatsApp implementation.

## Decision

Scenarios express conversational intent; platform adapters express platform
mechanics. The neutral model uses semantic actions (label + stable ID) and generic
message/chat concepts, with adapter-specific extensions where a scenario truly
depends on platform behaviour.

Telegram is the first fidelity target. WhatsApp shapes the neutral architecture
from the beginning, but full WhatsApp support is deferred until the deterministic
Telegram slice is reliable. Existing WhatsApp text code is treated as an
experimental compatibility probe, not as evidence that the WhatsApp feature is
complete or committed to the first release.

## Rationale

A concrete Telegram slice exposes real design pressure. A WhatsApp-aware review
prevents obvious leakage without forcing two platform implementations to mature
simultaneously.

## Declined Alternatives

### Telegram concepts in the core

Rejected because it would turn later adapters into translations from Telegram
rather than implementations of conversational intent.

### Ship Telegram and WhatsApp at parity in Phase 1

Rejected because it doubles platform fidelity risk before the runtime contract is
stable.

## Consequences at Decision Time

- Unsupported platform behaviour is reported explicitly, never silently
  approximated.
- Telegram-specific assertions remain available behind an adapter extension.
- WhatsApp implementation work is not on the Phase 1 critical path.

## Observed Consequences

The seed has a neutral `platform` package, a Telegram adapter for text, actions
and edits, and an early WhatsApp text adapter. Its neutral action shape already
uses label/ID, although the fidelity and unsupported-capability contract still
need hardening.

## Affected Features

- [`platform-adapters`](../features/chatwright/platform-adapters/README.md)
- [`scenario-authoring`](../features/chatwright/scenario-authoring/README.md)

## Open Questions

- Which neutral operations survive comparison against WhatsApp interactive,
  template and conversation-window semantics?

---
*This document follows the https://specscore.md/decision-specification*
