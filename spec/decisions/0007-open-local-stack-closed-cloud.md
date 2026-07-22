---
format: https://specscore.md/decision-specification
status: Approved
---

# Decision: Apache-2.0 local stack with optional commercial Cloud services

**Status:** Approved
**Date:** 2026-07-22
**Owner:** alex
**Tags:** open-source, studio, cloud, commercial, accounts
**Source Idea:** chatwright
**Supersedes:** 0005
**Superseded By:** —

## Context

Chatwright needs an unambiguous local-development promise and a sustainable
commercial boundary. Keeping Studio proprietary would reserve useful local
authoring and inspection rather than the operationally expensive value that
teams are more likely to pay for.

## Decision

Everything required for local development is open source under Apache-2.0. This
direction applies to Runtime, CLI, Platform Emulators, Playground and Studio.
A developer can clone Chatwright, run locally, develop and test bots, emulate
platforms, inspect transcripts, record scenarios and run deterministic tests
without a Chatwright Cloud or Sneat account.

Studio is local-first, offline-capable and optionally connects to Cloud. An
account is never required for supported local workflows.

Commercial value comes from optional operated services. Cloud Run provides
managed infrastructure, history, collaboration and organisation capabilities.
Cloud Intelligence provides managed orchestration, evaluation and intelligence
at scale. Those service implementations may be proprietary. Their portable
inputs, exports and approved regression tests remain usable by the open local
stack.

A free account should earn voluntary sign-in through additive value such as sync,
hosted reports, web Studio, limited execution and limited AI—not by withholding
local capability. Pricing and exact free/paid limits remain undecided.

Hosted services may authenticate with Sneat accounts, integrate into Sneat Work
or eventually join the Sneat Developer Platform. Chatwright remains an
independent project with standalone product identity and workflows.

## Rationale

An open local stack maximises trust, adoption, offline use and ecosystem
contribution. Managed compute, retention, collaboration and AI orchestration are
clear recurring service jobs and a stronger commercial boundary than local UI.

## Declined Alternatives

### Proprietary Studio

Rejected because it gates local authoring, recording and inspection and makes
the open runtime feel incomplete.

### Account-gated local features

Rejected because authentication adds friction without delivering service value
and violates the offline development promise.

### Open-source every operated service

Not required by the local-development promise. Cloud service code may remain
closed while formats and local workflows stay portable.

## Consequences

- Studio needs an Apache-2.0 LICENSE, NOTICE and public positioning.
- Local tools need complete offline paths and graceful optional Cloud actions.
- Sync and uploads require explicit user intent and portable local identity.
- Cloud reports and AI findings link back to exportable evidence.
- Marketplace assets declare their own licence and provenance; essential local
  workflows do not depend on commercial assets.
- Repository-level dependency notices still require investigation and upkeep.

## Affected Features

- [`chatwright`](../features/chatwright/README.md)
- [`developer-tooling`](../features/chatwright/developer-tooling/README.md)
- [`cloud`](../features/chatwright/cloud/README.md)
- [`marketplace`](../features/chatwright/marketplace/README.md)

## Open Questions

- Which portable sync and export contracts must be stable before Cloud beta?
- Which free-account benefit creates strong pull at sustainable cost?

---
*This document follows the https://specscore.md/decision-specification*
