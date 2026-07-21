---
format: https://specscore.md/feature-specification
status: Specifying
---

# Feature: Chatwright

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright?op=request-change) |
**Status:** Specifying
**Source Ideas:** chatwright

## Summary

An independently usable product that emulates messaging platforms locally so
scripted, human, replay and AI actors can exercise real bot applications through
their actual webhooks and platform API clients. The same run produces assertions,
transcripts, traces and metrics for local development and CI.

## Contents

| Child | Purpose |
|---|---|
| [platform-emulators](platform-emulators/README.md) | Local messaging platforms; Telegram MVP plus planned WhatsApp, Slack and Discord emulators |
| [conversation-runtime](conversation-runtime/README.md) | Environment, actors, identities, chats, scheduling and run lifecycle |
| [deterministic-testing](deterministic-testing/README.md) | Scripted scenarios, fluent assertions, milestones and CI-safe failure reporting |
| [ai-driven-testing](ai-driven-testing/README.md) | Goal-driven actors, constrained exploration and evidence-linked evaluation |
| [playground](playground/README.md) | Offline manual interaction, multiple chat panels, inspection and scenario recording |
| [scenario-authoring](scenario-authoring/README.md) | Go, structured scenarios, Starlark, hierarchy, inheritance and breakpoints |
| [agent-implementation-loop](agent-implementation-loop/README.md) | Exporting executable specifications to coding agents and tracking outcomes |
| [observability](observability/README.md) | Transcript, trace, metrics, failure comparison and redaction |
| [developer-tooling](developer-tooling/README.md) | CLI, local runner, CI, IDE/GitHub integration and hosted Studio boundary |

## Compatibility paths (not product hierarchy)

Approved decisions link to the historical
[`manual-emulator`](manual-emulator/README.md) and
[`platform-adapters`](platform-adapters/README.md) paths. They remain as
redirecting specification records; current product scope belongs to Playground
and Platform Emulators respectively.

## Problem

Testing one bot behaviour currently requires teams to choose between fast but
unrealistic handler tests and slow, network-dependent manual platform tests.
Meanwhile manual conversation design, deterministic assertions and AI UX
exploration tend to create separate artefacts that drift. Chatwright needs one
execution model that is realistic at platform boundaries, deterministic where
required and open to different actor drivers and authoring formats.

## Behavior

### One environment, multiple drivers

An environment owns bots, users, platform identities, chats, simulated platform
state, application dependencies, scheduling, transcripts and metrics for one
isolated run. Scripted, human, replay and AI actors produce actions through the
same environment and Platform Emulator; no actor type bypasses platform delivery.

### The platform is emulated; the bot is real

Chatwright simulates the messaging platform as users, applications and bots
observe it. The bot under development remains the real software under test: it
receives emulator-generated platform updates and makes real HTTP calls to the
emulator's bot-facing API. The Playground is a consumer of this environment, not
the emulator itself.

### Intent inside, mechanics at the edge

Scenarios express conversational intent. Platform Emulator internals own
platform mechanics. Generic assertions cover text, message types and semantic
actions; platform-specific assertions remain available when behaviour matters.

### Strong and narrow execution modes

Real HTTP webhook delivery is the strongest and preferred integration mode.
Direct transport invocation may trade fidelity for speed in narrower tests, but
results must clearly identify the mode used.

### Product layers

The core Go runtime, deterministic engine, Platform Emulators, transcript model,
CLI and a useful local Playground are candidates for open source. Hosted
authoring, collaboration, run history and AI execution may become commercial
services. Those boundaries remain revisable, but the open runtime must not
depend on Sneat accounts or `sneat.work`.

## Dependencies

- [Platform Emulators](platform-emulators/README.md), with Telegram as the MVP.
- Initial integration with `bots-go-framework` and its replaceable platform clients.
- Platform API research recorded under [`spec/research`](../../research/README.md).
- The open-source/hosted boundary decisions in [`spec/decisions`](../../decisions/README.md).

## Acceptance Criteria

### AC: one-runtime-across-actor-types

Scenario: A conversation changes driver
Given the same environment, real bot, Platform Emulator, identity and chat
When a scripted actor is replaced by a human or AI actor
Then actions still traverse the same simulated platform and real bot webhook
And transcript, trace and metrics retain the same schema

### AC: scenarios-separate-intent-from-mechanics

Scenario: A neutral scenario runs on a Platform Emulator
Given a scenario that sends text and chooses a semantic action
When it runs on a supported platform
Then the scenario contains no platform wire fields
And the emulator supplies the platform-specific update and outbound API mechanics

### AC: product-boundary-is-explicit

Scenario: A developer starts an offline bot session
Given Chatwright, a Telegram Platform Emulator and the developer's bot are local
When the conversation runs
Then documentation and evidence identify Telegram as the emulated system
And identify the developer's real bot as the software under test

### AC: runtime-remains-independent

Scenario: The open runtime is used outside Sneat
Given a bot project with no Sneat account or application dependencies
When its webhook and platform API base URL are configured for Chatwright
Then its supported scenarios can run locally and in CI

## Open Questions

- Which parts of the Platform Emulators and Playground must be open source to
  keep the local product genuinely independently useful?
- Does a single environment own several platform clocks, or one shared logical
  clock with emulator-specific timestamps?

---
*This document follows the https://specscore.md/feature-specification*
