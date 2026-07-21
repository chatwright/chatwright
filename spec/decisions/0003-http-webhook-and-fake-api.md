---
format: https://specscore.md/decision-specification
status: Approved
---

# Decision: Real HTTP webhook is the strongest mode; fake outbound APIs are required

**Status:** Approved
**Date:** 2026-07-21
**Owner:** alex
**Tags:** http, runtime, platform-api, fidelity
**Source Idea:** chatwright
**Supersedes:** —
**Superseded By:** —

## Context

Direct handler tests are fast but do not validate request routing,
serialisation/deserialisation or the bot's actual outbound platform client. Live
platform tests cover those seams but add accounts, network, deployment and rate
limits.

## Decision

The strongest Chatwright integration path is:

`actor → simulated platform update → real HTTP webhook → bot application → fake
platform API → simulated recipient chat`.

Chatwright must provide fake outbound platform APIs that validate requests,
return plausible platform responses, update state, append evidence and wake
expectations. In-process/local HTTP servers and external local processes are both
valid. Direct transport invocation may be supported as a faster, narrower mode,
but results must identify that reduced-fidelity mode.

## Rationale

This preserves the important production boundary while remaining deterministic,
offline and framework-independent. It also makes the outbound API a source of
observable state instead of a mock called only for verification.

## Declined Alternatives

### Direct invocation only

Rejected as the strongest mode because it skips the exact HTTP/wire seam most
integration tests need to exercise.

### Proxy the real platform API

Rejected for ordinary tests because credentials, network and mutable external
state make repeatability and error simulation harder.

## Consequences at Decision Time

- Bot configurations need a replaceable platform API base URL.
- Fake APIs become substantial adapter components with validation/version policy.
- Direct-mode evidence cannot be presented as equivalent to HTTP-mode evidence.

## Observed Consequences

The current harness posts generated updates to an `http.Handler` served by a
local test server and captures outbound calls through platform-specific
`httptest.Server` instances. The Telegram fake API is deliberately lenient for
unsupported methods today, so validating conformance is still planned work.

## Affected Features

- [`conversation-runtime`](../features/chatwright/conversation-runtime/README.md)
- [`deterministic-testing`](../features/chatwright/deterministic-testing/README.md)
- [`platform-adapters`](../features/chatwright/platform-adapters/README.md)

## Open Questions

- How strict should validation be when real platforms accept undocumented forms?
- What is the cleanest external-process lifecycle and readiness contract?

---
*This document follows the https://specscore.md/decision-specification*
