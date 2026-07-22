---
format: https://specscore.md/decision-specification
status: In Review
---

# Decision: Branch a coordinated environment with replay fallback

**Status:** In Review
**Date:** 2026-07-22
**Owner:** alex
**Tags:** checkpoint, snapshot, branch, isolation, replay
**Source Idea:** —
**Supersedes:** —
**Superseded By:** —

## Context

This decision originated in a private app-state-branching exploration and was
promoted to the public tree on 2026-07-22.

Scenario branches share conversation, platform and application history. Cloning
only application storage can produce a state that never existed because actors,
queues, clocks, generated IDs, Platform Emulators, mocks or pending work may be
at different moments.

Storage technologies also expose different operations: deep copy, restore,
copy-on-write fork, transaction rollback, persistent clone or replay. Requiring
one mechanism would either exclude applications or create false guarantees.

## Decision

1. The branchable unit is the complete declared Chatwright **environment**, not a
   database or transcript.
2. A **checkpoint** is a named semantic boundary. One coordinated manifest binds
   all participating snapshots, versions, time/sequence state and capabilities.
3. Applications register a list of branchable state holders or provide one
   composite implementation of the same branching lifecycle contract. Holders
   report optional capabilities rather than pretending to support them.
4. An incomplete coordinated capture is unusable and cleaned up.
5. **Replay fallback** is a first-class execution mechanism when safe snapshot or
   fork capability is unavailable.
6. The first implementation is explicit, sequential and **database-only**. It
   coordinates one or more registered DALgo databases, beginning with
   `dalgo2memory` and `dalgo2ingitdb`/inGitDB.
7. Branching Chatwright-owned or other non-database state, parallelism,
   additional database providers and public API syntax remain outside the MVP.

## Checkpoint Boundary

The database-only MVP captures at an application-declared database-quiescent
boundary: every registered database must have no unaccounted in-flight mutation,
and all holders must capture the same checkpoint generation. The future complete
environment boundary additionally pauses actor input, accounts for registered
work and establishes one logical clock/event sequence across all holders. If the
declared boundary cannot be proved, checkpoint creation fails or setup replays.

## Rationale

The semantic abstraction is “continue this scenario from the same complete
state”. Snapshot/fork/replay are optimisations and integration mechanisms.
Keeping them behind a common state-holder contract and capability negotiation
allows the same hierarchy to run across several databases and future
non-database/Cloud holders without weakening isolation claims.

Replay is slower but widely available, exposes equivalence defects and avoids
making branching mandatory for applications that cannot snapshot safely.

## Declined Alternatives

### Database snapshot as the feature

Declined because database state alone is not a consistent conversational
environment and bakes one integration layer into scenario intent.

### One omnipotent StateStore interface

Declined because holders would need to fake diff, persistence or parallel-safety
capabilities they do not have. One branching lifecycle interface is selected,
with optional behaviour declared through capabilities and exact method shape
left to research.

### Always replay setup

Declined as the only mechanism because it preserves duplication cost and limits
large AI/fuzz trees, though it remains the compatibility fallback.

### inGitDB as the complete environment abstraction

Declined because its commit/branch/diff mapping is selected for the second DALgo
database provider but it does not capture arbitrary runtime state.

### Parallel execution in the first version

Declined because process, goroutine, port, cache, queue and provider isolation
requirements are not yet understood.

## Consequences at Decision Time

- Registered databases need explicit clone/digest semantics; Chatwright-owned
  and other non-database holders follow later.
- Scenario/run evidence records checkpoint identity and execution mechanism.
- Applications disclose branchable state by registering holders or providing
  one composite holder.
- A false “complete snapshot” is treated as a correctness defect.
- Temporary provider state has an observable cleanup lifecycle.
- Snapshot/replay equivalence becomes a testable invariant.
- Persistent state and diffs require privacy, compatibility and retention policy.

## Observed Consequences

The database-only slice is implemented: an all-or-none checkpoint/branch
coordinator (`branching/`) with reverse-order compensation and quarantined
cleanup ships in the runtime and is exercised by the Listus reference plan.
The replay fallback (item 5) is decided but not yet implemented — the
coordinator currently records only the `branch` mechanism.

## Affected Features

- [State branching](../features/chatwright/state-branching/README.md)
- [Database state holders](../features/chatwright/state-branching/database-state-holders/README.md)
- [DALgo provider decision](0010-dalgo-branchable-database-providers.md)

## Open Questions

- Is quiescence represented as a coordinator phase or provider capability?
- How does an application prove its registered holder list or composite is
  complete for the declared scope?
- What digest proves replay/restore equivalence without exposing secrets?
- How does a composite holder prove which internal state it covers?

---
*This document follows the https://specscore.md/decision-specification*
