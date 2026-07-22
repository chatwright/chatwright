---
format: https://specscore.md/feature-specification
status: Specifying
---

# Feature: Chatwright

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright?op=request-change) |
**Status:** Specifying
**Source Ideas:** chatwright

## Summary

An open, local-first conversation development platform that emulates messaging
platforms so scripted, human, replay and AI actors can exercise real bot
applications through their actual webhooks and platform API clients. Systems
without a messenger boundary run through explicitly declared endpoint profiles
(headless engine today; see decision
[0008](../../decisions/0008-declared-endpoint-profiles.md)), whose evidence is
never interchangeable with platform-emulated evidence. Optional Cloud services
add managed execution, collaboration and intelligence without becoming a
prerequisite for local development.

## Contents

| Child | Purpose |
|---|---|
| [platform-emulators](platform-emulators/README.md) | Local messaging platforms; Telegram MVP plus a planned WhatsApp emulator (further platforms via the roadmap's later options) |
| [conversation-runtime](conversation-runtime/README.md) | Environment, actors, identities, chats, scheduling and run lifecycle |
| [agent-harnesses](agent-harnesses/README.md) | Controlled MCP tool-boundary testing (draft); batch/terminal agent-CLI adapters parked as an idea |
| [deterministic-testing](deterministic-testing/README.md) | Scripted scenarios, fluent assertions, milestones and CI-safe failure reporting |
| [ai-driven-testing](ai-driven-testing/README.md) | Goal-driven actors, constrained exploration and evidence-linked evaluation |
| [goal-driven-ai-testing](goal-driven-ai-testing/README.md) | Goal-and-task AI campaigns that explore a bot autonomously, verify state via data assertions and return evidence-backed reports |
| [fuzz-testing](fuzz-testing/README.md) | Seeded input, event-order and timing mutation plus AI-generated conversational perturbations |
| [observation-model](observation-model/README.md) | Actor-neutral projection of visible messages, generic actions, observation lineage and journey context shared by every actor |
| [playground](playground/README.md) | Offline manual interaction, multiple chat panels, inspection and scenario recording |
| [scenario-authoring](scenario-authoring/README.md) | Go, structured scenarios, Starlark, hierarchy, inheritance and breakpoints |
| [state-branching](state-branching/README.md) | Named database-state checkpoints, isolated scenario continuations and replay fallback |
| [agent-implementation-loop](agent-implementation-loop/README.md) | Exporting executable specifications to coding agents and tracking outcomes |
| [observability](observability/README.md) | Transcript, trace, metrics, failure comparison and redaction |
| [developer-tooling](developer-tooling/README.md) | Open-source CLI, local runner, CI, IDE integrations and offline-capable Studio |
| [cloud](cloud/README.md) | Optional managed infrastructure and intelligence, with a useful free-account path |
| [marketplace](marketplace/README.md) | Open-source, community and commercial reusable conversation-development assets |

## Compatibility paths (not product hierarchy)

Approved decisions link to the historical
[`manual-emulator`](manual-emulator/README.md) and
[`platform-adapters`](platform-adapters/README.md) paths. They remain as
redirecting specification records; current product scope belongs to Playground
and Platform Emulators respectively.

## Problem

Testing conversational behavior currently forces teams to assemble different
harnesses for direct engines, AI-agent processes and messenger bots, or to choose
between fast but narrow handler tests and slow network-dependent manual tests.
Meanwhile manual conversation design, deterministic assertions and AI UX
exploration tend to create separate artefacts that drift. Chatwright needs one
execution model with explicit fidelity profiles, deterministic evidence where
required and support for different actor, endpoint and authoring formats.

## Behavior

### One environment, multiple drivers

An environment owns systems under test, users, optional platform identities,
conversations/chats, endpoint state, application dependencies, scheduling,
transcripts and metrics for one isolated run. Scripted, human, replay and AI
actors produce semantic actions through the same environment. Within a
platform-emulated run no actor type bypasses platform delivery; a headless or
agent-harness run uses its explicitly declared endpoint instead.

### Messenger platforms are optional execution boundaries

A conversational product may expose an in-process/HTTP engine, a batch process,
an interactive terminal, a structured session endpoint or a messenger webhook.
Chatwright shares actors, scenarios, assertions, branching and evidence across
those profiles while each adapter owns its transport-specific mechanics.

Passing evidence always names its profile and capabilities. Direct/headless
evidence cannot satisfy a platform requirement, and a product with no messenger
does not need to pretend one exists.

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

For a messenger bot, real HTTP webhook delivery through a Platform Emulator is
the strongest and preferred platform-integration mode. Direct engine, structured
process/session and PTY modes provide different speed, observability and fidelity
for their declared systems under test. Results identify the exact profile and do
not rank unlike capabilities as interchangeable.

### Open local stack, optional closed services

Everything required for local development is open source under Apache-2.0:
Runtime, CLI, Platform Emulators, Playground and Studio. A developer can clone
Chatwright, develop and test bots, emulate platforms, inspect transcripts,
record scenarios and run deterministic suites without an account or network.

Commercial value comes from the operated Cloud service: managed capacity,
retained history, collaboration, organisations and intelligence at scale. Cloud
service implementations may remain closed, but they consume portable scenarios
and results rather than redefining them. Sneat authentication and `sneat.work`
integration are optional hosted conveniences, never Chatwright dependencies.

## Dependencies

- [Platform Emulators](platform-emulators/README.md), with Telegram as the MVP.
- Initial integration with `bots-go-framework` and its replaceable platform clients.
- Platform API research recorded under [`spec/research`](../../research/README.md).
- The open-source/hosted boundary decisions in [`spec/decisions`](../../decisions/README.md).

## Acceptance Criteria

### AC: one-runtime-across-actor-types

Scenario: A conversation changes driver
Given the same environment, endpoint profile, identity and conversation
When a scripted actor is replaced by a human or AI actor
Then actions still traverse the same declared endpoint
And transcript, trace and metrics retain the same semantic schema

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

### AC: complete-local-workflow-needs-no-account

Scenario: A developer evaluates Chatwright entirely offline
Given a clone containing the supported Runtime, CLI, Platform Emulator,
Playground and Studio
When the developer builds a bot, interacts with it, records a scenario, runs
deterministic tests and inspects the resulting transcript
Then every activity completes without a Chatwright Cloud or Sneat account
And cloud-only capabilities are presented as optional enhancements

### AC: execution-profile-is-not-overclaimed

Scenario: A neutral behavior passes through a headless engine
Given no messenger webhook or Platform Emulator participated
When Chatwright publishes the result
Then it identifies the headless endpoint and supported capabilities
And cannot satisfy an acceptance binding which requires Telegram or WhatsApp
evidence

## Open Questions

- Does a single environment own several platform clocks, or one shared logical
  clock with emulator-specific timestamps?
- Which portable extension contract lets local tools, Cloud and Marketplace
  assets interoperate without making the Cloud implementation public?

---
*This document follows the https://specscore.md/feature-specification*
