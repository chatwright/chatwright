---
format: https://specscore.md/feature-specification
status: Draft
---

# Feature: Observation Lineage

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/observation-model/observation-lineage?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/observation-model/observation-lineage?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/observation-model/observation-lineage?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/observation-model/observation-lineage?op=request-change) |

**Status:** Draft
**Source Ideas:** observation-model

## Summary

Give each observation identity, predecessor context and a structured list of
changes so actors can reason about currentness and transitions without diffing
complete conversation snapshots.

## Identity and Predecessor

The working envelope uses:

~~~yaml
observation_id: obs42
previous_observation_id: obs41
~~~

An actor proposal references the observation that made its target visible.
Observation identity therefore participates in optimistic concurrency,
diagnostics, replay and evidence. IDs are Chatwright identities rather than
platform update IDs.

Message/action synthetic IDs also join observation lineage and visual state to
the internal Platform Emulator objects that produced them. That resolver mapping
must remain valid for the supported observation/evidence lifetime or return an
explicit expired/tombstoned result.

Issued observations should behave as versioned facts: content associated with
one ID must not silently change. Research still needs to decide whether this is
a formal immutable storage contract and how long identities remain resolvable.

## Structured Changes

~~~yaml
changes:
  - actor: alice
    type: action_clicked
    message_id: msg7
    action_id: action1
  - actor: appointment_bot
    type: message_edited
    message_id: msg6
    previous_revision: 1
    revision: 2
  - actor: appointment_bot
    type: message_created
    message_id: msg8
~~~

A change records who acted, what changed and the affected objects. The model
must cover creation, edit, deletion, action availability, actor interactions and
material context transitions. It should avoid duplicating full content unless
needed for self-contained evidence.

## Staleness and Concurrency

The runtime compares a proposal's observation lineage, target identity and
revisions with authoritative current state. It may reject stale intent, ask the
actor to observe again or reconcile only when semantics prove the action is
still equivalent.

Multiple actor proposals from one observation need ordering and outcome rules.
The observation records perceived state; the accepted action/change sequence
records what actually won. Wall-clock timestamps alone are not a sufficient
ordering contract.

## Persistence and Replay

Persisted observation lineage could explain failures, drive ReplayActor, power
Studio time travel and associate an App State Branching checkpoint with what an
actor perceived. Persistence also creates schema compatibility, size, privacy
and retention obligations and is not implied by the initial in-memory contract.

## Acceptance Criteria

### AC: changes-are-explicit

Scenario: A bot edits one message and creates another
Given an actor previously received `obs41`
When `obs42` is created
Then `obs42` links to `obs41`
And changes identify both affected messages and the responsible actor

### AC: actor-does-not-diff-snapshots

Scenario: An AI actor receives a large conversation
Given only three objects changed since its previous observation
When the next observation is delivered
Then the three semantic changes are listed explicitly
And correctness does not depend on the AI computing a textual diff

### AC: simultaneous-intent-has-one-authoritative-order

Scenario: Two actors choose from the same observation
Given both proposals reference `obs42`
When one accepted proposal invalidates the other target
Then the runtime records the accepted ordering
And validates the later proposal against resulting current state

## Open Questions

- Are observations immutable, persisted and replayable?
- Are actors sent complete observations, deltas or both?
- How is identity retained across process boundaries and schema versions?
- How are simultaneous proposals ordered without leaking platform internals?

---
*This document follows the https://specscore.md/feature-specification*
