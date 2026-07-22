---
format: https://specscore.md/idea-specification
status: Draft
---

# Idea: Local CLI to web Studio continuity

**Status:** Draft
**Date:** 2026-07-22
**Owner:** alex
**Promotes To:** —
**Supersedes:** —
**Related Ideas:** extends:chatwright

## Problem Statement

How might a developer move from a terminal run straight into a visual Studio
inspection of the same conversation without losing the local-first promise?
Developers lose context switching from raw terminal output to visual
inspection, but any bridge that solves this must keep local run data local
unless the user explicitly publishes, shares or syncs it.

## Context

Chatwright's CLI produces one append-only event log per run: transcript,
trace, milestones and metrics. Studio is a richer rendering of that same log —
message/event view, raw platform evidence and correlated execution trace — but
today a developer has no path from a live or recorded local run into that
rendering without exporting a bundle or uploading data to a hosted service.
`chatwright open` is the missing seam: a local bridge that lets `chatwright.dev`
read a run directly from the developer's machine over an authenticated
loopback connection, for a live run in progress or a previously recorded one.

## Recommended Direction

`chatwright open` starts an authenticated loopback bridge and launches
`chatwright.dev` with a short-lived connection capability:

~~~text
chatwright run
chatwright open
chatwright open run_01K...
~~~

Studio loads the run snapshot, subscribes to new events over that bridge and
renders the same message/event model the terminal client already produces.
CLI output and Studio are two views of one append-only event log, not two
divergent data models; raw platform envelopes remain available beside
normalized messages so a developer can move from the rendered chat straight
into the same diagnostic evidence a terminal user already has.

The bridge itself follows a narrow, capability-scoped design: bind only to
`127.0.0.1` and `::1`; authenticate with a one-time random capability exchanged
for a short session; restrict the browser origin to the production Chatwright
Studio origin and validate host headers to defend against DNS rebinding;
expose structured run data and opaque attachment handles rather than arbitrary
file reads; redact bot tokens, headers and configured secret fields before
emission; and version the handshake, event schema and supported capability
list so the browser can request only declared capabilities. HTTP serves
snapshots and WebSocket or SSE carries live append-only events. Read-only is
the initial mode, and Cloud sign-in is never required for a supported local
workflow.

## Product Principles

- Local data remains local until the user explicitly publishes, shares or
  syncs it.
- CLI output and Studio are views of one append-only event log.
- Raw platform envelopes remain available beside normalized messages.
- Message-producing trace events open directly in Rendered view.
- The browser can request only declared bridge capabilities; read-only is the
  initial mode.
- Cloud sign-in is not required for any supported local workflow.

## Alternatives Considered

- **Export or upload a run bundle to Chatwright Cloud before viewing it in
  Studio.** Rejected as the default path because it makes ordinary local
  inspection depend on a network round trip and an account, breaking the
  "local data remains local" promise for the common case.
- **Serve Studio directly from an open, unauthenticated local HTTP server.**
  Rejected because any process or script on the machine — or a malicious page
  in another browser tab — could then read conversation data; a one-time
  capability exchange and origin restriction are the minimum viable boundary.
- **Let the browser read arbitrary files from the run directory.** Rejected
  in favour of structured run data and opaque attachment handles: arbitrary
  file access is not capability-scoped, not versionable and cannot redact
  secrets before emission.
- **Require a Cloud account before any Studio view, local or hosted.**
  Rejected because it contradicts the account-free local-workflow guarantee
  and would gate basic inspection behind a signup that adds no value to a
  single-machine debugging session.

## MVP Scope

- The `chatwright open` loopback bridge: bind to loopback only, authenticate
  with a one-time capability exchanged for a short session, and restrict the
  browser origin to production Chatwright Studio.
- A read-only snapshot load for a completed or in-progress run, plus a live
  event subscription (WebSocket or SSE) for runs still executing.
- One versioned handshake, event schema and capability list so Studio never
  assumes a capability the bridge has not declared.
- Redaction of bot tokens, headers and configured secret fields before any
  event or snapshot leaves the bridge.
- Rendering the same message/event model the terminal client already
  produces, with raw platform envelopes reachable as separate diagnostic
  evidence rather than folded into the rendered view.

## Not Doing (and Why)

- Write access from Studio back into the local run — the bridge is read-only
  until the capability model above is proven in practice.
- Cloud sync or retained history of local runs — a later paid transition, not
  required for viewing a local run in Studio.
- Supporting arbitrary browser origins or third-party embedding — restricted
  to the production Studio origin until a broader capability/CORS model
  exists.
- Requiring Cloud sign-in for any part of the local workflow — the bridge
  must work for a developer with no Chatwright account.
- Exposing raw platform/emulator evidence to AI or automation actors through
  this bridge — that evidence stays a human-facing developer inspector
  surface, matching the Observation Model's actor/developer split.

## Relationship to Existing Ideas

[App State Branching](app-state-branching.md) may later let Studio open,
inspect and compare local scenario branches. Its MVP remains database-only
and does not depend on this Studio continuity flow.

[Observation Model](observation-model.md) gives terminal and Studio clients
one actor-visible projection and explicit change lineage. Raw platform
envelopes remain separately available for diagnostics rather than becoming
actor input. Synthetic message/action IDs join each rendered object to the
developer inspector, where raw messages, callback data, native IDs, API
traffic and authoritative emulator state can be shown without exposing them
to AI or other tools acting on chat events.

For MVP Priority #1 Goal-Driven AI Testing, Studio should connect campaign
findings to the rendered conversation, raw developer inspector and DTQL/binding
evidence without exposing raw platform or domain IDs to the acting AI.

## Key Assumptions to Validate

| Tier | Assumption | How to validate |
|---|---|---|
| Must-be-true | A short-lived, one-time capability exchanged over loopback is enough to authenticate Studio without exposing the bridge to other machines, processes or scripts | DNS-rebinding, origin-spoofing and replay fixtures run against the bridge handshake |
| Must-be-true | Structured run data plus opaque attachment handles are sufficient for Studio to render the same view as the terminal client | Render a recorded run in Studio and compare it against CLI output for parity |
| Should-be-true | Read-only mode covers the primary developer workflow — inspecting a live or recorded run — without needing write-back in the first release | Usability sessions on inspect-only flows before a write capability is considered |
| Might-be-true | Free, account-free local and shared-evidence viewing drives enough Cloud-adjacent conversion to justify remaining unmetered | Measure conversion from shared/local viewing sessions to paid Cloud sign-ups after launch |

## SpecScore Integration

- **New Features this would create:** TBD at spec time — likely a
  `developer-tooling` child covering the loopback bridge and its capability
  contract.
- **Existing Features affected:** `developer-tooling` (CLI and Studio),
  `observation-model` (shared rendered event/message model).
- **Dependencies:** [Observation Model](observation-model.md),
  [App State Branching](app-state-branching.md), MVP Priority #1 Goal-Driven
  AI Testing (private, pre-announcement — the first consumer that needs Studio
  connected to campaign evidence).

## Open Questions

- Which exact versioned handshake and event schema should the bridge expose
  first, and how is a breaking change negotiated with an already-open Studio
  tab?
- Should the read-only capability ever expand to a write-back mode, and under
  what governance?
- How long should a one-time capability remain valid before Studio must
  re-authenticate?
- Does the bridge need a visible local indicator (tray icon, terminal banner)
  so a developer always knows when a browser tab is connected?

---
*This document follows the https://specscore.md/idea-specification*
