---
format: https://specscore.md/idea-specification
status: Specifying
---

# Idea: Executable feature contracts through SpecScore and Rehearse

**Status:** Specifying
**Date:** 2026-07-22
**Owner:** alex
**Promotes To:** chatwright/scenario-authoring/portable-scenario-documents, chatwright/developer-tooling/rehearse-adapter, chatwright/developer-tooling/specscore-verification-bindings
**Supersedes:** —
**Related Ideas:** extends:chatwright

## Problem Statement

How might a SpecScore acceptance criterion be continuously proven by a real
Chatwright conversation without copying scenario steps into feature prose,
teaching Rehearse chat semantics or losing Chatwright's branch, transcript and
database evidence?

## Context

SpecScore already indexes product intent as features and acceptance criteria.
Rehearse supplies the default thin-AC/scenario verification model, executes
acceptance-level scenarios and feeds `verified-behavior` facts back into
SpecScore. Chatwright executes a different, domain-rich scenario: it
owns actors, chats, platform emulation, real bot webhooks, reusable fragments,
state checkpoints, isolated branches and DTQL assertions over application data.

Those models are complementary. A Listus acceptance criterion such as “adding an
item persists it in the groceries list” should be able to point to the exact
Chatwright case which onboards a user, sends the message, observes the bot and
queries the branched DALgo database. A passing result should become SpecScore
evidence without flattening the transcript, DTQL recordset or branch lineage.

The integration also needs an honest source-of-truth rule. Product scenarios
belong with the product which maintains their semantics. The first Listus
scenario therefore belongs in `sneat-bots` and executes against the real
application profile supplied by `sneat-go`; neither SpecScore nor Rehearse should
own a copied version of its steps.

## Recommended Direction

Create an executable feature contract with four deliberately separate layers:

1. **SpecScore feature and acceptance-criterion view:** normative product intent,
   regardless of whether the configured AC source is inline or Rehearse's thin
   AC format.
2. **Chatwright scenario:** the executable conversational proof method.
3. **Rehearse adapter:** invocation and normalization into acceptance evidence.
4. **SpecScore binding and lock:** revisioned traceability, coverage and
   freshness without duplicating scenario content.

Chatwright owns its portable scenario format. Rehearse recognizes it as a
runner-native external proof format alongside Rehearse Markdown, and SpecScore
indexes its `verifies` relationships through the configured verification model.
Rehearse invokes Chatwright through a narrow adapter and consumes a normalized
result envelope while preserving links to Chatwright-native artifacts.

The relationship is many-to-many: one scenario may prove several criteria, and
one criterion may require several cases or execution modes. Generated summaries
show those relationships in a feature without embedding the serialized scenario
or asking humans to maintain content digests.

### Progressive serialization

Do not freeze a complete declarative conversation language before the Listus
reference journey proves the runtime concepts. The first portable artifact can
be a small versioned invocation manifest which names a Go-registered scenario,
case, inputs and execution modes. It is already useful to Rehearse and SpecScore,
and can evolve into a full structured scenario once actors, fragments,
checkpoints, branches and data assertions have stable semantics.

### Verification lock

A generated lock records the immutable verification definition: scenario URL
and revision/content digest, schema and compatible runner version, selected
case/modes, referenced fragment digests and DTQL assertion digests. Run evidence
separately records the application revision and exact locked definition which
was executed.

This distinction makes two kinds of staleness visible:

- the binding is stale when the scenario dependency graph differs from its lock;
- the evidence is stale when it was produced for an older binding or application
  revision than the one being evaluated.

The lock is a generated reproducibility aid, not a second hand-edited scenario.

## Illustrative Contract

The first manifest may be conceptually equivalent to:

~~~yaml
schema: https://chatwright.dev/scenario-invocation/v1
id: listus-new-user
runnerScenario: listus/new-user
verifies:
  - https://github.com/sneat-co/listus/spec/features/items#ac:item-is-persisted
cases:
  - onboarding
  - add-items
  - modify-items
modes:
  - telegram
~~~

A Rehearse scenario can initially invoke it through a dedicated block:

~~~markdown
# Rehearse: Listus persists a newly added item

**Verifies:** https://github.com/sneat-co/listus/spec/features/items#ac:item-is-persisted

```chatwright
scenario: scenarios/listus/new-user.chatwright.yaml
case: add-items
mode: telegram
```
~~~

The syntax is illustrative; the features promoted from this idea specify the
semantics without freezing these exact field or block names.

## Alternatives Considered

- **Teach Rehearse all Chatwright semantics.** Rejected because it creates a
  second conversation runtime and couples generic acceptance evidence to actors,
  messages, checkpoints, branching and DALgo.
- **Embed the serialized scenario in the feature README.** Rejected because
  feature intent becomes unreadable, product-owned scenarios are duplicated and
  reusable fragments cannot have one canonical source.
- **Let SpecScore own the Chatwright schema.** Rejected because the domain runner
  must be able to evolve and validate its own executable model independently.
- **Run Chatwright only through an opaque bash step.** Viable as a bootstrap but
  insufficient as the product contract: case-level statuses, AC references and
  artifact provenance would be inferred from terminal text.
- **Design a universal external-runner plugin system first.** Deferred. A thin
  dedicated Chatwright adapter proves the result protocol; common machinery can
  be extracted after a second domain runner demonstrates the same needs.
- **Store pass/fail only.** Rejected because a green boolean cannot explain the
  platform mode, application revision, state provider, DTQL result or branch
  whose behavior was actually observed.

## MVP Scope

- A stable named Chatwright scenario/case registry.
- A versioned invocation manifest owned by the product repository.
- One Rehearse Chatwright executor which invokes the real runner and real product
  through the declared Chatwright Platform Emulator profile.
- A normalized result envelope with case status, AC references, revisions,
  execution mode and artifact references.
- A generated SpecScore binding lock and feature summary.
- Fresh, failing, stale, partial, unsupported and unverified states kept
  distinct.
- The branchable Listus new-user and list-mutation journey as the reference
  cross-repository proof.

## Not Doing (and Why)

- A complete YAML replacement for the Go authoring API—the runtime semantics are
  still being validated.
- Rehearse execution of Chatwright's DTQL itself—Chatwright must query the named
  database holder bound to the current branch and report the result.
- Uploading rich run artifacts to SpecScore by default—local artifact references
  and explicit publication preserve Chatwright's offline-first boundary.
- Treating a passing scenario as feature approval—verification evidence proves
  specified behavior; it does not settle product status, completeness or quality
  outside the bound acceptance criteria.
- Locking generated IDs, timestamps, credentials or secret inputs—locks cover
  executable definitions and declared profiles, never sensitive runtime values.

## Key Assumptions to Validate

| Tier | Assumption | How to validate |
|---|---|---|
| Must-be-true | Rehearse can consume Chatwright outcomes without understanding chat or branch semantics. | Implement the Listus adapter using only invocation inputs and the normalized result envelope; record any leaked domain dependency. |
| Must-be-true | A small invocation manifest is useful before a full structured scenario exists. | Bind and rerun the Go-defined Listus journey from another repository with no copied steps. |
| Must-be-true | The lock can cover the transitive proof definition reproducibly. | Change a fragment and a DTQL assertion independently; both changes must make the binding stale. |
| Should-be-true | Developers understand separate binding-stale and evidence-stale statuses. | Present controlled examples in Studio and test whether users can identify the required rerun or relock action. |
| Should-be-true | Rich artifact links are enough for SpecScore while Chatwright retains native evidence. | Diagnose a failed Listus criterion from the SpecScore view through the linked transcript, branch and DTQL artifacts. |
| Might-be-true | Native discovery can later remove the small Rehearse wrapper file. | Compare wrapper-based and adapter-discovered scenarios after the MVP format stabilizes. |

## SpecScore Integration

- **Portable artifact:** [Portable scenario documents](../features/chatwright/scenario-authoring/portable-scenario-documents/README.md)
- **Execution bridge:** [Rehearse adapter](../features/chatwright/developer-tooling/rehearse-adapter/README.md)
- **Feature binding:** [SpecScore verification bindings](../features/chatwright/developer-tooling/specscore-verification-bindings/README.md)
- **Reference plan:** [Listus branchable reference scenario](../plans/listus-branching-reference-scenario.md)

## Open Questions

- Should Rehearse discover native `.chatwright.yaml` files directly after the
  adapter MVP, or keep explicit wrapper scenarios as a readable verification
  layer?
- Which runner-version compatibility rule belongs in a lock: exact version,
  schema-declared range or capability digest?
- Does a cross-repository scenario URL lock to a commit in the feature repository
  or to an independently resolved scenario repository revision?
- Which application changes should invalidate evidence automatically when a
  monorepo-independent dependency graph is unavailable?

---
*This document follows the https://specscore.md/idea-specification*
