---
format: https://specscore.md/decision-specification
status: Approved
---

# Decision: Use DALgo with dalgo2memory and inGitDB first

**Status:** Approved
**Date:** 2026-07-22
**Owner:** alex
**Tags:** dalgo, dalgo2memory, ingitdb, database, provider
**Source Idea:** —
**Supersedes:** —
**Superseded By:** —

## Context

This decision originated in a private app-state-branching exploration and was
promoted to the public tree on 2026-07-22.

App State Branching needs application database state to start each scenario
branch from the same checkpoint without making Chatwright depend on one storage
engine. The environment can also contain state that is not a database, so the
database seam must remain one participant in a wider coordinated checkpoint.

The DALgo ecosystem already supplies a common Go data-access boundary, a built-in
in-memory adapter and inGitDB adapters. That gives Chatwright an ephemeral path
and a persistent Git-native path without inventing unrelated database APIs.

## Decision

1. DALgo is the application-database abstraction for the first branchable
   database integrations.
2. `dalgo2memory` is the first provider and ephemeral reference implementation.
3. `dalgo2ingitdb`, backed by inGitDB (and its local integration where needed),
   is the second provider and first persistent implementation.
4. Both providers must satisfy one Chatwright branch conformance contract for
   checkpoint identity, independent continuation, restore/replay equivalence,
   compatibility reporting and cleanup.
5. The MVP supports one or more database instances. An application registers a
   list of branchable database holders or supplies one composite implementation
   of the same branching contract which coordinates those databases.
6. A multi-database checkpoint or branch is usable only when every registered
   holder succeeds; partial results are cleaned or quarantined.
7. The exact snapshot/fork API and whether it belongs in DALgo core, adapter
   extensions or Chatwright integration code remain implementation research.
8. MVP branching covers database state only. Chatwright-owned state and other
   non-database application state may use the same holder model later.

## Rationale

`dalgo2memory` is the shortest path to deterministic, fast mutation-isolation
tests. inGitDB then tests the same semantics against durable, inspectable commits
and branches. Using DALgo keeps application code on one data-access boundary,
while capability negotiation prevents the two adapters from claiming identical
performance, persistence or diff behaviour.

## Declined Alternatives

### Build SQLite or PostgreSQL first

Deferred because DALgo already provides the desired application-facing seam and
the selected pair exercises both ephemeral and persistent behaviour first.

### Use inGitDB as the whole environment abstraction

Declined because Git-native database state is only one component of a consistent
Chatwright environment.

### Require every application database to implement branching immediately

Declined because replay preserves compatibility while the first two providers
establish the contract; custom non-database holders can follow later.

## Consequences at Decision Time

- The MVP and roadmap prioritise these two database providers before SQLite,
  PostgreSQL, Firebase or other adapters.
- `dalgo2memory` needs an explicit, supported branch/export/clone seam rather
  than Chatwright reaching into private engine maps.
- The inGitDB integration needs branch/worktree, commit, retention, redaction and
  crash-cleanup rules.
- A shared conformance suite distinguishes required branch semantics from
  provider-specific capabilities such as persistence and structured diffs.
- Applications not using DALgo can still use replay, but are not first-party
  branchable database providers in the initial sequence.
- The runner and reports label the MVP boundary as database-only.
- Selecting inGitDB does not claim that Git-backed storage captures queues,
  processes, caches or arbitrary OLTP state.

## Observed Consequences

The Listus branching reference plan runs the dalgo2memory-backed holder
through the shared coordinator contract; the inGitDB provider and the
conformance suite's provider-capability split remain future work.

## Affected Features

- [State branching](../features/chatwright/state-branching/README.md)
- [Database state holders](../features/chatwright/state-branching/database-state-holders/README.md)

## Open Questions

- Can the required contract be additive to DALgo without widening `dal.DB`?
- Does `dalgo2memory` clone serialised and columnar collections through one
  portable representation or provider-specific paths?
- Does each inGitDB scenario branch require a worktree, or can sequential runs
  safely switch/reset one isolated checkout?

---
*This document follows the https://specscore.md/decision-specification*
