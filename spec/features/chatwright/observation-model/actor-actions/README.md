---
format: https://specscore.md/feature-specification
status: Draft
---

# Feature: Actor Actions

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/observation-model/actor-actions?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/observation-model/actor-actions?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/observation-model/actor-actions?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/observation-model/actor-actions?op=request-change) |

**Status:** Draft
**Source Ideas:** observation-model

## Summary

Expose user-visible interactions as generic Chatwright actions and accept actor
intent against those actions. The same synthetic action ID links the observation
and rendered control to authoritative internal Platform Emulator state.
Chatwright validates and resolves accepted intent without exposing callback
data, request payloads or native button coordinates as actor input. An
authorised developer inspector can display those raw details.

## Available Action

The smallest useful action is an opaque ID plus visible label:

~~~yaml
actions:
  - id: action1
    label: Haircut
~~~

An optional semantic kind, accessibility description, destination or input
contract may be required for non-button interactions. Those additions should be
driven by evidence rather than messenger type systems. The observation must
describe what an actor can do, not how a platform sends it.

## Actor Proposal

An action proposal identifies both the perceived observation and target:

~~~yaml
observation_id: obs42
action: click
target: action1
message_id: msg7
message_version: 2
~~~

The exact redundancy is unresolved. Observation ID is needed for staleness;
message ID/version may make diagnostics and fine-grained validation stronger.
Text entry, uploads, navigation and compound interactions may require proposal
shapes beyond `click` while retaining the same actor-neutral contract.

The visual view model or rendered node carries `action1` as its Chatwright
identity. A visual/manual actor may select that object by ID, but only the
runtime resolver can look up the private emulator action or translate it to a
platform operation. A developer inspection surface may use the same lookup to
show callback data and native state without copying them into the observation.

## Authoritative Validation

Before resolving a proposal, Chatwright checks at least:

- the referenced observation exists and satisfies freshness policy;
- the target action existed in that observation;
- the owning message and version still match where required;
- the action remains visible and available;
- the actor has permission to perform it;
- supplied values satisfy the generic action contract;
- Platform Emulator semantics allow the translated operation now.

The actor proposes intent; it never makes the runtime authoritative state true
by claiming it. Rejection should be structured and deterministic enough for a
scripted actor to assert, an AI actor to recover and Studio to explain.

## Acceptance Criteria

### AC: callback-data-is-not-actor-input

Scenario: A Telegram inline button has callback data
Given the Platform Emulator projects that button
When an actor observes and chooses it
Then the actor uses a Chatwright action ID and label
And Chatwright resolves the ID to callback data for execution
And an authorised developer inspector can display that callback data
But AI and automation actors do not receive it in their observation

### AC: rendered-control-and-observation-share-id

Scenario: Studio renders a generic action
Given action `action1` is visible in the observation
When the corresponding control is rendered
Then the rendered control retains synthetic ID `action1`
And inspection and actor proposals resolve through the same authoritative map

### AC: unavailable-action-is-rejected

Scenario: A bot replaces its available actions
Given an actor observed action `action1`
When the message is edited and `action1` disappears
Then a proposal targeting `action1` is not executed
And the result identifies unavailable or stale intent

### AC: actor-kind-does-not-change-validation

Scenario: Human and replay actors propose the same action
Given equivalent actor permissions and the same current observation
When each targets the action
Then the same validation and platform-resolution rules apply

## Open Questions

- Is opaque ID plus label sufficient, or is an action kind required?
- Must actions always belong to messages, and are IDs globally unique?
- How do links, Web Apps, deep links, text input, uploads and navigation fit one
  proposal model?
- Which stale-action outcomes are reject, refresh or safe reconciliation?

---
*This document follows the https://specscore.md/feature-specification*
