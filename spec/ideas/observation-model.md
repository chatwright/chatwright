---
format: https://specscore.md/idea-specification
status: Specifying
---

# Idea: Observation Model

**Status:** Specifying
**Date:** 2026-07-22
**Owner:** alex
**Promotes To:** chatwright/observation-model, chatwright/observation-model/visible-conversation, chatwright/observation-model/actor-actions, chatwright/observation-model/observation-lineage, chatwright/observation-model/observation-context
**Supersedes:** —
**Related Ideas:** extends:app-state-branching, extends:local-studio-continuity

## Executive Summary

Chatwright needs one actor-neutral **Observation Model**: the contract through
which every actor perceives the current user-visible world and chooses what to
do next.

`HumanActor`, `ScriptedActor`, `AIActor`, `ReplayActor`, `BotActor` and future
actor types should consume the same semantic projection. They should not need
Telegram callback data, webhook envelopes, Bot API requests, platform message
IDs or WhatsApp-specific payloads. Platform Emulators translate those details
into visible messages and generic actions; Chatwright translates a validated
actor intent back into the platform operation.

The working representation is structured YAML with Markdown in human-readable
text fields. Stable message and observation identities, explicit versions and
a structured change list make the model usable by deterministic actors and AI
actors without requiring either to reverse-engineer a platform or diff two
large snapshots.

## Problem Statement

How might we give every Chatwright actor one faithful view of the user-visible
world while preserving full platform-native evidence for developer inspection,
without letting AI or automation tools depend on messenger implementation
details?

An actor currently risks observing one of several incompatible views: raw
platform events, a rendered transcript, test helpers or AI-specific prompt
context. This makes actors difficult to reuse, platform adapters leak into
scenario logic and AI exploration reason about implementation details that a
real user never sees.

The desired abstraction answers four questions consistently:

1. What conversation content is visible now?
2. What changed since the actor last observed it?
3. Which interactions are available?
4. Which goal, milestone and journey facts are relevant to the next choice?

The abstraction describes perception, not storage, transport or rendering.

## Context

Chatwright spans platform-emulated bots, direct conversational engines and
agent harnesses. Its actor strategies already include human, scripted, replay
and AI-driven behaviour, with more strategies expected. Platform Emulators need
lossless platform state for fidelity, while actors need only the semantic world
a user can perceive and interact with.

Without an explicit projection boundary, raw platform events tend to become the
de facto actor API, rendered UI structures become automation contracts or each
actor receives a bespoke prompt/state shape. The Observation Model is the shared
boundary between those concerns.

## Recommended Direction

Define a versioned, actor-neutral observation envelope whose working
serialisation is YAML and whose text fields contain normalised Markdown. Project
visible logical messages, generic actions, explicit changes and bounded journey
context from authoritative runtime/Platform Emulator state. Accept generic
actor proposals tied to their source observation, then let Chatwright validate
and resolve those proposals back into platform operations.

Treat exact field syntax as provisional until the investigation backlog proves
identity, delivery, action, link, media and compatibility semantics on real
fixtures.

## Product Principles

- **User-visible semantics:** expose what a user can perceive, not how a
  messenger encodes or transports it.
- **Actor neutrality:** actor kind does not change the observation contract.
- **Platform-neutral actor input:** callback payloads, webhook bodies, Bot API
  calls and platform-native IDs stop at the Observation Model boundary. They
  remain available in authorised developer diagnostics.
- **Stable reference:** logical messages and observations have identities;
  message edits advance a version instead of manufacturing a new message.
- **Traceable synthetic identity:** the observation and its visual rendering use
  the same Chatwright-generated IDs to resolve objects back to authoritative
  internal Platform Emulator state. Developer inspectors expose the native
  state on demand; actor observations do not.
- **Explicit change:** changes name who acted, what changed and which objects
  were affected.
- **Action by intent:** actors target generic actions; Chatwright resolves and
  validates the platform operation.
- **Readable structure:** YAML carries machine-readable structure and Markdown
  preserves natural formatted text.
- **Complete conversational units:** chronological context preserves whole
  turns, complete bot responses and every currently visible action.
- **Authoritative runtime:** an actor proposes; Chatwright validates current
  state, version, availability, permissions and platform semantics.
- **Context without AI coupling:** goals, journey state, milestones and facts
  may help any actor and do not make the model an `AIActor` prompt format.

## Working Observation Shape

This example communicates semantics, not a frozen public schema:

~~~yaml
observation_id: obs42
previous_observation_id: obs41

messages:
  - id: msg7
    version: 2
    actor: appointment_bot
    type: text
    text: |
      **Choose a service**
      Read the [booking policy](https://example.com/policy).
    actions:
      - id: action1
        label: Haircut
      - id: action2
        label: Consultation

changes:
  - actor: alice
    type: action_clicked
    message_id: msg6
    action_id: action0
  - actor: appointment_bot
    type: message_edited
    message_id: msg6
    previous_version: 1
    version: 2
  - actor: appointment_bot
    type: message_created
    message_id: msg7

context:
  current_state: choosing_service
  goal: Book an appointment
  active_milestone: service-options-visible
  relevant_facts:
    - Alice prefers an afternoon appointment.
~~~

The first observation can omit `previous_observation_id` and describe an
initial baseline. Subsequent observations can carry both an actionable view and
the changes since the predecessor. Whether transports may deliver changes only
is an investigation; an actor should never be forced to compute a semantic diff
itself.

## Messages and Formatting

A message should have at least a stable logical `id`, monotonic `version`,
producing `actor` and semantic `type`. The `id` is a synthetic Chatwright
identity mapped internally to the corresponding Platform Emulator object. The
same ID appears in actor observations, rendered/visual nodes and inspection
tools, so selecting a visible message can resolve back to authoritative
emulator state. The same logical message survives edits. Deleted messages,
quoted replies, media and platform-specific rendering gaps need explicit
representation rather than silent loss.

Markdown is the default actor-facing text format. Normalisation should preserve
headings, bold, italic, links, code, lists, quotes, spoilers and emoji where the
source platform can express them, without exposing raw Telegram HTML or
MarkdownV2. Studio may render safe HTML later, but HTML is a view rather than
the actor contract.

Conversation order is chronological, oldest to newest. A window should not cut
through a multi-message bot response or conversational turn, and it should
retain all currently visible actions even when their source message falls near
the history boundary. Edits update a logical message in place while the change
list records their temporal occurrence.

## Generic Actions

An observation exposes generic actions with an opaque Chatwright identity and a
user-visible label:

~~~yaml
actions:
  - id: action1
    label: Haircut
~~~

An actor can propose:

~~~yaml
observation_id: obs42
action: click
target: action1
message_id: msg7
message_version: 2
~~~

Chatwright resolves `action1` internally to the current Platform Emulator
operation. Callback data, native button indices and platform request shapes do
not cross into actor observations or proposals. An authorised developer UI can
show them in a separate inspector. Rendered controls carry the same synthetic
action ID, letting a visual/manual actor, Studio inspector or trace view address
the exact internal emulator action through the resolver. Research must
determine whether the action catalogue normally needs a semantic type or
whether opaque ID plus label is sufficient, and how links, Web Apps, deep links
and actions not attached to one message fit the model.

## Identity, Versions and Changes

Observations have stable identities and optional predecessor links. Actor
proposals reference the observation from which the target was perceived. This
creates an optimistic-concurrency boundary: Chatwright can reject, refresh or
explicitly reconcile an action based on an obsolete observation.

The structured `changes` list complements the current view. A change identifies:

- the actor responsible;
- a semantic change type;
- affected message, action or context identities;
- old/new versions or other minimal transition facts where relevant.

Changes must be sufficient to explain created, edited and deleted messages,
action availability and actor interactions. They are runtime facts, not an
AI-generated summary.

## Observation Context and Window

The conceptual policy is not “the last N messages”. A useful observation may
combine:

- recent complete conversation turns;
- every current visible action;
- a history summary or journey memory;
- current state and visited states;
- unexplored actions;
- current goal and persona;
- active and completed milestones;
- relevant facts.

Size limits are an implementation constraint on that semantic policy. The model
must distinguish observed facts from summaries or inferred memory, preserve the
provenance needed for replay and avoid inventing AI-only fields.

## Architecture Boundary

~~~text
Messenger-shaped input
        ↓
Platform Emulator
        ↓ normalises visible state
Chatwright Observation Model
        ↓ same contract
Human / Scripted / AI / Replay / Bot actor
        ↓ generic action proposal
Chatwright validation and resolution
        ↓ platform operation
Platform Emulator
~~~

The Observation Model sits above Platform Emulators and below actor strategies.
It is also a natural shared projection for terminal clients, Studio inspection,
manual driving, replay and third-party agent integrations, although public API
status remains unresolved.

Synthetic identities form the cross-layer join without becoming platform IDs:

| Layer | Identity use |
|---|---|
| Platform Emulator | Owns the authoritative object and maps its private/native identity to a Chatwright synthetic ID |
| Observation | References visible messages/actions by the synthetic ID |
| Visual representation | Carries the same ID on its view model/rendered node for selection and inspection |
| Actor proposal | Targets the synthetic action/message ID from a specific observation |
| Developer inspector, trace and Studio | Resolves the ID back to emulator state and exposes raw payloads, native IDs, callback data and API evidence on demand when authorised |

The mapping must not let an actor bypass action validation or mutate emulator
state directly. A developer may inspect raw details while manually driving the
chat, but those details are a parallel diagnostic surface rather than fields in
the HumanActor or other actor observation.

## Alternatives Considered

- **Give actors raw platform payloads.** Rejected because it couples every actor
  to callback data, webhook envelopes and provider-specific IDs. The same data
  remains available to developers through trace/emulator inspection.
- **Create an AI-only prompt context.** Rejected because deterministic, replay,
  human and AI actors should perceive the same world; only strategy differs.
- **Use rendered HTML or a browser DOM as the contract.** Rejected because it
  conflates a Studio view with portable semantics and weakens non-visual actors.
- **Send complete transcripts and make actors diff them.** Rejected as the only
  change mechanism because semantic edits and action availability become
  expensive and unreliable for AI actors.
- **Expose the last N raw messages.** Rejected as the conceptual window because
  it can split turns/responses and discard currently visible actions.
- **Standardise each messenger's action taxonomy.** Rejected as the starting
  point; generic opaque targets should be tested before platform types are
  promoted into the core schema.

## MVP Scope

- One versioned YAML envelope consumed by every local actor strategy.
- Normalised Markdown text for visible logical messages.
- Stable Chatwright message ID, monotonic version, actor and semantic type.
- Observation ID, optional predecessor and structured changes.
- Generic visible actions plus actor proposals referencing their source
  observation.
- Authoritative validation for staleness, versions, availability, permissions
  and Platform Emulator semantics.
- Chronological conversation projection that preserves complete current turns,
  bot responses and actions under a defined window policy.
- Raw platform trace evidence kept separately and exposed to authorised
  developers through diagnostics linked by synthetic IDs.

## Not Doing (and Why)

- Freezing a public third-party API before schema conformance and versioning are
  proven.
- Persisting every observation by default before privacy, retention and size
  policy exist.
- Replacing Platform Emulator state or App State Branching snapshots; an
  observation is a perception projection, not the complete environment.
- Encoding Telegram HTML, MarkdownV2, callback data or native API requests into
  the generic actor contract; developer inspection of those details remains in
  scope.
- Capturing private AI reasoning or treating actor memory as authoritative
  conversation state.
- Requiring full journey memory, automatic summaries, all media types or Studio
  time travel in the first local runtime slice.

## Relationship to Existing Ideas

### App State Branching

An observation is evidence about one moment in a branch, not the complete
branchable environment. Future App State Branching checkpoints may retain an
observation identity or snapshot alongside conversation/runtime state so a
restored actor perceives the same branch point. Observation persistence alone
must not imply that application state was restored.

### Local CLI to web Studio continuity

The local bridge can expose the same normalised observation and change model to
terminal and Studio clients while retaining raw platform envelopes as separate
diagnostic evidence. Studio can later visualise message versions, observation
lineage, action availability and stale attempts.

### Platform Emulators

Platform Emulators own lossless platform fidelity and translation. The generic
observation deliberately omits callback data and transport envelopes; raw
evidence remains separately inspectable for emulator debugging.

### AI and Branch Exploration

AI, monkey, fuzz, goal-driven, deterministic and manual exploration should vary
actor strategy, not runtime perception. Concrete observations and accepted
actions can be retained to promote an exploratory path into a replay or scripted
scenario.

[Autonomous Goal-Driven Bot Testing](goal-driven-ai-bot-testing.md) is the
number-one MVP consumer of this model. The first Observation Model slice should
therefore be selected by what the Listus campaign needs to discover onboarding,
exercise shopping-list actions and react to explicit changes safely.

## Feature Decomposition

| Feature | Responsibility |
|---|---|
| [Observation Model](../features/chatwright/observation-model/README.md) | Actor-neutral envelope and platform boundary |
| [Visible Conversation](../features/chatwright/observation-model/visible-conversation/README.md) | Messages, versions, Markdown, ordering, links, replies and media |
| [Actor Actions](../features/chatwright/observation-model/actor-actions/README.md) | Generic action catalogue, actor proposals and authoritative validation |
| [Observation Lineage](../features/chatwright/observation-model/observation-lineage/README.md) | Observation identity, explicit changes, staleness and concurrency |
| [Observation Context](../features/chatwright/observation-model/observation-context/README.md) | Semantic window, summary, journey, goals, milestones and relevant facts |

## Roadmap Direction

1. Validate the canonical projection against Telegram behaviours and at least
   one non-platform conversational harness.
2. Specify the minimum YAML envelope, message identity and generic action
   proposal, including stale-observation validation.
3. Prove deterministic and AI actors consume the same observation in local
   runs.
4. Add portable persistence/replay and Studio change visualisation only after
   identity and redaction semantics are stable.
5. Consider a public third-party actor API after conformance and compatibility
   policy exist.

See the [Observation Model research backlog](../research/observation-model.md).

## Key Assumptions to Validate

| Tier | Assumption | How to validate |
|---|---|---|
| Must-be-true | Every actor strategy can consume one semantic projection without platform-specific observation fields. | Drive the same decision fixture through HumanActor, ScriptedActor, AIActor, ReplayActor and BotActor. |
| Must-be-true | YAML with Markdown preserves enough user-visible content across supported platforms and headless harnesses. | Normalise Telegram and non-platform corpora and publish the fidelity/loss matrix. |
| Must-be-true | Stable message/observation identity plus explicit changes makes edits and stale actions deterministic. | Run repeated edit, deletion, concurrency and stale-proposal fixtures. |
| Should-be-true | Opaque action ID plus label covers most interactions before a required action type is introduced. | Map click, choice, input, upload, link, Web App and deep-link cases. |
| Should-be-true | A semantic window can remain bounded without splitting current turns or hiding current actions. | Exercise long conversations under byte/token budgets with deterministic expected projections. |
| Might-be-true | Persisted observation lineage becomes a safe public API for replay, Studio and third-party AI agents. | Prototype only after schema compatibility, privacy and retention investigations pass. |

## SpecScore Integration

The feature family is decomposed in [Feature Decomposition](#feature-decomposition),
sequenced in [Roadmap Direction](#roadmap-direction) and backed by
[OM-01–OM-28](../research/observation-model.md#investigation-backlog).

## Open Questions

The evidence-producing backlog in
[research/observation-model.md](../research/observation-model.md) owns lifecycle,
window, formatting, media, link, action, concurrency, branching, replay, Studio
and public API investigations.

---
*This document follows the https://specscore.md/idea-specification*
