---
format: https://specscore.md/plan-specification
status: Executing
---

# Plan: Listus branchable reference scenario

**Status:** Executing
**Source:** idea:chatwright
**Features:** chatwright/scenario-authoring/scenario-composition, chatwright/deterministic-testing/data-state-assertions, chatwright/state-branching, chatwright/state-branching/database-state-holders
**Date:** 2026-07-22
**Owner:** alex
**Supersedes:** —

## Summary

Create Chatwright's first honest branchable chat journey around Listus. Define
the reusable product scenario in `sneat-bots`, prove it first through Listus's
existing deterministic in-process conversation path, then make the release gate
the same shared list fragment executed by `sneat-go` after profile-qualified
ListusBot and SneatBot onboarding through real Telegram webhooks against
Chatwright's fake Bot API.

The pilot branches database state only. It uses `dalgo2memory`, runs sibling
branches sequentially, registers one Listus database in the reference journey
and separately proves a two-database holder group. New-user and existing-user
journeys invoke the same reusable list-items fragment. Read-only DTQL assertions
after messages and at checkpoints prove what Listus persisted and attach the
queried records to run evidence.

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
- a genuine new Telegram user using fake authentication and language selection,
  with the default family space auto-created by the Sneat auth system and
  assigned to the user rather than hidden in a pre-seeded onboarded fixture;
- an explicit existing-user fixture which invokes the same list fragment;
- message-level, checkpoint and branch-completion DTQL queries against the named
  Listus database holder;
- semantic record assertions over item title, done state and count, not generated
  IDs or timestamps, with bounded result previews in evidence;
- the smallest DTQL extension needed to address Listus's parent-scoped `lists`
  collection and return its nested `items` field;
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
├── Add milk
├── DTQL: show the groceries list record and assert stored active milk
├── Add bread, eggs and apples
├── DTQL: assert exactly four active items and show the list record
├── Checkpoint: few-items-added
├── Branch: add-new-and-existing
│   ├── Add bananas
│   ├── Re-add milk
│   └── DTQL: verify current deduplication/reactivation semantics
├── Branch: mark-bought-and-remove-done
│   ├── Mark selected items bought
│   ├── Remove done items
│   └── DTQL: show the record and verify only untouched active items remain
└── Branch: remove-selected-then-remove-all
    ├── Remove selected items
    ├── Remove all remaining items
    └── DTQL: show the record and verify its items are empty
~~~

The re-add branch preserves whatever behaviour the existing Listus tests and
implementation establish. Current reconnaissance indicates that an exact-title
item is not duplicated and a matching done item is reactivated; the implementer
must characterise that behaviour before changing actions and then lock the
observed result into the reusable scenario.

### Checkpoint invariants

`onboarding-complete` contains a bot user, app user, selected locale and the
default family space auto-created and assigned by the Sneat auth system. It must
result from the onboarding behaviour under test; the new-user scenario cannot
provision that space itself or silently call the existing-user fixture.

`few-items-added` contains exactly milk, bread, eggs and apples, all active. Each
sibling begins with that semantic state, even after an earlier sibling mutates
its own database. A DTQL assertion against the concrete list record gates
checkpoint publication; transcript text alone cannot establish this invariant.

Because the checkpoint excludes emulator state, every sibling receives a fresh
Chatwright driver and bot/application environment. It sends a new command or
renders a new message; it never reuses a message handle created before the
checkpoint.

## Repository Boundaries

| Repository | Responsibility |
|---|---|
| `chatwright/chatwright` | scenario composition, DTQL data assertions, holder registry/coordinator, runner/environment binding, evidence and public specifications |
| DALgo | additive provider-neutral branching primitive, DTQL parent-path support and conformance harness plus `adapters/dalgo2memory`; do not widen mandatory `dal.DB` |
| `datatug/datatug` | read-only compatibility reference for DTQL authoring/inspection; no daemon or CLI dependency in this MVP |
| `sneat-co/listus` | source of truth for the parent-scoped list record and embedded-item schema; change only if an exposed query seam is required |
| `sneat-bots` | reusable Listus scenario/fragment definitions, product fixtures and assertions, conversation actions, direct integration rung and deterministic bot/framework seams |
| `sneat-go` | execution host for those scenarios: actual ListusBot and SneatBot profiles, profile-specific fake-auth onboarding, environment/database factories and Telegram webhook adapter |

`sneat-bots` is the source of truth for what the Listus scenario does. It must
export or otherwise expose the scenario definition without importing
`sneat-go`. `sneat-go` supplies an adapter/environment which executes that
definition against the real application profile; it must not copy or redefine
the steps. This preserves the existing dependency direction.

The implementation lead must first resolve Chatwright's canonical committed
runtime location. The current `chatwright/cli` checkout has no commit history;
agents must not create a second implementation there while the committed
`chatwright/chatwright/chatwrite` tree exists.

All work starts by cloning missing repositories or fetching and fast-forwarding
existing clean checkouts from their default branches. The lead records the
resulting revision of every repository it reads or edits. Feature work then uses
clean worktrees from those revisions. Dirty root checkouts and unrelated changes
are read-only inputs, never integration targets.

## Work Plan

### Wave 0: Freeze the foundation

#### Task 0: Baseline, worktrees and canonical runtime

**Model:** Sol
**Depends-On:** —
**Status:** complete

Clone or fast-forward every repository that will be read or edited, record its
remote/default branch/revision and current focused test results, create one clean
worktree per implementation lane, and decide the one Chatwright runtime package
that all agents extend. Record cross-repository dependency replacement and
integration order before editing runtime code.

#### Task 1: Freeze lifecycle semantics and package ownership

**Model:** Sol
**Depends-On:** 0
**Status:** complete

Convert the feature acceptance criteria into contract tests and an architecture
note. Freeze semantics, not cosmetic API names: uniquely named holders,
immutable checkpoints, fresh replacement `dal.DB` handles, all-or-none grouped
checkpoint/branch start, reverse-order compensation, explicit unsupported
capabilities and database-only manifests. Also freeze when message/checkpoint
DTQL assertions execute, how they select a named holder and how a failed query
gates checkpoint publication. Do not add methods to `dal.DB`.

### Wave 0 contract freeze

The committed Chatwright runtime for this plan is the Go module rooted at
`chatwrite/` (`github.com/chatwright/chatwright/chatwrite`). The fresh checkout contains
no `cli/` runtime, and no second implementation may be introduced beside
`chatwrite/`.

Wave 0 recorded these clean synchronized bases:

| Repository | URL | Default branch | Starting commit | Use |
|---|---|---|---|---|
| Chatwright | `https://github.com/chatwright/chatwright.git` | `main` | `aa42ec0f6deb7f735117cd2a7f01736d617e6d9e` | modified |
| DALgo | `https://github.com/dal-go/dalgo.git` | `main` | `c979840261d55af0598aea3cdb905c9fffa28e09` | modified |
| sneat-bots | `https://github.com/sneat-co/sneat-bots.git` | `main` | `1009a685b47891d8bae1168d2d2eee0dafde9711` | modified |
| sneat-go | `https://github.com/sneat-co/sneat-go.git` | `main` | `21a293129e83162bb8dc30066f286622e3c5ccf6` | modified |
| Listus backend | `https://github.com/sneat-co/listus.git` | `main` | `ea91d7b8ef82f2df926f153318ac384573b05be5` | read-only |
| Sneat core modules | `https://github.com/sneat-co/sneat-core-modules.git` | `main` | `712ce897548e7b7ac9a1b3f010d62bab59350433` | read-only |

The lifecycle contract is frozen as follows:

- holder registration rejects empty and duplicate application names before
  invoking a holder;
- capture and branch start visit holders in registration order and publish a
  group result only after every holder succeeds;
- partial capture and partial branch start compensate completed work in reverse
  registration order, retain the primary failure, and report cleanup failures
  as quarantined resources;
- checkpoints are immutable until idempotent release, and every branch owns a
  fresh replacement handle with idempotent finish;
- application continuation starts only after the complete replacement group is
  available and the application factory has bound it;
- checkpoint identity is qualified by scenario and fragment invocation path;
- evidence scope is exactly `database-only`, includes holder generations,
  mechanism and cleanup, and explicitly excludes emulator/messages/cursors,
  clocks, queues, process globals, caches and files;
- sibling branches execute sequentially and never reset a live database;
- DALgo exposes branching as an optional sibling-package capability and does
  not add a method to `dal.DB`;
- the first memory provider accepts only the default serialised engine and
  returns an explicit unsupported-capability error for columnar/custom engines.

The following contract-test identities are fixed. Implementations may add
cases, but must not weaken or rename these behaviours without updating this
plan and its feature acceptance criteria:

| Repository/package | Frozen contract tests |
|---|---|
| Chatwright `branching` | `TestRegistryRejectsEmptyAndDuplicateNames`, `TestCapturePublishesOnlyCompleteGroups`, `TestCaptureFailureCompensatesInReverseOrder`, `TestBranchFailureDoesNotInvokeApplicationFactory`, `TestBranchFailureCompensatesInReverseOrder`, `TestCleanupFailuresAreQuarantined`, `TestReleaseAndFinishAreIdempotent`, `TestEvidenceIsExplicitlyDatabaseOnly`, `TestBranchFactoryReceivesOnlyFreshReplacementHandles` |
| Chatwright scenario composition | `TestFragmentInvocationRecordsParentPathSourceAndInputs`, `TestFragmentInputsAreIsolated`, `TestCheckpointIdentityIsQualifiedByInvocationPath`, `TestCheckpointLineageCrossesParentAndFragment` |
| DALgo optional contract | `TestDBInterfaceIsNotWidened`, plus a provider-neutral `branchingtest.RunConformance` covering empty, seed, mutate, semantic digest, source isolation, sibling isolation, fresh handles and idempotent cleanup |
| `dalgo2memory` | `TestBranchingConformanceSerialized`, `TestBranchingPreservesNestedKeyChains`, `TestBranchingRejectsColumnarEngine`, `TestTwoMemoryDatabasesConformAsOneGroup` |
| sneat-bots Listus actions | `TestExactTitleReaddDeduplicatesActiveItem`, `TestExactTitleReaddReactivatesDoneItem`, confirmed remove-done/remove-all confirm and cancel tests, and semantic title/status/count assertions |
| sneat-bots Listus scenario | `TestListusReferenceScenarioDirect` with the three named siblings starting from the same four-active-item digest and one fragment invoked by new/existing parents |
| sneat-go onboarding | a fake-auth new-user test proving bot user, app user, locale, and auth-created/assigned default family space without fixture provisioning |
| sneat-go Telegram host | `TestListusReferenceScenarioTelegramWebhook` executing profile-qualified parents and the same sneat-bots list fragment through actual ListusBot and SneatBot profiles plus Chatwright fake Bot API, with fresh DB, bot, application and driver handles per sibling |

Exclusive implementation ownership is frozen by path:

| Lane | Exclusive paths |
|---|---|
| Chatwright composition | new `chatwrite/scenario*.go` files and their tests only |
| Chatwright coordinator | new `chatwrite/branching/**` files only |
| DALgo contract | new top-level `branching/**` and `branchingtest/**` files only |
| DALgo memory | `adapters/dalgo2memory/branching*.go` and tests; request any shared engine edit from the integration lead |
| sneat-bots actions | existing `extensions/listus/convoactions/**` and `extensions/listus/listusbot/cmds4listusbot/**` action/test files only |
| sneat-bots scenario | new `extensions/listus/scenarios/**` files only |
| sneat-go onboarding | `pkg/bots/botauth/facade4botauth/**` onboarding files/tests only |
| sneat-go host | new Listus execution-host test/support files under `pkg/bots/botinit/` only |

Only the integration lead owns `go.mod`, `go.sum`, specification status/links,
and edits outside the path table. Cross-repository integration order is DALgo
contract, DALgo memory, Chatwright composition/coordinator, sneat-bots actions,
sneat-bots scenario, sneat-go onboarding, then sneat-go Telegram host. Local
`replace` directives used while integrating must be removed before the release
gate.

### Wave 1: Parallel contract and product lanes

Tasks 2–6 may run concurrently after Task 1. Their path ownership must not
overlap.

#### Task 2: Reusable scenario composition

**Model:** Terra
**Repository:** `chatwright/chatwright`
**Depends-On:** 1
**Status:** complete

Implement the smallest typed fragment/execution-context layer that preserves
parent invocation path, fragment source, effective inputs and qualified
checkpoint identity. Add semantic text/action matching only where the Listus
journey demonstrates a real need.

#### Task 2A: DTQL data-state assertion runtime

**Model:** Terra
**Repository:** `chatwright/chatwright`
**Depends-On:** 1
**Status:** complete

Implement the smallest provider-neutral assertion layer from the data-state
feature: attachment after settled message/action work, checkpoint gating,
branch-completion checks, named-holder resolution, canonical DTQL evidence,
bounded/redacted record previews and deterministic row normalisation. Use a fake
DTQL executor for contract tests until Task 4 lands; do not invent a private
query language or require a DataTug process.

#### Task 3: Holder registry and group coordinator

**Model:** Sol
**Repository:** `chatwright/chatwright`
**Depends-On:** 1
**Status:** complete

Implement the generic named-holder/composite boundary with fake-holder tests.
Prove duplicate-name rejection, deterministic order, no partial publication,
reverse cleanup, idempotent release and no application continuation after a
partial branch failure.

#### Task 4: DALgo branching and Listus DTQL contracts

**Model:** Sol
**Repository:** DALgo
**Depends-On:** 1
**Status:** complete

Place an optional branching primitive beside, not inside, mandatory `dal.DB`.
Build a provider-neutral conformance harness around application-supplied seed,
mutation and semantic-digest callbacks so providers need not expose generic
record enumeration. In the same DALgo-owned lane, prove the existing DTQL and
`dalgo2memory` query behaviour against the actual Listus storage shape. Extend
DTQL only as needed to losslessly encode a parent-scoped `CollectionRef` and
select the intended `buy!groceries` list record with its `count` and nested
`items`; keep joins and arbitrary collection-group work out of scope.

#### Task 5: Listus mutation behaviour and direct baseline

**Model:** Terra
**Repository:** `sneat-bots`
**Depends-On:** 1
**Status:** complete

Characterise and freeze current add/re-add, mark-bought and selected-item removal
behaviour through the existing direct conversation test path; existing behaviour
is treated as correct. Preserve the current confirmation behaviour. If
remove-done or remove-all is missing, implement it with explicit confirmation
and deterministic confirm/cancel tests. Keep storage access behind the Listus
facade rather than teaching action catalogs about DALgo.

#### Task 6: Genuine onboarding and Telegram harness spike

**Model:** Sol
**Repository:** `sneat-go` with narrowly scoped test seams in `sneat-bots`
**Depends-On:** 1
**Status:** complete

Prove a new ListusBot user can complete `/start` and language selection with fake
auth while the Sneat auth system auto-creates and assigns the default family
space. Mount the actual profile on a test webhook, rewrite Telegram API traffic
to Chatwright's fake Bot API and use HTTP response mode. Treat failure to
provision the space as a product defect, not permission for the scenario or test
harness to pre-seed it.

### Wave 2: Providers and reference journeys

#### Task 7: `dalgo2memory` provider

**Model:** Terra
**Repository:** DALgo (`adapters/dalgo2memory`)
**Depends-On:** 4
**Status:** complete

Implement checkpoint/branch for the default serialised engine. Deep-copy record
key parent chains and mutable byte values; create a fresh database per branch;
cover empty state plus insert/update/delete/nested-key isolation; and return an
explicit unsupported error for columnar/custom engines. Run the shared
conformance harness and race tests. Add an end-to-end DTQL query case proving a
parent-scoped Listus-shaped record remains queryable in every fresh branch.

#### Task 8: Branch application/environment binding

**Model:** Sol
**Repository:** `chatwright/chatwright`, then the narrow Listus harness seam
**Depends-On:** 3, 6, 7
**Status:** complete

Bind a complete holder group into a fresh application/environment factory
before the branch continues. For the Telegram harness create a fresh bot,
webhook and emulator session per sibling and attach the replacement database to
every request context. Keep execution sequential because bot-framework response
mode is process-global.

#### Task 9: Reusable Listus scenario and direct execution

**Model:** Terra
**Repository:** `sneat-bots`
**Depends-On:** 2, 2A, 4, 5, 7
**Status:** in_progress

Implement the reusable new-user setup contract, existing-user setup contract
and shared list-items fragment in `sneat-bots`. Execute the definition through
the deterministic direct path, create `few-items-added`, run all mutation
siblings and prove semantic-digest isolation. Keep execution dependencies behind
an adapter so `sneat-bots` does not import `sneat-go`. This is the fast
diagnostic rung, not the final fidelity claim. After adding milk, execute and
show the parent-scoped groceries-list DTQL result; gate `few-items-added` and
every mutation branch with the corresponding stored-state assertion.

#### Task 10: Execute the Listus scenarios against `sneat-go`

**Model:** Sol
**Repository:** `sneat-go`
**Depends-On:** 2, 2A, 4, 5, 8, 9
**Status:** in_progress

Add a `sneat-go` test host beside the bot profile tests which executes the
scenario definitions owned by `sneat-bots` against actual ListusBot and SneatBot
Telegram webhooks. The host supplies profile-specific fake auth/onboarding,
application/profile startup, holder/environment factories and Chatwright
transport. It must not copy the list scenario steps. Each new-user parent creates
its qualified `onboarding-complete`; new and existing parents for both profiles
invoke the exact same list fragment. Assertions use visible bot behaviour plus
semantic database digests and never reuse pre-checkpoint message handles.
The same DTQL assertions from `sneat-bots` must run against the database
handle supplied by the `sneat-go` execution host; the host must not replace them
with direct Listus facade assertions.

### Wave 3: Integration and evidence

#### Task 11: Cross-repository integration gate

**Model:** Sol
**Depends-On:** 2, 2A, 3–10
**Status:** in_progress

Integrate commits in dependency order, remove temporary replacements, run
focused and affected suites with race detection, and repeat the complete
scenario 20 times. Verify manifests, lineage, branch/replay mechanism, excluded
state and cleanup evidence. Verify each concrete DTQL, selected holder, returned
record preview and assertion outcome are correlated to the triggering message or
checkpoint. Record any retained experimental API as internal.

#### Task 12: Documentation and status reconciliation

**Model:** Terra; Luna is acceptable for purely mechanical link/status updates
**Depends-On:** 11
**Status:** in_progress

Update package docs, runnable commands, SpecScore status and implementation
links. Keep deferred inGitDB, parallel execution and non-database holders clearly
separate from delivered behaviour.

## Parallel-Agent Allocation

| Wave | Agent | Model | Exclusive ownership | Waits for |
|---|---|---|---|---|
| 0 | Lead/architecture | Sol | baselines, contract decisions, integration map | — |
| 1 | Composition | Terra | Chatwright fragment/provenance files and tests | Task 1 |
| 1 | DTQL assertions | Terra | Chatwright data-state assertion files and fake-executor tests | Task 1 |
| 1 | Coordinator | Sol | Chatwright holder/coordinator files and tests | Task 1 |
| 1 | DALgo contract | Sol | DALgo optional branch contract, DTQL parent path and conformance files | Task 1 |
| 1 | Listus behaviour | Terra | `sneat-bots` Listus actions/direct tests | Task 1 |
| 1 | Onboarding spike | Sol | `sneat-go` ListusBot harness/onboarding tests | Task 1 |
| 2 | Memory provider | Terra | `dalgo2memory` implementation/tests | Task 4 |
| 2 | Runtime binding | Sol | factory/binding seam only | Tasks 3, 6, 7 |
| 2 | Scenario definition/direct run | Terra | reusable scenario definitions, DTQL files/assertions and direct runner in `sneat-bots` | Tasks 2, 2A, 4, 5, 7 |
| 2 | `sneat-go` execution host | Sol | adapter/harness files beside the actual ListusBot profile; no copied scenario or DTQL definitions | Tasks 2, 2A, 4, 5, 8, 9 |
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
composition, DTQL assertion execution/evidence, Listus actions/direct tests, the
serialised memory provider and documentation. Terra should not independently
choose competing lifecycle, query or package contracts.

Use **Luna only for mechanical fixture expansion, link/status updates or repetitive
table-driven cases after a Sol/Terra-owned test pattern exists**. Luna is not
currently exposed as a selectable subagent model in this workspace, so the
practical first run should use Sol and Terra only rather than block on it.

## Implementation Result

The database-branching foundation and non-DTQL reference journey are implemented
on the four integration branches. The DTQL assertion gate added to this plan on
`main` remains pending, so the expanded plan is still `Executing`.
The canonical Chatwright runtime remains under `chatwrite/`; its publishable Go
module path is `github.com/chatwright/chatwright/chatwrite`, matching that nested
repository location.

### Integrated milestones

| Repository | Integration commits | Result |
|---|---|---|
| Chatwright | `d59cd13`, `398ec13`, `3a027f5`, `0728ea2`, `9ae60c9` | contract freeze, scenario composition, grouped coordinator, immutable message observations and publishable module path |
| DALgo | `27fea2b`, `9dd0947`, `9bb4023` | optional branching contract, conformance harness and serialised `dalgo2memory` provider |
| `sneat-bots` | `8c56977`, `7cc9037`, `cdb3b68`, `2ea811f`, `eedc0a2`, `3071a82`, `cc51035`, `98d3950` | characterised mutations, confirmed bulk removal, reusable scenarios/direct rung, profile-qualified parents, profile compatibility and dependency integration |
| `sneat-go` | `865d4586`, `155bdcaa`, `be692df5`, `98266280`, `ce252f0`, `85f2eee` | auth-managed default spaces, valid bot identities, actual dual-profile Telegram webhook host and dependency integration |

### Release evidence

- `GOWORK=off GOPROXY=off go test -p=1 ./...` passed in every modified Go
  module, including the complete `sneat-go` repository.
- `TestListusReferenceScenarioDirect` and
  `TestListusReferenceScenarioTelegramWebhook` each passed 20 consecutive runs.
- Affected race tests passed for Chatwright, DALgo branching and memory,
  `sneat-bots` Listus/profile packages, and the `sneat-go` host/auth packages.
- The real Telegram rung uses actual ListusBot and SneatBot webhooks with
  profile-qualified onboarding, fake auth and a closed HTTP transport that
  redirects only Telegram API calls to Chatwright's fake Bot API. Each new-user
  database starts empty and observes auth creating and assigning the default
  family before the exact same list fragment runs.
- Evidence checks require the two qualified checkpoints, one shared fragment,
  the three ordered isolated siblings, fresh database/application/bot/driver
  handles, released cleanup, and explicit `database-only` exclusions.
- DALgo separately passes the two-memory-database group and partial capture and
  branch failure cleanup coverage. Columnar/custom memory engines are rejected;
  inGitDB and non-database holders remain absent.

No cross-repository `replace` directive is committed. `sneat-bots` and
`sneat-go` use checksummed pseudo-versions for pushed integration milestones.

## Release Gate

- The direct diagnostic rung and the real ListusBot and SneatBot Telegram
  webhook rungs pass without network credentials or cloud services.
- The new-user path proves actual language selection and default-family-space
  auto-creation/assignment by the Sneat auth system; neither the scenario nor
  the test harness provisions it and neither calls the existing-user seeder.
- Both named checkpoints carry qualified lineage and `database-only` scope.
- New-user and existing-user journeys invoke one list-items fragment.
- After adding milk, the run shows the parent-scoped `buy!groceries` record and a
  DTQL assertion proves its stored `items` contains active milk with a consistent
  count.
- `few-items-added` and every mutation sibling are gated by DTQL stored-state
  assertions executed against the current branch's named database holder.
- DTQL/result evidence is canonical, bounded, redacted and correlated to its
  triggering message, checkpoint or branch completion.
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
Implement the SpecScore plan "Listus branchable reference scenario" using
multiple subagents. Act as the Sol implementation and integration lead.

Priority link: this reusable regression journey supports the Sneat top priority
that @SneatBot has no known bugs by exercising Listus onboarding, persistence and
list mutation behaviour repeatedly.

Repository preparation
======================

Use these canonical checkouts:

- https://github.com/chatwright/chatwright.git
  -> ~/projects/chatwright/chatwright
- https://github.com/dal-go/dalgo.git
  -> ~/projects/dal-go/dalgo
- https://github.com/datatug/datatug.git
  -> ~/projects/datatug/datatug
- https://github.com/sneat-co/listus.git
  -> ~/projects/sneat-co/listus
- https://github.com/sneat-co/sneat-bots.git
  -> ~/projects/sneat-co/sneat-bots
- https://github.com/sneat-co/sneat-go.git
  -> ~/projects/sneat-co/sneat-go

Before reading implementation code or editing anything, clone every missing
repository and run `git pull --ff-only` on the default branch of every existing
clean checkout you will read or edit. If a checkout is dirty, do not pull,
reset, stash, clean or modify it: run `git fetch origin` and create a clean
worktree from the updated remote default branch. Any additional repository must
be cloned to ~/projects/<github-org>/<repo> or updated before use. Record every
URL, default branch, exact starting commit and read/edit intent.

Never implement in a canonical checkout or on its default branch. Give every
lane a dedicated branch and exclusive worktree under:

  ~/projects/<github-org>/.worktrees/<repo>-listus-branching-<lane>

Use agent/listus-branching-<lane> feature branches and a separate
agent/listus-branching-integration branch/worktree per modified repository. The
Sol lead alone owns integration worktrees and shared dependency/version files.
If two agents need the same file, one stops and hands the change to its owner.

Read all applicable AGENTS.md files and run the Sneat priority check. After
synchronising Chatwright, read:

- spec/features/chatwright/scenario-authoring/scenario-composition/README.md
- spec/features/chatwright/deterministic-testing/data-state-assertions/README.md
- spec/features/chatwright/state-branching/README.md
- spec/features/chatwright/state-branching/database-state-holders/README.md
- spec/plans/listus-branching-reference-scenario.md

Foundation and delegation
=========================

Do not start feature code until Tasks 0 and 1 have recorded baselines, resolved
the canonical Chatwright runtime home and frozen contract tests. Do not widen
dal.DB. Branches receive fresh DB handles; no in-place reset. The MVP is
database-only and sequential, uses the default serialised dalgo2memory engine,
and defers inGitDB, columnar mode and non-database state.

After Task 1, delegate the plan's independent lanes. Use Sol for holder/DALgo
contracts, the minimal DTQL parent-path extension, onboarding/runtime binding and
the final Telegram E2E. Use Terra for scenario composition, the Chatwright DTQL
assertion runtime, bounded Listus behaviour/direct tests and the memory provider.
Every subagent returns commits, files changed, checks run, assumptions and risks.

Scenario ownership and execution
================================

Define the reusable Listus scenarios, fragments, DTQL queries and data
expectations in sneat-bots. Keep sneat-bots independent of sneat-go. sneat-go is
the execution host supplying the actual ListusBot profile, fake auth,
application/database factories, webhook and Chatwright transport. It executes,
but never copies or replaces, the sneat-bots scenario and DTQL definitions.

Build the direct-conversation rung first. Completion requires the same scenario
against the actual ListusBot Telegram webhook. New and existing users invoke one
list-items fragment. The Sneat auth system—not the scenario or harness—must
auto-create and assign the default family space.

Create onboarding-complete and few-items-added checkpoints, then run isolated
add/re-add, mark/remove-done and selected-remove/remove-all siblings. Never use a
pre-checkpoint message handle inside a database-only branch.

DTQL data assertions
====================

DTQL state assertions are MVP release requirements, not optional diagnostics.
They run against the named Listus database holder after registered application
work settles, immediately before checkpoint publication and at branch
completion. A failed checkpoint assertion prevents the checkpoint from being
published.

Listus stores a list as a record in a parent-scoped `lists` collection with
items embedded in its `items` field. Current DTQL accepts root collections only.
Extend DALgo/DTQL by the smallest lossless amount needed to encode the concrete
parent key path and execute it through dalgo2memory. Do not broaden this into
joins, arbitrary collection groups or a new query language.

After the user adds milk, execute canonical DTQL selecting the current default
family space's buy!groceries list. Show the bounded/redacted returned record and
assert exactly one intended list record, an active milk item, and a consistent
stored count. Gate few-items-added with a DTQL assertion for exactly milk,
bread, eggs and apples as active items. Query and show the same record after
every mutation branch. Use semantic state, not generated IDs or timestamps.

Chatwright owns scheduling/assertions/evidence, DALgo owns DTQL, and DataTug is
the compatible authoring/inspection surface. Do not require a DataTug daemon or
shell out to its CLI in this MVP; preserve the canonical DTQL and result schema
so a DataTug surface can open the same artifact later.

Product behaviour
=================

Characterise existing Listus add/re-add/remove behaviour before changing it and
treat it as product truth. Current reconnaissance suggests exact-title re-add
deduplicates/reactivates. Preserve existing confirmation flows. If remove-done
or remove-all is absent, implement it with explicit confirmation and
deterministic confirm/cancel coverage.

Milestone commit and push policy
================================

Commit and push completed milestones only after their relevant formatting,
lint, static checks, focused tests and affected tests pass. Milestones include:

1. contracts and architecture tests frozen;
2. each independent implementation lane completed;
3. DTQL parent-path and dalgo2memory conformance passing;
4. direct Listus scenario with DTQL assertions passing;
5. sneat-go Telegram execution with DTQL assertions passing;
6. cross-repository integration and release gate passing.

Subagents commit and push only their assigned feature branches. On first push
use `git push -u origin <feature-branch>`; later use
`git push origin <feature-branch>`. Report branch, commit, commands and results.
The Sol lead reviews and integrates into each repository's dedicated integration
branch, then commits and pushes that integration milestone after its checks pass.
Include the Sneat priority justification in Sneat-related commit/PR descriptions.
Never push directly to a default branch or another agent's branch, and do not
push a knowingly failing milestone.

Release and report
==================

Run the full release gate, including two-memory-DB conformance, DTQL query/result
evidence, race tests and 20 consecutive full runs. Report starting revisions,
agents/models, branches and commits by repository, integration order, commands
and results, delivered acceptance criteria, deferred items and risks. Do not
merge to a default branch, deploy or release without explicit user authorisation.
~~~

## Confirmed Product Decisions

- Existing Listus add/re-add semantics are correct and must be characterised and
  preserved rather than redesigned by this work.
- The Sneat auth system auto-creates the default family space and assigns it to
  the new user; the scenario and test harness only observe and verify it.
- Existing confirmation behaviour is authoritative. A newly implemented
  remove-done or remove-all operation requires explicit confirmation and a
  cancellation path.
- DTQL assertions after relevant messages and at checkpoints are part of the
  Listus branching MVP. They query and show the stored list record, and a failed
  checkpoint assertion prevents branching.

## Open Questions

- None for the database-only MVP. Task 0 resolved the runtime location as the
  committed `chatwrite/` module and aligned its module path with that directory.

---
*This document follows the https://specscore.md/plan-specification*
