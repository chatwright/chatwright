---
format: https://specscore.md/decision-specification
status: Approved
---

# Decision: Independent open-source project with an initial framework integration

**Status:** Approved
**Date:** 2026-07-21
**Owner:** alex
**Tags:** product, boundary, open-source
**Source Idea:** chatwright
**Supersedes:** —
**Superseded By:** —

## Context

Chatwright originated alongside Sneat bot infrastructure and can reuse
`bots-go-framework` adapters immediately. Coupling its runtime or specifications
to Sneat application architecture would limit adoption and make a future hosted
product inseparable from one customer's stack.

## Decision

Chatwright is a standalone project under the `chatwright` GitHub organisation and
is independently branded at `chatwright.dev`. Sneat.co develops it and may operate
hosted services around it.

The first implementation is Go and initially depends on or reuses
`bots-go-framework` as its reference integration. That dependency is not a
permanent product boundary: any bot that can receive supported platform webhooks
and redirect outbound platform calls to a fake API should be able to participate
without importing Sneat code.

## Rationale

The framework provides concrete wire types and production experience, making it
the shortest route to a realistic first slice. An HTTP-defined integration seam
keeps the product useful to other languages and frameworks.

## Declined Alternatives

### Build inside the Sneat bot repository

Rejected because runtime release cadence, identity and architecture would remain
coupled to one application ecosystem.

### Avoid all framework reuse

Rejected because duplicating proven adapter work delays useful platform fidelity
without improving the product boundary.

## Consequences at Decision Time

- Public naming, documentation and APIs use Chatwright rather than Sneat product
  concepts.
- Framework-specific adapters and examples sit behind general runtime contracts.
- Sneat authentication cannot be required for local or CI execution.

## Observed Consequences

The public repository exists under `chatwright/chatwright`, uses an Apache-2.0
Go runtime and imports `bots-go-framework` platform packages. Its HTTP-facing
contracts already permit bots outside that framework in principle; a dedicated
framework-independent fixture remains future evidence.

## Affected Features

- [`chatwright`](../features/chatwright/README.md)
- [`platform-adapters`](../features/chatwright/platform-adapters/README.md)
- [`developer-tooling`](../features/chatwright/developer-tooling/README.md)

## Open Questions

- When should framework-derived adapter code become copied, wrapped or independently
  implemented to avoid dependency constraints?

---
*This document follows the https://specscore.md/decision-specification*
