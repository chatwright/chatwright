---
format: https://specscore.md/idea-specification
status: Implementing
---

# Idea: Chatwright conversation execution platform

**Status:** Implementing
**Date:** 2026-07-21
**Owner:** alex
**Promotes To:** chatwright, chatwright/agent-implementation-loop, chatwright/ai-driven-testing, chatwright/cloud, chatwright/cloud/intelligence, chatwright/cloud/intelligence/ai-swarm-testing, chatwright/cloud/run, chatwright/conversation-runtime, chatwright/deterministic-testing, chatwright/developer-tooling, chatwright/fuzz-testing, chatwright/manual-emulator, chatwright/marketplace, chatwright/marketplace/community-libraries, chatwright/observability, chatwright/platform-adapters, chatwright/platform-emulators, chatwright/platform-emulators/discord, chatwright/platform-emulators/slack, chatwright/platform-emulators/telegram, chatwright/platform-emulators/telegram/client, chatwright/platform-emulators/telegram/server-api, chatwright/platform-emulators/whatsapp, chatwright/playground, chatwright/scenario-authoring
**Supersedes:** —
**Related Ideas:** —

## Problem Statement

How might conversational-application teams test a real bot as a stateful
conversation—quickly, offline and repeatedly—without binding their scenarios to
one messaging platform or relying on brittle exact-transcript tests for every
kind of behaviour?

## Context

Bot tests commonly stop at handler units or depend on live Telegram/WhatsApp
accounts, public webhooks, network availability and platform rate limits. Those
approaches miss the most failure-prone seam: a platform-shaped update crosses a
real HTTP webhook, application code performs work, and its outbound API calls
become messages, edits and actions in a stateful chat.

Conversational UX also needs two different kinds of confidence. Critical
invariants require deterministic assertions; adaptable natural-language flows
benefit from goal-driven actors and evidence-linked evaluation. Both need the
same environment, transcript, trace and metrics rather than separate test
products.

The current repository already proves a thin path: a Go harness can deliver
Telegram-shaped messages to a real HTTP handler, capture fake Bot API calls and
assert text, actions, edits and latency. Chatwright should turn that proof into
independently useful open-source infrastructure before pursuing managed Cloud
services.

## Recommended Direction

Build Platform Emulators around a platform-neutral conversation environment.
Chatwright emulates the messaging platform; the developer runs and tests the
real bot application. A scenario expresses intent (send text, choose an action,
expect an edit), while the selected emulator owns webhook envelopes, IDs,
callbacks, API responses, restrictions and platform state.

Use Go as the first runtime and API, with real HTTP webhook execution as the
strongest integration mode and direct invocation as an optional narrower mode.
Make the Telegram Platform Emulator, deterministic tests and a local Chatwright
Playground useful first. The Playground consumes the emulator; it does not
replace it. Add a portable structured model and Starlark only after runtime
semantics are stable. Add AI actors as another actor driver—not another execution
engine—and require every AI judgement to point to transcript or state evidence.

Keep the entire local development stack open source under Apache-2.0: Runtime,
CLI, Platform Emulators, Playground and Studio. `bots-go-framework` is the
initial integration and reference adapter source, not a permanent product
boundary. Developers need no account to clone, run, develop, test, inspect or
record locally.

Build optional commercial Cloud services in two areas. Cloud Run provides
managed execution and collaboration infrastructure. Cloud Intelligence provides
managed actors, evaluation, model comparison, AI swarm exploration and an
evidence-driven improvement loop. Add a Marketplace for portable open-source,
community and commercial assets. Hosted services may use Sneat accounts and
integrate with Sneat Work, while Chatwright stays independently usable and
branded.

## Alternatives Considered

- **Platform-specific test kits only.** Faster for one adapter, but scenarios
  leak Telegram mechanics and cannot exercise cross-platform semantics.
- **Direct handler calls only.** Fast but skips HTTP routing, serialisation and
  outbound API behaviour—the seam Chatwright is intended to validate.
- **Record-and-replay as the core.** Useful later, but recordings alone become
  brittle and do not express semantic intent or controlled state.
- **AI-only testing.** Flexible, but inappropriate for permissions, exactly-once
  effects and other invariants; it also makes failures hard to reproduce.
- **Cloud platform first.** Attractive as a business surface but delays the
  standalone developer value and managed jobs are not yet validated.
- **Proprietary Studio.** Creates an artificial gate around local visual work;
  commercial differentiation is stronger in operated infrastructure and
  intelligence.

## MVP Scope

The first product-worthy release is the Telegram Platform Emulator, comprising
its Client Emulator and Server/API Emulator. It supports deterministic and
manual offline Telegram development for multiple private users and bots with:

- real HTTP webhook delivery to an in-process or local bot;
- realistic inbound text updates and a validating fake outbound Bot API;
- stateful message IDs, text messages, inline actions and in-place edits;
- readable transcripts and failure reports;
- chainable text/action/edit assertions with `Within(duration)`;
- per-message latency, size and count metrics with run-level aggregation;
- deterministic draining for work initiated by the webhook;
- CI execution and a documented `bots-go-framework` reference integration;
- Playground access to multiple conversations and actor switching;
- recording actors, messages, actions, timestamps, metrics and platform events
  for selective conversion into reusable scenarios or specifications.

The existing repository is an implementation seed, not evidence that every MVP
item above is production-ready.

## Not Doing (and Why)

- Full Telegram feature parity in the first release—the Telegram Platform
  Emulator supplies a complete local loop for its declared compatibility profile,
  not an inaccurate claim to reproduce every Telegram capability.
- Full WhatsApp execution—the generic model must account for it, while platform
  work follows after the Telegram slice is reliable. The current text adapter is
  experimental groundwork, not a scope commitment.
- Starlark, arbitrary YAML round-tripping or a visual DSL—runtime semantics must
  stabilise first.
- Semantic AI milestones as MVP requirements—initial milestones remain
  deterministic.
- Database-operation metrics—latency, tokens, message size and count come first.
- Hosted collaboration, billing or pricing decisions.
- Cloud Run, Cloud Intelligence and Marketplace implementation; these remain
  product direction rather than MVP scope.

## Key Assumptions to Validate

| Tier | Assumption | How to validate |
|---|---|---|
| Must-be-true | Real HTTP plus a fake outbound API finds failures that handler-unit tests miss without making the suite slow or flaky. | Run the same bot behaviour through unit and Chatwright suites; compare defects found, duration and flake rate. |
| Must-be-true | A useful neutral message/action model can cover Telegram now without encoding Telegram-only concepts. | Map the MVP scenarios to Telegram and a WhatsApp design fixture; record every required platform escape hatch. |
| Must-be-true | Developers can diagnose failures from one transcript/trace without attaching a debugger. | Give failing fixtures to unfamiliar developers; measure time to explain the failure. |
| Should-be-true | The Playground converts exploratory sessions over the same Platform Emulator into maintainable scenarios. | Record five real sessions and assess how much generated output needs manual correction. |
| Might-be-true | Teams will pay for hosted authoring, history and AI evaluation while using the runtime freely. | Interview runtime adopters only after repeat local/CI use is visible. |
| Might-be-true | A useful free Cloud tier can earn voluntary sign-in without gating local use. | Compare repeat-user activation for sync, hosted reports and limited execution. |
| Might-be-true | Community packs and commercial assets compound adoption without fragmenting scenario formats. | Publish one curated pack type and measure reuse, compatibility and maintenance cost. |

## SpecScore Integration

- **Umbrella Feature:** [`chatwright`](../features/chatwright/README.md)
- **First delivery Plan:** [`deterministic-telegram-quick-start`](../plans/deterministic-telegram-quick-start.md)
- **Decisions:** [`spec/decisions`](../decisions/README.md)
- **Investigations:** [`spec/research`](../research/README.md)

## Open Questions

- What named compatibility profile makes the Telegram Platform Emulator useful
  and trustworthy without claiming full Telegram feature parity?
- Which structured scenario representation can support visual authoring without
  promising lossless round-tripping from arbitrary Go or Starlark?
- Which deterministic evidence is sufficient for goal completion before an AI
  evaluator is allowed to contribute a judgement?
- Which managed Cloud job creates the strongest pull after repeat local use?
- Which Marketplace asset should validate the extension and trust model first?

---
*This document follows the https://specscore.md/idea-specification*
