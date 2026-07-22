---
format: https://specscore.md/feature-specification
status: Draft
---

# Feature: Developer tooling and Studio

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/developer-tooling?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/developer-tooling?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/developer-tooling?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/developer-tooling?op=request-change) |
**Status:** Draft
**Source Ideas:** chatwright

## Summary

The Apache-2.0 CLI, local runner, CI contract, editor integrations and Studio
that make Chatwright usable from the first offline conversation onward. Optional
Cloud integration adds sync and managed services without replacing local state.

## Problem

A capable runtime still fails as a product if setup is framework-specific,
failures require bespoke scripts and CI evidence cannot be revisited. At the
same time, treating Studio as only a hosted dashboard would couple basic visual
workflows to an account system and weaken the local-first product promise.

## Contents

| Child | Purpose |
|---|---|
| [datatug-integration](datatug-integration/README.md) | Open captured DTQL assertions and recordsets in a local DataTug investigation and export reviewed queries |
| [openvaultdb-artifact-storage](openvaultdb-artifact-storage/README.md) | Retain finalized run evidence in an optional user-selected OpenVaultDB vault without weakening local-first operation |
| [rehearse-adapter](rehearse-adapter/README.md) | Invoke Chatwright from Rehearse and return criterion-addressable outcomes without duplicating chat semantics |
| [specscore-verification-bindings](specscore-verification-bindings/README.md) | Bind criteria to canonical scenario cases, lock proof definitions and distinguish current, stale and partial evidence |

## Behavior

### Local and CI first

The CLI creates/runs a scenario, connects an in-process handler or local URL,
selects platform and output format, and exits non-zero on deterministic failure.
Machine-readable results accompany a concise terminal transcript. CI integration
does not require a hosted account.

### Discoverable configuration

Configuration identifies webhook target, fake API base URL injection,
platform/version, fixtures, secrets policy and output location. Reference setup
for `bots-go-framework` is first, while the HTTP contract remains framework- and
language-independent.

### Local-first Studio

Studio connects hierarchy, Playground, authoring and run inspector
rather than presenting separate dashboards. A user can move from a failing tree
node to its transcript, reproduce it manually against the same Platform
Emulator, refine assertions and export an implementation task while retaining
scenario/run identity. It is open source under Apache-2.0, runs offline and can
connect to a local CLI/runtime bridge without uploading private run data.

### Optional Cloud integration

A user may explicitly connect Studio to [Cloud](../cloud/README.md) for sync,
web access, hosted execution, collaboration, retained history and managed AI.
The operated service may be commercial and closed source. Sneat accounts and
Sneat Work integration are hosted conveniences, never Studio or runtime
prerequisites.

## Dependencies

- [playground](../playground/README.md)
- [platform-emulators](../platform-emulators/README.md)
- [scenario-authoring](../scenario-authoring/README.md)
- [observability](../observability/README.md)
- [cloud](../cloud/README.md), for optional hosted capabilities

## Acceptance Criteria

### AC:local-run-needs-no-account

Scenario: A developer runs Chatwright in CI
Given an open-source bot repository and supported local dependencies
When the Chatwright command runs its deterministic suite
Then no Chatwright/Sneat account or hosted API is required
And process status and machine-readable results reflect scenario outcomes

### AC:views-preserve-context

Scenario: A developer opens a failure from the scenario tree
Given a failing scenario and recorded run
When they navigate to the run inspector and Playground
Then the selected workspace, scenario, run and actors remain identifiable

### AC:framework-integration-is-not-hard-boundary

Scenario: A non-Go bot exposes HTTP configuration
Given a bot that accepts platform-shaped webhooks and a replaceable API base URL
When configured against Chatwright
Then it can use the same supported Platform Emulator without importing `bots-go-framework`

### AC:studio-works-offline

Scenario: A developer opens Studio without a network connection
Given a local bot, Platform Emulator and result bundle
When the developer uses Playground, records a scenario and inspects a transcript
Then Studio performs those supported workflows without authentication
And unavailable Cloud actions are visibly optional rather than blocking

## Open Questions

- What is the smallest CLI command/config shape that works across in-process Go
  tests and external bot processes?
- Which Cloud connection protocol preserves local ownership, offline continuity
  and explicit upload consent?
- Should IDE/GitHub integration consume a stable result bundle or query a local
  daemon?

---
*This document follows the https://specscore.md/feature-specification*
