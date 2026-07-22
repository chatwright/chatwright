---
format: https://specscore.md/feature-specification
status: Draft
---

# Feature: DTQL data-state assertions

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/deterministic-testing/data-state-assertions?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/deterministic-testing/data-state-assertions?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/deterministic-testing/data-state-assertions?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/deterministic-testing/data-state-assertions?op=request-change) |
**Status:** Draft
**Source Ideas:** chatwright

## Summary

Run read-only DTQL queries against a named application database after a settled
message/action, at a checkpoint or at branch completion. Assert the returned
records and retain a bounded, redacted recordset as evidence so a scenario proves
what the application stored, not only what the bot said.

## Problem

A bot can reply correctly while failing to persist data, updating the wrong
tenant/list or changing unrelated records. Chat assertions cannot detect those
failures. Application-specific database helpers can, but they duplicate query,
normalisation, rendering and failure-reporting logic and do not transfer across
DALgo providers.

DTQL is a canonical, human-readable representation of DALgo structured queries.
Using it as the scenario artifact lets Chatwright execute the assertion directly
against the branch's database while DataTug can author, inspect and render the
same query and recordset without inventing a second query language.

## Behaviour

### Assertion attachment points

A scenario may attach a data assertion:

- after a user message or action and the resulting registered application work
  has settled;
- immediately before a named checkpoint is published;
- at the end of a branch or scenario fragment.

A checkpoint assertion gates publication: if its query or expectation fails,
the checkpoint is not usable by child branches. A message-level assertion is
ordered after the message expectation it follows, so observing a reply does not
race the transaction which persists the reply's claimed effect.

### Named database target

Each assertion names one registered database holder. The runner executes the
query against the handle bound to the current environment. Inside a branch this
must be the branch's replacement handle, never the source or a sibling handle.

An omitted holder is allowed only when exactly one query-capable database holder
is registered. An unknown or ambiguous holder fails before query execution.

### DTQL query artifact

The executable artifact is canonical DTQL YAML which deserialises to a read-only
`dal.StructuredQuery`. It may be authored inline, loaded from a scenario-owned
file or produced from typed runtime inputs and then serialised to canonical DTQL
before execution. The concrete query stored in evidence contains resolved
values; the first release does not add a placeholder syntax to DTQL.

Unsupported DTQL or database-provider query capabilities fail explicitly. The
runner must not silently fall back to scanning all records in application code
or bypass the registered `dal.DB`.

### Assertions and record evidence

The first assertion set covers:

- exact, minimum or maximum row count;
- empty/non-empty result;
- a row containing a partial field/value shape, including nested maps/lists;
- an exact canonical rowset after declared normalisation;
- per-row field predicates needed by the Listus proof.

Queries used for exact rowset comparison must declare deterministic ordering or
a canonical sort key. Normalisation can exclude generated IDs/timestamps, but
every excluded field is visible in evidence and cannot affect the assertion
secretly.

On success the run may show a bounded result preview. On failure it shows the
canonical DTQL, holder, attachment point, expected shape and bounded actual
records. Larger results are retained as a referenced artifact when a result
store is configured. Redaction happens before persistence or terminal display;
truncation and redaction are both declared.

### Listus MVP proof

Listus stores a list as a record in the parent-scoped `lists` collection and
stores list items inside that record's `items` field. The MVP DTQL query targets
the authenticated user's auto-created default family space and the
`buy!groceries` list, and returns the actual list record including `count` and
`items`.

After the user adds `milk`, evidence shows the queried list record and the
assertion proves that:

- exactly one intended list record is selected;
- its `items` contains an active item titled `milk`;
- its stored count agrees with the item collection stored in the record.

At `few-items-added`, another DTQL assertion proves that the same list record
contains exactly milk, bread, eggs and apples as active items before the
checkpoint becomes branchable. Mutation branches query the same record after
add/re-add, mark/remove-done and selected-remove/remove-all operations.

The current DTQL subset supports root collections only, while this Listus record
uses a parent-scoped collection. The Listus MVP therefore includes the smallest
lossless DTQL/DALgo extension required to represent and execute that concrete
parent key path. It does not generalise into joins, arbitrary collection groups
or a new path/query language.

### DataTug boundary

Chatwright owns assertion scheduling, result semantics and run evidence. DALgo
owns the structured query and DTQL serialization. DataTug is the compatible
authoring/inspection surface for DTQL and returned recordsets; Chatwright does
not require a DataTug daemon or shell out to the DataTug CLI in the first
release.

This shared-artifact boundary lets the
[DataTug assertion investigation](../../developer-tooling/datatug-integration/README.md)
open the exact failing query and captured result without coupling deterministic
scenario execution to another process.

## Dependencies

- [Deterministic testing](../README.md)
- [State branching](../../state-branching/README.md)
- [Database state holders](../../state-branching/database-state-holders/README.md)
- [Observability](../../observability/README.md)
- DALgo `dtql` and query-capable database adapters

## Acceptance Criteria

### AC: message-assertion-observes-committed-state

Scenario: A Listus user adds milk
Given a DTQL assertion attached after the add-item conversation step
When the bot response and registered application work have settled
Then the assertion queries the current environment's registered Listus database
And the returned list record contains an active item titled milk

### AC: checkpoint-is-gated-by-data

Scenario: The populated-list checkpoint is created
Given the chat transcript claims four groceries were added
When the `few-items-added` checkpoint assertion returns a missing or extra item
Then checkpoint publication fails with the DTQL and actual records
And no child branch can start from that checkpoint

### AC: query-uses-branch-database

Scenario: A sibling branch removes list items
Given the assertion targets the named Listus database holder
When its branch-completion DTQL executes
Then it reads the replacement database bound to that sibling
And mutations from the source or another sibling are not visible

### AC: listus-parented-record-is-queryable

Scenario: DTQL selects the Listus groceries list
Given the default family-space module key and the parent-scoped `lists`
collection
When the concrete DTQL query executes through `dalgo2memory`
Then it returns only the `buy!groceries` list record for that parent
And evidence can show its `count` and nested `items` fields

### AC: record-evidence-is-bounded-and-redacted

Scenario: A data assertion fails with a large or sensitive result
Given configured result limits and redaction policy
When failure evidence is produced
Then it declares the query, holder, total/returned row counts and truncation
And no configured sensitive field is printed or persisted in plaintext

### AC: dtql-is-the-shared-artifact

Scenario: A developer investigates a failed state assertion
Given the run contains the concrete canonical DTQL and result schema
When the artifact is opened by a compatible DataTug surface
Then it represents the same query Chatwright executed
And Chatwright did not translate it through a private query language

## Open Questions

- Should successful record previews be opt-in per assertion or enabled by
  default below a conservative row/byte limit?
- Which stable representation should identify parent key paths in DTQL without
  conflating a database path with a user-visible string?
- When DataTug saved-query support stabilises, should Chatwright reference a
  DataTug project query by immutable digest or vendor a canonical copy into the
  scenario?

---
*This document follows the https://specscore.md/feature-specification*
