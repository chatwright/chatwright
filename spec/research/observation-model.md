# Research: Observation Model

**Date:** 2026-07-22
**Owner:** alex
**Status:** Proposed
**Consumed by:** [`observation-model`](../features/chatwright/observation-model/README.md)

## Purpose

Establish the semantic, compatibility and evidence boundaries for one
actor-neutral projection of the user-visible conversational world. Research
must validate the YAML-with-Markdown direction against real platform behaviour,
deterministic and AI actors, replay, Studio and future App State Branching
without leaking platform implementation details into the actor contract.

## Working Architecture Hypotheses

| Hypothesis | Evidence needed before promotion |
|---|---|
| One model serves every actor | Scripted, replay, manual and AI actors consume the same fixture without adapter-specific observation fields |
| YAML plus Markdown is sufficient | Telegram and a non-platform harness round-trip rich visible content with documented normalisation loss |
| Stable logical IDs survive edits | Multi-edit, deletion and reply fixtures retain understandable identity and order |
| Snapshot plus explicit changes is usable | Actors react correctly without computing full-object diffs; size remains bounded |
| Opaque generic actions hide platform mechanics | Button, link and input interactions resolve and validate without callback data escaping |
| Observation lineage detects stale intent | Revision/concurrency matrix produces deterministic accept, reject, refresh or reconcile outcomes |
| Journey context is actor-neutral | Scripted and AI actors use the same goal/milestone/fact representation |
| Observations compose with branching and replay | Restored/replayed branch points reproduce actor-visible state without claiming application state is in the observation |

## Investigation Backlog

### Lifecycle and delivery

| ID | Question | Required evidence and output |
|---|---|---|
| OM-01 | Should observations be immutable? | Lifecycle model distinguishing issued identity, in-memory objects, persisted evidence and redaction; mutation-attempt tests. |
| OM-02 | Should observations be complete or incremental? | Compare self-contained snapshots, deltas and hybrid snapshot-plus-changes across scripted/AI actors, recovery and size. |
| OM-03 | Should actors receive only changes after the first observation? | Disconnect/retry and missed-update fixtures proving how an actor reconstructs current actionable state without its own semantic diff. |
| OM-04 | Should observation history be persisted? | Storage/retention/privacy options plus a failure investigation and Studio inspection prototype using persisted lineage. |

### Window and context policy

| ID | Question | Required evidence and output |
|---|---|---|
| OM-05 | How should observation size be limited? | Representative long conversations tested with semantic turn/action preservation under byte and token budgets. |
| OM-06 | Should old messages be summarised automatically? | Deterministic/provenanced summary design with contradiction, replay and information-loss tests. |

### Content, identity and ordering

| ID | Question | Required evidence and output |
|---|---|---|
| OM-07 | How should Markdown be normalised across platforms? | Telegram and at least one second source corpus covering headings, bold, italic, links, code, lists, quotes, spoilers and emoji with a loss matrix. |
| OM-08 | How should media be represented? | Image, video, audio, document, sticker and caption fixtures defining visible metadata, attachment references, accessibility and sensitive URLs/IDs. |
| OM-09 | How should edits be represented? | Repeated-edit fixture proving stable message ID, monotonic revision, current content and explicit change records. |
| OM-10 | How should deleted messages appear? | User-visible deletion/tombstone matrix across platforms and replay, including actions invalidated by deletion. |
| OM-11 | How should message ordering work with edits? | Ordering model separating conversational position from edit-event order with chronological rendering examples. |
| OM-12 | How should quoted replies be represented? | Reply fixtures for available, edited, deleted and windowed-out source messages with stable logical references. |

### Actions, staleness and concurrency

| ID | Question | Required evidence and output |
|---|---|---|
| OM-13 | Should actions always belong to messages? | Compare inline buttons, persistent keyboards, global navigation, commands, Web Apps and harness capabilities. |
| OM-14 | Should action IDs be globally unique? | Identity-scope and retention model across observations, messages, conversations, branches and process restarts. |
| OM-15 | How should stale observations be detected? | Validation matrix using observation ID, predecessor, message revision and action availability; define accept/reject/refresh/reconcile outcomes. |
| OM-16 | How should multiple simultaneous actor actions be represented? | Two-actor race fixtures establishing proposal ordering, authoritative outcomes, rejected intent and resulting change records. |

### Branching, replay, Studio and ecosystem

| ID | Question | Required evidence and output |
|---|---|---|
| OM-17 | How should observation snapshots integrate with App State Branching? | Checkpoint manifest sketch and restored-branch fixture that associates actor-visible state without treating it as the complete environment. |
| OM-18 | Should observations be replayable? | ReplayActor experiment defining whether observations, accepted actions, raw events or a combination is authoritative across schema versions. |
| OM-19 | How should Studio visualise observation changes? | Prototype of message revisions, created/edited/deleted changes, current actions, lineage and stale attempts on desktop and narrow layouts. |
| OM-20 | Should observations become a public API for third-party AI agents? | Threat/compatibility analysis plus an external agent proof using version negotiation, redaction and capability discovery. |

### Extended contract questions

| ID | Question | Required evidence and output |
|---|---|---|
| OM-21 | Does an available action need a semantic type, or are label and opaque ID sufficient for most interactions? | Corpus of click, choose, input, upload and navigation actions; smallest schema that remains unambiguous and accessible. |
| OM-22 | What are the semantics of links, external navigation, Web Apps and deep links? | Matrix for visible URLs, labelled Markdown links, link actions, navigation events and return-to-conversation behaviour; prove deterministic URL assertions can resolve targets by synthetic identity. |
| OM-23 | Which platform fidelity details should the developer UI expose beside, but outside, the observation? | Synthetic-ID-linked inspector for raw messages, callback data, native IDs, API traffic and emulator state; prove raw data does not leak into AI/tool actor decisions. |
| OM-24 | What conformance suite proves actor neutrality? | The same scenario driven by HumanActor, ScriptedActor, AIActor, ReplayActor and BotActor with no actor-specific observation projection. |
| OM-25 | What privacy and redaction rules apply to observations and summaries? | Data classification, secret/PII fixtures, attachment policy and local/retained/Cloud export rules. |
| OM-26 | How are observation schemas versioned and evolved? | Compatibility policy covering stored history, replay, Studio, external actors and additive/semantic changes. |
| OM-27 | How is context provenance represented? | Fixture distinguishing directly visible content, runtime facts, deterministic summaries, inferred facts and actor-private memory. |
| OM-28 | What scope and lifetime should synthetic message/action IDs and their emulator-state mappings have? | Identity map design and fixtures across edits, deletion, rendering, observation expiry, replay, branches and process restarts; prove visual selection cannot bypass validation. |

## Recommended Investigation Order

1. OM-07, OM-09, OM-11, OM-12, OM-21 and OM-22: prove the visible message and
   action projection on real platform fixtures.
2. OM-01–OM-03, OM-13–OM-16 and OM-26: settle identity, delivery, validation,
   staleness and compatibility semantics.
3. OM-05, OM-06 and OM-27: define bounded contextual observations without
   arbitrary message truncation or unverifiable memory.
4. OM-08, OM-10, OM-23–OM-25 and OM-28: close media, deletion, fidelity,
   actor conformance, privacy and synthetic-ID mapping gaps.
5. OM-04 and OM-17–OM-20: add persistence, branching, replay, Studio and public
   API commitments only after the core contract is stable.

## Open Questions

The backlog above is intentionally unresolved. Working directions in the idea
and feature specifications are hypotheses until the named evidence exists.
