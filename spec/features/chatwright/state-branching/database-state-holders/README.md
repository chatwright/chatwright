---
format: https://specscore.md/feature-specification
status: Draft
---

# Feature: Database state holders

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/state-branching/database-state-holders?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/state-branching/database-state-holders?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/state-branching/database-state-holders?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/state-branching/database-state-holders?op=request-change) |
**Status:** Draft
**Source Ideas:** chatwright, app-state-branching

## Summary

Let an application register several named branchable database holders or supply
one composite holder, then coordinate their checkpoint, branch and cleanup
lifecycle as one database-only scenario boundary.

## Problem

Applications may use a primary database, audit database, tenant databases or a
custom composite. Provider-wide IDs such as `dalgo2memory` do not identify those
instances, and independently successful snapshots do not prove that a group is
safe to use. A failure in the final holder must not leave earlier partial state
available as a branch.

DALgo's `dal.DB` deliberately models data access, not snapshot lifecycle.
Requiring new methods on it would break every adapter and mock. Branching should
therefore be an additive provider capability wrapped by Chatwright's generic
state-holder contract.

## Behaviour

### Registration shapes

An application chooses one of two shapes:

- register a list of uniquely named holders such as `primary` and `audit`, and
  let Chatwright coordinate them;
- register one composite implementation which coordinates its internal
  databases and exposes one all-or-none outcome.

Application-supplied names, not `dal.DB.ID()`, are used in manifests and errors.
Duplicate or empty names fail before checkpoint creation.

### Holder lifecycle

The conceptual contract covers:

- stable identity and capability/version metadata;
- immutable checkpoint creation;
- creation of a fresh branch handle from that checkpoint;
- access to the branch's replacement database handle;
- branch finish/cleanup and checkpoint release;
- explicit incompatibility, unsupported-mode and released-reference errors.

The exact Go interfaces are not fixed here. Optional persistence, diff,
copy-on-write and parallel safety are capability metadata rather than mandatory
methods which simple providers must fake.

### Group coordination

The coordinator prepares and captures holders in deterministic registration
order. It publishes a group checkpoint only after every holder succeeds. On
failure it cleans partial results in reverse order; cleanup failures are reported
and quarantined rather than hidden.

Branch start follows the same rule. Scenario continuation begins only after all
replacement database handles exist and the application factory has bound them.

### DALgo ownership boundary

Chatwright owns holder registration, group manifests and compensation. DALgo may
expose an additive database-branching primitive in a sibling package or adapter
extension; it is not added to the mandatory `dal.DB` interface.

Provider conformance accepts fixture-specific seed, mutation and semantic-digest
callbacks because generic `dal.DB` cannot enumerate every collection reliably.

### First provider: dalgo2memory

The first provider supports the default serialised `dalgo2memory` engine:

- snapshot bytes and full nested key chains are deep-copied while state is
  stable;
- every branch receives a fresh `dal.DB` rather than a reset source handle;
- source and sibling mutations cannot alter the immutable checkpoint;
- empty databases, insert/update/delete and nested keys are covered;
- unsupported columnar/custom engines fail clearly;
- cleanup/release is idempotent.

The Listus reference scenario registers one database. Separate conformance tests
register two memory databases to prove the architecture is not accidentally
single-database.

### Second provider: inGitDB

`dalgo2ingitdb`/inGitDB remains the selected second and first persistent
provider, after the memory contract stabilises. Its commit identity,
branch/worktree creation, clean-tree policy, single-writer behaviour, retention,
redaction and crash cleanup have their own release gate and do not block Listus.

## Dependencies

- [State branching](../README.md)
- DALgo and `dalgo2memory`
- `dalgo2ingitdb`/inGitDB for the later persistent provider

## Acceptance Criteria

### AC:multiple-holders-are-one-checkpoint

Scenario: An application registers primary and audit databases
Given both holders are at one application-declared boundary
When a checkpoint succeeds
Then the manifest references one generation of both named holders
And a branch receives replacement handles for both before continuation

### AC:partial-checkpoint-is-not-published

Scenario: The second holder fails during checkpoint creation
Given the first holder already captured temporary state
When the second capture fails
Then no usable group checkpoint is published
And the first holder is cleaned in compensation order

### AC:partial-branch-does-not-run

Scenario: The audit database cannot start a branch
Given a valid two-holder checkpoint
When primary starts but audit fails
Then no application factory or scenario continuation runs
And the primary branch is cleaned or explicitly quarantined

### AC:memory-branches-are-independent

Scenario: Two branches start from one serialised dalgo2memory checkpoint
Given records with nested keys and mutable caller values
When branch A inserts, updates and deletes records
Then branch B and the checkpoint retain the original semantic digest
And no key/data pointer alias leaks mutation between them

### AC:unsupported-engine-fails-honestly

Scenario: A dalgo2memory database uses an unsupported storage engine
Given the first provider cannot clone its configuration safely
When checkpoint creation is requested
Then it returns a clear unsupported-capability error
And does not publish a partial checkpoint

## Open Questions

- Should DALgo's additive primitive live in `dal`, a new sibling package or each
  adapter package?
- Which serialised representation is stable enough for compatibility/version
  checks without becoming a public backup format?

---
*This document follows the https://specscore.md/feature-specification*
