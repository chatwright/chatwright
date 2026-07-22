---
format: https://specscore.md/idea-specification
status: Specifying
---

# Idea: User-owned Chatwright evidence in OpenVaultDB

**Status:** Specifying
**Date:** 2026-07-22
**Owner:** alex
**Promotes To:** chatwright/developer-tooling/openvaultdb-artifact-storage
**Supersedes:** —
**Related Ideas:** extends:chatwright

## Problem Statement

How might developers retain, inspect and share private Chatwright run evidence
in storage they control without making OpenVaultDB mandatory for local runs,
confusing evidence storage with application-state branching or displacing Git as
the source of code-owned scenarios?

## Context

Chatwright produces more than a pass/fail value. A useful deterministic or AI
run can include a transcript, platform trace, metrics, branch lineage,
checkpoint manifests, canonical DTQL, bounded recordsets and failure
comparisons. Local files preserve ownership but are difficult to synchronize,
retain across machines or share selectively. Chatwright Cloud can offer managed
history, but it should not be the only durable destination for private evidence.

OpenVaultDB's Host → Vault → Namespace model is a natural fit for an optional
Chatwright-owned namespace inside a user-selected vault. Its current working Go
engine exposes record CRUD over an inGitDB-backed store and a connect/consent
flow. Its current limitations also matter: production-grade token persistence,
packaging and at-rest encryption are not yet complete. The integration must use
capability discovery and must not imply that every current OpenVaultDB host is
safe for sensitive run data.

Scenario storage and result storage have different source-of-truth needs. A run
is naturally an immutable evidence bundle. A scenario in a product repository
is versioned code and should remain canonical in Git. OpenVaultDB may later hold
personal drafts, visual-workspace state, synchronized caches or deliberately
vault-native scenario collections, but silently mirroring an editable scenario
into two authoritative stores would create conflicts.

## Recommended Direction

Add OpenVaultDB as an optional provider behind Chatwright's portable artifact
store boundary. Keep the local filesystem as the default and require no vault,
account or network for authoring or execution.

The MVP stores finalized run evidence:

1. Chatwright writes and validates a local result bundle.
2. Redaction and truncation happen locally before any vault transfer.
3. The user explicitly connects a vault and grants a Chatwright namespace the
   minimum required capabilities.
4. Immutable artifact blobs are addressed by content digest and deduplicated.
5. A small run manifest references the artifacts, source revisions, execution
   profiles and SpecScore/Rehearse evidence identities.
6. Retrieval verifies digests before Studio or another consumer trusts the
   bundle.

OpenVaultDB record CRUD need not provide a native blob or write-once primitive
for the first proof. Chatwright can split bounded artifacts into records and
enforce append-only content identities at its provider layer. Larger-blob,
atomic-finalization and garbage-collection capabilities should be negotiated
rather than assumed.

### Relationship to branching

OpenVaultDB stores scenario and run artifacts; it is not automatically a
branchable application database. Chatwright's application-state checkpoints
continue to use the registered state-holder interface and DALgo provider
contracts. A future `dalgo2openvaultdb` provider may independently implement that
contract, but evidence retention must not depend on it.

### Scenario storage after the MVP

Three later roles remain possible and should stay visibly distinct:

- **Mirror/cache:** a digest-verified copy of a Git-owned scenario.
- **Workspace draft:** private visual/editor state which is not yet a committed
  product scenario.
- **Vault-native source:** an explicitly chosen non-Git scenario collection with
  its own revision/conflict model.

Only the last role makes OpenVaultDB canonical. Promotion from a draft to a Git
scenario is an explicit export/commit operation, not background two-way sync.

## Alternatives Considered

- **Store scenarios first.** Deferred because editable source introduces merge,
  revision and authority questions before the storage integration is proven.
- **Make OpenVaultDB the only result store.** Rejected because it violates
  offline-first operation and would block adoption on OpenVaultDB availability.
- **Treat the vault as a directory of opaque ZIP files.** Simple, but loses
  queryable run metadata, deduplication and selective artifact retrieval.
- **Store every transcript event as an independent database record.** Rejected
  for the MVP because it couples Chatwright's trace schema and write volume to
  OpenVaultDB CRUD and complicates atomic publication.
- **Use OpenVaultDB as the branchable product database in the same feature.**
  Rejected as a category error; state branching and evidence retention have
  different lifecycle, consistency and security contracts.
- **Upload unredacted data and rely only on server-side encryption.** Rejected.
  Redaction is part of Chatwright's evidence contract and must happen before the
  trust boundary.

## MVP Scope

- Optional OpenVaultDB artifact-store configuration and capability discovery.
- Explicit Connect/grant flow for one user-selected vault and Chatwright-owned
  namespace.
- Local-first finalized run bundles with a versioned manifest.
- Content-digest addressing, idempotent retry and artifact deduplication.
- Local redaction/truncation before transfer.
- Refusal to publish sensitive evidence when the selected host lacks the
  configured security capabilities.
- Upload, list, retrieve and verify a Listus Chatwright run containing transcript,
  branch and DTQL evidence.
- SpecScore/Rehearse evidence may reference the vault-stored manifest without
  requiring either product to understand every Chatwright artifact.

## Not Doing (and Why)

- Replacing local result files—offline execution remains complete.
- General scenario authoring/sync—the first slice proves immutable evidence.
- Automatic upload—private transcripts and recordsets require explicit policy
  and user consent.
- Assuming at-rest encryption exists on every host—the current implementation
  does not justify that claim.
- Cross-vault replication, CRDT merge or multi-device conflict resolution.
- Permanent access tokens embedded in repository configuration.
- Destructive remote retention cleanup—the first slice can leave user-controlled
  records in place until safe reference and retention semantics are defined.

## Key Assumptions to Validate

| Tier | Assumption | How to validate |
|---|---|---|
| Must-be-true | A Chatwright result bundle maps cleanly to OpenVaultDB records without losing integrity or making individual trace events database rows. | Store and retrieve one Listus run, then verify every manifest and artifact digest byte-for-byte. |
| Must-be-true | Redaction can be completed before any network write. | Instrument the provider and prove configured secret values never appear in outgoing request bodies or retry storage. |
| Must-be-true | Host capability discovery can prevent unsafe production publication. | Exercise a host with no encryption capability and verify a sensitive-data policy refuses upload with an actionable result. |
| Should-be-true | Content-addressed artifacts substantially reduce repeated-run storage. | Upload several runs sharing scenario definitions and unchanged attachments; compare physical records/bytes with naive duplication. |
| Should-be-true | Users value a vault-owned evidence history distinct from Chatwright Cloud. | Dogfood cross-machine retrieval and selective sharing, then interview teams handling private bot transcripts. |
| Might-be-true | OpenVaultDB is useful later for private scenario drafts. | Export one Studio draft to Git and measure whether the explicit promotion model is understandable before designing sync. |

## SpecScore Integration

- **Feature:** [OpenVaultDB artifact storage](../features/chatwright/developer-tooling/openvaultdb-artifact-storage/README.md)
- **Evidence model:** [SpecScore verification bindings](../features/chatwright/developer-tooling/specscore-verification-bindings/README.md)
- **Run artifacts:** [Conversation observability](../features/chatwright/observability/README.md)
- **Branching boundary:** [State branching](../features/chatwright/state-branching/README.md)

## Open Questions

- Does the current OpenVaultDB record API need a blob/chunk capability before
  realistic traces can be stored efficiently?
- Which host capability statement is strong enough for Chatwright to permit
  sensitive evidence publication?
- Should a run manifest be one immutable record plus content-addressed artifact
  records, or should OpenVaultDB expose an atomic bundle-finalization primitive?
- How are retention and garbage collection authorized without allowing a
  compromised runner to erase historical evidence?

---
*This document follows the https://specscore.md/idea-specification*
