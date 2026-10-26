---
format: https://specscore.md/feature-specification
status: Draft
---

# Feature: Player playback core

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/playground/playback-core?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/playground/playback-core?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/playground/playback-core?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/playground/playback-core?op=request-change) |
**Status:** Draft
**Source Ideas:** —

**Scope of this specification.** This document records an extraction and
packaging decision for the playback core already used by Chatwright Studio. It
supports the [Playground](../README.md) Feature without approving the Draft
Playground Feature as a whole, and it does not approve or implement the
[DataTug Incident Replay programme](https://github.com/datatug/backstage/blob/main/spec/plans/incident-replay/README.md).
The evidence below covers extraction, packaging and an outside-repository
consumer only. It is not evidence of Main landing, a registry publication,
external checkpoint transport, DataTug embedding or the six-case story.

## Summary

Studio's Player already has a framework-free layer that turns a run bundle into a
deterministic timeline and folds it into settled transcript state. This
specification extracts that layer into `@chatwright/player-core`, a small
Apache-2.0 package with compiled ESM, self-contained declarations, an explicit
public surface and no runtime dependencies. Studio consumes this single
implementation; its Angular signals, native timers, animation-frame
presentation, chat pinning and UI state remain in Studio.

## Problem

The pure playback layer lived inside the Studio application. Any other consumer
of Chatwright run bundles — a training surface, a review tool, a test harness —
would either import Studio internals and inherit Angular/Firebase coupling or
copy the timeline and settled-state logic. A copy drifts from the player that
users actually see, and "same bundle, same seek, same state" stops being one
provable claim.

The opposite mistake is also real: publishing a runtime execution layer as the
playback API. Scenario execution, validation, grading and wire-format policy are
not presentation concerns and must not move into this package.

## Behaviour

### The pure playback surface

Given a run bundle, the package builds an ordered step list. Ordering is
deterministic: part order first, then timestamp with sub-millisecond precision,
then journal-before-AI-beat at an identical instant, then construction order.
Settled state at an index is a pure fold of journal steps up to and including
that index. It applies edits in place, retains each version's lineage, records
button presses against their target, marks deletions and keeps uncaptured-method
notes. AI beats never mutate settled state.

Animation is declared, not performed. The package selects a primitive and a
nominal duration; the host owns timers, `requestAnimationFrame`, reduced motion
and rendering. Tempo arithmetic is a pure function so a host applies the same
speed scale without copying it.

### One implementation, two layers

`packages/player-core` owns the timeline, settled state, animation
specification, tempo and playhead-independent derivations. Studio's
`PlayerEngine` stays the Angular wrapper: signals, the virtual clock, native
timers, typing animation frames, chat auto-follow/pinning and deferred play. The
wrapper imports the package's compiled exports; Studio keeps no second live
engine. Existing Studio engine and `PlayerEngine` regression tests continue to
run against the extracted implementation.

### Package and consumer contract

- Package name: `@chatwright/player-core`, version `0.1.0`.
- Compiled ESM plus declarations; the `exports` map exposes the root entry point
  and `./package.json` only. There are no deep private source exports.
- Zero runtime, peer, optional or bundled dependencies. The packed JavaScript
  imports only relative files; declarations reference only relative files.
- `README.md`, `LICENSE` (Apache-2.0) and `NOTICE` ship in the tarball alongside
  `dist/`.
- Studio builds the workspace package before Angular build, test and typecheck,
  so a clean checkout never depends on a `dist/` left on a developer machine.
- The executable proof packs the real package, inspects the tarball, installs it
  into a fresh temporary consumer outside the repository with `npm --offline`,
  and runs both a runtime proof and a TypeScript declaration proof against that
  install. No repository alias, sibling checkout, vendored runtime or private
  source import participates in package resolution.

### Ownership boundary: no second manifest

`walkthrough.json` remains DataTug's sole chapter/navigation owner. This package
does not define a training manifest, chapter model, checkpoint contract,
progress store or workflow engine. Studio's existing bundle-part projection
remains a presentation adapter over run-bundle parts. DataTug will supply its own
approved projection later. No Phantom Orders identifiers or business-domain
special cases enter production playback code.

### Public API

The root entry point is deliberately explicit; the full list is in the package's
`src/index.ts`.

| Area | Public exports |
|---|---|
| Run-bundle wire types | `Bundle`, `BundleRun`, `BundlePart`, `BundleActor`, `PlatformJournalEntry`, `PlatformAction`, `ActorLoopEvent`, `ObserveObservation`, `BundleAnnotation`, `BundleBookmark`, `BundleAnchor`, `CampaignReport`, `DatastateEvidence`, related string-enum types, `RUN_BUNDLE_FORMAT_V1` |
| Timeline | `buildTimeline`, `chaptersOf`, `Step`, `JournalStep`, `BeatStep`, `BeatKind`, `Chapter` |
| Settled state | `settledStateAt`, `SettledState`, `SettledChat`, `SettledItem`, `SettledMessage`, `MessageVersion`, `MethodNote` |
| Animation specification | `animationForJournalEntry`, `animationForBeat`, `messageKey`, `TYPING_MS_PER_CHAR`, `AnimationSpec`, `AnimationPrimitive` |
| Tempo | `BASE_TEMPO`, `MIN_GAP_MS`, `MAX_GAP_MS`, `frameDelayMs` |
| Playhead-independent derivations | `attribution`, `messageLineage`, `loopEventForBotMessage`, `observedByParts`, `actorStats`, `deriveMarkers`, `findingSeverity`, `resolveAnnotations`, `threadAnnotations`, `resolveAnchorMessageKey` and their result types |
| AI mind cursor | `aiCursorAt`, `AiCursor` |

The wire types are input/contract types only. Parsing and validation policy
remain in Studio (`parse-bundle.ts`); shared wire semantics are unchanged by this
extraction.

### Extraction decision

Options considered:

1. **Keep the pure layer in Studio; let each consumer copy it.** Rejected: a
   second live implementation drifts and makes seek-equivalence claims
   unverifiable.
2. **Publish the runtime scenario engine as the playback API.** Rejected:
   execution, validation and grading are different semantics; they must not be
   conflated with presentation and would break runtime parity expectations.
3. **Move the Angular `PlayerEngine` into the package.** Rejected: it owns
   signals, timers, animation frames and DOM-facing presentation, which belong
   to Studio and would make the package framework-bound.
4. **Extract the pure core as `@chatwright/player-core`; keep the Angular wrapper
   in Studio.** Chosen: one implementation, zero runtime dependencies, no DOM or
   Node-specific public types, and a public surface both Studio and an outside
   consumer can compile and run.

Studio therefore has no compatibility shim: production imports and existing
regression tests resolve `@chatwright/player-core` from the workspace's compiled
package, and the package builds before Studio uses it.

### Proof boundary and runtime parity

Playback is a rendering concern. Under the current
[runtime-parity register](../../../../../docs/runtime-parity.md) rule, a
presentation-only change is Go **N/A**; this extraction is therefore N/A for
Go. If a future change alters shared execution, scenario or wire semantics, it
requires real Go/TypeScript parity evidence and a different specification — not
an extension of this one.

### Licensing and dependency facts

The package contains only first-party Chatwright code extracted from Studio. It
is Apache-2.0, carries the project `NOTICE`, and its runtime dependency closure
is empty. Studio's existing third-party dependencies are untouched; Angular,
PrimeNG, Firebase, cloud saving, providers and UI components stay with Studio.

### Source evidence

Pre-landing source branch: `incident-replay-player-core` in
[chatwright/studio](https://github.com/chatwright/studio/tree/incident-replay-player-core).
The canonical post-landing paths are
[`packages/player-core`](https://github.com/chatwright/studio/tree/main/packages/player-core)
and
[`scripts/prove-player-core-package.mjs`](https://github.com/chatwright/studio/blob/main/scripts/prove-player-core-package.mjs).

Observed proof run on 2026-10-26 (all commands exited 0):

| Item | Observed |
|---|---|
| Package unit tests | 6 tests, 3 suites, 0 failures (`pnpm --filter @chatwright/player-core test`) |
| Studio regression tests | 19 files, 185 tests, 0 failures (`pnpm test`) |
| Studio typecheck/build | development build and production build succeeded; pre-existing `emulator.page.scss` budget warning only |
| Tarball | `chatwright-player-core-0.1.0.tgz`, 34,246 bytes |
| Tarball SHA-256 | `1dbd2648b4dba6ac4033689e13dbe48ca1fc1ab303e1f4e83d0031f02bcfdb6a` |
| Tarball contents | `package.json`, `README.md`, `LICENSE`, `NOTICE`, 8 compiled `.js`, 8 `.d.ts`, 8 `.d.ts.map`, 8 `.js.map`; no `src/`, `test/` or `node_modules/` |
| Dependency closure | `dependencies`, `peerDependencies`, `optionalDependencies`, `bundledDependencies`, `bundleDependencies` all absent/empty; no external runtime or declaration imports |
| Consumer install | `npm install --offline --ignore-scripts --no-audit --no-fund --no-package-lock <tarball>` from a fresh temp directory outside the repository |
| Consumer resolution | `<consumer>/node_modules/@chatwright/player-core/dist/index.js`; not a repository path |
| Consumer runtime proof | 8/8 checks passed, including existing golden messages/edit, sequential-versus-seek equivalence and a declared deletion |
| Consumer declaration proof | explicit TypeScript compiler, `--noEmit --strict --lib ES2022 --module NodeNext`, exit 0 |

The proof prints the tarball hash, full file list, consumer path, exact commands
and outcomes on every run. Temporary consumer paths are per-run; the observed run
used `/var/folders/c6/pty228l52dx19k5xfxjz1ztr0000gn/T/chatwright-player-core-proof-mg4B3e/consumer`.

### Relationship to DataTug Incident Replay

This work is the bounded extraction portion of the approved
[Incident Replay Task 1 — Validate generic Chatwright embedding](https://github.com/datatug/backstage/blob/main/spec/plans/incident-replay/README.md#task-1-validate-generic-chatwright-embedding)
under the approved
[Incident Replay feature](https://github.com/datatug/backstage/blob/main/spec/features/incident-replay/README.md).
The proof here is extraction and packaging only. Task 1b (external
wait/checkpoint transport and synthetic embedding), Task 2 (versioned narrative
and checkpoint contracts) and the six-case Phantom Orders story remain dependent
future work. No external checkpoint capability is claimed, and nothing here
creates learner progress or a Work record.

## Dependencies

- [Chatwright Playground](../README.md)
- [Runtime parity decision](../../../../decisions/0015-runtime-parity.md)
- [Runtime parity register](../../../../../docs/runtime-parity.md)
- Run-bundle v1 wire contract ([`formats/run-bundle/v1/schema.json`](../../../../../formats/run-bundle/v1/schema.json))

## Acceptance Criteria

### AC: settled-state-is-deterministic

Scenario: The existing golden bundle is played and seeked
Given the existing golden run bundle
When a consumer steps through every index and separately seeks directly to each
Then settled state is deep-equal at every index
And the final state has two visible messages with the bot message edited in place
to version 1 and the original version retained in history

### AC: studio-uses-one-implementation

Scenario: Studio builds and tests the Player
Given the extracted package and Studio's Angular `PlayerEngine` wrapper
When Studio builds, typechecks and runs its engine regressions
Then the wrapper imports `@chatwright/player-core` compiled exports
And no duplicate live timeline or settled-state implementation remains in Studio
And signals, native timers, animation frames, chat pinning and reduced motion
remain in the wrapper

### AC: packed-package-is-self-contained

Scenario: A reviewer inspects the packed package
Given the built `@chatwright/player-core` tarball
When its manifest, file list, compiled imports and declarations are inspected
Then all runtime and declaration dependencies are empty or relative
And `README.md`, `LICENSE` and `NOTICE` are present
And no source, test or `node_modules` content is packed

### AC: outside-consumer-proves-the-public-contract

Scenario: A fresh consumer outside the repository installs the tarball
Given a temporary consumer directory containing only the tarball install
When the consumer imports the public root export and runs its runtime and
declaration checks
Then it observes the declared messages, edit, deletion and sequential-versus-seek
equivalence
And package resolution is the consumer's tarball install, not a repository
alias, sibling checkout or private source file

### AC: playback-is-presentation-only-for-parity

Scenario: A reviewer assesses runtime parity
Given this presentation-only extraction
When the runtime-parity register is consulted
Then playback remains Go N/A under the current rendering rule
And any future change to shared execution or wire semantics is required to carry
real Go/TypeScript parity evidence instead

### AC: walkthrough-ownership-remains-with-datatug

Scenario: A future embedding supplies chapter navigation
Given DataTug's `walkthrough.json` and the extracted playback core
When the embedding is designed
Then `walkthrough.json` remains the sole chapter/navigation owner
And the playback package provides no second training manifest or workflow engine

## Open Questions

- When the package should move to a dedicated repository rather than the Studio
  workspace is a packaging decision, not a reason to fork the implementation.
- Versioning and release automation for the package are deliberately deferred
  until a real consumer needs registry publication; this specification claims no
  registry publication.
- Whether a future consumer needs a narrower subpath export (for example
  timeline-only) should be decided from actual use, not speculative API design.

---
*This document follows the https://specscore.md/feature-specification*
