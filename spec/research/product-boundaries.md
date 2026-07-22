# Research: Product, repository and hosted boundaries

**Date:** 2026-07-21
**Owner:** alex
**Status:** Proposed
**Consumed by:** [`developer-tooling`](../features/chatwright/developer-tooling/README.md), [`agent-implementation-loop`](../features/chatwright/agent-implementation-loop/README.md), [`cloud`](../features/chatwright/cloud/README.md)

## Purpose

Turn the independent open-source positioning into workable CLI, repository,
licensing and hosted integration boundaries.

## Investigation backlog

| ID | Question | Required evidence and output |
|---|---|---|
| I-29 | What CLI shape supports Go tests, external processes, local emulation, machine-readable CI and platform selection? | Command/config prototype, exit-code contract and three workflow transcripts. |
| I-30 | Which packages/repositories should contain runtime, Platform Emulator internals, examples, scenario libraries, Playground UI and hosted services? | Dependency/release map with criteria for splitting rather than speculative repositories. |
| I-31 | Which notice and third-party obligations apply across the Apache-2.0 Runtime, CLI, Platform Emulators, Playground and Studio? | Licence review and automated dependency notice process across each distributable repository. |
| I-32 | Which portable seams keep the closed Cloud service optional while the full local workflow stays open? | Boundary table and offline acceptance suite covering run, develop, test, emulate, inspect and record. |
| I-33 | How may a hosted product use Sneat accounts without coupling the runtime or open formats? | Auth boundary/tenant model and a no-account local/CI acceptance fixture. |
| I-34 | What integration with `sneat.work` adds user value without making it Chatwright's canonical application shell? | Product flow and data/URL ownership proposal with standalone-hosted fallback. |

## Existing structure concern

Resolved 2026-07-22: the runtime moved from the `chatwrite/` subdirectory to the
repository root as module `github.com/chatwright/chatwright`, with `.github` CI
and `cmd/chatwright` at the root. The nested
`github.com/chatwright/chatwright/chatwrite` module path remains resolvable for
consumers pinned to historical pseudo-versions.

## Open Questions

The backlog above is intentionally unresolved.
