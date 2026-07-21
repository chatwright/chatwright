---
format: https://specscore.md/feature-specification
status: Draft
---

# Feature: Developer tooling and Studio

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/developer-tooling?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/developer-tooling?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/developer-tooling?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/developer-tooling?op=request-change) |
**Status:** Draft
**Source Ideas:** chatwright

## Summary

The CLI, local runner, CI contract, editor integrations and later hosted Studio
that make Chatwright usable from first local conversation to team-wide run history.

## Problem

A capable runtime still fails as a product if setup is framework-specific,
failures require bespoke scripts and CI evidence cannot be revisited. At the
same time, building a hosted dashboard before local use is dependable would
front-load complexity and couple the open runtime to an account system.

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

### Connected Studio

The later Studio connects hierarchy, live emulator, authoring and run inspector
rather than presenting separate dashboards. A user can move from a failing tree
node to its transcript, reproduce it manually, refine assertions and export an
implementation task while retaining scenario/run identity.

### Hosted boundary

Hosted execution, team collaboration, dashboards, run history, AI evaluation at
scale and organisation integrations may be commercial. Sneat accounts and
`sneat.work` integration are hosted conveniences, never runtime prerequisites.

## Dependencies

- [manual-emulator](../manual-emulator/README.md)
- [scenario-authoring](../scenario-authoring/README.md)
- [observability](../observability/README.md)

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
When they navigate to the run inspector and emulator
Then the selected workspace, scenario, run and actors remain identifiable

### AC:framework-integration-is-not-hard-boundary

Scenario: A non-Go bot exposes HTTP configuration
Given a bot that accepts platform-shaped webhooks and a replaceable API base URL
When configured against Chatwright
Then it can use the same supported adapter without importing `bots-go-framework`

## Open Questions

- What is the smallest CLI command/config shape that works across in-process Go
  tests and external bot processes?
- Which hosted features are valuable enough to fund the project without
  weakening the open-source local workflow?
- Should IDE/GitHub integration consume a stable result bundle or query a local
  daemon?

---
*This document follows the https://specscore.md/feature-specification*
