---
format: https://specscore.md/idea-specification
status: Specifying
---

# Idea: Investigate Chatwright data assertions in DataTug

**Status:** Specifying
**Date:** 2026-07-22
**Owner:** alex
**Promotes To:** chatwright/developer-tooling/datatug-integration
**Supersedes:** —
**Related Ideas:** extends:chatwright

## Problem Statement

How might a developer author and investigate Chatwright DTQL assertions with
DataTug's query and recordset surfaces while keeping deterministic execution
local to Chatwright and preserving the exact query and branch state which
produced the evidence?

## Context

Chatwright's DTQL data-state assertions already establish the critical shared
artifact: canonical DTQL YAML representing a read-only DALgo structured query.
Chatwright runs that query after settled message work, at a checkpoint or at
branch completion, and captures a bounded redacted recordset. This proves that
a bot persisted the claimed state rather than merely sending the expected text.

DataTug is designed to author, render and run queries and to present recordsets.
Its planned brokered query builder uses the same canonical DALgo AST and DTQL
YAML, supports deterministic Web editing and opens a local loopback daemon
through a one-time deep link. That creates a useful integration without
inventing another query language or requiring DataTug inside a CI run.

The failing branch may no longer exist when a developer investigates it. An
integration which opens only a live connection would therefore be misleading:
rerunning the query against current state may not reproduce the captured
failure. The first-class handoff must include the executed query and captured
recordset, with live read-only rerun offered only as an explicit second action.

## Recommended Direction

Define a versioned Chatwright data-investigation bundle which DataTug can open.
The bundle contains:

- canonical resolved DTQL and its digest;
- assertion kind and expected shape;
- bounded, redacted actual recordset plus schema/column metadata;
- total/returned row counts and truncation declaration;
- scenario, step/checkpoint/branch and database-holder identities;
- application, scenario and provider revisions/profiles;
- an optional non-secret connection-profile reference for explicit rerun.

Chatwright creates the bundle as part of run evidence. DataTug renders the
captured result immediately without a database connection. The developer may
then:

1. inspect the exact query/result/assertion difference;
2. clone the query into a local DataTug tab and make deterministic edits;
3. map the holder/profile to a local read-only connection and rerun explicitly;
4. export canonical DTQL back to the scenario repository for review.

Edited DTQL is a new proof definition with a new digest. It cannot retroactively
change the old run or turn its result green. Chatwright revalidates imported
DTQL against its supported DALgo/provider capabilities before a later run.

### Transport and trust boundary

The MVP is file/local-daemon based. `chatwright open --datatug` may start or
connect to a loopback DataTug daemon, create a tab from the bundle and return a
deep link containing a one-time code in its fragment. No query, credentials or
recordset needs to be uploaded to a hosted DataTug service.

Connection credentials are never serialized in the bundle or URL. A profile
reference is resolved by the user's local DataTug configuration. Live execution
is read-only and opt-in; opening captured evidence never contacts the database.

## Alternatives Considered

- **Build a second query editor in Chatwright Studio.** Rejected for the first
  integration because it duplicates DataTug's canonical AST, deterministic
  editing, connections and recordset presentation.
- **Require a DataTug daemon during Chatwright runs.** Rejected because CI,
  offline determinism and assertion scheduling must not depend on another
  process.
- **Open only the live query.** Rejected because the original branch may have
  been released and current data is not the evidence which failed.
- **Store only a screenshot/table rendering.** Rejected because it loses the
  executable DTQL and machine-comparable recordset.
- **Let DataTug decide Chatwright assertion pass/fail.** Rejected because
  attachment order, normalization, checkpoint gating and branch context belong
  to Chatwright.
- **Round-trip through native SQL or provider syntax.** Rejected because Listus
  uses a document database shape and DTQL is already the portable lossless
  artifact.

## MVP Scope

- Versioned investigation bundle for one DTQL assertion and recordset.
- DataTug import/render without requiring a connection.
- Local loopback handoff with one-time-code deep link.
- Clone captured DTQL into an editable DataTug tab.
- Optional explicit read-only rerun after local connection-profile mapping.
- Export canonical DTQL and import it into Chatwright as a reviewed scenario
  change.
- Listus failure example showing the parent-scoped groceries record, expected
  items and actual nested `items`/`count` fields.
- Digests and provenance which distinguish captured, edited and rerun results.

## Not Doing (and Why)

- DataTug as a runtime dependency—Chatwright must run deterministically alone.
- Automatic live rerun when a bundle opens—the original result is evidence and
  credentials/branch state may not be available.
- Mutating database actions—investigation is read-only.
- Native-query-to-DTQL conversion—DTQL remains the canonical source artifact.
- Uploading private result rows to a hosted UI by default.
- Editing Chatwright actor/message/branch steps in DataTug—it owns the data-query
  surface, not the conversation scenario.
- Treating an edited query as verification until Chatwright executes it again.

## Key Assumptions to Validate

| Tier | Assumption | How to validate |
|---|---|---|
| Must-be-true | Chatwright and DataTug round-trip canonical DTQL without semantic loss. | Import, edit/export and deserialize the Listus parent-scoped query; compare the resulting DALgo structured query. |
| Must-be-true | A captured recordset is sufficient for useful first inspection when the branch database no longer exists. | Give a failed bundle to a developer without the application environment and measure whether they can explain the mismatch. |
| Must-be-true | Opening a bundle leaks neither credentials nor unredacted fields. | Inspect the bundle, deep link, daemon requests and browser state under a configured redaction policy. |
| Should-be-true | DataTug materially improves assertion authoring versus hand-editing YAML. | Author and refine several Listus queries through both workflows and compare time, errors and comprehension. |
| Should-be-true | Optional live rerun can map a Chatwright holder profile safely to a local read-only DataTug connection. | Rerun against a disposable branch/fixture and prove mutation attempts are rejected. |
| Might-be-true | Studio can embed or link the DataTug investigation view later. | Validate the local deep-link workflow before designing a shared hosted surface. |

## SpecScore Integration

- **Feature:** [DataTug integration](../features/chatwright/developer-tooling/datatug-integration/README.md)
- **Executable query boundary:** [DTQL data-state assertions](../features/chatwright/deterministic-testing/data-state-assertions/README.md)
- **Evidence surface:** [Conversation observability](../features/chatwright/observability/README.md)

## Open Questions

- Should the investigation bundle reuse a DataTug dataset/query-result format
  directly or wrap it with Chatwright assertion and branch context?
- How should nested document fields map into DataTug recordset columns without
  flattening away useful structure?
- Can a released `dalgo2memory` branch be retained temporarily for explicit
  rerun, and how is that retention bounded?
- Should imported DTQL be vendored into the scenario repository or referenced by
  immutable DataTug project URL and digest after saved queries stabilize?

---
*This document follows the https://specscore.md/idea-specification*
