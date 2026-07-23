# Release process

Chatwright is pre-1.0 across the fleet: tags are `v0.X.Y`, the API may change
between minor versions, and every release is honest about what it supports.

Since the 2026-07-23 code split, releases happen per repository. Every code
repository releases by a deliberate, hand-cut annotated tag
(`git tag -a vX.Y.Z -m "vX.Y.Z"`, push the tag); this repository — the
standard — releases formats and docs, not code. No new tags are ever cut on
the old `github.com/chatwright/chatwright` module path; its existing `v0.x`
tags remain resolvable forever.

## Per-repository release flow

### sdk-go (`chatwright.dev/sdk`)

The canonical run-bundle JSON Schema lives here, generated from the sdk wire
types by `go run ./internal/schemagen/gen` and gated by the module's own
drift-guard test (regeneration must match the committed
`formats/run-bundle/v1/schema.json`). Release: green gates (`gofmt`,
`go vet ./...`, `go test -race ./...`, drift guard in CI), then a deliberate
annotated tag. A schema change triggers the format-release checklist below.

### runtime-go (`chatwright.dev/runtime`)

Release only with **all four e2e gates green**:

1. greetbot scripted campaign,
2. bundle e2e (`run/bundle_e2e_test.go`), including schema validation of the
   produced bundle,
3. the two-part hybrid-run proof,
4. pybot (a real Python subprocess driven over HTTP).

Then a deliberate annotated tag. Review
[`docs/compatibility/telegram.md`](compatibility/telegram.md) (kept in this
repository) against the code being released — the profile is versioned by
release, and release notes link the profile as of that tag.

### cli (`chatwright.dev/cli`)

Pushing an annotated tag triggers GoReleaser via `strongo/cicd`'s
`release.yml`: it builds the release artifacts (linux/darwin amd64+arm64,
windows amd64, plus checksums) that the chatwright.dev install scripts —
`curl -fsSL https://chatwright.dev/install.sh | sh` and
`irm https://chatwright.dev/install.ps1 | iex` — download and verify. The
Homebrew cask self-skips while the `CHATWRIGHT_GORELEASER_GITHUB_TOKEN`
secret is absent and activates on the first release cut after it is set;
until then the cask is not an available install path and must not be
documented as one.

### This repository — format releases

When the run-bundle schema changes in sdk-go, in the same window:

1. Copy the regenerated schema from sdk-go into
   [`formats/run-bundle/v1/schema.json`](../formats/run-bundle/v1/schema.json)
   here, **and**
2. Update the studio worker's published copy —
   `worker/formats/run-bundle/v1/schema.json` in
   [chatwright/studio](https://github.com/chatwright/studio) — so
   `https://chatwright.dev/formats/run-bundle/v1/schema.json` serves the same
   bytes.

The [Format drift workflow](../.github/workflows/format-drift.yml) enforces
both: it diffs this repository's committed copy against sdk-go's `main` and
against the copy served at chatwright.dev, on every push/PR and weekly.

The `CHATWRIGHT.md` manifest format (decision 0013) follows the same
pattern with one difference: its canonical schema lives **here**, at
[`formats/chatwright-md/v1/schema.json`](../formats/chatwright-md/v1/schema.json)
(hand-authored; no generator yet). A schema change means updating the studio
worker's copy — `worker/formats/chatwright-md/v1/schema.json` — in the same
window; the drift workflow diffs the served copy against this repository's
canonical one.

## Common checklist per code release

1. **Green gates** for that repository (see above), plus
   `specscore spec lint` where the change touches spec/docs in this
   repository.
2. **CHANGELOG:** move the Unreleased section under the new version heading
   with the date. Entries describe user-visible behaviour, not commits.
3. **Tag:** annotated `git tag -a vX.Y.Z -m "vX.Y.Z"`, push the tag.
4. **Verify install paths** from a clean environment, e.g.
   `go get chatwright.dev/runtime@vX.Y.Z`,
   `go install chatwright.dev/cli/cmd/chatwright@vX.Y.Z`, or the install
   script for a CLI release. Vanity-path gotchas (recorded during the split):
   edge propagation takes seconds — retry, don't fail; the first
   sum.golang.org lookup of a brand-new tag can 500 for about a minute;
   pkg.go.dev indexing is lazy and never a gate.
5. **GitHub release:** `gh release create vX.Y.Z` with the CHANGELOG section
   as notes (the cli repo's GoReleaser workflow creates its release itself).
6. **No overclaims:** release notes follow the declared-fidelity principle —
   supported / partial / unsupported wording, never "full".

## Versioning intent

- The split repositories version independently, each from its own `v0.1.0`.
- Patch: fixes within the declared profile.
- Minor: profile expansions, new assertions, new capabilities; may include
  pre-1.0 API breaks, which the CHANGELOG names explicitly (plain prose — no
  `!`/`BREAKING CHANGE:` markers pre-1.0).
- v1.0.0 waits until the Phase 1 exit gate in [`roadmap.md`](roadmap.md) holds.

## Version policy

Chatwright stays on `v0.x` until the Phase 1 exit gate holds. A `feat!:` or
`BREAKING CHANGE:` marker in a commit message never triggers an automatic
major-version bump. The split repositories (`sdk-go`, `runtime-go`, `cli`)
each set `disable-version-bumping: true` in their own `strongo/cicd` CI
workflows, so every tag is cut by hand, per the flow above. Each also sets
`allow_major_version_bump: false` explicitly (matching the `strongo/cicd`
default): should any of them ever adopt the shared workflow's
continuous-delivery auto-tag path, a commit that would otherwise bump the
major version is capped to a minor bump with a warning in the run log, rather
than failing the run or cutting `v1.0.0` unattended. `v1.0.0` is cut only by
a deliberate, explicit action: the founder (or an authorised maintainer)
pushes an annotated `v1.0.0` tag by hand — no automated path in
`strongo/cicd` can produce it on its own.
