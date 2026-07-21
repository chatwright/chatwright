---
format: https://specscore.md/plan-specification
status: Draft
---

# Plan: Deterministic Telegram quick start

**Status:** Draft
**Source:** idea:chatwright
**Date:** 2026-07-21
**Owner:** alex
**Supersedes:** —

## Summary

Harden the existing greeting/language-edit proof into a documented, repeatable
Telegram support slice before broadening APIs or starting Starlark/AI work. This
plan changes runtime code only after the investigation named by each task has
confirmed the required seam.

## Approach

Work from externally observable evidence inward: freeze passing/failing golden
results; make supported fake API methods validating; stabilise state and metrics;
add an honest registered-work drain; then package local/CI entry points. Retain
the experimental WhatsApp text adapter as an architecture probe but keep it off
the release gate.

## Tasks

### Task 1: Baseline and golden evidence bundle

**Verifies:** chatwright/deterministic-testing#ac:exercises-real-http-boundary, chatwright/deterministic-testing#ac:edits-are-assertable
**Depends-On:** —
**Status:** planning

Freeze the current `Hi` → greeting/actions → Español → same-message edit flow.
Capture a schema-versioned passing transcript/trace plus wrong-text, late-reply
and invalid-outbound-call failures. Document observed support separately from
planned capability.

### Task 2: Supported fake Bot API conformance

**Verifies:** chatwright/platform-emulators/telegram/server-api#ac:real-bot-calls-fake-bot-api, chatwright/platform-emulators#ac:compatibility-is-honest
**Depends-On:** 1
**Status:** planning

Complete I-04/I-05 for the supported text/action/edit slice. Validate required
fields and encodings, return realistic success/errors, and stop blanket-success
acknowledgement from masking mistakes for methods declared supported.

### Task 3: Stable identity, metrics and diagnostic failures

**Verifies:** chatwright/conversation-runtime#ac:stable-message-identity, chatwright/deterministic-testing#ac:timeout-failure-is-diagnostic, chatwright/observability#ac:metrics-aggregate-without-double-counting
**Depends-On:** 1, 2
**Status:** planning

Correlate actor action → update → webhook → outbound call → stateful message.
Capture size/count/latency once and aggregate by actor, bot, chat, scenario and
run. Include focused transcript/trace, simulated time and pending registered work
in failures.

### Task 4: Deterministic registered-work draining

**Verifies:** chatwright/conversation-runtime#ac:distinguish-three-times
**Depends-On:** 3
**Status:** planning

Complete I-12/I-13/I-14. Introduce virtual-clock and drain contracts only for
observable registered work, explicitly report untracked async limitations, and
prove no real sleeps are needed in delayed/retry fixtures.

### Task 5: Multi-user and multi-bot reference scenario

**Verifies:** chatwright/conversation-runtime#ac:isolates-complete-run-state, chatwright/deterministic-testing#ac:safe-for-ci, chatwright/platform-emulators/telegram/client#ac:one-instance-represents-many-users
**Depends-On:** 2, 3, 4
**Status:** planning

Add a two-user/two-bot shared-application-state fixture with distinct platform
identities and a cross-bot notification. Run it concurrently with an identical
environment to prove isolation.

### Task 6: Local/CI product entry point

**Verifies:** chatwright/developer-tooling#ac:local-run-needs-no-account, chatwright/developer-tooling#ac:framework-integration-is-not-hard-boundary
**Depends-On:** 1, 5
**Status:** planning

Resolve I-29/I-30, including the current `chatwrite/` repository path. Publish the
smallest documented command/config and result bundle for both an in-process
`bots-go-framework` bot and a framework-independent local HTTP fixture.

## Release Gate

- Golden scenarios repeat without order changes or platform/network credentials.
- Supported fake API calls reject invalid required input with useful evidence.
- Every result declares platform/version, HTTP/direct mode and fidelity level.
- A new contributor can run and understand deliberate failures from repository
  instructions alone.
- Full WhatsApp fidelity, Starlark, AI actors and hosted services remain outside
  the release criteria.

## Open Questions

- What duration and repeated-run count should define the first acceptable flake
  budget?
- Does repository-path correction belong in this plan or a separate packaging
  change after I-30?

---
*This document follows the https://specscore.md/plan-specification*
