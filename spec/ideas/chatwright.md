---
format: https://specscore.md/idea-specification
status: Implementing
---

# Idea: Chatwright conversation execution platform

**Status:** Implementing
**Date:** 2026-07-21
**Owner:** alex
**Promotes To:** chatwright, chatwright/agent-implementation-loop, chatwright/ai-driven-testing, chatwright/conversation-runtime, chatwright/deterministic-testing, chatwright/developer-tooling, chatwright/manual-emulator, chatwright/observability, chatwright/platform-adapters, chatwright/scenario-authoring
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
independently useful open-source infrastructure before pursuing a hosted Studio.

## Recommended Direction

Build a platform-neutral conversation environment around adapter-owned platform
mechanics. A scenario expresses intent (send text, choose an action, expect an
edit); a Telegram or future WhatsApp adapter owns webhook envelopes, IDs,
callbacks, API responses and restrictions.

Use Go as the first runtime and API, with real HTTP webhook execution as the
strongest integration mode and direct invocation as an optional narrower mode.
Make deterministic tests and a local human-controlled emulator useful first.
Add a portable structured model and Starlark only after the runtime semantics are
stable. Add AI actors as another actor driver—not another execution engine—and
require every AI judgement to point to transcript or state evidence.

Keep the runtime open source and independent of Sneat application architecture.
`bots-go-framework` is the initial integration and reference adapter source, not
a permanent product boundary. A later hosted service may use Sneat accounts and
integrate with `sneat.work`, but the runtime must remain usable without either.

## Alternatives Considered

- **Platform-specific test kits only.** Faster for one adapter, but scenarios
  leak Telegram mechanics and cannot exercise cross-platform semantics.
- **Direct handler calls only.** Fast but skips HTTP routing, serialisation and
  outbound API behaviour—the seam Chatwright is intended to validate.
- **Record-and-replay as the core.** Useful later, but recordings alone become
  brittle and do not express semantic intent or controlled state.
- **AI-only testing.** Flexible, but inappropriate for permissions, exactly-once
  effects and other invariants; it also makes failures hard to reproduce.
- **Hosted Studio first.** Visually attractive but delays the standalone
  developer value and forces UI decisions before runtime semantics settle.

## MVP Scope

The first product-worthy release supports deterministic, offline Telegram tests
for multiple private users and bots with:

- real HTTP webhook delivery to an in-process or local bot;
- realistic inbound text updates and a validating fake outbound Bot API;
- stateful message IDs, text messages, inline actions and in-place edits;
- readable transcripts and failure reports;
- chainable text/action/edit assertions with `Within(duration)`;
- per-message latency, size and count metrics with run-level aggregation;
- deterministic draining for work initiated by the webhook;
- CI execution and a documented `bots-go-framework` reference integration.

The existing repository is an implementation seed, not evidence that every MVP
item above is production-ready.

## Not Doing (and Why)

- Full Telegram emulation in the first release—narrow fidelity beats a broad,
  inaccurate clone.
- Full WhatsApp execution—the generic model must account for it, while platform
  work follows after the Telegram slice is reliable. The current text adapter is
  experimental groundwork, not a scope commitment.
- Starlark, arbitrary YAML round-tripping or a visual DSL—runtime semantics must
  stabilise first.
- Semantic AI milestones as MVP requirements—initial milestones remain
  deterministic.
- Database-operation metrics—latency, tokens, message size and count come first.
- Hosted collaboration, billing or final licensing/pricing decisions.

## Key Assumptions to Validate

| Tier | Assumption | How to validate |
|---|---|---|
| Must-be-true | Real HTTP plus a fake outbound API finds failures that handler-unit tests miss without making the suite slow or flaky. | Run the same bot behaviour through unit and Chatwright suites; compare defects found, duration and flake rate. |
| Must-be-true | A useful neutral message/action model can cover Telegram now without encoding Telegram-only concepts. | Map the MVP scenarios to Telegram and a WhatsApp design fixture; record every required platform escape hatch. |
| Must-be-true | Developers can diagnose failures from one transcript/trace without attaching a debugger. | Give failing fixtures to unfamiliar developers; measure time to explain the failure. |
| Should-be-true | The manual emulator converts exploratory sessions into maintainable scenarios. | Record five real sessions and assess how much generated output needs manual correction. |
| Might-be-true | Teams will pay for hosted authoring, history and AI evaluation while using the runtime freely. | Interview runtime adopters only after repeat local/CI use is visible. |

## SpecScore Integration

- **Umbrella Feature:** [`chatwright`](../features/chatwright/README.md)
- **First delivery Plan:** [`deterministic-telegram-quick-start`](../plans/deterministic-telegram-quick-start.md)
- **Decisions:** [`spec/decisions`](../decisions/README.md)
- **Investigations:** [`spec/research`](../research/README.md)

## Open Questions

- What minimum fidelity makes the Telegram adapter trustworthy without turning
  Chatwright into a complete platform clone?
- Which structured scenario representation can support visual authoring without
  promising lossless round-tripping from arbitrary Go or Starlark?
- Which deterministic evidence is sufficient for goal completion before an AI
  evaluator is allowed to contribute a judgement?
- Where should the basic local emulator sit across the open-source/hosted
  boundary?

---
*This document follows the https://specscore.md/idea-specification*
