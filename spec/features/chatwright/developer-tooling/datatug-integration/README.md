---
format: https://specscore.md/feature-specification
status: Draft
---

# Feature: DataTug assertion investigation

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/developer-tooling/datatug-integration?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/developer-tooling/datatug-integration?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/developer-tooling/datatug-integration?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/developer-tooling/datatug-integration?op=request-change) |
**Status:** Draft
**Source Ideas:** datatug-investigation-workspace

## Summary

Open a Chatwright DTQL assertion and its captured recordset as a local DataTug
investigation, optionally rerun the query through an explicitly mapped read-only
connection, and export edited canonical DTQL for a later Chatwright run.

## Problem

Failure output can print a bounded recordset, but understanding a nested document
query, comparing expected/actual fields and safely refining the query needs a
dedicated data surface. Requiring a live database loses the exact failed branch
state; requiring DataTug during execution weakens Chatwright's deterministic and
offline contract. Passing credentials or unredacted records through a hosted
deep link would also cross an unacceptable trust boundary.

## Behavior

### Investigation bundle

Every eligible DTQL assertion can export a versioned bundle containing:

- the canonical resolved DTQL and content digest;
- expected assertion shape and normalization/excluded-field declarations;
- captured bounded/redacted recordset with column/schema metadata;
- total versus returned row counts and truncation state;
- holder, scenario, attachment point, checkpoint/branch and run identities;
- runner, application, DALgo and state-provider revisions/profiles;
- an optional non-secret local connection-profile hint.

The bundle distinguishes the recordset captured by Chatwright from any later
DataTug execution. Opening and viewing it requires no bot, branch database or
application credentials.

### Local DataTug handoff

A developer may open the bundle with a local DataTug CLI/daemon. Chatwright
creates or selects a DTQL-mode tab and returns a deep link to the DataTug Web UI
using a loopback endpoint and one-time code in the URL fragment. Query and row
data are transferred through the authenticated local daemon, not embedded in
the URL or uploaded to the hosted Web application.

If DataTug is unavailable, the original bundle remains readable and Chatwright
reports an installation/startup diagnostic; run evidence is unaffected.

### Captured inspection and comparison

DataTug presents the executed DTQL, nested result fields, expected shape,
normalization and mismatch together. It indicates that rows are captured
evidence, including redaction/truncation, rather than current live data.

DataTug may provide sorting, field selection and visual comparison over the
captured rows, but it cannot rewrite the historical query, assertion or result.
Derived views retain a reference to the original bundle and digest.

### Explicit read-only rerun

The user may clone the query into an editable tab and map the Chatwright holder
profile to a DataTug connection configured locally. Credentials are resolved by
DataTug and never imported from the evidence bundle. Live execution is always
read-only and clearly labelled with its own time, target and result identity.

Failure to reconstruct a released branch is expected. A rerun against a fixture,
retained branch or current environment is comparable investigation data, not a
replacement for the captured evidence.

### Author/edit/export loop

DataTug edits the canonical DALgo AST in DTQL mode and exports canonical DTQL
YAML. Chatwright parses and validates the exported query against the scenario's
holder and provider capabilities before accepting it as a source change. The
edited query has a new digest and must be reviewed/committed and executed again
before it can produce verification evidence.

DataTug does not own message settlement, attachment ordering, recordset
normalization, assertion truth, checkpoint gating or branch selection.

## Dependencies

- [Developer tooling and Studio](../README.md)
- [DTQL data-state assertions](../../deterministic-testing/data-state-assertions/README.md)
- [Conversation observability](../../observability/README.md)
- DataTug DTQL-mode query tab, recordset presentation and loopback deep-link
  contract
- DALgo canonical DTQL serialization

## Acceptance Criteria

### AC:captured-failure-opens-without-database

Scenario: A Listus branch has already been released
Given its failed DTQL assertion bundle contains the canonical query and captured
recordset
When the developer opens it in DataTug without a database connection
Then DataTug displays the executed query, expected shape and captured mismatch
And clearly labels row limits, redaction and the original branch/run identity

### AC:deep-link-does-not-carry-sensitive-data

Scenario: Chatwright opens a local DataTug investigation
Given the bundle contains private list records
When the browser deep link is produced
Then it contains only the local endpoint, tab identity and one-time code in the
fragment
And contains no query text, row data or database credential

### AC:live-rerun-is-explicit-and-distinct

Scenario: A developer reruns a captured Listus query
Given they map its holder profile to a local read-only DataTug connection
When the query executes against current or fixture state
Then the new result records its own target and execution time
And does not overwrite or masquerade as the Chatwright-captured recordset

### AC:mutation-is-not-possible

Scenario: An investigation is connected to a live product fixture
Given a user attempts to change or delete records through the query tab
When DataTug handles the request
Then the mutation is refused or rejected by a read-only session
And the database remains unchanged

### AC:dtql-round-trips-losslessly

Scenario: A developer edits a parent-scoped Listus query in DataTug
Given the query is represented by the canonical DALgo AST
When DataTug exports DTQL and Chatwright parses it
Then the resulting structured query is semantically identical to the edited AST
And its new canonical digest is reproducible

### AC:edited-query-does-not-rewrite-evidence

Scenario: A developer fixes a filter which caused a failed assertion
Given the original bundle and run are retained
When the edited DTQL is exported to the scenario repository
Then the old evidence continues to reference the original query digest
And the criterion is not marked passing until Chatwright executes the new query

### AC:chatwright-remains-independent

Scenario: DataTug is not installed in CI
Given a scenario contains supported DTQL assertions
When Chatwright executes it
Then assertions and evidence bundles complete without DataTug
And only the optional open/investigate action is unavailable

### AC:credentials-resolve-locally

Scenario: A holder profile names a secured database
Given the evidence bundle contains only its non-secret profile reference
When the developer chooses live rerun
Then DataTug resolves credentials from local configuration or prompts the user
And no resolved secret is written back to the bundle or deep link

## Open Questions

- Should the bundle embed DataTug's `QueryResult`/recordset model or reference a
  separately versioned Chatwright-to-DataTug interchange schema?
- How should nested maps/lists be displayed and compared without lossy tabular
  flattening?
- Does `chatwright open --datatug` start the daemon, or only connect to an
  already running instance in the first release?
- Which DataTug artifact identity can be referenced immutably from a scenario
  after saved-query support is production-ready?

---
*This document follows the https://specscore.md/feature-specification*
