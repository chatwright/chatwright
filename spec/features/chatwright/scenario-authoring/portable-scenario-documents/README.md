---
format: https://specscore.md/feature-specification
status: Draft
---

# Feature: Portable scenario documents

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/scenario-authoring/portable-scenario-documents?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/scenario-authoring/portable-scenario-documents?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/scenario-authoring/portable-scenario-documents?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/scenario-authoring/portable-scenario-documents?op=request-change) |
**Status:** Draft
**Source Ideas:** specscore-rehearse-verification

## Summary

Give a Chatwright scenario a versioned, serializable representation which can be
owned by an application repository, invoked locally or from Rehearse, referenced
by SpecScore and evolved without pretending arbitrary Go code can round-trip
through a document.

## Problem

The Go-first authoring API is appropriate for discovering scenario runtime
semantics, but an in-process function is not by itself a portable artifact.
Cross-repository execution, visual authoring, verification locks and managed runs
need a stable document identity and validation boundary. Freezing a complete DSL
now would encode unproven choices about fragments, checkpoints and branches;
serializing only a command line would lose intent, inputs and evidence binding.

## Behavior

### Progressive document model

The first supported document may be an invocation manifest. It names a
registered Chatwright scenario, selectable cases, declared inputs, execution
modes and acceptance-criterion references while the executable steps remain in
the Go-first definition. A manifest is a real versioned contract, not a claim
that the underlying scenario is fully declarative.

Once runtime concepts stabilize, later schema versions may represent actors,
chats, fixtures, reusable fragments, messages/actions, expectations,
checkpoints, branches and data assertions directly. Support is capability-based:
a reader rejects an unsupported construct or version explicitly rather than
silently dropping it.

### Canonical product ownership

The application or reusable scenario-pack repository owns its scenario
documents. The Listus reference scenarios live in `sneat-bots`; `sneat-go`
supplies the application profile and executes them without copying their steps.
Chatwright owns the schema and runner, while SpecScore and Rehearse consume
references to the canonical artifact.

Moving or vendoring a scenario creates a new source identity unless an explicit
redirect or provenance link preserves the original. A feature README may show a
generated summary, but it is not a second source for the scenario body.

### Identity, references and composition

A document has a stable logical ID, schema version and source URL. References to
fragments, fixtures, DTQL files or other documents resolve relative to the source
document or through explicit URL references. Each resolved dependency retains
its own source identity and participates in the scenario's semantic digest.

The same document may expose several named cases and may verify several
acceptance criteria. Conversely, one criterion may be covered by several
scenario cases or modes. `verifies` metadata is descriptive binding information;
adding or removing it cannot change the messages, application state or assertions
performed by the scenario.

### Parsing and validation

Parsing never starts the bot, accesses a database, expands secrets or executes
scenario actions. Validation reports:

- unsupported schema versions and capabilities;
- unresolved or cyclic references;
- duplicate scenario, case, fragment or checkpoint identities;
- undeclared required inputs and invalid mode selections;
- structural errors before runtime side effects begin.

Runtime inputs may reference secret names, but serialized documents, semantic
digests and validation output do not contain resolved secret values.

### Portable does not mean lossless arbitrary-code conversion

Chatwright may export the supported structure of a Go-authored scenario or use a
manifest to invoke it. It does not promise to decompile arbitrary conditionals,
I/O or helper calls into the structured format, nor to regenerate equivalent Go
source from every visual edit. Reports state whether a scenario is native
structured content, a registered-code invocation or a mixture of referenced
components.

## Dependencies

- [Scenario authoring](../README.md)
- [Scenario composition](../scenario-composition/README.md)
- [Deterministic testing](../../deterministic-testing/README.md)
- [State branching](../../state-branching/README.md)
- [DTQL data-state assertions](../../deterministic-testing/data-state-assertions/README.md)

## Acceptance Criteria

### AC: invocation-manifest-runs-registered-scenario

Scenario: A product publishes a portable manifest before the full DSL exists
Given a versioned manifest naming a registered Listus scenario and `add-items`
case
When Chatwright validates and runs the manifest
Then it invokes that exact registered case with the declared inputs and mode
And the result identifies the manifest and registered definition revisions

### AC: canonical-scenario-is-not-copied-by-hosts

Scenario: A Listus scenario executes through the Sneat application host
Given the canonical document and steps are owned by `sneat-bots`
When `sneat-go` supplies its ListusBot profile and runtime dependencies
Then it executes the referenced scenario without redefining its conversation
steps
And reports retain the `sneat-bots` source identity

### AC: unsupported-schema-is-safe

Scenario: An older runner opens a newer portable document
Given the document requires a schema version or capability the runner does not
support
When it is parsed and validated
Then execution does not start
And the result identifies the unsupported version or capability without
discarding the original content

### AC: transitive-components-have-provenance

Scenario: A scenario invokes a reusable fragment with a DTQL assertion
Given both components are stored outside the root document
When the scenario is resolved
Then the effective scenario records each component's canonical source and
semantic digest
And a component change can be distinguished from a root-document change

### AC: verification-metadata-is-non-executable

Scenario: A scenario is rebound to another acceptance criterion
Given its actors, steps, assertions, inputs and execution profile are unchanged
When only `verifies` references change
Then the conversation and application-state effects remain identical
And the binding metadata change is still visible to evidence consumers

### AC: resolved-secrets-are-not-serialized

Scenario: A manifest declares a secret-backed application input
Given the runner resolves that secret at execution time
When the document, semantic digest and validation report are stored
Then they contain the secret reference but not its resolved value
And run evidence applies the configured redaction policy

## Open Questions

- Which minimal fields must the first invocation manifest freeze beyond schema,
  ID, registered scenario, case, modes, inputs and `verifies` references?
- Should a registered Go scenario expose a capability description which can be
  validated without loading application code?
- When is the runtime model stable enough to promote actors, fragments,
  checkpoints and branches from registered code into the structured schema?

---
*This document follows the https://specscore.md/feature-specification*
