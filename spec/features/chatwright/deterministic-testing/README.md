---
format: https://specscore.md/feature-specification
status: Implementing
---

# Feature: Deterministic testing

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/deterministic-testing?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/deterministic-testing?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/deterministic-testing?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/deterministic-testing?op=request-change) |
**Status:** Implementing
**Source Ideas:** chatwright

## Summary

Fast, repeatable scripted scenarios that exercise real webhook and outbound API
behaviour and fail with readable, source-linked evidence.

## Problem

Exact transcript snapshots are brittle, but handler-unit tests omit platform and
HTTP boundaries. Critical conversational invariants need semantic, chainable
assertions that wait deterministically and explain the observed conversation on
failure.

## Behavior

### Scripted scenarios

A scripted actor sends semantic actions and observes messages through a chat.
Scenarios may cover several users, bots, chats and platforms while sharing
environment fixtures. Platform-neutral intent is the default; explicit
platform-specific assertions cover mechanics that matter to the product.

### Fluent expectations

Expectations cover bot/user messages, edits, deletions, absence, message types,
actions, transcript state and milestones. `Within(duration)` is a convenience
constraint over expectation timing and message metrics; it must not maintain a
second latency value.

### Deterministic milestones

Initial milestones trigger after N messages, a keyword or regular expression,
or a message type. Assertions may require order, cardinality, duration and data.
AI-inferred milestones are excluded from this feature's first release.

### Failure evidence

A failure identifies source location, scenario, actor, bot, platform, expected
and actual values, timing, relevant metrics, transcript, simulated time, pending
jobs and related platform calls. CI output must remain useful without the web UI.

## Dependencies

- [conversation-runtime](../conversation-runtime/README.md)
- [observability](../observability/README.md)
- [platform-emulators](../platform-emulators/README.md)

## Acceptance Criteria

### AC: exercises-real-http-boundary

Scenario: A user greets a bot
Given the bot webhook is served on a local HTTP listener
When a scripted actor sends `Hi`
Then Chatwright posts a platform-shaped update to that listener
And captures the bot reply through the fake platform API

### AC: edits-are-assertable

Scenario: A language action edits a greeting
Given a bot greeting with an Español action
When the actor chooses the action
Then the original message can be expected to change to the Spanish greeting
And no new-message assertion is required

### AC: timeout-failure-is-diagnostic

Scenario: A reply misses its deadline
Given a one-second expectation
When the reply arrives after 1.73 seconds with unexpected text
Then the failure shows both expected and actual text, observed latency and the
relevant transcript/trace entries

### AC: safe-for-ci

Scenario: A deterministic suite is repeated
Given fixed scenario input and controlled dependencies
When it runs repeatedly without product changes
Then outcomes and transcript ordering remain stable and no real platform account
or public network endpoint is required

## Open Questions

- Should `ExpectNoMessage` use simulated duration, wall-clock duration or both?
- How should alternatives and non-deterministic but allowed message ordering be
  expressed without weakening the default assertion model?

---
*This document follows the https://specscore.md/feature-specification*
