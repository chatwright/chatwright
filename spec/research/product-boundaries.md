# Research: Product, repository and hosted boundaries

**Date:** 2026-07-21
**Owner:** alex
**Status:** Proposed
**Consumed by:** [`developer-tooling`](../features/chatwright/developer-tooling/README.md), [`agent-implementation-loop`](../features/chatwright/agent-implementation-loop/README.md)

## Purpose

Turn the independent open-source positioning into workable CLI, repository,
licensing and hosted integration boundaries.

## Investigation backlog

| ID | Question | Required evidence and output |
|---|---|---|
| I-29 | What CLI shape supports Go tests, external processes, local emulation, machine-readable CI and platform selection? | Command/config prototype, exit-code contract and three workflow transcripts. |
| I-30 | Which packages/repositories should contain runtime, adapters, examples, scenario libraries, web UI and hosted services? | Dependency/release map with criteria for splitting rather than speculative repositories. |
| I-31 | Does Apache-2.0 remain the right runtime licence, and what notice/third-party obligations arise from adapter reuse? | Licence review and automated dependency notice process; no pricing decision required. |
| I-32 | Which functions must work entirely locally, and which hosted capabilities may be proprietary or paid? | Boundary table tested against the independent-use promise and realistic operating costs. |
| I-33 | How may a hosted product use Sneat accounts without coupling the runtime or open formats? | Auth boundary/tenant model and a no-account local/CI acceptance fixture. |
| I-34 | What integration with `sneat.work` adds user value without making it Chatwright's canonical application shell? | Product flow and data/URL ownership proposal with standalone-hosted fallback. |

## Existing structure concern

The runtime currently sits under a `chatwrite/` subdirectory, including its own
`.github` directory, after a recent repository move. This task deliberately does
not rename or relocate runtime code. I-30 must determine whether that path is an
intentional future module boundary, a temporary staging location or a typo before
packaging and CI assume it.

## Open Questions

The backlog above is intentionally unresolved.
