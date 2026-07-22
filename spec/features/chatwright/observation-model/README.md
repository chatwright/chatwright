---
format: https://specscore.md/feature-specification
status: Draft
---

# Feature: Observation Model

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/observation-model?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/observation-model?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/observation-model?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/observation-model?op=request-change) |

**Status:** Draft
**Source Ideas:** observation-model

## Summary

Provide one platform-neutral description of the user-visible conversational
world to every Chatwright actor. The model carries visible messages, generic
actions, observation lineage, structured changes and relevant journey context;
it excludes messenger transport and callback implementation details.

The working serialisation is YAML with Markdown in text fields. The semantic
contract is independent of whether an actor is human, scripted, AI-driven,
replaying a recording, driving a bot or introduced later.

## Feature Hierarchy

| Child | Stage | Purpose |
|---|---|---|
| [visible-conversation](visible-conversation/README.md) | Draft | Stable logical messages, Markdown content, ordering, links, replies and media |
| [actor-actions](actor-actions/README.md) | Draft | Generic available actions, actor proposals, resolution and validation |
| [observation-lineage](observation-lineage/README.md) | Draft | Observation IDs, predecessor links, explicit changes and stale-action handling |
| [observation-context](observation-context/README.md) | Draft core; future journey depth | Semantic history window, summaries, goals, milestones and relevant facts |

### Capability Map

~~~text
Observation Model
├── Visible Conversation
│   ├── Stable Message Identity and Revisions
│   ├── Normalised Markdown
│   ├── Chronological Conversation Ordering
│   └── Links, Replies and Media
├── Actor Actions
│   ├── Generic Action Catalogue
│   ├── Actor Action Proposals
│   └── Runtime Validation and Platform Resolution
├── Observation Lineage
│   ├── Observation Identity and Predecessor
│   ├── Structured Change Feed
│   └── Staleness and Concurrent Intent
└── Observation Context
    ├── Complete Recent Turns and Current Actions
    ├── History Summary and Journey Memory
    └── Goals, Persona, Milestones and Relevant Facts
~~~

## Product Contract

- All actor types receive the same semantic observation contract.
- Platform-native callback data, webhook payloads, API requests and internal
  messenger IDs are absent from the actor-facing model.
- Messages have stable logical identity and monotonic revision across edits.
- Message/action IDs are synthetic Chatwright IDs shared by the observation and
  visual representation, with an internal resolver back to authoritative
  Platform Emulator state; raw platform details stay outside actor input and
  are available on demand in an authorised developer inspector.
- Observations have identity; later observations can reference a predecessor.
- Changes are stated explicitly so actors are not required to diff snapshots.
- Text is normalised to Markdown rather than raw Telegram HTML or MarkdownV2.
- Conversation content is chronological, oldest to newest, and windowing
  preserves complete turns, complete responses and current visible actions.
- Actions use opaque Chatwright IDs plus user-visible semantics. Actors submit
  generic proposals tied to the observation in which the action appeared.
- Chatwright validates action existence, currentness, revisions, availability,
  permissions and platform semantics before executing anything.
- Goals and journey facts are actor-neutral context, not a special AI prompt.
- Raw platform evidence remains separately available to developers for
  diagnostics and fidelity testing; it is not embedded into actor observations
  or passed to AI/automation tools acting on chat events.

## Architecture Notes

The Observation Model is a projection boundary:

~~~text
Platform Emulator state ──project──▶ Observation ──observe──▶ Actor
Platform Emulator action ◀─resolve── Action proposal ◀─────── Actor
                                     │
                                     └── Chatwright validates current state
~~~

The projection may be generated from a lossless platform event log, but an
acting AI/script/tool does not access that log through the Observation Model.
Actor strategies remain replaceable because they do not call platform-specific
helpers. A terminal client and Studio may render the same projection, while an
authorised developer diagnostic view can link back to and display raw messages,
callback data, native IDs, API traffic and emulator state.

The visual representation must preserve synthetic message and action IDs in its
view model/rendered nodes. Studio or a manual actor can therefore select what is
visible and resolve the exact object through Chatwright to internal emulator
state and trace evidence. This is an inspection and targeting link, not direct
access to or mutation of emulator state.

Studio therefore has two deliberately different surfaces:

- the rendered chat/Observation Model used to act on the conversation;
- a developer inspector for raw platform and emulator evidence.

Seeing raw data in the inspector does not add it to the actor proposal or make
it an input available to AI, scripted, replay or bot actors.

An issued observation is treated as a versioned fact for validation and
evidence. Whether the serialised object is formally immutable, persisted, fully
self-contained or transported incrementally remains under investigation.

## Dependencies and Relationships

- [Goal-Driven AI Testing](../goal-driven-ai-testing/README.md) is the MVP #1
  consumer and defines the first required observation/action slice.
- Platform Emulators must project platform-visible content/actions and resolve
  accepted generic actions back into platform semantics.
- The actor runtime must accept observation input and return proposed intent
  without actor-type branches in the core protocol.
- App State Branching may associate an observation with a checkpoint, but an
  observation does not replace a complete environment snapshot.
- Replay and exploration need stable identity plus accepted-action evidence.
- Studio continuity can render observations and change lineage without making
  local runs depend on Cloud.

## Acceptance Criteria

### AC: same-observation-serves-different-actors

Scenario: Scripted and AI actors reach the same decision point
Given one visible conversation projected by a Platform Emulator
When a ScriptedActor and an AIActor observe it independently
Then both receive the same observation schema and semantic content
And neither receives platform-native callback or webhook data

### AC: edit-preserves-logical-message

Scenario: A bot edits a visible message
Given message `msg7` at revision 1
When the platform reports an edit to the same logical message
Then the next observation contains `msg7` at revision 2
And its change list identifies the actor, message and revision transition

### AC: visual-object-resolves-to-emulator-state

Scenario: Studio selects a rendered action
Given the observation and rendered control share a synthetic action ID
When Studio asks Chatwright to inspect that ID
Then Chatwright resolves the authoritative internal emulator action and trace
And the developer inspector can display native IDs and callback payloads
But those raw details do not become actor input

### AC: stale-action-is-validated

Scenario: An actor selects an action from an obsolete observation
Given the action was visible in `obs41`
And the message or action changed in `obs42`
When the actor submits the old target with `obs41`
Then Chatwright does not blindly execute the platform operation
And reports a deterministic stale, refresh or reconciliation outcome

### AC: chronology-preserves-actionable-context

Scenario: The observation window reaches its size policy
Given an older conversation and a current multi-message bot response
When the observation is projected
Then messages are ordered oldest to newest
And the current response, complete turn and visible actions are not split away

## Open Questions

- Is an issued observation formally immutable?
- Is the actor-facing envelope always complete, or may an actor receive a
  changes-only continuation after the initial observation?
- Which subset is stable enough for a public third-party actor API?

See [research/observation-model.md](../../../research/observation-model.md) for the
full investigation backlog.

---
*This document follows the https://specscore.md/feature-specification*
