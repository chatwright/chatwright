---
format: https://specscore.md/plan-specification
status: Draft
---

# Plan: Listus branchable reference scenario

**Status:** Draft
**Source:** chatwright/scenario-authoring/scenario-composition, chatwright/state-branching, chatwright/state-branching/database-state-holders
**Date:** 2026-07-22
**Owner:** alex
**Supersedes:** —

## Summary

Create Chatwright's first honest branchable chat journey around Listus. Define
the reusable product scenario in `sneat-bots`, prove it first through Listus's
existing deterministic in-process conversation path, then make the release gate
the same scenario executed by `sneat-go` through a real Telegram webhook against
Chatwright's fake Bot API.

The pilot branches database state only. It uses `dalgo2memory`, runs sibling
branches sequentially, registers one Listus database in the reference journey
and separately proves a two-database holder group. New-user and existing-user
journeys invoke the same reusable list-items fragment.

This is a process-priority investment: repeatable Listus onboarding and list
mutation coverage directly supports the Sneat priority that `@SneatBot has no
known bugs`.

## Chosen Scope

### Included

- Go-first, process-local and sequential scenario execution;
- the default serialised `dalgo2memory` engine as the first provider;
- a generic application-owned list of named branchable state holders, with an
  application-provided composite accepted as the alternative registration
  shape;
- one Listus database in the end-to-end journey and a separate two-memory-DB
  conformance scenario;
- a deterministic direct-conversation integration rung before the Telegram
  end-to-end gate;
- a genuine new Telegram user using fake authentication, language selection and
  normal default/family-space provisioning rather than a hidden pre-seeded
  onboarded user;
- an explicit existing-user fixture which invokes the same list fragment;
- semantic assertions over item title, done state and count, not generated IDs
  or timestamps;
- named checkpoints `onboarding-complete` and `few-items-added`;
- database-only evidence, lineage, fixture-specific digests and cleanup status.

### Deferred

- inGitDB as a release gate; it remains the selected second provider after the
  memory contract stabilises;
- columnar or custom `dalgo2memory` storage engines;
- real Firebase/Auth/Firestore and external Telegram credentials;
- parallel branch execution, Cloud checkpoint persistence and retention;
- branching emulator messages, cursors, clocks, queues, files, caches or other
  process state;
- WhatsApp or cross-platform parity;
- freezing a final public Go API or structured scenario language.

## Reference Scenario

~~~text
Listus reference journeys
├── New Telegram user
│   ├── /start
│   ├── Choose English
│   ├── Verify bot/app user and usable default Listus space
│   ├── Checkpoint: onboarding-complete
│   └── Use: list-items-modification
└── Existing user
    ├── Load an explicit onboarded-user fixture
    └── Use: list-items-modification

list-items-modification
├── Add milk, bread, eggs and apples
├── Verify four active items and no done items
├── Checkpoint: few-items-added
├── Branch: add-new-and-existing
│   ├── Add bananas
│   ├── Re-add milk
│   └── Verify exact-title deduplication/reactivation semantics
├── Branch: mark-bought-and-remove-done
│   ├── Mark selected items bought
│   ├── Remove done items
│   └── Verify only the untouched active items remain
└── Branch: remove-selected-then-remove-all
    ├── Remove selected items
    ├── Remove all remaining items
    └── Verify the list is empty
~~~

The re-add branch assumes the established Listus behaviour: an exact-title item
is not duplicated and a matching done item is reactivated. If product intent is
instead "add more items to an already non-empty list", rename the branch and
drop the duplicate assertion without changing the branching architecture.

### Checkpoint invariants

`onboarding-complete` contains a bot user, app user, selected locale and a usable
default Listus space. It must result from the onboarding behaviour under test;
the new-user scenario cannot silently call the existing-user fixture.

`few-items-added` contains exactly milk, bread, eggs and apples, all active. Each
sibling begins with that semantic state, even after an earlier sibling mutates
its own database.

Because the checkpoint excludes emulator state, every sibling receives a fresh
Chatwright driver and bot/application environment. It sends a new command or
renders a new message; it never reuses a message handle created before the
checkpoint.

## Repository Boundaries

| Repository | Responsibility |
|---|---|
| `chatwright/chatwright` | scenario composition, holder registry/coordinator, runner/environment binding, evidence and public specifications |
| DALgo | additive provider-neutral branching primitive and conformance harness; do not widen mandatory `dal.DB` |
| `dalgo2memory` | deep-copy checkpoint and fresh-DB branch support for the serialised engine |
| `sneat-bots` | reusable Listus scenario/fragment definitions, product fixtures and assertions, conversation actions, direct integration rung and deterministic bot/framework seams |
| `sneat-go` | execution host for those scenarios: actual ListusBot profile, fake-auth onboarding, environment/database factories and Telegram webhook adapter |

`sneat-bots` is the source of truth for what the Listus scenario does. It must
export or otherwise expose the scenario definition without importing
`sneat-go`. `sneat-go` supplies an adapter/environment which executes that
definition against the real application profile; it must not copy or redefine
the steps. This preserves the existing dependency direction.

The implementation lead must first resolve Chatwright's canonical committed
runtime location. The current `chatwright/cli` checkout has no commit history;
agents must not create a second implementation there while the committed
`chatwright/chatwright/chatwrite` tree exists.

All work starts in clean worktrees from recorded `origin/main` revisions. Dirty
root checkouts and unrelated changes are read-only inputs, never integration
targets.

## Work Plan

### Wave 0: Freeze the foundation

#### Task 0: Baseline, worktrees and canonical runtime

**Model:** Sol
**Depends-On:** —
**Status:** planning

Record repository revisions and current focused test results, create one clean
worktree per implementation lane, and decide the one Chatwright runtime package
that all agents extend. Record cross-repository dependency replacement and
integration order before editing runtime code.

#### Task 1: Freeze lifecycle semantics and package ownership

**Model:** Sol
**Depends-On:** 0
**Status:** planning

Convert the feature acceptance criteria into contract tests and an architecture
note. Freeze semantics, not cosmetic API names: uniquely named holders,
immutable checkpoints, fresh replacement `dal.DB` handles, all-or-none grouped
checkpoint/branch start, reverse-order compensation, explicit unsupported
capabilities and database-only manifests. Do not add methods to `dal.DB`.

### Wave 1: Parallel contract and product lanes

Tasks 2–6 may run concurrently after Task 1. Their path ownership must not
overlap.

#### Task 2: Reusable scenario composition

**Model:** Terra
**Repository:** `chatwright/chatwright`
**Depends-On:** 1
**Status:** planning

Implement the smallest typed fragment/execution-context layer that preserves
parent invocation path, fragment source, effective inputs and qualified
checkpoint identity. Add semantic text/action matching only where the Listus
journey demonstrates a real need.

#### Task 3: Holder registry and group coordinator

**Model:** Sol
**Repository:** `chatwright/chatwright`
**Depends-On:** 1
**Status:** planning

Implement the generic named-holder/composite boundary with fake-holder tests.
Prove duplicate-name rejection, deterministic order, no partial publication,
reverse cleanup, idempotent release and no application continuation after a
partial branch failure.

#### Task 4: DALgo additive branching contract

**Model:** Sol
**Repository:** DALgo
**Depends-On:** 1
**Status:** planning

Place an optional branching primitive beside, not inside, mandatory `dal.DB`.
Build a provider-neutral conformance harness around application-supplied seed,
mutation and semantic-digest callbacks so providers need not expose generic
record enumeration.

#### Task 5: Listus mutation behaviour and direct baseline

**Model:** Terra
**Repository:** `sneat-bots`
**Depends-On:** 1
**Status:** planning

Freeze current add, exact-title re-add/reactivate, mark-bought and selected-item
removal behaviour through the existing direct conversation test path. Add the
missing remove-done and remove-all conversational operations with explicit
confirmation behaviour and deterministic tests. Keep storage access behind the
Listus facade rather than teaching action catalogs about DALgo.

#### Task 6: Genuine onboarding and Telegram harness spike

**Model:** Sol
**Repository:** `sneat-go` with narrowly scoped test seams in `sneat-bots`
**Depends-On:** 1
**Status:** planning

Prove a new ListusBot user can complete `/start` and language selection with fake
auth and receive a usable default/family space. Mount the actual profile on a
test webhook, rewrite Telegram API traffic to Chatwright's fake Bot API and use
HTTP response mode. Treat failure to provision the space as a product defect,
not permission to pre-seed the new-user fixture.

### Wave 2: Providers and reference journeys

#### Task 7: `dalgo2memory` provider

**Model:** Terra
**Repository:** `dalgo2memory`
**Depends-On:** 4
**Status:** planning

Implement checkpoint/branch for the default serialised engine. Deep-copy record
key parent chains and mutable byte values; create a fresh database per branch;
cover empty state plus insert/update/delete/nested-key isolation; and return an
explicit unsupported error for columnar/custom engines. Run the shared
conformance harness and race tests.

#### Task 8: Branch application/environment binding

**Model:** Sol
**Repository:** `chatwright/chatwright`, then the narrow Listus harness seam
**Depends-On:** 3, 6, 7
**Status:** planning

Bind a complete holder group into a fresh application/environment factory
before the branch continues. For the Telegram harness create a fresh bot,
webhook and emulator session per sibling and attach the replacement database to
every request context. Keep execution sequential because bot-framework response
mode is process-global.

#### Task 9: Reusable Listus scenario and direct execution

**Model:** Terra
**Repository:** `sneat-bots`
**Depends-On:** 2, 5, 7
**Status:** planning

Implement the reusable new-user setup contract, existing-user setup contract
and shared list-items fragment in `sneat-bots`. Execute the definition through
the deterministic direct path, create `few-items-added`, run all mutation
siblings and prove semantic-digest isolation. Keep execution dependencies behind
an adapter so `sneat-bots` does not import `sneat-go`. This is the fast
diagnostic rung, not the final fidelity claim.

#### Task 10: Execute the Listus scenarios against `sneat-go`

**Model:** Sol
**Repository:** `sneat-go`
**Depends-On:** 2, 5, 8, 9
**Status:** planning

Add a `sneat-go` test host, preferably beside the Listus profile tests, which
executes the scenario definitions owned by `sneat-bots` against the actual
ListusBot Telegram webhook. The host supplies fake auth, application/profile
startup, holder/environment factories and Chatwright transport. It must not copy
the scenario steps. The new-user path creates `onboarding-complete`; both new
and existing paths invoke the same list fragment. Assertions use visible bot
behaviour plus semantic database digests and never reuse pre-checkpoint message
handles.

### Wave 3: Integration and evidence

#### Task 11: Cross-repository integration gate

**Model:** Sol
**Depends-On:** 2–10
**Status:** planning

Integrate commits in dependency order, remove temporary replacements, run
focused and affected suites with race detection, and repeat the complete
scenario 20 times. Verify manifests, lineage, branch/replay mechanism, excluded
state and cleanup evidence. Record any retained experimental API as internal.

#### Task 12: Documentation and status reconciliation

**Model:** Terra; Luna is acceptable for purely mechanical link/status updates
**Depends-On:** 11
**Status:** planning

Update package docs, runnable commands, SpecScore status and implementation
links. Keep deferred inGitDB, parallel execution and non-database holders clearly
separate from delivered behaviour.

## Parallel-Agent Allocation

| Wave | Agent | Model | Exclusive ownership | Waits for |
|---|---|---|---|---|
| 0 | Lead/architecture | Sol | baselines, contract decisions, integration map | — |
| 1 | Composition | Terra | Chatwright fragment/provenance files and tests | Task 1 |
| 1 | Coordinator | Sol | Chatwright holder/coordinator files and tests | Task 1 |
| 1 | DALgo contract | Sol | DALgo optional contract and conformance files | Task 1 |
| 1 | Listus behaviour | Terra | `sneat-bots` Listus actions/direct tests | Task 1 |
| 1 | Onboarding spike | Sol | `sneat-go` ListusBot harness/onboarding tests | Task 1 |
| 2 | Memory provider | Terra | `dalgo2memory` implementation/tests | Task 4 |
| 2 | Runtime binding | Sol | factory/binding seam only | Tasks 3, 6, 7 |
| 2 | Scenario definition/direct run | Terra | reusable scenario definitions and direct runner in `sneat-bots` | Tasks 2, 5, 7 |
| 2 | `sneat-go` execution host | Sol | adapter/harness files beside the actual ListusBot profile; no copied scenario definitions | Tasks 2, 5, 8, 9 |
| 3 | Integration lead | Sol | dependency updates, final fixes and gate | all implementation tasks |
| 3 | Documentation | Terra or Luna | docs/status files only | Task 11 |

Agents return a commit, commands/tests run, assumptions and unresolved risks to
the lead. Only the lead updates dependency versions or shared integration files.
If two tasks discover they need the same file, one stops and hands the requested
change to its owner rather than creating conflicting edits.

## Model Recommendation

Use **Sol as the primary implementer and integration lead**. This change crosses
scenario semantics, database lifecycle, multiple Go modules and a genuine
onboarding defect boundary; it benefits from the strongest cross-repository
reasoning.

Use **Terra for bounded tasks after Task 1 freezes the contract**: scenario
composition, Listus actions/direct tests, the serialised memory provider and
documentation. Terra should not independently choose competing lifecycle or
package contracts.

Use **Luna only for mechanical fixture expansion, link/status updates or repetitive
table-driven cases after a Sol/Terra-owned test pattern exists**. Luna is not
currently exposed as a selectable subagent model in this workspace, so the
practical first run should use Sol and Terra only rather than block on it.

## Release Gate

- The direct diagnostic rung and real Telegram webhook rung both pass without
  network credentials or cloud services.
- The new-user path proves actual language selection and default Listus-space
  provisioning; it does not call the existing-user seeder.
- Both named checkpoints carry qualified lineage and `database-only` scope.
- New-user and existing-user journeys invoke one list-items fragment.
- All three mutation siblings pass and each later sibling starts from the same
  four-active-item digest.
- The grouped-holder conformance suite passes with two memory databases,
  including partial-failure compensation.
- Branches receive fresh database, bot and driver handles and do not use old
  message handles.
- The complete reference scenario passes 20 consecutive runs plus affected Go
  race tests.
- Existing affected repository suites pass and no real Telegram/Firebase call is
  observed.
- inGitDB, columnar memory mode and non-database state are not required or
  implied by the result.

## Implementation-Agent Prompt

~~~text
Implement the SpecScore plan "Listus branchable reference scenario" in the
Chatwright/Sneat/DALgo repositories. Read these specifications first:

- spec/features/chatwright/scenario-authoring/scenario-composition/README.md
- spec/features/chatwright/state-branching/README.md
- spec/features/chatwright/state-branching/database-state-holders/README.md
- spec/plans/listus-branching-reference-scenario.md

Priority link: this reusable regression journey supports the Sneat top priority
that @SneatBot has no known bugs by exercising Listus onboarding and list
mutation behaviour repeatedly.

Act as the Sol implementation lead. Do not start feature code until Tasks 0 and
1 have recorded clean origin/main worktrees, current baselines, the canonical
Chatwright runtime home and contract tests. Preserve every dirty root checkout.
Do not widen dal.DB. Branches must receive fresh DB handles; no in-place reset.
The MVP is database-only and sequential. Use dalgo2memory's default serialised
engine; inGitDB and columnar mode are explicitly deferred.

After Task 1, delegate independent lanes exactly as the plan permits: Sol for
holder/DALgo contracts, onboarding/runtime binding and final Telegram E2E;
Terra for scenario composition, bounded Listus behaviour/direct tests and the
memory provider. Give each agent exclusive file ownership. Require each agent
to return a commit, tests run, assumptions and risks. Do not let agents update
shared dependency files; integrate those centrally in dependency order.

Define the Listus scenarios and shared list-items fragment in sneat-bots. Keep
sneat-bots independent of sneat-go. Build the direct-conversation execution rung
there first, but do not call the work complete until a sneat-go-owned host runs
those same definitions against the actual ListusBot Telegram webhook with fake
auth and normal default-space provisioning. Do not copy scenario steps into
sneat-go. New and existing users must invoke the same fragment. Create
onboarding-complete and few-items-added checkpoints, then run isolated
add/re-add, mark/remove-done and selected-remove/remove-all siblings. Assert
semantic state, not generated IDs or timestamps, and never use a pre-checkpoint
message handle inside a branch.

Run the release gate from the plan, including two-memory-DB conformance, race
tests and 20 consecutive full runs. Report commits by repository, commands and
results, delivered acceptance criteria, deferred items and remaining risks. Do
not push, publish, deploy or release without explicit user authorization.
~~~

## Open Questions

- Confirm that "add items already on list" means exact-title
  deduplication/reactivation; otherwise treat it as adding only new items to a
  non-empty list.
- Which exact default/family space should the production new-user onboarding
  path provision for Listus?
- Should remove-done and remove-all each require an explicit confirmation, and
  what visible cancellation behaviour is required?
- Which committed Chatwright runtime path should replace the current ambiguous
  `chatwrite/` versus unversioned `cli/` split?

---
*This document follows the https://specscore.md/plan-specification*
