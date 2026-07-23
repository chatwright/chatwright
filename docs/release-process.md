# Release process

Chatwright is pre-1.0: tags are `v0.X.Y`, the API may change between minor
versions, and every release is honest about what it supports.

## Checklist per release

1. **Green gates:** `gofmt -l .` empty, `go vet ./...`, `go test -race ./...`,
   `specscore spec lint` — all clean on `main`.
2. **Compatibility profile:** review
   [`docs/compatibility/telegram.md`](compatibility/telegram.md) against the
   code being released; the profile is versioned by release — the release notes
   link the profile as of that tag.
3. **CHANGELOG:** move the Unreleased section under the new version heading
   with the date. Entries describe user-visible behaviour, not commits.
4. **Tag:** annotated `git tag -a vX.Y.Z -m "vX.Y.Z"`, push the tag.
5. **Verify install paths** from a clean environment:
   `go get github.com/chatwright/chatwright@vX.Y.Z` and
   `go install github.com/chatwright/chatwright/cmd/chatwright@vX.Y.Z`.
6. **GitHub release:** `gh release create vX.Y.Z` with the CHANGELOG section as
   notes; link the compatibility profile.
7. **No overclaims:** release notes follow the declared-fidelity principle —
   supported / partial / unsupported wording, never "full".

## Versioning intent

- Patch: fixes within the declared profile.
- Minor: profile expansions, new assertions, new capabilities; may include
  pre-1.0 API breaks, which the CHANGELOG names explicitly (plain prose — no
  `!`/`BREAKING CHANGE:` markers pre-1.0).
- v1.0.0 waits until the Phase 1 exit gate in [`roadmap.md`](roadmap.md) holds.

## Version policy

Chatwright stays on `v0.x` until the Phase 1 exit gate holds. A `feat!:` or
`BREAKING CHANGE:` marker in a commit message never triggers an automatic
major-version bump. Today that is doubly true: version bumping is disabled
entirely for this repository (`disable-version-bumping: true` in
[`.github/workflows/ci.yml`](../.github/workflows/ci.yml)), so every tag
above is cut by hand, per the checklist. Should this repository — or a
future split-out repo (`sdk-go`, `runtime-go`, `cli`) — ever adopt the
shared workflow's continuous-delivery auto-tag path instead,
`.github/workflows/ci.yml` also sets `allow_major_version_bump: false`
explicitly (matching the `strongo/cicd` default): the shared workflow caps
any commit that would otherwise bump the major version to a minor bump
instead, with a warning in the run log, rather than failing the run or
cutting `v1.0.0` unattended. `v1.0.0` is cut only by a deliberate, explicit
action: the founder (or an authorised maintainer) pushes an annotated
`v1.0.0` tag by hand, exactly as any other release in the checklist above —
no automated path in `strongo/cicd` can produce it on its own.
