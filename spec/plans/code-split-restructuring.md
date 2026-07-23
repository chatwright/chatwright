---
format: https://specscore.md/plan-specification
status: Draft
---

# Plan: Code-split restructuring — sdk-go, runtime-go, cli, the standard repo

**Status:** Draft
**Source:** idea:engine-sdk-repo-split
**Features:** chatwright/developer-tooling
**Date:** 2026-07-23
**Owner:** alex
**Supersedes:** —

## Summary

Execute the approved code split: this repository becomes the standard
(specs, formats, docs; later conformance), and the Go code moves into three
repositories — `chatwright/sdk-go` (module `chatwright.dev/sdk`),
`chatwright/runtime-go` (module `chatwright.dev/runtime`) and
`chatwright/cli` (module `chatwright.dev/chatwright`) — under vanity import
paths served by chatwright.dev. Execution is gated on the Listus MVP proof
and the player PR landing, because in-flight lanes in other sessions import
the current module path. Task 0 (vanity prototype) is safe to run now.

## Design decisions (binding for execution)

### The SDK owns the wire model

`chatwright.dev/sdk` defines its own Go types for everything the run-bundle
schema describes — bundle, runs, actors, parts, journal entries, anchors,
bookmarks, annotations, report, evidence, observations, loop events *as wire
shapes*. The runtime converts its internal types (platform.JournalEntry,
goal.Goal, observe.Observation, actor.LoopEvent, campaign.Report,
datastate.Evidence) into sdk wire types at bundle-assembly time
(`AssembleBundleRun`/`SingleAIGoalRun` move runtime-side; sdk stays pure
model + IO + schema). Consequences: the JSON Schema is generated from sdk
types; runtime internals can evolve without touching the wire contract; the
sdk go.mod stays library-pure (the split's founding requirement); and the
future recorder lives sdk-side with the file/DALgo/capture-API sinks.

### Wire-casing normalisation (founder checkpoint before execution)

Today's wire mixes camelCase wrapper fields with PascalCase embedded
runtime types (a consequence of embedding — the TS player must handle both).
With sdk-owned wire types the embedding constraint disappears.
**Recommendation: normalise the entire wire to camelCase in this cut**,
while the format is unreleased — regenerating schema, goldens, samples and
the player's TS types in the same window. Still format v1 (no external
consumers). Founder approves or declines this explicitly before Task 2; the
plan works either way (declining means sdk wire types replicate today's
casing exactly).

### CLI module path and canonical install

Repo `chatwright/cli`, module `chatwright.dev/cli`, binary at
`cmd/chatwright`. Canonical install (founder decision) is an install script
served by the chatwright.dev worker — `curl -fsSL
https://chatwright.dev/install.sh | sh` and a Windows analogue (`irm
https://chatwright.dev/install.ps1 | iex`) — downloading GoReleaser release
artifacts; the Homebrew cask stays per the ecosystem standard; `go install
chatwright.dev/cli/cmd/chatwright@latest` is the Go-native tertiary path
(the last path element names the binary `chatwright`). Task 4 includes the
two install scripts + a clean-machine proof of each on macOS/Linux (sh) and
Windows (PowerShell) alongside the cask.

### Vanity import paths

The chatwright.dev worker (studio repo) serves `go-import` (and `go-source`)
meta for `chatwright.dev/{sdk,runtime,chatwright}` on `?go-get=1` requests,
pointing at the three GitHub repos. Repo layout becomes permanently
invisible to importers.

### History, old path, versioning

Packages move with history (`git filter-repo` per package set). Old
`github.com/chatwright/chatwright` tags remain resolvable forever; after the
cut the standard repo removes Go code in an ordinary commit and never tags
the old module path again. New repos start at v0.1.0 with independent
semver; the CLI's `--version` prints its own version plus the resolved
sdk/runtime versions from build info. The canonical schema is generated in
sdk-go; the published copy in this repo's `formats/` is updated as a step in
the format-release checklist, with a CI drift check comparing the two.

## Tasks

| # | Task | Depends on |
|---|---|---|
| 0 | Vanity prototype: worker route serving go-import meta for a scratch module (`chatwright.dev/vanity-test` → private scratch repo); prove `go install` and `go get` from a clean machine incl. the `?go-get=1` flow; check pkg.go.dev indexing behaviour. Safe NOW — additive worker route. | — |
| 1 | Founder checkpoint: wire-casing normalisation yes/no (record in a status note here). | 0 |
| 2 | Cut `sdk-go`: wire model + Write/Read + schemagen + goldens/tests moved with history; regenerate schema; tag v0.1.0. | 1, gate |
| 3 | Cut `runtime-go`: platform/telegram/observe/goal/actor(+anthropic)/campaign/datastate/run/scenario root + examples; assembly conversion layer to sdk wire types; every existing e2e gate green (greetbot scripted campaign, bundle e2e, two-part proof, pybot); tag v0.1.0. | 2 |
| 4 | Cut `cli`: root main package importing runtime + sdk; strongo/cicd CI, GoReleaser + Homebrew cask; clean-machine install proof. | 3 |
| 5 | Prune this repo to the standard: remove Go code, rewrite README as the front door (what Chatwright is; install one-liner; repo map), update quickstarts/release-process/glossary pointers. | 3 |
| 6 | Consumers: studio player TS types + samples regenerated if Task 1 approved normalisation; backstage notes; migration note for sneat-bots/sneat-go next bump. | 3 |

## Status note (2026-07-23)

Task 1 is decided: the founder approved full camelCase wire normalisation.
Normalisation is pulled forward and executed pre-split in the current repo —
explicit `json` tags on every type reaching bundle JSON, schema/goldens/
samples regenerated — so the wire settles before any cut and Task 2's sdk
extraction inherits the final shape. Task 0 (vanity prototype) COMPLETE
the same day: the chatwright.dev worker serves go-import/go-source meta for
sdk/runtime/cli/vanity-proof (studio df99001, deployed green, existing
routes unaffected); `go install chatwright.dev/vanity-proof@latest` and
`go get` both proven from a clean machine. Gotchas recorded for the cut:
edge propagation takes seconds (retry, don't fail); the first
sum.golang.org lookup of a brand-new tag can 500 for ~a minute; pkg.go.dev
indexing is lazy and decoupled — never a gate for install.

## Out of scope

The TypeScript runtime and `@chatwright/sdk` extraction; the recorder
implementation (lives in sdk-go later per its own idea); any conformance
suite work; renaming or restructuring the studio repo.

## Gate

Per principle 6, the split exists only with its proofs: a scratch consumer
importing only `chatwright.dev/sdk` builds with no runtime/CLI dependencies
in its go.sum; `go install chatwright.dev/chatwright@latest` works from a
clean machine; all pre-split e2e gates pass in runtime-go; the schema drift
check runs in CI on both sides; `specscore spec lint` 0 violations after the
docs sweep. Execution start is gated on the Listus MVP proof and studio
PR #2 landing.

---
*This document follows the https://specscore.md/plan-specification*
