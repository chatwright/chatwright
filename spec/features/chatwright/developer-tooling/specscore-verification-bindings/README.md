---
format: https://specscore.md/feature-specification
status: Draft
---

# Feature: SpecScore verification bindings

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/developer-tooling/specscore-verification-bindings?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/developer-tooling/specscore-verification-bindings?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/developer-tooling/specscore-verification-bindings?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/developer-tooling/specscore-verification-bindings?op=request-change) |
**Status:** Draft
**Source Ideas:** specscore-rehearse-verification

## Summary

Bind SpecScore acceptance criteria to canonical Chatwright scenario cases,
generate a reproducible lock over their proof definitions and show whether the
latest evidence is passing, failing, missing, partial or stale.

## Problem

A prose link to “the chat test” does not identify the scenario revision, selected
case, execution mode, reusable fragments or DTQL assertions which constitute the
proof. Embedding the complete scenario in the feature would solve neither reuse
nor drift. Treating the latest green run as permanently current would hide
changes to product code or the verification definition.

## Behavior

### Intent and proof stay separate

The acceptance criterion presented by SpecScore remains the normative statement
of what must be true. Its configured source may be an inline criterion or
Rehearse's thin-AC format. A Chatwright scenario case is one proof method.
SpecScore owns the feature view and indexing, Chatwright owns the scenario schema
and execution, and Rehearse owns the verification adapter and resulting
acceptance-evidence fact.

Bindings use resolvable criterion and scenario URL references, including
cross-repository references. A Listus feature may therefore bind to a canonical
scenario in `sneat-bots` even though `sneat-go` supplies its execution host. No
repository needs to vendor another repository's scenario body.

### Many-to-many verification graph

One scenario or reusable case may verify several criteria. One criterion may
require several scenarios, cases or modes. A binding can declare required and
informational coverage dimensions such as direct versus Telegram transport,
state provider or application profile.

SpecScore reports the status of each required binding and derives criterion
coverage without turning an informational extra run into a release requirement.
A partially covered criterion is distinct from both unverified and fully
verified.

### Generated verification lock

A lock command resolves a binding and writes a deterministic record containing:

- canonical scenario URL, selected case and source revision/content digest;
- Chatwright schema and compatible runner requirement;
- required execution modes and non-secret input/profile identities;
- the resolved transitive fragment, fixture and DTQL assertion digests;
- the acceptance-criterion references the binding is allowed to verify;
- lock format version and generation provenance.

The lock never duplicates the scenario body and is generated rather than
hand-maintained. Resolution failure, a dirty source or unavailable remote
revision is reported explicitly; an existing lock is not silently rewritten.

### Freshness and status model

Binding freshness and evidence freshness are evaluated separately:

- **binding stale:** the resolved scenario proof graph differs from the lock;
- **evidence stale:** a result targets a different lock or an older application
  revision than the revision being evaluated;
- **unverified:** no applicable result exists;
- **partial:** some but not all required cases/modes have current passing results;
- **failing:** a current applicable result contains an assertion failure;
- **unsupported/skipped:** execution did not prove or disprove the criterion;
- **verified:** every required binding has current passing evidence.

A fresh failure supersedes an older pass for the same binding and evaluated
revision. Status computation retains conflicting or incomparable results instead
of selecting whichever is greener.

### Generated feature read model

SpecScore may generate a compact verification summary beside an acceptance
criterion or in its feature view. It shows the canonical scenario/case, required
modes, lock status, latest evidence status/revision and links to rich artifacts.
The generated summary is replaceable and never becomes the source of scenario or
criterion content.

Studio can navigate in both directions: criterion to scenario/run artifacts and
scenario to every criterion it claims to verify. A passing Chatwright binding
does not by itself approve the feature or prove unbound requirements.

## Dependencies

- [Developer tooling and Studio](../README.md)
- [Portable scenario documents](../../scenario-authoring/portable-scenario-documents/README.md)
- [Rehearse adapter](../rehearse-adapter/README.md)
- [Conversation observability](../../observability/README.md)
- SpecScore URL references, acceptance criteria, facts and Studio indexing

## Acceptance Criteria

### AC:cross-repository-scenario-is-canonical

Scenario: A Listus criterion binds to its Chatwright product scenario
Given the criterion is indexed outside `sneat-bots`
And the canonical scenario is stored in `sneat-bots`
When SpecScore resolves the binding
Then it records the scenario URL, selected case and repository revision
And does not require a copied scenario in the feature repository

### AC:lock-covers-transitive-proof-definition

Scenario: A reusable fragment or DTQL assertion changes
Given neither file is the root scenario manifest
When SpecScore compares the resolved scenario with its lock
Then the binding becomes stale
And the diagnostic identifies the changed transitive component

### AC:lock-does-not-contain-runtime-secrets

Scenario: A scenario uses secret-backed bot configuration
Given the binding is resolved in an environment where the secret exists
When the verification lock is generated
Then it contains only the declared secret/profile identity needed for resolution
And never contains the resolved credential value

### AC:required-modes-produce-partial-status

Scenario: A criterion requires direct and Telegram-emulated proof
Given the direct case has current passing evidence
And the Telegram-emulated case has no current result
When criterion verification status is computed
Then the criterion is `partial`, not `verified`
And the missing required mode is visible

### AC:evidence-staleness-is-distinct-from-binding-staleness

Scenario: Application code changes after a locked scenario passes
Given the scenario proof graph still matches its lock
When SpecScore evaluates the newer application revision
Then the binding remains current
And its earlier passing evidence is reported stale for that application revision

### AC:fresh-failure-is-not-hidden-by-old-pass

Scenario: A locked case passed and later fails for the same evaluated revision
Given both result records remain available
When SpecScore computes current verification status
Then the current failure prevents a verified status
And the older passing evidence remains inspectable as history

### AC:generated-summary-is-not-source-of-truth

Scenario: A generated feature verification summary is deleted
Given canonical criteria, bindings, lock and result facts still exist
When SpecScore regenerates the feature view
Then the same mappings and statuses are restored
And no Chatwright scenario content is recovered from or written into the summary

### AC:verification-does-not-imply-feature-approval

Scenario: Every currently bound Chatwright case passes
Given the feature has an unbound acceptance criterion or unresolved product
decision
When SpecScore displays verification and feature lifecycle status
Then it shows the passing behavior evidence accurately
And does not automatically promote the feature to approved or complete

## Open Questions

- Should the lock be stored per feature, per scenario binding or once per
  repository verification graph?
- How should SpecScore select an evaluated application revision when the feature,
  scenario and execution host are in three repositories?
- Is dirty-worktree evidence allowed for local exploration but excluded from a
  `verified` release status?
- Which changes outside the declared proof graph should automatically stale
  evidence when no build-system dependency graph is available?

---
*This document follows the https://specscore.md/feature-specification*
