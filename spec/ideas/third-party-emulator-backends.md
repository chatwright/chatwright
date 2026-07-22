---
format: https://specscore.md/idea-specification
status: Draft
---

# Idea: Third-party emulator backends

**Status:** Draft
**Date:** 2026-07-22
**Owner:** alex
**Promotes To:** —
**Supersedes:** —
**Related Ideas:** extends:chatwright

## Problem Statement

How might Chatwright run its scenarios, assertions, evidence and branching on
top of messaging-platform emulators it does not own — external stateful API
emulators and vendor-provided local servers — without losing the determinism,
fidelity labelling and observability guarantees its own Platform Emulators
provide?

## Context

Chatwright's value stack has three layers: platform emulation, the
conversation-native runner (scenarios, actors, assertions, branching), and
evidence (transcript, trace, metrics). The emulation layer is the one other
projects are starting to build independently:

- **General-purpose stateful API emulators.** `vercel-labs/emulate`
  (Apache-2.0) ships stateful local emulators for CI and no-network sandboxes
  (Slack and Twilio today; a Telegram Bot API emulator exists as an unmerged
  pull request, and `serejke/grammy-emulate` already wraps that work for the
  grammY framework).
- **Vendor oracles.** Telegram publishes its Bot API server as open source; it
  is a real-network proxy rather than an offline emulator, but it is
  oracle-grade for behaviour: the authoritative answer to "what would the real
  platform return?".

Chatwright already has the seams this idea needs: the neutral
`platform.Platform`/`Emulator` contracts, declared-fidelity doctrine (decision
0006), declared endpoint profiles (decision 0008), and the conformance-fixture
research (I-37/I-38). What is missing is a stated position: are external
emulators substitutes to outrun, or backends to run on top of?

## Recommended Direction

Treat platform emulation as a **pluggable backend layer** beneath the runner
and evidence layers, in three declared classes:

1. **Built-in backend (default).** Chatwright's own in-process Platform
   Emulator: the richest profile — deterministic scheduling, virtual clock,
   append-only journal, fault injection, per-method validation. This remains
   the reference implementation and the default.
2. **External emulator backend.** An external stateful emulator process (for
   example a merged `@emulators/telegram`) drives the same platform profile:
   Chatwright submits client actions through the backend's control surface,
   the bot under test talks to the backend's platform API, and Chatwright
   captures evidence at the same seams. The backend declares a capability
   profile; anything it cannot express (virtual clock, fault injection,
   journal queries) is reported as unsupported, never silently approximated.
3. **Oracle backend (conformance only).** Vendor-provided servers (the
   official Telegram Bot API server) run the same conformance fixtures so
   Chatwright can diff built-in and external backends against authoritative
   behaviour and publish a parity matrix. Oracle backends are for conformance
   runs, not CI suites.

Every result names its backend and capability profile, extending "fidelity is
declared" to "the emulator itself is declared". The conformance suite that
validates community-contributed emulators and the one that validates external
backends are the same suite.

The strategic effect: Chatwright's differentiation concentrates where it is
already strongest — the conversation-native runner, assertions, branching and
evidence — while external emulation effort becomes an asset for Chatwright
users rather than a competing stack, and parity claims become checkable
receipts rather than marketing.

## Alternatives Considered

- **Ignore external emulators.** Rejected: a maintained external Telegram
  emulator plus any thin runner replicates Chatwright's emulation layer under
  a bigger brand; refusing interop concedes the choice to users anyway.
- **Compete on emulation fidelity alone.** Rejected as a sole posture:
  fidelity is capital-intensive to maintain per platform, and a platform
  vendor can compress that moat overnight by blessing an official offline
  mode. Fidelity remains a priority for the built-in backend, but it is not
  the only defensible layer.
- **Adopt an external emulator as the only emulator.** Rejected: built-in
  determinism seams (virtual clock, journal, fault injection, validation
  modes) are core to the product promise and cannot be delegated to a
  dependency Chatwright does not control.
- **Fork external emulators into the codebase.** Rejected: inherits their
  maintenance surface without the community benefit; the backend contract
  achieves the same user value with cleaner ownership.

## MVP Scope

- Extract a **backend contract** from the current `platform.Emulator` seam:
  lifecycle, client-action submission, bot-facing API endpoint, state/evidence
  queries, capability declaration.
- **Capability profiles** in results: backend identity, supported operations,
  and unsupported-capability reporting wired into the existing
  supported/unsupported result semantics.
- **One external backend spike** against the Telegram greetbot fixture set
  (candidate: the `@emulators/telegram` work, once merged upstream), producing
  a written gap list rather than a shipped integration if fidelity is
  insufficient.
- **One oracle conformance run**: the same fixtures against the official
  Telegram Bot API server, diffed against the built-in backend, published as
  a parity table.

## Not Doing (and Why)

- **Shipping external-backend support before the candidate emulator merges
  upstream** — an unmerged pull request is not a dependency.
- **Slack/Discord backends** — follows the platform roadmap, not this idea.
- **Weakening built-in determinism to the lowest common backend** — external
  backends declare reduced profiles; the built-in profile is never capped to
  match them.
- **A plugin marketplace for backends** — discovery/packaging concerns belong
  to the marketplace idea, later.

## Key Assumptions to Validate

| Tier | Assumption | How to validate |
|---|---|---|
| Must-be-true | An external emulator can express webhook delivery, chat state and outbound-call capture well enough to back the supported Telegram slice | Run the greetbot fixture set against the external backend in the spike and enumerate gaps |
| Must-be-true | Capability declaration prevents silent fidelity loss when a backend lacks a feature | Force unsupported operations in the spike and verify results report unsupported rather than pass |
| Should-be-true | Conformance fixtures are portable across built-in, external and oracle backends without per-backend forks | One fixture corpus, three runners, one parity table |
| Might-be-true | Oracle diffing materially improves built-in fidelity | Count behaviour corrections traced to oracle diffs in the first conformance cycle |

## SpecScore Integration

- **Existing Features affected:**
  [`platform-emulators`](../features/chatwright/platform-emulators/README.md)
  (backend contract and capability declaration),
  [`observability`](../features/chatwright/observability/README.md) (backend
  identity in evidence),
  [`deterministic-testing`](../features/chatwright/deterministic-testing/README.md)
  (unsupported-capability result semantics).
- **Dependencies:** decision 0006 (platform emulated, bot real), decision 0008
  (declared profiles and non-interchangeable evidence), research I-37/I-38
  (conformance fixture matrices).

## Open Questions

- How do external backends participate in deterministic draining and virtual
  time, or is wall-clock-only a declared limitation of every external profile?
- What is the minimal control-plane surface for injecting client actions into
  an external emulator that was not designed for one?
- How are third-party backend licences and attribution surfaced in evidence
  bundles?
- Does the oracle conformance run need real-network credentials, and how is
  that isolated from ordinary local use?

---
*This document follows the https://specscore.md/idea-specification*
