---
format: https://specscore.md/idea-specification
status: Specifying
---

# Idea: Test conversational engines without a messenger platform

**Status:** Specifying
**Date:** 2026-07-22
**Owner:** alex
**Promotes To:** chatwright/conversation-runtime/headless-engine-harness
**Supersedes:** —
**Related Ideas:** extends:chatwright

## Problem Statement

How might Chatwright test a real conversational AI engine quickly and
branchably without routing every scenario through Telegram or another messenger,
while making it impossible to mistake headless evidence for platform-level
proof?

## Context

Chatwright's Platform Emulators provide valuable end-to-end fidelity: they shape
updates, deliver webhooks, assign message IDs and validate outbound platform API
calls. Those mechanics are unnecessary when the behavior under investigation is
inside a conversational engine—prompt routing, typed actions, tool selection,
memory, policy, handoff and application-state effects.

The Listus plan already uses a fast direct-conversation rung before a Telegram
webhook gate. Generalizing that rung would make the same runtime useful for AI
conversational engines which have no underlying messenger at all, as well as for
bot applications which want fast diagnostic coverage beneath their platform
adapter.

The risk is dishonest equivalence. A direct invocation cannot prove webhook
serialization, callbacks, platform restrictions, delivery semantics or message
edits. Chatwright must retain strong, named execution profiles rather than
silently treating every conversation as a simulated messenger chat.

## Recommended Direction

Add a headless conversational-engine endpoint to the shared Conversation
Runtime. A scenario sends semantic actor events directly to an in-process or
HTTP engine and observes a stream of semantic engine events:

- assistant messages and streaming completion boundaries;
- typed actions, commands and handoffs;
- tool requests, results and failures;
- memory/context updates and registered application work;
- errors, refusals, usage and timing.

The runtime owns actors, conversations, scheduling, checkpoints, evidence and
state holders in every profile. The selected endpoint owns transport. A
platform-emulated profile routes the event through the actual webhook and fake
platform API; a headless profile routes it through the declared engine contract.

### Two-rung verification

Portable, platform-neutral scenarios should be reusable across two rungs where
the product supports both:

1. **Headless/direct:** fast engine and application behavior.
2. **Platform-emulated:** platform serialization, webhook, API and delivery
   behavior.

Evidence names the profile, adapter and capabilities. SpecScore bindings may
require one or both modes. A headless pass never satisfies a platform-required
binding, while a product with no messenger can legitimately require only the
headless profile.

### AI-aware evidence and branching

Exact text is only one possible assertion. Scenarios may assert required facts,
forbidden claims, typed actions, tool parameters, deterministic state, goal
completion, policy constraints and latency/token/cost budgets. AI evaluation is
labelled as judgement and points to the turns or state it used.

Every run records available reproducibility inputs such as engine version,
prompt/configuration revision, provider/model, temperature, seed and tool
catalog. Unsupported provider controls are declared rather than fabricated.

From one application/conversation checkpoint, sibling branches can test
different user replies, prompt/model configurations, tool outcomes and policy
conditions. Database state can branch through the existing holder contract;
conversation memory or engine process state participates only after it has an
explicit holder/snapshot implementation, otherwise the engine is recreated and
the prefix replayed.

## Alternatives Considered

- **Require a Platform Emulator for every run.** Rejected because it adds
  mechanics and latency which do not exist for standalone engines and obscures
  engine-level failure diagnosis.
- **Call headless mode a fake messaging platform.** Rejected because it gives
  synthetic IDs/delivery semantics undeserved product meaning.
- **Create a separate AI-engine testing product.** Rejected because actors,
  scenarios, branching, assertions, evidence and Studio inspection are already
  shared Chatwright concerns.
- **Use only unit tests around prompt functions.** Useful internally but
  insufficient for multi-turn state, real tool calls, registered application
  work and evidence-linked evaluation.
- **Snapshot full model responses.** Rejected as the default because natural
  language variation makes exact transcripts brittle; deterministic invariants
  and bounded semantic evaluation are more honest.
- **Treat headless and Telegram passes as interchangeable.** Rejected because it
  hides the very integration gaps Platform Emulators exist to reveal.

## MVP Scope

- One versioned semantic engine endpoint contract.
- In-process Go adapter first, with HTTP as the next transport realization.
- User text/action input and assistant message/typed-action/tool-call output.
- Turn settlement, timeout, cancellation and structured error semantics.
- Scripted actors, deterministic assertions and DTQL application-state checks.
- Model/prompt/tool-profile provenance plus transcript and trace evidence.
- The same neutral Listus or conversational-engine scenario runnable in direct
  and Telegram-emulated profiles, with distinct evidence.
- Sequential branches which recreate an engine from the checkpoint state and
  replay prefix events when engine memory cannot be snapshotted.

## Not Doing (and Why)

- Claiming platform fidelity from direct execution.
- Requiring an LLM—deterministic rule-based engines are valid endpoints.
- A universal provider abstraction which erases model-specific capabilities.
- Exact replay of opaque hosted-model internals.
- Automatic branching of process memory, caches or model-provider sessions.
- Replacing focused engine unit tests or platform-emulated release gates.
- Mandating AI evaluation where deterministic state or typed output can prove the
  requirement.

## Key Assumptions to Validate

| Tier | Assumption | How to validate |
|---|---|---|
| Must-be-true | A stable semantic event contract can serve direct and platform-emulated profiles without leaking Telegram wire fields into scenarios. | Run one neutral scenario through both paths and record every profile-specific escape hatch. |
| Must-be-true | Headless execution materially shortens diagnosis without changing product behavior under test. | Compare duration and failure localization for equivalent engine and Telegram-emulated suites. |
| Must-be-true | Evidence prevents a headless pass from being mistaken for platform proof. | Bind one AC to both modes and verify SpecScore remains partial until the platform case passes. |
| Should-be-true | Typed actions and deterministic state assertions cover most valuable engine invariants better than exact text. | Convert several conversational-engine regressions and measure how often semantic AI evaluation is still required. |
| Should-be-true | Recreate-and-replay is sufficient before engine-memory snapshots exist. | Branch a multi-turn Listus/AI journey repeatedly and compare state, runtime and flake rate. |
| Might-be-true | Standalone conversational-engine teams adopt Chatwright without using a messenger emulator. | Publish one framework-neutral HTTP example and observe independent usage. |

## SpecScore Integration

- **Feature:** [Headless conversational-engine harness](../features/chatwright/conversation-runtime/headless-engine-harness/README.md)
- **Shared runtime:** [Conversation runtime](../features/chatwright/conversation-runtime/README.md)
- **Evidence binding:** [SpecScore verification bindings](../features/chatwright/developer-tooling/specscore-verification-bindings/README.md)
- **State proof:** [DTQL data-state assertions](../features/chatwright/deterministic-testing/data-state-assertions/README.md)

## Open Questions

- What is the smallest semantic event set which supports text, actions,
  streaming, tool calls and handoffs without becoming an agent-protocol clone?
- Does the HTTP realization use Chatwright's own envelope, an existing engine
  protocol or application-provided codecs around the semantic contract?
- Which turn-completion signal is mandatory when an engine can stream, schedule
  background work or request several tools?
- How should model/prompt variants become branch inputs without embedding secret
  provider configuration in portable scenarios?

---
*This document follows the https://specscore.md/idea-specification*
