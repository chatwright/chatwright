---
format: https://specscore.md/feature-specification
status: Specifying
---

# Feature: Chatwright

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright?op=request-change) |
**Status:** Specifying
**Source Ideas:** chatwright

## Summary

An independently usable conversation execution platform in which scripted,
human, replay and AI actors drive stateful chats through real bot webhooks, while
platform adapters emulate inbound and outbound messaging mechanics. The same run
produces assertions, transcripts, traces and metrics for local development and CI.

## Contents

| Child | Purpose |
|---|---|
| [conversation-runtime](conversation-runtime/README.md) | Environment, actors, identities, chats, scheduling and run lifecycle |
| [deterministic-testing](deterministic-testing/README.md) | Scripted scenarios, fluent assertions, milestones and CI-safe failure reporting |
| [ai-driven-testing](ai-driven-testing/README.md) | Goal-driven actors, constrained exploration and evidence-linked evaluation |
| [manual-emulator](manual-emulator/README.md) | Offline human interaction, multiple chat panels and scenario recording |
| [scenario-authoring](scenario-authoring/README.md) | Go, structured scenarios, Starlark, hierarchy, inheritance and breakpoints |
| [agent-implementation-loop](agent-implementation-loop/README.md) | Exporting executable specifications to coding agents and tracking outcomes |
| [observability](observability/README.md) | Transcript, trace, metrics, failure comparison and redaction |
| [platform-adapters](platform-adapters/README.md) | Neutral model, Telegram fidelity, WhatsApp architecture and future platforms |
| [developer-tooling](developer-tooling/README.md) | CLI, local runner, CI, IDE/GitHub integration and hosted Studio boundary |

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
same environment; no actor type bypasses platform delivery.

### Intent inside, mechanics at the edge

Scenarios express conversational intent. Platform adapters express platform
mechanics. Generic assertions cover text, message types and semantic actions;
adapter-specific assertions remain available when platform behaviour matters.

### Strong and narrow execution modes

Real HTTP webhook delivery is the strongest and preferred integration mode.
Direct transport invocation may trade fidelity for speed in narrower tests, but
results must clearly identify the mode used.

### Product layers

The core Go runtime, deterministic engine, adapters, transcript model, CLI and a
basic local emulator are candidates for open source. Hosted authoring,
collaboration, run history and AI execution may become commercial services.
Those boundaries remain revisable, but the open runtime must not depend on Sneat
accounts or `sneat.work`.

## Dependencies

- Initial integration with `bots-go-framework` and its platform adapters.
- Platform API research recorded under [`spec/research`](../../research/README.md).
- The open-source/hosted boundary decisions in [`spec/decisions`](../../decisions/README.md).

## Acceptance Criteria

### AC: one-runtime-across-actor-types

Scenario: A conversation changes driver
Given the same environment, bot, platform identity and chat
When a scripted actor is replaced by a human or AI actor
Then actions still traverse the simulated platform and bot webhook
And transcript, trace and metrics retain the same schema

### AC: scenarios-separate-intent-from-mechanics

Scenario: A neutral scenario runs on an adapter
Given a scenario that sends text and chooses a semantic action
When it runs on a supported platform
Then the scenario contains no platform wire fields
And the adapter supplies the platform-specific update and outbound API mechanics

### AC: runtime-remains-independent

Scenario: The open runtime is used outside Sneat
Given a bot project with no Sneat account or application dependencies
When its webhook and platform API base URL are configured for Chatwright
Then its supported scenarios can run locally and in CI

## Open Questions

- Which parts of the basic emulator must be open source to keep the runtime
  genuinely independently useful?
- Does a single environment own several platform clocks, or one shared logical
  clock with adapter-specific timestamps?

---
*This document follows the https://specscore.md/feature-specification*
