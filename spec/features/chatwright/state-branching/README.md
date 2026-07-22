---
format: https://specscore.md/feature-specification
status: Draft
---

# Feature: State branching

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/state-branching?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/state-branching?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/state-branching?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/state-branching?op=request-change) |
**Status:** Draft
**Source Ideas:** chatwright, app-state-branching

## Summary

Create named state checkpoints during a scenario and continue isolated sibling
scenarios from them. The first release branches registered application database
state only, executes branches sequentially and reports that boundary explicitly.

> Set up once. Branch many times.

## Problem

Conversational journeys share expensive setup such as onboarding, user/space
creation and initial domain data. Replaying that setup for every alternative is
slow and obscures the real decision tree. Reusing one mutable database instead
is unsafe because a branch can contaminate its siblings.

Database branching is also easy to overstate. The first release does not branch
Chatwright's emulator messages, message-consumption cursors, clocks, processes,
queues or arbitrary globals. Scenario authors and reports must not mistake a
database checkpoint for a complete-environment snapshot.

## Contents

| Child | Purpose |
|---|---|
| [database-state-holders](database-state-holders/README.md) | Register one or more branchable databases and coordinate checkpoint/branch lifecycle |

## Behaviour

### Named checkpoints

A checkpoint is a stable semantic boundary in a scenario path. It records its
qualified identity, source scenario/fragment revision, parent checkpoint,
registered-holder references, capabilities, excluded state and lifecycle state.

The first Listus journey uses two checkpoints:

- `onboarding-complete`: user, locale, bot chat/user records and usable Listus
  space exist in the registered database;
- `few-items-added`: groceries contain the exact baseline items and none are
  done.

### Fresh branch environments

Starting a branch creates fresh database handles from the checkpoint and invokes
an application/environment factory which binds those handles before scenario
steps continue. The first release does not reset a live database in place.

Each branch uses a fresh driver session. Because emulator state is excluded, a
branch cannot click or edit a message handle created before its checkpoint. It
must send a new command, render a new screen or use replay until platform state
becomes branchable.

### Sequential execution

Branches execute one at a time. Each completes evidence and cleanup before the
next starts. Sequential execution narrows process/global isolation risk but does
not weaken the requirement that database mutations remain invisible to siblings.

### Replay fallback

When a registered database cannot create a safe branch, the runner may replay
the parent setup in a fresh environment. Evidence identifies replay separately
from native checkpoint/branch execution and records its physical setup cost.

### Database-only evidence

Every checkpoint and branch result states:

- that the isolation scope is `database-only`;
- the holders and database generation included;
- the mechanism used (branch or replay);
- Chatwright/platform/process/queue state excluded from the claim;
- cleanup outcome and any quarantined partial resources.

## Initial Scope

Included:

- Go-first, process-local named checkpoints;
- sequential sibling branches;
- nested checkpoint lineage sufficient for the two Listus checkpoints;
- one or more registered database holders;
- `dalgo2memory` with its default serialised engine;
- reusable scenario fragments and source-linked evidence;
- replay fallback and fixture-specific semantic digests.

Deferred:

- `dalgo2memory` columnar/custom storage engines;
- inGitDB (the selected second provider, but not a Listus pilot release gate);
- parallel/distributed branches and Cloud checkpoint storage;
- in-place database reset;
- branching emulator, actor, clock, ID, queue, file, cache or arbitrary process
  state;
- final structured scenario or public Go API syntax.

## Dependencies

- [Scenario composition](../scenario-authoring/scenario-composition/README.md)
- [Database state holders](database-state-holders/README.md)
- [Conversation runtime](../conversation-runtime/README.md)
- [Deterministic testing](../deterministic-testing/README.md)
- [Observability](../observability/README.md)

## Acceptance Criteria

### AC: named-checkpoints-form-lineage

Scenario: Listus creates two checkpoints in one journey
Given onboarding completes before the reusable list fragment runs
When the fragment adds baseline groceries
Then `few-items-added` records `onboarding-complete` in its lineage
And both identities include their scenario/fragment invocation path

### AC: sibling-database-mutations-do-not-leak

Scenario: Listus branches from a populated groceries list
Given milk, bread, eggs and apples at `few-items-added`
When one branch marks and removes items
Then every later sibling starts with the original four active items
And semantic comparison does not depend on generated record IDs

### AC: branch-uses-a-fresh-driver

Scenario: A branch begins after a database-only checkpoint
Given a message was rendered before the checkpoint
When the application factory starts the branch
Then the branch receives fresh database and chat-driver handles
And it does not reuse the pre-checkpoint message handle

### AC: scope-is-not-overstated

Scenario: Database state branches but platform state does not
Given a successful database checkpoint
When branch evidence is rendered
Then it is labelled `database-only`
And excluded emulator, clock, queue and process state is visible

### AC: replay-is-distinguishable

Scenario: A database holder cannot branch
Given replayable deterministic setup
When the runner executes a child by replay
Then evidence reports replay rather than native branching
And the resulting fixture-specific database digest matches the checkpoint path

## Open Questions

- Does the first Go API expose checkpoint/branch operations from a scenario
  runner, environment or execution context?
- How many nested checkpoint levels must be supported beyond the Listus proof?

---
*This document follows the https://specscore.md/feature-specification*
