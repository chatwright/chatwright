# Research: App State Branching

**Date:** 2026-07-22
**Owner:** alex
**Status:** Proposed
**Consumed by:** [State branching](../features/chatwright/state-branching/README.md)

## Purpose

Establish the consistency, isolation and value evidence required for a
sequential database-only MVP. The MVP coordinates one or more registered DALgo
databases, using `dalgo2memory` first and inGitDB second, while preserving a
state-holder contract that can extend to non-database state later.

## Initial Provider Findings

| Technology | Evidence-backed opportunity | Boundary |
|---|---|---|
| DALgo | One Go database abstraction can present several backing adapters to Chatwright | A data-access interface is not itself a checkpoint/fork lifecycle |
| `dalgo2memory` | Built-in in-memory DALgo adapter and fastest reference candidate | Current internals need a supported snapshot/clone/export seam; private engine maps are not an integration contract |
| `dalgo2ingitdb`/inGitDB | Existing DALgo adapter plus Git commits/branches/worktrees for persistent, inspectable state | Git-native data only; holder lifecycle, branch cleanup and redaction are unresolved |
| SQLite | The online backup API copies a database into another file or in-memory database and can back up a live source | Captures SQLite only; connection, queue, process and mock state remain outside |
| PostgreSQL template database | A database can be cloned by using another database as CREATE DATABASE template | Privileges, open connections, size, speed and cleanup need a spike |
| PostgreSQL savepoint | Rolls one transaction back to a named point and can be reused sequentially | Not an independent whole environment; cursor and external side effects have caveats |
| Firebase Emulator Suite | Firestore/Auth/Realtime Database/Storage emulator data can be exported and imported as a baseline | Import overwrites current emulator memory; concurrent branches likely need isolated emulator instances |
| Git | Commits reference snapshots; branches are lightweight pointers; worktrees materialise several branches | Does not itself coordinate several application databases or runtime state |

Primary sources:

- [DALgo](https://github.com/dal-go/dalgo)
- [DALgo inGitDB adapter](https://github.com/ingitdb/dalgo2ingitdb)
- [SQLite Online Backup API](https://www.sqlite.org/backup.html)
- [PostgreSQL template databases](https://www.postgresql.org/docs/current/manage-ag-templatedbs.html)
- [PostgreSQL SAVEPOINT](https://www.postgresql.org/docs/current/sql-savepoint.html)
- [Firebase Local Emulator Suite import/export](https://firebase.google.com/docs/emulator-suite/install_and_configure)
- [Git branches and snapshots](https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell.html)
- [Git worktrees](https://git-scm.com/docs/git-worktree.html)
- [inGitDB overview](https://github.com/ingitdb/ingitdb)

## Investigation Backlog

### Consistency and state ownership

| ID | Question | Required evidence and output |
|---|---|---|
| ASB-01 | How does an application declare every database in the MVP scope? | Registration manifest for primary, audit and tenant databases, including a deliberate unregistered-database failure. |
| ASB-02 | What database-quiescence protocol yields one checkpoint generation across several holders? | Two-database fixture with concurrent writers proving pause/drain/reject behaviour. |
| ASB-03 | How does coordinated capture fail atomically across registered database holders? | Prepare/capture/abort spike with failure in the second holder and cleanup proof for the first. |
| ASB-04 | How are duplicate holder IDs, missing databases and dynamic/tenant database sets detected? | Registry validation rules plus startup and runtime test matrix. |
| ASB-05 | How are in-flight transactions, retries and database-triggered work accounted for? | State machine plus fixtures defining safe boundary and unsupported cases. |
| ASB-06 | Can multiple databases be captured transactionally or only at an application-declared barrier? | Two-store consistency spike and documented partial-failure semantics. |

### Provider and fallback architecture

| ID | Question | Required evidence and output |
|---|---|---|
| ASB-07 | What single branching lifecycle contract supports both a holder registry and an application composite without becoming omnipotent? | Two API sketches covering identity, capabilities, checkpoint, branch start, finish and release; no final public syntax. |
| ASB-08 | What clone/export semantics must `dalgo2memory` expose for serialised and columnar collections? | Mutation-isolation suite across both engines and two DB instances without private-field access. |
| ASB-09 | Should the branch seam live in DALgo core, an additive interface, each adapter or Chatwright integration code? | Dependency/API comparison validated against `dalgo2memory` and `dalgo2ingitdb`. |
| ASB-10 | Can replay and checkpoint starts be proven equivalent for every registered database? | Normalised per-holder and group digest with repeated golden cross-mode comparison. |
| ASB-11 | When should the runner choose restore, fork, reset or replay? | Capability negotiation matrix with deterministic selection and failure messages. |
| ASB-12 | How are snapshots cleaned, retained and recovered after cancellation/crash? | Lifecycle state machine and orphan-cleanup test. |

### Determinism, hierarchy and evidence

| ID | Question | Required evidence and output |
|---|---|---|
| ASB-13 | Which determinism claims remain valid when only database state branches? | Database-only evidence fixture separating holder restoration from replayed clock, random, ID and actor state. |
| ASB-14 | Which hierarchy/inheritance rules apply to checkpoints, actors, fixtures, platform config and overrides? | Three real scenario trees with provenance and selective-leaf execution. |
| ASB-15 | What invalidates a checkpoint after scenario, code, provider or schema change? | Fingerprint/compatibility manifest and stale-checkpoint test matrix. |
| ASB-16 | How should setup, restore, branch-local, logical-total and physical metrics be represented? | Report examples and timings from reused versus replayed setup. |
| ASB-17 | How are transcript prefixes stored/exported without duplication or broken standalone evidence? | Content/reference options benchmark and portable result example. |
| ASB-18 | What branch comparison contract works across transcript, state, metrics and outcomes? | Portable comparison model plus one structured provider diff. |

### DALgo providers, scale and security

| ID | Question | Required evidence and output |
|---|---|---|
| ASB-19 | What minimum DALgo branch capability contract can both selected adapters satisfy honestly? | Capability matrix and compile-time/runtime prototype covering one and multiple DBs. |
| ASB-20 | How should `dalgo2memory` checkpoint, clone and clean serialised/columnar state? | First provider implementation spike with conformance timings and mutation-leak tests. |
| ASB-21 | How should `dalgo2ingitdb` map checkpoint/branch/finish/cleanup to commits, branches and worktrees? | Second provider spike measuring persistence, diff, reset, branch explosion, crash recovery and data-fit limits. |
| ASB-22 | Does one conformance suite prove equivalent branch starts across `dalgo2memory`, inGitDB and a two-database group? | Shared suite with failure injection, digests, cleanup and capability-specific assertions. |
| ASB-23 | What privacy/security policy applies to persisted snapshots and state diffs? | Threat model, redaction fixture, retention/deletion contract and access-control requirements. |
| ASB-24 | What process/resource boundary is required for parallel, Cloud and AI/fuzz branch execution? | Isolation matrix and costed campaign; no parallel-safety claim until it passes. |

## Recommended Investigation Order

1. ASB-01–ASB-06: prove multi-database registration and consistency.
2. ASB-07–ASB-12: choose the single holder/composite contract and fallback.
3. ASB-13–ASB-18: prove determinism, hierarchy and evidence semantics.
4. ASB-19–ASB-23: implement the two selected DALgo providers, conformance and
   security evidence.
5. ASB-24: consider parallel/Cloud scale only after local isolation is credible.

## Open Questions

The backlog above is intentionally unresolved.
