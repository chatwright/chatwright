---
format: https://specscore.md/feature-specification
status: Draft
---

# Feature: Rehearse adapter

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/developer-tooling/rehearse-adapter?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/developer-tooling/rehearse-adapter?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/developer-tooling/rehearse-adapter?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/developer-tooling/rehearse-adapter?op=request-change) |
**Status:** Draft
**Source Ideas:** specscore-rehearse-verification

## Summary

Let Rehearse invoke a Chatwright scenario as acceptance evidence and consume its
case outcomes through a narrow result contract, while Chatwright remains solely
responsible for conversation, platform, branch and DTQL execution semantics.

## Problem

An opaque shell command can start Chatwright, but Rehearse cannot reliably infer
which case ran, which acceptance criterion it proves, whether a mode was
unsupported or where the transcript and state evidence live. Reimplementing
Chatwright as Rehearse step types would create duplicate runtimes and make a
generic acceptance-evidence tool depend on conversational domain details.

## Behavior

### Thin invocation adapter

Rehearse supplies a scenario reference, optional case selector, declared inputs,
execution mode and expected acceptance-criterion references. The adapter invokes
the installed Chatwright runner and passes through cancellation, timeout and
working-directory boundaries. Chatwright resolves the scenario, creates the
environment and executes every conversational step.

The first Rehearse surface may be a dedicated `chatwright` fenced block. Its
implementation uses a result protocol rather than parsing terminal output. A
later native scenario-discovery adapter may remove the need for wrapper Markdown
without changing Chatwright execution semantics.

### Real execution with an intentional emulator

The adapter runs the real Chatwright binary/runtime and the real application
under test. A declared Chatwright Platform Emulator is an explicit execution
profile, not a Rehearse mock fabricated to pass. Evidence identifies the
emulated platform, transport mode, application profile and state providers so a
reader can distinguish direct invocation, fake Telegram API and live-platform
runs.

### Normalized result envelope

Chatwright returns a versioned envelope containing at least:

- overall and per-case status, duration and failure summary;
- scenario, manifest and resolved-component identities/digests;
- bound acceptance-criterion references;
- Chatwright runner and scenario-schema versions;
- application and repository revisions, including dirty-state declaration;
- platform, transport and registered state-provider profiles;
- artifact references plus their media type, digest and redaction/truncation
  metadata.

Statuses preserve `passed`, `failed`, `skipped`, `unsupported`, `cancelled` and
infrastructure error rather than reducing every non-pass outcome to a failed
acceptance criterion. Rehearse validates the envelope version before ingesting
it and cannot report verified behavior for a case missing a successful outcome.

### Rich evidence remains Chatwright-native

The Rehearse report stores the normalized outcome and durable references to the
Chatwright transcript, platform trace, branch lineage, checkpoint manifests,
DTQL queries/recordsets and failure comparison. It need not copy every artifact
into a generic step-output string.

Chatwright executes DTQL after settled application work and against the named
database holder for the active branch. Rehearse records the resulting assertion
and artifact references; it does not rerun the query through its own SQLite DTQL
block or another database connection.

### Criterion binding validation

If the Rehearse wrapper and Chatwright scenario both declare `verifies`
references, the effective mapping must agree or be explicitly narrowed to a
selected case. A contradictory mapping fails before evidence ingestion. One run
may emit several case-to-criterion outcomes, allowing SpecScore to ingest facts
at the most specific proven scope.

## Dependencies

- [Developer tooling and Studio](../README.md)
- [Portable scenario documents](../../scenario-authoring/portable-scenario-documents/README.md)
- [Conversation observability](../../observability/README.md)
- [DTQL data-state assertions](../../deterministic-testing/data-state-assertions/README.md)
- Rehearse scenario execution and `verified-behavior` report ingestion

## Acceptance Criteria

### AC:rehearse-delegates-chat-semantics

Scenario: Rehearse executes a Chatwright verification block
Given a block referencing the Listus `add-items` case
When Rehearse invokes the adapter
Then Chatwright owns actor, message, platform, checkpoint, branch and database
execution
And Rehearse consumes the versioned result without interpreting those steps

### AC:case-outcome-maps-to-criterion

Scenario: One Chatwright manifest exposes several cases
Given only `add-items` verifies the selected persistence acceptance criterion
When the complete run report is returned
Then Rehearse records the matching case outcome against that criterion
And outcomes from unrelated cases are not used as its proof

### AC:rich-artifacts-are-preserved

Scenario: A Listus DTQL assertion fails in a mutation branch
Given Chatwright produced a transcript, branch lineage, canonical query and
bounded recordset
When Rehearse writes its report
Then the normalized failure retains durable references and digests for those
artifacts
And the evidence is not reduced to terminal text alone

### AC:dtql-runs-in-chatwright-branch-context

Scenario: Rehearse invokes a data-asserting branch scenario
Given the case uses a replacement DALgo database holder
When its DTQL assertion executes
Then Chatwright queries that branch-bound holder exactly once
And Rehearse ingests the result without opening or querying another database

### AC:execution-profile-is-explicit

Scenario: The same case runs directly and through Telegram emulation
Given both executions pass
When their evidence is ingested
Then each result identifies its transport, platform emulator and state-provider
profile
And one mode is not silently presented as evidence for the other

### AC:non-pass-status-is-not-false-proof

Scenario: A requested Chatwright capability is unsupported by the installed
runner
Given the adapter receives an `unsupported` case outcome
When Rehearse summarizes and exports the run
Then it does not create passing verified-behavior evidence
And it preserves `unsupported` separately from product assertion failure

### AC:binding-conflict-fails-before-ingestion

Scenario: A wrapper claims a criterion not declared by its selected case
Given the two sources disagree and no explicit narrowing rule resolves them
When the adapter validates the invocation
Then the run produces no verified-behavior fact for either mapping
And the diagnostic identifies both conflicting references

## Open Questions

- Should the first adapter be implemented as a built-in Rehearse block executor,
  a subprocess protocol or a separately installed runner plugin?
- Does each Chatwright case become a Rehearse sub-scenario, or can one Rehearse
  scenario report several independently addressable case outcomes?
- Which artifact references must be content-addressed immediately, and which may
  remain local paths in offline-only runs?

---
*This document follows the https://specscore.md/feature-specification*
