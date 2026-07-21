# Research: Runtime integration seams

**Date:** 2026-07-21
**Owner:** alex
**Status:** Proposed
**Consumed by:** [`conversation-runtime`](../features/chatwright/conversation-runtime/README.md), [`developer-tooling`](../features/chatwright/developer-tooling/README.md)

## Purpose

Determine how Chatwright hosts and drives real bot applications, including
multi-bot shared state and asynchronous application infrastructure, without
making `bots-go-framework` a permanent hard boundary.

## Observed baseline

The current Go seed accepts an `http.Handler` or webhook URL, starts an
`httptest.Server` for the fake platform API and exposes its base URL. This proves
an in-process happy path; it does not yet prove framework-wide base-URL injection,
external process lifecycle, shared dependencies or deterministic queue draining.

## Investigation backlog

| ID | Question | Required evidence and output |
|---|---|---|
| I-01 | Which transport, webhook handler and bot lifecycle abstractions already exist across `bots-go-framework` and reference bots? | Code map covering constructors, handlers, platform adapters and test seams; recommendation on reuse versus wrapper boundaries. |
| I-02 | How can every relevant Telegram/WhatsApp client override its platform API base URL in tests? | Executable matrix by adapter/version; identify clients that require injection changes. |
| I-03 | Can webhook handlers be hosted in-process without changing production composition, and how should external processes signal readiness/shutdown? | Reference in-process integration plus an external-process spike with lifecycle/timeouts documented. |
| I-11 | How should several bots share application dependencies and state while retaining distinct platform identities and chats? | Two-bot fixture demonstrating a cross-bot notification and an isolation analysis. |
| I-12 | Which queue/event-bus implementations can integrate with a deterministic run, and what registration contract do they need? | Inventory of current Sneat/framework queues and a minimal drain/correlation interface proposal. |

## Risks to test

- A fake API base URL may be configurable for one client but captured globally by
  another, preventing concurrent environments.
- “In process” can accidentally bypass middleware, route registration or request
  serialisation used in production.
- Async work spawned outside registered schedulers may make `RunUntilIdle`
  unsound; Chatwright must report that limitation rather than guess.

## Open Questions

The backlog above is intentionally unresolved.
