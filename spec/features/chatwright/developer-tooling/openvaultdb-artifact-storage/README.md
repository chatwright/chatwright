---
format: https://specscore.md/feature-specification
status: Draft
---

# Feature: OpenVaultDB artifact storage

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/developer-tooling/openvaultdb-artifact-storage?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/developer-tooling/openvaultdb-artifact-storage?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/developer-tooling/openvaultdb-artifact-storage?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/developer-tooling/openvaultdb-artifact-storage?op=request-change) |
**Status:** Draft
**Source Ideas:** openvaultdb-artifact-storage

## Summary

Store finalized Chatwright run evidence in a user-selected OpenVaultDB vault
through an optional artifact provider, while local files remain the default and
redaction, integrity and host-security policy are enforced before publication.

## Problem

Local result bundles are private and portable but difficult to retain across
machines or share selectively. A managed Chatwright Cloud history is convenient
but does not satisfy every team's ownership or hosting requirements.
OpenVaultDB can provide a user-controlled destination, but its record API,
security capabilities and lifecycle differ from a filesystem. Treating it as an
ordinary path risks partial bundles, overwritten evidence, secret leakage and
claims about encryption the selected host cannot support.

## Behavior

### Optional provider boundary

Chatwright writes every run to the same portable local bundle first. An artifact
store provider may then publish and retrieve finalized bundles. Local filesystem
storage is always supported and requires no OpenVaultDB host, account, grant or
network connection.

The provider boundary covers immutable manifests and artifact bytes. It is
separate from branchable application state holders: registering an OpenVaultDB
artifact store does not add a checkpointable database to a scenario.

### Vault connection and namespace

The user explicitly selects an existing vault through OpenVaultDB Connect and
grants a Chatwright-owned application namespace only the capabilities required
to create, read and list its result records. Credentials are held by the local
secret/configuration mechanism, never written into scenario files, result
manifests or SpecScore evidence.

Before publication the provider discovers the host/API version and capabilities.
Configuration declares the minimum security policy for the evidence class. A
host which does not advertise required transport, encryption, size or atomicity
capabilities is rejected before any artifact bytes are sent.

### Result bundle mapping

A published run has one versioned manifest identifying:

- run, scenario/case, application and source revisions;
- execution mode, platform emulator and state-provider profiles;
- outcome and timestamps;
- referenced transcript, trace, metrics, branch, checkpoint, DTQL and recordset
  artifacts;
- each artifact's media type, byte count, content digest, redaction and
  truncation metadata;
- Rehearse/SpecScore evidence identities when present.

Artifacts use content-derived identities and are uploaded idempotently.
Unchanged bytes shared by several runs are stored once where the host/provider
supports safe deduplication. The run manifest becomes discoverable only after
every required artifact is present and verified; interrupted uploads do not
appear as complete runs.

The first provider may encode bounded artifacts as OpenVaultDB records/chunks.
It must expose an explicit unsupported/size result rather than silently dropping
large artifacts if the host lacks suitable storage capability.

### Local privacy boundary

Chatwright applies configured capture, redaction and truncation policy before
the provider receives a bundle. Retry queues contain only the already-redacted
publication form. A policy may forbid remote storage for selected artifacts or
require a declared at-rest-encryption capability.

Artifact references in terminal, Rehearse and SpecScore output disclose no
access token. Sharing a vault result is an explicit OpenVaultDB permission or
export action; possession of a normal run ID alone grants no access.

### Integrity, retrieval and offline retry

Retrieval verifies the manifest and every requested artifact digest before
exposing them as trusted Chatwright evidence. Missing, changed or corrupt bytes
produce an integrity failure, not a partial successful run.

Network failure never changes the local run outcome. The bundle remains locally
usable and publication is reported as pending/failed independently. Retrying is
idempotent and cannot overwrite a different artifact or finalized manifest with
the same identity.

### Scenario-storage boundary

Git-owned portable scenarios remain canonical in their product repositories.
This feature may store digest-verified scenario attachments needed to interpret
a run, but does not provide editable scenario synchronization. Private drafts or
vault-native scenario collections require a later feature with explicit
authority, revision and conflict semantics.

## Dependencies

- [Developer tooling and Studio](../README.md)
- [Conversation observability](../../observability/README.md)
- [Portable scenario documents](../../scenario-authoring/portable-scenario-documents/README.md)
- [SpecScore verification bindings](../specscore-verification-bindings/README.md)
- OpenVaultDB Connect, host-capability discovery and record CRUD

## Acceptance Criteria

### AC: local-run-does-not-require-openvaultdb

Scenario: A developer runs Chatwright offline
Given no OpenVaultDB provider or credentials are configured
When the scenario completes
Then its complete supported local bundle is written and inspectable
And the scenario outcome does not depend on remote storage

### AC: publication-is-explicit-and-least-privilege

Scenario: A user connects Chatwright to an existing vault
Given the OpenVaultDB Connect picker displays available vaults
When the user selects one and approves the requested access
Then Chatwright receives access scoped to its application namespace and required
record operations
And no owner-wide credential is written to the repository or result bundle

### AC: redaction-precedes-network-write

Scenario: A transcript and DTQL recordset contain configured sensitive values
Given remote publication is enabled
When the provider prepares and uploads the run
Then those values are redacted before the first OpenVaultDB request body or
retry record is created
And the manifest declares the applied redaction/truncation policy

### AC: unsafe-host-is-rejected-before-upload

Scenario: Evidence policy requires at-rest encryption
Given the selected host does not advertise an accepted encryption capability
When publication is requested
Then no artifact bytes are sent
And the local result remains available with an actionable publication failure

### AC: manifest-publishes-after-artifacts

Scenario: Upload fails after some artifacts are written
Given the final run manifest has not been published
When another client lists complete Chatwright runs
Then the interrupted upload is not presented as a complete run
And an idempotent retry can finish without duplicating verified artifacts

### AC: retrieval-verifies-content

Scenario: A stored transcript no longer matches its manifest digest
Given Studio retrieves the run from the vault
When Chatwright validates the requested artifacts
Then it reports an integrity failure and does not trust the altered transcript
And the other historical metadata is not silently used as complete evidence

### AC: artifact-storage-does-not-register-branch-state

Scenario: A run publishes evidence to OpenVaultDB
Given the application has registered its DALgo database as a branchable holder
When a checkpoint and sibling branch are created
Then only the application holder participates in branching
And the evidence vault is used after/during reporting without being cloned as
application state

### AC: git-scenario-remains-canonical

Scenario: A run stores the scenario document needed for provenance
Given the canonical scenario is committed in a product repository
When a digest-verified copy is included in the vault bundle
Then the copy is labelled as run evidence rather than editable source
And changing it cannot update or supersede the Git-owned scenario

## Open Questions

- What content-size threshold requires native blob support instead of chunked
  records?
- Can the current OpenVaultDB API atomically finalize a manifest, or does the
  provider need a pending/complete record protocol?
- Which capability vocabulary represents transport security, at-rest encryption
  and append-only/tamper-evident storage across self-hosted and managed hosts?
- Which principal is allowed to apply retention without giving routine CI runs
  permission to delete historical evidence?

---
*This document follows the https://specscore.md/feature-specification*
