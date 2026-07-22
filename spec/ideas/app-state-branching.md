---
format: https://specscore.md/idea-specification
status: Specifying
---

# Idea: App State Branching

**Status:** Specifying
**Date:** 2026-07-22
**Owner:** alex
**Promotes To:** chatwright/state-branching, chatwright/state-branching/database-state-holders
**Supersedes:** —
**Related Ideas:** extends:local-studio-continuity, extends:observation-model

## Executive Summary

Chatwright should let a scenario establish an expensive, meaningful state once
and continue several isolated paths from it:

> Set up once. Branch many times.

The full vision is that a branch inherits both the conversation and the
complete test environment—not only application storage. The implemented slice
is deliberately narrower: database-only branching; conversation, emulator and
clock holders are future work. This can make large suites faster, turn scenario
hierarchy into execution hierarchy, preserve exact failure states and make AI or
fuzz exploration economical.

The practical first version is deliberately narrow: explicit checkpoints for
one or more registered application databases, sequential isolated branches,
branch-local evidence and replay fallback. DALgo is the database boundary; the
first two providers are `dalgo2memory` and `dalgo2ingitdb` backed by inGitDB.
Branching Chatwright-owned runtime state or other application state, parallel
execution, Studio visualisation and Cloud distribution are later work.

## Problem Statement

Conversational scenarios naturally share long prefixes. An authenticated user
may book, cancel, reschedule or update details; each choice may then branch
again. Conventional runners repeat authentication, fixture creation, platform
setup and earlier turns for every leaf.

That repetition creates four costs:

- execution time and paid AI/model cost;
- duplicated setup code and drifting fixtures;
- weak expression of the actual conversation tree;
- failures that are difficult to reproduce at the exact decision point.

Reusing only a database snapshot is unsafe. State may also live in the Platform
Emulator, actors, queues, virtual time, ID generators, mocks, caches or pending
work. A branch is trustworthy only if its complete declared environment is
consistent and isolated.

## Context

Chatwright scenarios already express hierarchy through nested fragments and
shared setup, but that hierarchy is only organisational: every leaf still
replays its ancestors' setup at execution time. DALgo already gives Chatwright
one database-access abstraction over several backing adapters, which makes a
database-scoped checkpoint the first checkpoint boundary worth coordinating.
The [Observation Model](observation-model.md) can later identify what an actor
perceived at a checkpoint, and [Local CLI to web Studio continuity](local-studio-continuity.md)
can later let Studio open and compare branches; neither replaces the coordinated
environment snapshot this idea defines.

## Recommended Direction

Make scenario hierarchy executable by letting a parent establish a named
checkpoint that children restore or fork from, instead of replaying setup for
every leaf. Coordinate one or more registered DALgo database holders — or one
composite holder an application supplies — behind a single branching lifecycle
contract, and publish a checkpoint only when every holder captures successfully.

Sequence two providers: `dalgo2memory` first, as the fast ephemeral reference
implementation that proves the holder contract; `dalgo2ingitdb`/inGitDB second,
as the first persistent, inspectable provider once that contract is stable.
Everything outside registered databases — Platform Emulator state, actors,
queues, virtual time, IDs, caches and arbitrary globals — stays out of the
branching claim until it has its own holder, and every checkpoint/branch result
must say so explicitly.

## Product Insight

Scenario hierarchy should be executable, not merely organisational. A parent can
establish actors, fixtures, platform configuration and a checkpoint. Children
inherit that checkpoint and describe only their divergent continuation.

~~~text
Appointment management
└── Setup: authenticated customer
    └── Checkpoint: authenticated-user
        ├── Booking
        │   ├── Accept first option
        │   ├── Ask for later time
        │   └── Reject all options
        ├── Cancellation
        ├── Rescheduling
        └── Update contact details
~~~

The runner may realise inheritance by restoring a snapshot, forking copy-on-write
state, replaying setup or invoking an application reset hook. The scenario author
should declare the semantic checkpoint and branch tree, not a storage mechanism.

## MVP Boundary: Database State Only

The product vision is a branchable complete environment. The MVP makes a smaller
and testable promise: **only registered application database state is branched**.
It must support more than one database in the same application. A checkpoint is
usable only when every registered database holder captured successfully, and a
branch starts only when every holder has been restored or forked to the same
checkpoint generation.

State outside those databases—including Platform Emulator internals, actor
memory, queues, timers, caches, files and arbitrary globals—is not claimed as
branched by the MVP. Scenario setup may replay or reconstruct that state. The
run evidence must label the boundary as database-only so users do not infer
whole-environment isolation.

The integration model stays extensible. An application can register a list of
branchable state holders, or supply one composite implementation of the same
branching contract which coordinates its internal holders. Initially the
supported holders are DALgo databases; later holders can represent queues,
emulators, clocks, files or application-defined state without changing scenario
intent.

## Naming and Terminology

### Vocabulary

| Term | Meaning |
|---|---|
| Checkpoint | A named semantic point whose declared environment can be restored or replayed |
| Snapshot | The persisted representation and manifest captured for a checkpoint |
| Fork | Creation of a new isolated environment continuation from a checkpoint |
| Branch | One named scenario continuation and its branch-local evidence |
| Restore | Creation or reset of an execution environment from a checkpoint snapshot |
| Replay fallback | Re-execution of shared setup when a safe snapshot/fork is unavailable |
| Branch comparison | A comparison of two branch outcomes relative to their common checkpoint |

“Checkpoint” belongs in scenario language; “snapshot”, “restore” and “fork”
describe runner/provider mechanics. A restore must create or reset an isolated
environment—it must not mutate another live branch back in time.

## Illustrative API

The following examples communicate intent only. They do not finalise Go types,
method placement, error handling or concurrency semantics.

~~~go
chat.SendText("/start")
chat.ExpectBotMessage().TextContains("Welcome")

checkpoint := env.Checkpoint("authenticated-user")

checkpoint.Branch("book", func(branch chatwright.Branch) {
    chat := branch.Chat(alice, bot)
    chat.SendText("Book an appointment")
    chat.ExpectBotMessage().TextContains("Choose a date")
})

checkpoint.Branch("cancel", func(branch chatwright.Branch) {
    chat := branch.Chat(alice, bot)
    chat.SendText("Cancel my appointment")
    chat.ExpectBotMessage().TextContains("Which appointment?")
})
~~~

Milestones may become explicit checkpoint triggers without making every
milestone snapshot-worthy:

~~~go
checkpoint := run.
    ExpectMilestone("options-offered").
    Checkpoint("options-offered")
~~~

## Environment Snapshot Scope

A checkpoint is a coordinated state vector. Its manifest should identify every
participating component, its provider/version, snapshot reference, capability
flags and consistency boundary.

| State | Why it matters | Branching direction |
|---|---|---|
| Application databases | Domain state must match the scenario branch | **MVP:** one or more DALgo holders, initially `dalgo2memory` and `dalgo2ingitdb`/inGitDB |
| Conversation transcript and chat state | Later turns depend on visible history and message identity | MVP evidence/replay; future holder |
| Users, actors and actor memory | Drivers may track goals, choices and private memory | Future holder |
| Bot/platform identities | IDs and permissions shape updates and API calls | Future holder |
| Platform Emulator state | Messages, callbacks, update counters and rate/fidelity state | Future holder |
| Other application state | Files, services or in-process state may not use DALgo | Future application holder/composite |
| Virtual clock and timers | Deadlines and scheduled work must resume consistently | Future holder; constrain in MVP |
| Deterministic random state | Branches need explainable divergence | Evidence/replay in MVP; future holder |
| Generated-ID sequences | Replayed/forked messages need deterministic identities | Future holder |
| Pending jobs and queues | Hidden work can leak across the checkpoint | Future holder; quiesce or exclude in MVP |
| Fake external services | Payment, email or API mocks may contain state | Future holder |
| Scenario variables and fixtures | Children inherit parent context | Scenario definition/evidence; future holder if mutable |
| Milestones and assertions | Branches need the inherited semantic baseline | Evidence, not mutable database state |
| Metrics baseline | Setup and continuation costs must be separated | Record baseline, not reset history |
| Registered caches/globals | Mutable state can violate isolation | Future holder or explicitly unsupported |

### Consistency protocol

Capturing component blobs independently is insufficient. A future coordinator
needs a defined barrier, conceptually:

1. stop new actor input;
2. drain, freeze or reject undeclared pending work;
3. establish one logical clock and event-sequence boundary;
4. ask participating providers to prepare;
5. capture component state and versions;
6. publish one checkpoint manifest only if every required capture succeeds;
7. abort partial captures and resume the source environment.

The database-only MVP simplifies this by coordinating registered database
holders at an application-declared quiescent boundary. It rejects a checkpoint
when a holder has an active transaction or cannot establish a safe branch point,
and explicitly excludes non-database work from its isolation claim.

## Snapshot Provider Model

Chatwright should coordinate registered state holders rather than hard-code a
database. Each holder implements one branching lifecycle contract and reports
capabilities it genuinely supports. The application may register several
holders, including several databases, or provide one composite holder which
coordinates its internal state. Exact Go syntax remains an investigation.

~~~go
// Illustrative lifecycle only; not final API syntax.
type BranchableStateHolder interface {
    Identity() StateHolderIdentity
    Capabilities() BranchingCapabilities
    Checkpoint(ctx context.Context, checkpoint CheckpointID) (StateRef, error)
    StartBranch(ctx context.Context, ref StateRef, branch BranchID) (BranchState, error)
    FinishBranch(ctx context.Context, state BranchState) error
    Release(ctx context.Context, ref StateRef) error
}

type BranchingCapabilities struct {
    CopyOnWrite  bool
    Persistent   bool
    FastRestore  bool
    Diffable     bool
    ParallelSafe bool
}
~~~

A holder contract also needs compatibility semantics: coordinated prepare,
capture, restore/fork, release, cleanup, schema/code fingerprint and sensitive
data classification. Optional operations such as structured diff or persistence
should be capability-gated rather than mandatory. Whether the phases are direct
methods, operation objects or a manifest protocol remains unresolved.

For multiple holders, the coordinator publishes no checkpoint until all captures
succeed. If any capture or branch start fails, it aborts or cleans every partial
result. A composite application implementation assumes this coordination itself
but must expose the same all-or-nothing outcome.

### Candidate providers

| Provider | Likely use | Important limitation |
|---|---|---|
| `dalgo2memory` through DALgo | First branchable database reference holder | Needs explicit snapshot/clone/export semantics and mutation-isolation proof |
| `dalgo2ingitdb` with inGitDB | Second, persistent branchable database holder | Git-native data only; lifecycle, worktree and sensitive-data policy required |
| Composite application holder | Coordinates several databases/holders behind one contract | Application assumes completeness and cleanup responsibility |
| Chatwright in-memory deep copy | Future runner-owned state holder | Requires explicit ownership and clone semantics |
| Immutable structures | Cheap logical sharing | Application must already use persistent data structures |
| Copy-on-write store | Fast many-branch exploration | Complexity and hidden shared mutability |
| SQLite backup/file clone | Local application adapter | Captures one database, not queues/process state |
| PostgreSQL database/schema clone | Isolated persistent branch | Privileges, connections, speed and cleanup |
| Transaction savepoint | Fast sequential database rollback | Lives inside one transaction; not an independent whole environment |
| Firebase emulator export/import | Emulator-backed baseline | Import overwrites emulator memory; likely needs separate instances |
| Application-defined holder | Future arbitrary domain/runtime integration | Correctness burden sits with application author |

### DALgo database boundary

DALgo is the selected abstraction boundary for branchable application databases.
The first provider proves fast ephemeral branches with `dalgo2memory`; the
second proves persistent, inspectable branches through `dalgo2ingitdb` and
inGitDB. This order is settled even though the exact branch capability API,
adapter ownership and conformance suite remain to be designed.

Each registered DALgo database is one holder in the checkpoint manifest. The MVP
may register several. DALgo does not replace future Chatwright holders for
conversations, actors, Platform Emulators, clocks and IDs, nor future
application-defined holders for state outside DALgo.

## inGitDB Integration

inGitDB is the selected second branchable database provider when application
state fits its Git-backed model. Chatwright reaches it through the DALgo adapter
rather than making Git concepts part of scenario intent:

| Chatwright concept | inGitDB/Git concept |
|---|---|
| Checkpoint | Commit |
| Snapshot reference | Commit ID |
| Scenario branch | Git branch or isolated worktree |
| Branch mutations | Subsequent commits |
| Branch comparison | Record-aware or Git diff |
| Persistent failure state | Retained commit/ref |

~~~diff
appointments/123.json
+ "status": "confirmed"
+ "time": "2026-07-23T16:30:00+01:00"
users/alice.json
- "pendingBooking": true
+ "pendingBooking": false
~~~

Benefits include immutable references, human-readable changes, historical
reproduction and strong branch comparison. Git branches are lightweight
pointers to commit snapshots, and linked worktrees can materialise several
branches without cloning the entire repository.

The integration is the **second provider and first persistent provider** after
`dalgo2memory`; it is not the generic environment abstraction or the initial
in-memory reference implementation. Local inGitDB documentation positions it
for versioned, reference and slowly-changing data; Chatwright must not imply that
it snapshots arbitrary queues, caches or OLTP state. A spike should test the
DALgo capability seam, cleanup, worktree/branch explosion, commit cost,
sensitive-state redaction and exact multi-process isolation.

## Hierarchical Scenario Integration

A child scenario may inherit:

- the parent checkpoint and setup provenance;
- actors and identities;
- fixtures and scenario variables;
- Platform Emulator/profile configuration;
- deterministic seed policy;
- expected invariant/milestone baseline.

Each branch owns:

- local overrides and actions;
- transcript continuation;
- state mutations and final state;
- logical clock continuation;
- random/ID continuation;
- metrics and failures;
- cleanup/cancellation lifecycle.

Inheritance must be visible. A child should show which checkpoint revision,
parent fixtures and provider capabilities it used. Changing parent setup,
application code, schema, platform profile or provider version can invalidate
cached checkpoints and descendant evidence.

Replay fallback gives the same hierarchy a slower but correct execution mode.
Reports must say whether a child restored, forked, reset or replayed; performance
differences must not masquerade as semantic differences.

## Milestone Integration

Useful checkpoint triggers may include:

- an explicit test API call;
- a named milestone;
- after authentication or before confirmation;
- an actor goal state;
- a configured message count;
- a message type, keyword or regular expression.

Explicit API calls and named milestones are the likely first triggers. Automatic
content triggers are future convenience because they can fire at unstable or
non-quiescent points. Reaching a milestone must not automatically persist state:
checkpoint creation, persistence and retention are separate decisions.

## AI Branch Exploration

One checkpoint can seed independent continuations across personas, goals,
constraints, models, temperatures or deterministic seeds:

~~~text
Options offered
├── Accept first option
├── Ask for a later option
├── Change service
├── Reject all options
├── Become confused
└── Abandon conversation
~~~

This reduces repeated setup/model cost, permits outcome comparison from an
identical decision point and can generate candidate scenario trees. Generated
branches still capture concrete inputs/actions and evaluator evidence. Restoring
deterministic state cannot make an external AI model deterministic.

The local runtime should support bounded branch exploration. Cloud Intelligence
can later generate and prioritise branches, choose personas/models, rank risk,
summarise differences and propose deterministic regressions. Cloud Run can
persist checkpoints and distribute safe branch work, but Cloud is never required
for the core semantics.

## Fuzz Branch Exploration

At a shared checkpoint, deterministic or AI-generated fuzz branches can vary:

- malformed, incomplete or contradictory input;
- invalid callback data and unsupported message types;
- message order, duplicates, delays, edits and cancellation;
- timeouts and scheduled-event order;
- goal changes, repeated questions and abandonment.

The branch records the mutation recipe, seed, checkpoint reference and concrete
action sequence. This avoids replaying expensive setup while keeping each fuzz
failure reproducible. Stateful minimisation must preserve prerequisite turns and
the checkpoint contract.

## Metrics Semantics

Reports should separate logical scenario cost from physical execution cost:

~~~text
Scenario metrics
├── Shared setup
├── Branch-local continuation
├── Logical total (setup + this branch)
└── Physical run allocation
~~~

- **Shared setup** remains visible and belongs to every branch's logical path.
- **Branch-local** metrics start at the checkpoint baseline.
- **Logical total** answers what the complete user journey cost.
- **Physical allocation** records actual runner/Cloud work and cache reuse.

Latency should not include snapshot restore as conversational latency, but restore
duration is operational evidence. Token and model usage before the checkpoint is
shared logical context; branch generation/evaluation is local. Cloud billing
policy must not distort product metrics and remains a separate decision.

## Determinism

The MVP must reproduce the same registered database contents and adapter
configuration at every branch start. It does not claim to restore virtual time,
platform/message/update IDs, scheduled work, random state, actor state or mocks;
those remain replayed, reconstructed or explicitly outside the boundary until
they gain state holders. Every branch still records its checkpoint and seed mode:

| Mode | Behaviour | Best use |
|---|---|---|
| Identical continuation seed | Each branch begins with the same deterministic state; actions alone cause divergence | Comparing explicit alternative choices |
| Unique branch seed | A stable branch-specific seed is derived from checkpoint + branch identity | Exploring randomised/fuzz variations without cross-branch correlation |

Branch names are human labels, not necessarily seed identity; renaming a branch
should not silently change evidence unless the derivation rule explicitly says
so. AI model nondeterminism is labelled and concrete outputs are retained.

## Branch Comparison

Comparison is a future feature over two branches sharing a compatible checkpoint.
Dimensions may include:

- transcript and rendered messages;
- state change and final state;
- milestones, expected outcomes and goal completion;
- failures and recovery;
- latency, tokens, message count and operational cost;
- evaluator/UX outcomes.

Diffs should be relative to the checkpoint, not raw dumps of each final
environment. Providers may supply structured diffs; otherwise Chatwright can
compare normalised portable evidence. Persisted state diffs require redaction and
access controls because they can reveal application data absent from transcripts.

## Alternatives Considered

- **Reset a live database in place instead of starting each branch from a
  fresh handle.** Rejected because an in-place reset can let one branch's
  mutation become visible to a sibling still mid-run; a fresh handle per
  branch keeps isolation independent of execution order.
- **Claim complete-environment branching (conversation, emulator, clocks,
  queues) in the first release.** Rejected because no consistency barrier
  exists yet for those components; overclaiming isolation would produce false
  confidence, so the MVP is scoped to database-only state with the boundary
  declared explicitly in every checkpoint/branch result.
- **Ship `dalgo2ingitdb`/inGitDB before `dalgo2memory`.** Rejected because the
  in-memory provider is the faster, lower-risk way to prove the holder
  contract first; inGitDB's persistent Git-backed lifecycle (worktrees,
  cleanup, redaction) is deliberately sequenced second.
- **Allow parallel branch execution in the MVP.** Rejected because sequential
  execution narrows process/global isolation risk while the database-only
  claim is still being proven; parallel execution is later work gated on an
  isolation matrix.

## MVP Scope

The first implementation should support:

1. explicit named checkpoints at quiescent runner boundaries;
2. registration of one or more branchable database state holders;
3. an alternative composite implementation of the same branching contract;
4. coordinated all-or-nothing checkpoint and branch start across registered
   databases;
5. DALgo as the application-database boundary, with `dalgo2memory` as the
   ephemeral reference provider;
6. `dalgo2ingitdb`/inGitDB as the next persistent provider, against the same
   branch conformance contract;
7. sequential branch execution;
8. inherited scenario setup and database-checkpoint provenance;
9. branch-local transcript, metrics, outcome and database-state evidence;
10. automatic temporary-state cleanup;
11. replay setup fallback when database branch capability is absent or unsafe;
12. clear `database-only` scope, capability/mode reporting and unsupported-state
    errors.

## Not Doing (and Why)

- Parallel branches or promises of goroutine/process isolation — sequential
  execution is the only isolation model proven so far.
- Database providers beyond `dalgo2memory` and `dalgo2ingitdb`/inGitDB — the
  conformance contract is validated against these two before it is extended.
- Treating DALgo or inGitDB as the whole-environment snapshot mechanism — both
  are database-boundary tools, not a claim about non-database state.
- Branching Chatwright conversation, actor, Platform Emulator, virtual clock,
  random, ID, queue, mock, file, cache or arbitrary application state — none
  of these has a state-holder contract yet.
- First-party custom non-database state holders — deferred until the
  database-only holder contract is stable.
- General mutable-global discovery — out of scope until an explicit holder
  claims that state.
- Automatic checkpoint creation at every milestone — checkpoint creation,
  persistence and retention remain separate, explicit decisions.
- Branch comparison UI or Studio multi-panel branching — a future Studio
  continuity concern, not this idea's MVP.
- Distributed or Cloud-only execution — the core semantics must hold locally
  first.
- Final public Go API syntax — the illustrative API in this document is not
  frozen.

## Future Roadmap

| Stage | Direction |
|---|---|
| Validate | Prove a database-holder contract, multi-database coordination and replay equivalence |
| MVP | Sequential database-only branches, `dalgo2memory`, hierarchy, evidence and cleanup |
| Next | `dalgo2ingitdb`/inGitDB, composite holder, milestone checkpoints and database comparison |
| Later local | Non-database holders, complete-environment checkpoints, more DALgo providers and Studio visualisation |
| Later scale | Parallel/process-isolated branches, Cloud Run distribution/caching and CI matrix expansion |
| Later intelligence | AI branch generation/prioritisation, swarm exploration, fuzz trees and regression extraction |

## Risks

- A “successful” database checkpoint can be inconsistent across multiple
  databases or be mistaken for whole-environment isolation.
- Mutable globals, goroutines or external services can leak across branches.
- Application/composite holders can claim completeness they do not provide.
- Restore can conflict with code/schema/provider versions.
- Snapshot size and cleanup can overwhelm local disk or Cloud storage.
- Parallelism can introduce races hidden by sequential MVP results.
- Branch names, refs and inGitDB worktrees can proliferate without lifecycle rules.
- State diffs and retained checkpoints may contain secrets or personal data.
- Shared setup caching can make metrics, latency and billing misleading.
- AI continuations remain probabilistic even from an identical snapshot.
- Replay and snapshot modes may diverge and hide product defects.

## Dependencies and Relationships

This idea depends on or extends the public Chatwright areas for:

- [scenario authoring and hierarchy](https://github.com/chatwright/chatwright/tree/main/spec/features/chatwright/scenario-authoring);
- [deterministic testing and milestones](https://github.com/chatwright/chatwright/tree/main/spec/features/chatwright/deterministic-testing);
- [AI-driven testing](https://github.com/chatwright/chatwright/tree/main/spec/features/chatwright/ai-driven-testing);
- [fuzz testing](https://github.com/chatwright/chatwright/tree/main/spec/features/chatwright/fuzz-testing);
- [conversation runtime and virtual time](https://github.com/chatwright/chatwright/tree/main/spec/features/chatwright/conversation-runtime);
- [Platform Emulators](https://github.com/chatwright/chatwright/tree/main/spec/features/chatwright/platform-emulators);
- [observability](https://github.com/chatwright/chatwright/tree/main/spec/features/chatwright/observability);
- [Playground/Studio](https://github.com/chatwright/chatwright/tree/main/spec/features/chatwright/developer-tooling);
- [Cloud Run and Cloud Intelligence](https://github.com/chatwright/chatwright/tree/main/spec/features/chatwright/cloud).

The [Observation Model](observation-model.md) can identify what an actor
perceived at a checkpoint and provide branch-local message/action evidence. It
does not replace a coordinated environment snapshot: application databases,
runtime state and platform state still require holders or replay.

The complete investigation backlog is in
[research/app-state-branching.md](../research/app-state-branching.md).

## Key Assumptions to Validate

| Tier | Assumption | Validation |
|---|---|---|
| Must-be-true | All registered databases can be coordinated at one declared boundary without publishing partial state | Two-database failure/cleanup fixtures across two branches |
| Must-be-true | Database snapshot and replay produce equivalent branch starts within the declared database-only scope | Golden database digest and repeated cross-mode runs |
| Must-be-true | Sequential database branching saves meaningful setup time without excessive complexity | Benchmark representative authentication/setup trees |
| Should-be-true | Hierarchical inheritance is clearer than duplicated setup scenarios | Usability review of three real scenario trees |
| Should-be-true | One DALgo branch conformance contract works for `dalgo2memory` and inGitDB without weakening either | Implement the same checkpoint/fork/isolation suite against both providers |
| Might-be-true | Persistent inGitDB branches make failure debugging and comparison substantially better | Provider spike with retained failing state |
| Might-be-true | Cloud parallelism and AI exploration create enough value to justify storage/compute cost | Costed campaign after local semantics are stable |

## SpecScore Integration

- **New Features this would create:** none — this idea promotes to Features
  that already exist.
- **Existing Features affected:**
  [State branching](../features/chatwright/state-branching/README.md),
  [Database state holders](../features/chatwright/state-branching/database-state-holders/README.md).
- **Dependencies:** [Observation Model](observation-model.md),
  [Local CLI to web Studio continuity](local-studio-continuity.md),
  [research/app-state-branching.md](../research/app-state-branching.md).

## Open Questions

- What exact quiescence contract makes a checkpoint consistent?
- Which application-state hook is small enough to implement correctly?
- Can replay and snapshot modes share one environment digest/oracle?
- Are branch seeds independent of mutable display names?
- Which checkpoint inputs invalidate descendants after code or schema changes?
- When should a failed checkpoint be retained, redacted or destroyed?
- Which snapshot/fork capabilities belong in DALgo, adapter extensions or the
  Chatwright integration layer?
- Should applications normally register several holders or expose one composite
  holder, and how is completeness declared?
- Which inGitDB branch/worktree lifecycle is safe for persistent checkpoints?
- What isolation boundary is required before parallel execution is honest?
- How should physical shared-setup cost be reported and billed?

---
*This document follows the https://specscore.md/idea-specification*
