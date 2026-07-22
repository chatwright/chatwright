---
format: https://specscore.md/feature-specification
status: Draft
---

# Feature: Scenario composition

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/scenario-authoring/scenario-composition?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/scenario-authoring/scenario-composition?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/scenario-authoring/scenario-composition?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/scenario-authoring/scenario-composition?op=request-change) |
**Status:** Draft
**Source Ideas:** chatwright

## Summary

Let a scenario invoke reusable scenario fragments with explicit prerequisites,
inputs, outputs and provenance. A new-user journey and an existing-user journey
can therefore exercise the same behaviour without copying its chat steps or
assertions.

## Problem

Conversation suites repeat long behavioural sequences beneath different setup
paths. Plain helper functions remove some code duplication but do not give
Chatwright a stable execution identity, source-linked evidence, checkpoint
qualification or a portable composition model.

The first Listus reference journey needs one list-items fragment to run after
both genuine onboarding and an existing-user fixture. Treating those as copied
test cases would make the branching proof immediately drift.

## Behaviour

### Scenario fragments

A fragment is reusable scenario behaviour, not an inherited test case. It
declares or documents:

- required actors, chats, fixtures and application capabilities;
- typed/configured inputs and named outputs;
- actions, assertions and checkpoints it contributes;
- cleanup or state postconditions the caller must observe;
- whether it can run independently or only inside a parent scenario.

The Go-first implementation may use ordinary typed functions around a small
execution context. This specification does not freeze the function signature or
require a structured scenario format in the first release.

### Invocation and provenance

Each invocation receives its caller's prepared environment and has a distinct
execution identity. Results retain:

- the parent scenario path;
- the fragment's definition/source location and revision;
- effective inputs and their sources;
- locally produced steps, checkpoints, branches and failures.

An invocation cannot mutate another invocation's configuration or hidden
package-level state. Runtime state may change only through the environment made
explicit to the fragment.

### Checkpoint qualification

A reusable fragment may create checkpoints. Their machine identities are
qualified by invocation path so two uses of `few-items-added` cannot collide;
reports may keep the short display name where context is clear.

### Listus reference composition

The first evidence uses this structure:

~~~text
Listus journeys
├── New user
│   ├── Complete onboarding
│   ├── Checkpoint: onboarding-complete
│   └── Use: list-items-modification
└── Existing user
    ├── Load explicit onboarded-user fixture
    └── Use: list-items-modification

list-items-modification
├── Add milk, bread, eggs and apples
├── Verify semantic list state
├── Checkpoint: few-items-added
└── Run isolated mutation branches
~~~

The fragment accepts an already prepared user/chat and logical space. It does
not decide how a new user is authenticated or how an existing user is seeded.

The Listus scenario and fragment definitions are owned by `sneat-bots`.
`sneat-go` supplies the real ListusBot application/profile environment and
executes those definitions through an adapter; it neither redefines the steps
nor creates a reverse `sneat-bots` dependency on `sneat-go`.

## Dependencies

- [Scenario authoring](../README.md)
- [Deterministic testing](../../deterministic-testing/README.md)
- [State branching](../../state-branching/README.md)

## Acceptance Criteria

### AC: one-fragment-serves-new-and-existing-users

Scenario: List modification is reused under two setup paths
Given one parent onboards a new Listus user
And another parent supplies an explicit existing-user fixture
When both invoke the list-items-modification fragment
Then the same fragment definition and assertions execute in each parent
And neither parent contains a copied list-mutation sequence
And the `sneat-go` execution host does not copy the `sneat-bots` scenario steps

### AC: fragment-provenance-is-visible

Scenario: An assertion inside a reused fragment fails
Given a fragment invoked from an existing-user scenario
When one of its list assertions fails
Then the result identifies the parent invocation path and fragment source
And the failure is not attributed only to an opaque helper call

### AC: checkpoint-identities-do-not-collide

Scenario: Two parents invoke a fragment with the same checkpoint label
Given each invocation creates `few-items-added`
When results and branch references are produced
Then each checkpoint has a distinct qualified machine identity
And both may retain the same human-readable label

### AC: fragment-inputs-are-isolated

Scenario: One invocation overrides the groceries list fixture
Given two parents invoke the same fragment
When one supplies a local input override
Then the other invocation retains its own effective inputs
And the fragment definition is unchanged

## Open Questions

- Is a typed Go function plus execution context sufficient for the first API, or
  is a named fragment wrapper required immediately for evidence/source mapping?
- Which fragment outputs need to become addressable inputs for a later fragment?

---
*This document follows the https://specscore.md/feature-specification*
