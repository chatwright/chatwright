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

The same package also carries the presentation transport added by Task 1b: a
timer-free cursor with caller-declared segment ranges and barrier bindings, and
an opaque wait ticket that only the caller can release after its own validation.
The package remains presentation-only; the caller owns every project, authority,
checkpoint, attempt, outcome and assistance decision.

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
specification, tempo, playhead-independent derivations and the presentation
transport. Studio's `PlayerEngine` stays the Angular wrapper: signals, the
virtual clock, native timers, typing animation frames, chat auto-follow/pinning
and deferred play. The wrapper imports the package's compiled exports; Studio
keeps no second live engine. Existing Studio engine and `PlayerEngine`
regression tests continue to run against the extracted implementation.

### External waits are presentation, not validation

The transport is a pure cursor over the timeline with caller-declared
`PresentationSegment` ranges and `PresentationBarrier` step bindings. A host
clock tick calls `advance()` while `state.canAdvance` is true; reaching an
unreleased barrier returns `waiting` with a live ticket, and doing nothing keeps
it waiting. `canAdvance` also admits the documented tick that reaches
`segment-end` or `ended`, so a host never strands a preview, idle or running
state one step short of its required transition. `seek()` is a watch operation:
it may preview anywhere, revokes any open ticket and never opens one. Segment
ends wait for an explicit outer `enterSegment()`; barriers never change
chapters.

The caller owns the whole validation boundary. It constructs and matches its own
immutable context and envelope — project scope, authority generation, content
pins, walkthrough/chapter/step, challenge identity/revision, checkpoint, attempt
and submission generation, typed outcome, whole-attempt completion and an
independent assistance flag — and only then calls `releaseWait()` with the exact
current ticket. Acceptance is exact-instance and once-only. Release marks the
wait satisfied but never advances, schedules a frame or restarts playback, so a
release while paused still needs an explicit Play. `seek`, `reset`, a new load or
dispose revoke obsolete tickets and callbacks.

The package never parses an envelope, interprets an outcome, keeps a completion
registry, consumes validation or performs the external action. Barriers are
runtime presentation bindings, never run-bundle wire fields; `walkthrough.json`
remains the sole chapter owner. Studio consumes the same transport: empty-barrier
behaviour is unchanged, and a scheduled frame callback delivered after a seek,
pause, plan change or disposal is inert. The transport validates and freezes the
caller's plan; a host that retains it across a rebuild keeps
`transport.bindings`, not the caller's mutable arrays or records. A new
load/select/patch context is prepared and validated before any bundle, timeline
or transport is published, so a failed admission leaves the prior complete
context unchanged rather than pairing an empty timeline with an old live ticket.
A live wait at the final index survives pause/Play; a paused release satisfies
the wait without advancing, scheduling or restarting, and ordinary wait-free
replay-at-end still restarts. The only caller-side matching proof is synthetic;
this specification claims no production DataTug adapter, server grading or
registry publication.

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
| Presentation transport | `PresentationTransport`, `PresentationSegment`, `PresentationBarrier`, `PresentationPlan`, `PresentationState`, `PresentationStatus`, `PresentationWaitTicket` |

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
presentation-only change is Go **N/A**; this extraction and its presentation
transport are therefore N/A for Go. If a future change alters shared execution,
scenario, validation or wire semantics, it requires real Go/TypeScript parity
evidence and a different specification — not an extension of this one.

The external-wait proof is deliberately bounded. Envelope construction and
matching live in the proof harness's caller-side adapter, not in the package.
The browser embedding is a synthetic presentation surface: it has no SQL editor,
DataTug adapter, evidence rows, attempt store or production grading claim. It
proves presentation admission and caller fencing, not server-verified
achievement, learner progress, registry publication or deployment.

### Licensing and dependency facts

The package contains only first-party Chatwright code extracted from Studio. It
is Apache-2.0, carries the project `NOTICE`, and its runtime dependency closure
is empty. Studio's existing third-party dependencies are untouched; Angular,
PrimeNG, Firebase, cloud saving, providers and UI components stay with Studio.
The browser proof adds `playwright-core` as a Studio development dependency only.

### Source evidence

Task 1a extraction is recorded by the durable
[commit `c85671b`](https://github.com/chatwright/studio/commit/c85671b1067e3ba5919640d93b13f241959adde0)
(already landed); the deleted `incident-replay-player-core` branch is not a
durable reference. Task 1b transport and embedding remain on the
`incident-replay-checkpoint-transport` pre-landing branch. The canonical paths are
[`packages/player-core`](https://github.com/chatwright/studio/tree/main/packages/player-core),
[`scripts/prove-player-core-package.mjs`](https://github.com/chatwright/studio/blob/main/scripts/prove-player-core-package.mjs)
and
[`scripts/prove-player-core-browser.mjs`](https://github.com/chatwright/studio/blob/main/scripts/prove-player-core-browser.mjs).

Observed Task 1b forward-fix proof run on 2026-10-26 against Studio main base
`68759024def5f7adeb79046a89252a00f875384f` plus pre-landing commit
`50ec3535064187ef36886cb2b0142accea520207` (all commands exited 0):

| Item | Observed |
|---|---|
| Package unit tests | 33 tests, 9 suites, 0 failures (`pnpm --filter @chatwright/player-core test`; includes the documented-`canAdvance` host-transition suite) |
| Studio regression tests | 19 files, 205 tests, 0 failures (`pnpm test`; includes final-index wait, retained-binding, atomic-context and cancelled-callback regressions) |
| Studio typecheck/build | development build, production Cloudflare build and offline UI zip succeeded; pre-existing `emulator.page.scss` budget warning only |
| Tarball | `chatwright-player-core-0.1.0.tgz`, 43,497 bytes, 40 entries |
| Tarball SHA-256 | `64ce6a8ae02645505c2f10e1778b30e3ea78ef2867ad30a9eed6b3ce725733bc` |
| Tarball contents | `package.json`, `README.md`, `LICENSE`, `NOTICE`, 9 compiled `.js`, 9 `.d.ts`, 9 `.d.ts.map`, 9 `.js.map`; no `src/`, `test/` or `node_modules/` |
| Dependency closure | `dependencies`, `peerDependencies`, `optionalDependencies`, `bundledDependencies`, `bundleDependencies` all absent/empty; no external runtime or declaration imports |
| Consumer install | `npm install --offline --ignore-scripts --no-audit --no-fund --no-package-lock <tarball>` from a fresh temp directory outside the repository |
| Consumer resolution | `<consumer>/node_modules/@chatwright/player-core/dist/index.js`; not a repository path |
| Consumer runtime proof | 23/23 checks passed: existing golden messages/edit/deletion and seek equivalence plus documented-`canAdvance` host transitions, caller-side envelope mutation, required named-part completion, recreated-wait once-only consumption, ticket lifetime, stored-completion and zero-effect fencing |
| Consumer declaration proof | explicit TypeScript compiler, `--noEmit --strict --lib ES2022 --module NodeNext`, exit 0, including the transport types |
| Raw catalogue pins | Consumer fixtures declare raw UTF-8 byte length and SHA-256 (en 111 bytes, fr 119 bytes) and reject changed bytes, wrong lengths and a re-formatted equivalent JSON before parsing, key resolution or timing |
| Browser embedding | Chromium 156.0.8078.4 (headless), 39/39 checks, 10 screenshots, loopback-only ephemeral server, consumer tarball install; browser/context/server cleanup confirmed |
| Browser lifecycle proof | 4/4 child-process checks: SIGINT and SIGTERM each close context, browser and the owned loopback server exactly once; a rejected context/browser close still closes the others, reports the failure and leaves no listening port |

The proof prints the tarball hash, full file list, consumer path, exact commands
and outcomes on every run. Temporary consumer paths are per-run; the observed
forward-fix runs used
`/var/folders/c6/pty228l52dx19k5xfxjz1ztr0000gn/T/chatwright-player-core-proof-bhRI0J/consumer`
and
`/var/folders/c6/pty228l52dx19k5xfxjz1ztr0000gn/T/chatwright-player-core-browser-lNZvxi/consumer`.
Each screenshot records one expected-versus-observed sentence for its settled
transcript and effect/credit counters.

### Relationship to DataTug Incident Replay

This work covers the bounded extraction (Task 1a) and the presentation
transport/wait and synthetic external-checkpoint embedding (Task 1b) portions of
the approved
[Incident Replay Task 1 — Validate generic Chatwright embedding](https://github.com/datatug/backstage/blob/main/spec/plans/incident-replay/README.md#task-1-validate-generic-chatwright-embedding)
under the approved
[Incident Replay feature](https://github.com/datatug/backstage/blob/main/spec/features/incident-replay/README.md).
The caller-side adapter is a deterministic fencing proof, not a production
DataTug adapter. Task 1 remains incomplete pending its aggregate review and
landing; Task 2 (versioned narrative and checkpoint contracts) and the six-case
Phantom Orders story remain dependent future work. No external checkpoint
capability, learner progress, Work record or registry publication is claimed.

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

### AC: external-waits-are-caller-gated

Scenario: A host reaches a caller-declared barrier while playing
Given a packed consumer with a declared segment and barrier and an open wait ticket
When the host keeps ticking without a matching caller release
Then presentation stays at the barrier with the same ticket and grants no credit
When the caller seeks, resets, reloads or disposes
Then obsolete tickets and scheduled callbacks are inert
When the caller releases the exact current ticket after its own accepted result
Then presentation resumes within the same segment at most once
And a release while paused does not restart playback
And Watch/seek never opens a ticket, consumes validation or changes chapters
And a host that schedules only while `canAdvance` reaches `waiting`,
`segment-end` and `ended` without an undocumented extra advance
And a live final-index wait survives pause/Play, while wait-free end-of-run
replay still restarts
And a failed load/select/patch leaves the prior bundle, timeline, transport,
cursor and ticket coherent
And a caller-owned once-only ledger prevents a recreated wait from consuming the
same attempt/submission identity again

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
