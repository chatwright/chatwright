---
format: https://specscore.md/feature-specification
status: Draft
---

# Feature: Headless conversational-engine harness

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/conversation-runtime/headless-engine-harness?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/conversation-runtime/headless-engine-harness?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/conversation-runtime/headless-engine-harness?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/conversation-runtime/headless-engine-harness?op=request-change) |
**Status:** Draft
**Source Ideas:** headless-conversational-engine-testing

## Summary

Exercise a real conversational engine directly through a versioned semantic
endpoint, retaining Chatwright actors, scenarios, branching, assertions and
evidence without inventing a messenger platform or claiming platform fidelity.

## Problem

Platform-emulated webhook execution is the strongest proof for a messenger bot,
but it adds irrelevant mechanics when testing prompt routing, typed actions,
tools, memory and application state—or when the conversational product has no
messenger at all. Ad hoc direct handler tests are fast but do not share
Chatwright's multi-turn lifecycle, state checkpoints, evidence or scenario
identity, and can be mistaken for end-to-end coverage.

## Behavior

### Semantic engine endpoint

A headless endpoint accepts semantic actor events with conversation/actor
identity and declared input such as text or an action. It returns ordered engine
events such as:

- assistant message start/chunks/completion;
- typed action, command or handoff;
- tool request, result correlation and tool error;
- registered application work and state event;
- refusal, engine error, usage and terminal turn state.

The contract is versioned and capability-discoverable. An adapter rejects an
unsupported input/output capability before silently flattening it to text.
Product-specific extensions remain namespaced and visible in evidence.

The first realization is an in-process Go adapter. An HTTP realization maps an
application protocol to the same semantic contract through an explicit codec;
the feature does not require every engine to adopt one wire envelope.

### Conversation and settlement lifecycle

The shared runtime owns actor/conversation identity, inputs, transcript,
scheduling, cancellation, assertions and registered state holders. The endpoint
owns engine invocation. A turn settles only after a declared terminal event and
all registered application work for that turn has completed. Stream chunks are
evidence but do not individually satisfy a final-message assertion unless the
assertion explicitly targets streaming behavior.

Missing terminal events, uncorrelated tool results and work continuing after the
safety timeout fail with the pending events and endpoint state visible.

### Honest execution profiles

Every result identifies `headless`/`direct` mode, endpoint adapter, engine and
capabilities. It never creates synthetic Telegram message IDs, callback queries
or delivery claims. A neutral scenario may also run through a Platform Emulator,
but results and SpecScore bindings remain mode-specific.

A headless pass can prove engine/application behavior. It cannot satisfy a
binding which requires webhook, platform API, delivery, edit or other
platform-emulated evidence.

### Assertions and AI provenance

Supported assertions cover messages, required/forbidden facts, typed actions,
tool calls/parameters, handoffs, errors, usage/timing and registered application
state. Deterministic evidence takes configured precedence over an AI evaluator
when both address the same invariant.

Evidence records available engine and prompt/configuration revision,
provider/model, temperature, seed, tool catalog and evaluator identity. A
provider which cannot honor a seed or deterministic mode reports that limitation
rather than claiming reproducibility.

### Checkpoints and branches

Database/application state branches through registered state holders. If the
engine exposes a safe memory snapshot holder, it may join the checkpoint group.
Otherwise each branch receives a fresh engine instance and replays the qualified
conversation prefix against the branched application state. Evidence declares
snapshot versus replay, replayed events and effective engine configuration.

Opaque provider sessions and live process memory are never assumed clonable.

## Dependencies

- [Conversation runtime](../README.md)
- [Deterministic testing](../../deterministic-testing/README.md)
- [AI-driven testing](../../ai-driven-testing/README.md)
- [State branching](../../state-branching/README.md)
- [Conversation observability](../../observability/README.md)

## Acceptance Criteria

### AC:headless-run-needs-no-platform

Scenario: A conversational engine has no messenger integration
Given an in-process endpoint supporting semantic text and assistant messages
When a scripted actor completes a multi-turn scenario
Then the run uses no Platform Emulator, webhook or platform API
And retains normal Chatwright transcript, assertions, metrics and cleanup

### AC:typed-engine-events-remain-structured

Scenario: An engine requests a Listus add-item action
Given the endpoint declares typed-action support
When the engine emits the action with item parameters
Then Chatwright records and asserts the action and parameters structurally
And does not infer them only from assistant prose

### AC:turn-settles-after-registered-work

Scenario: An assistant response schedules an application database write
Given the endpoint emits its terminal turn event before the write completes
When Chatwright waits for the turn to settle
Then it also drains the registered application work
And a following DTQL assertion observes the committed state

### AC:stream-is-correlated-to-final-message

Scenario: An engine streams several assistant chunks
Given all chunks share one response identity
When the endpoint emits completion
Then the transcript preserves the chunks and one assembled semantic message
And final-message assertions do not pass before completion

### AC:headless-proof-does-not-satisfy-platform-mode

Scenario: An acceptance criterion requires direct and Telegram evidence
Given the neutral scenario passes through the headless endpoint only
When verification status is computed
Then the direct binding can pass
And the criterion remains partial until the Telegram-emulated case passes

### AC:unsupported-capability-fails-explicitly

Scenario: A scenario sends an action unsupported by an engine endpoint
Given capability discovery reports text-only input
When the action case is validated
Then execution does not flatten the action into guessed text
And the result identifies the unsupported input capability

### AC:branch-replay-is-declared

Scenario: Engine memory cannot be snapshotted at a checkpoint
Given the application database can branch
When two sibling conversations start from that checkpoint
Then each uses a fresh engine and the qualified prefix is replayed
And evidence distinguishes replayed conversation state from branched database
state

### AC:model-provenance-is-honest

Scenario: A hosted model does not support deterministic seeds
Given a scenario requests the provider's supported configuration
When the run result is written
Then it records provider/model and effective sampling configuration
And does not claim seeded reproducibility

## Open Questions

- Are tool request/result events part of the minimum endpoint contract or an
  optional capability layered over messages and typed actions?
- Does an HTTP adapter expose standardized discovery or rely on local
  configuration plus a product codec?
- How should conversation-prefix replay avoid repeating irreversible external
  tool effects when those tools are not registered state holders?
- Which semantic fact assertion belongs in deterministic testing versus an AI
  evaluator plugin?

---
*This document follows the https://specscore.md/feature-specification*
