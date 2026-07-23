# Research: Executable knowledge platform

**Date:** 2026-07-23
**Owner:** alex
**Status:** Proposed
**Consumed by:** [`playground`](../features/chatwright/playground/README.md), [`platform-emulators`](../features/chatwright/platform-emulators/README.md), [`marketplace`](../features/chatwright/marketplace/README.md), [`observability`](../features/chatwright/observability/README.md)

## Purpose

Decisions 0011–0014 fix the domain model, the black-box bot protocol, the
federation model and the community-metrics posture. This backlog records
what was deliberately **not** specified there, so each topic gets a
dedicated design session with clean entry points instead of premature
detail. Extension points named here are contractual: implementations
scaffolded meanwhile must not foreclose them.

## Investigation backlog

| ID | Question | Required evidence and output |
|---|---|---|
| I-66 | Browser runtime internals: how does runtime-ts structure orchestration (scenario execution, bot registry, routing, correlation, state) inside the Playground/player component, and how does the player's settled-fold rendering accept a live, append-only journal instead of a finished bundle? | Component/state architecture spec; an `appendStep`-style engine contract the existing player components can consume; an embedding contract for demos on any page. |
| I-67 | Platform emulation fidelity in TypeScript: which Bot API slice does the browser Telegram emulator cover first, how is fidelity declared with capability keys, and how is parity with the Go emulator proven? | Fidelity table per capability key; shared conformance fixtures (same scenario, both runtimes, byte-compatible bundles); honesty rules per decision 0008. |
| I-68 | Bot protocol envelope, full specification: error semantics, timeouts, port lifecycle, multi-chat routing, version negotiation, iframe `sandbox`/CSP attributes (none exist on chatwright.dev today), and the optional in-iframe platform-API shim. | Protocol spec + JSON Schema under `formats/`; a reference iframe bot; adversarial test cases (slow bot, dead bot, wrong-origin, replayed handshake). |
| I-69 | Recording and replay in the browser: where the TS runtime journals (capture points), how bundles are assembled incrementally, and how download-without-account and save-to-Cloud-with-auth are wired. | Capture-point map mirroring the Go runtime's; golden fixtures shared with runtime-go; a save/auth boundary note consistent with decision 0007. |
| I-70 | Testing surface in the browser: how a visitor turns a live session into assertions/regression tests (record → golden conversation → replay), and what of the Go `cw` scenario API translates. | Testing UX spec; golden-conversation format proposal; gap list against runtime-go's assertion vocabulary. |
| I-71 | Portable scenario format: the declarative representation Recipes, demos and the browser runtime share (relationship to Starlark plans, specscore-rehearse-verification and Go fragments). | Format proposal with three real scenarios expressed in it and executed by at least one runtime. |
| I-72 | Search: index build over the knowledge graph (facets = jobs, capability keys, platforms, frameworks, languages, repositories, authors, bots, tags), where it runs and how it stays static-friendly. | Index schema + build pipeline from `chatwright/recipes`; query UX note; zero-backend baseline vs hosted option. |
| I-73 | Community metrics implementation: events API, storage, distinct-user counting, abuse handling and the GitHub star sync, per decision 0014. | Service boundary spec (open formats, closed service per 0007); rate-limit and audit design; cost model. |
| I-74 | Federation API: authenticated self-registration of repositories, its trust model versus PR-time validation, and index synchronisation. | API sketch; threat model (squatting, manifest spoofing, id collisions); migration path from PR-only registry. |
| I-75 | Capability compatibility data pipeline: authoring format under `data/capabilities/`, validation, and page generation (browser-compat-data lessons), including how emulator fidelity declarations and platform docs consume the same keys. | Data schema + two capability trees authored end to end (buttons, message editing) rendering into compatibility tables. |

## Open Questions

The backlog above is intentionally unresolved; each item is a dedicated
design session.
