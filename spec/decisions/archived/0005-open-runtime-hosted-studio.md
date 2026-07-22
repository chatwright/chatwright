---
format: https://specscore.md/decision-specification
status: Superseded
---

# Decision: Open runtime with a separable, potentially commercial hosted Studio

**Status:** Superseded
**Date:** 2026-07-21
**Owner:** alex
**Tags:** open-source, hosted, commercial, accounts
**Source Idea:** chatwright
**Supersedes:** —
**Superseded By:** 0007-open-local-stack-closed-cloud

## Context

Chatwright needs independent developer adoption and a plausible sustainable
business. If essential local execution depends on the hosted service, the runtime
is not credible open infrastructure. If every team/AI feature must be free and
local, there may be no obvious commercial layer.

## Decision

The core runtime should remain open source, including Go APIs, deterministic
engine, platform emulation, webhook runner, transcript/metrics contracts, CLI,
future Starlark support and a useful basic local emulator.

Hosted authoring, collaboration, cloud execution, organisation management, run
history, dashboards, hosted AI actors/evaluation and integrations with coding
agents may become commercial. The hosted product may use Sneat accounts and
integrate with `sneat.work`; those services cannot be prerequisites for local or
CI execution.

This decision does not finalise pricing, packaging or the licence of future
hosted-only code.

## Rationale

The boundary lets teams trust and adopt the execution layer while reserving
operationally expensive, collaborative and AI-heavy value for a service.

## Declined Alternatives

### Hosted-only execution

Rejected because it undermines offline bot testing, CI portability and the
independent open-source positioning.

### Finalise every SKU now

Rejected because repeat runtime use has not yet shown which hosted jobs users
will value.

## Consequences at Decision Time

- Open formats and result bundles must not require proprietary servers.
- Authentication concerns live outside the runtime core.
- The local emulator must be genuinely useful, though advanced team features may
  remain hosted.

## Observed Consequences

The runtime repository is public and Apache-2.0 licensed. No hosted service,
account dependency, pricing model or proprietary Studio implementation exists in
this repository at decision time; the PrimeNG UI is explicitly a local mock.

## Affected Features

- [`manual-emulator`](../../features/chatwright/manual-emulator/README.md)
- [`developer-tooling`](../../features/chatwright/developer-tooling/README.md)
- [`agent-implementation-loop`](../../features/chatwright/agent-implementation-loop/README.md)

## Open Questions

- Which collaboration and AI workloads create enough recurring value to support
  the hosted product?
- Where is the fair boundary between the basic emulator and advanced Studio?

## Supersession

[Decision 0007](../0007-open-local-stack-closed-cloud.md) opens the complete local
development stack, including Studio, under Apache-2.0 and moves the potentially
proprietary commercial boundary to optional operated Cloud services.

---
*This document follows the https://specscore.md/decision-specification*
