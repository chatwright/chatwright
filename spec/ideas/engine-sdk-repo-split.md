---
format: https://specscore.md/idea-specification
status: Draft
---

# Idea: Engine/SDK code split — the standard repo, per-language SDK + emulator, thin CLI

**Status:** Draft
**Date:** 2026-07-23
**Owner:** alex
**Promotes To:** —
**Supersedes:** —
**Related Ideas:** extends:chatwright, extends:live-recording-sdk

## Problem Statement

All Go code (emulator/runtime, SDK surfaces, CLI) lives at the root of the
main repository alongside the specs and formats. Two forces outgrow that
layout: a bot developer embedding only the SDK (bundle writing, the future
recorder) should not carry an emulator's or CLI's dependency surface in
production; and a second engine implementation — TypeScript, hostable in the
browser — is on the horizon, which makes a Go-module-at-the-root main
repository the wrong shape for a multi-language standard.

## Context

The run-bundle format already behaves like a standard: a URL-identified wire
contract with a published JSON Schema, consumed by Go (writer) and TypeScript
(the Studio player's reader — the embryo of an npm package). Decision 0008's
declared endpoint profiles accommodate a browser-hosted emulator as a new
profile (browsers cannot receive webhooks; evidence must say what the
boundary was). Go module-graph pruning isolates consumers from unimported
packages within one module; vanity import paths decouple module identity
from repository layout entirely. The `chatwright/cli` repository slot is
retired but reserved. Founder decisions (2026-07-23): the component set is
go SDK, go runtime/emulator, ts runtime/emulator, CLI; repo naming is
role-first (`sdk-go`, not `go-sdk`); and the SDK definitely lives in a
separate repository from the runtime from day one.

## Recommended Direction

**Logical layout (what consumers see) — four components per the founder's
proposal, with language-neutral import identities via vanity paths served by
the chatwright.dev worker (`go-import` meta; npm scope):**

- `chatwright.dev/sdk` (Go) / `@chatwright/sdk` (TS): the language
  embodiment of the standard — bundle read/write, anchors, the future
  recorder + sinks. Library-pure dependencies; what a production bot embeds.
- `chatwright.dev/runtime` (Go) / `@chatwright/runtime` (TS): the heavy
  engine — platform emulation (Telegram first) plus the testing runtime
  (observe/goal/actor/campaign/run). Depends on sdk, never the reverse.
  Recommended name: **runtime** — decision 0004's "one runtime" is exactly
  what this repo holds, and the glossary's Platform Emulator is a component
  inside it; `emulator` would name the whole after one part. (`emulator`
  remains the founder-listed alternative until confirmed.)
- `chatwright.dev/cli`: thin CLI importing sdk + emulator;
  `go install chatwright.dev/cli@latest`.
- `chatwright/chatwright` becomes **the standard**: specs, docs, glossary,
  `formats/`, and — once a second engine exists — a conformance suite
  (golden scenarios + expected evidence + schema validation) every engine's
  CI runs. No engine code.

**Physical layout (repos) — per founder decision, three Go-side repos from
day one, cut post-Listus-proof in one window:**

- `chatwright/sdk-go` — module `chatwright.dev/sdk`
- `chatwright/runtime-go` (or `emulator-go` — see recommendation above) —
  module `chatwright.dev/runtime`
- `chatwright/cli` — module `chatwright.dev/cli`
- `chatwright/runtime-ts` (and `@chatwright/sdk` extraction from the
  player's bundle reader) follow as the TS track starts.

Vanity paths still earn their keep: any later re-arrangement (or a rename
settling emulator↔runtime) never churns imports.

Old `github.com/chatwright/chatwright` tags remain resolvable forever;
pinned consumers (sneat-bots, sneat-go) migrate on their own next bump.

## Alternatives Considered

- **One combined Go module (core folded into SDK).** Simplest operationally
  and module-graph pruning isolates builds — but it leaves the SDK's
  dependency manifest polluted for production-bot supply-chain review, and
  the sdk/runtime boundary is the durable one (it mirrors the standard
  itself). Rejected by founder decision: the SDK lives in its own repo.
- **Colocating sdk + runtime modules in one repo as a staging step.**
  Avoids the cross-repo release train during fast format evolution, but the
  founder decided the SDK is definitely a separate repo from day one; the
  tax is accepted and mitigated by cutting only after format v1's current
  polish settles.
- **GitHub-path module names.** Workable fallback; vanity paths cost one
  worker route and permanently decouple imports from repo layout.

## MVP Scope

- Decision recorded (promote this idea) + vanity-import route live on
  chatwright.dev serving `sdk`/`runtime`/`cli` module paths.
- The cut, post-Listus-proof, in one window: sdk-go, runtime-go and cli
  repos (packages moved with history); main repo prunes to the standard;
  fleet CI + release process (strongo/cicd, Homebrew cask) rewired.
- Proof (principle 6): a bot developer project importing only
  `chatwright.dev/sdk` builds with no emulator or CLI dependencies in its
  go.sum; `go install chatwright.dev/cli@latest` works from a clean machine;
  all existing e2e gates green in the new layout.

## Not Doing (and Why)

- The TypeScript emulator itself — this idea shapes the ground for it;
  `@chatwright/sdk` extraction is its first, independent step.
- A conformance suite before a second engine exists — one engine's own e2e
  gates are the conformance suite until then.
- Splitting observe/goal/actor/campaign/run away from the emulator module —
  they are the testing runtime and travel with it until proven otherwise.

## Key Assumptions to Validate

| Tier | Assumption | How to validate |
|---|---|---|
| Must-be-true | Vanity `go-import` serving from the CF worker works for `go install`/`go get` including the ?go-get=1 flow and multi-module repos | Prototype route + `go install chatwright.dev/cli@latest` from a clean machine |
| Should-be-true | Two colocated Go modules with a replace-free tag flow release cleanly under strongo/cicd | Trial tag cycle (sdk/vX.Y.Z + emulator/vX.Y.Z) in the new repo |
| Might-be-true | No consumer besides sneat-bots/sneat-go pins the old module path | Search public imports before the cut |

## SpecScore Integration

- **Existing Features affected:** repository/distribution docs across
  README and docs/ (install paths), release process, CI fleet;
  [`developer-tooling`](../features/chatwright/developer-tooling/README.md).

## Open Questions

- Final name pick, `runtime-go` vs `emulator-go` (founder narrowed to these
  two; `runtime` recommended above) — the last open naming call.
- Does the CLI keep its own version or track the runtime's releases?
- Where does the conformance suite's expected-evidence format live once two
  engines exist — formats/ or a dedicated conformance/ tree?

---
*This document follows the https://specscore.md/idea-specification*
