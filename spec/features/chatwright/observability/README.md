---
format: https://specscore.md/feature-specification
status: Draft
---

# Feature: Conversation observability

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/observability?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/observability?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/observability?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/observability?op=request-change) |
**Status:** Draft
**Source Ideas:** chatwright

## Summary

A shared transcript, technical trace, metric model and redaction policy that make
deterministic failures, manual sessions and AI evaluations explainable.

## Problem

A chat transcript alone omits webhook/API/scheduler events; a raw trace hides the
conversation. Without shared correlation and metric scopes, developers cannot
tell why a reply was late, which bot/user produced cost, or which evidence an AI
report relied on.

## Behavior

### Transcript and trace

The transcript is a human-readable semantic view of actor and bot actions. The
trace adds platform updates, HTTP requests/responses, outbound API calls,
message edits, milestones, scheduling events, registered application events and
permitted AI interactions. Stable IDs correlate both representations.

### First-class metrics

Initial metrics are latency, token usage, message size and message count. They
are available per message, actor/user, bot, chat, conversation/scenario and total
run. AI token metrics identify model/provider and may include estimated cost when
clearly labelled. Database-operation metrics are initially excluded.

### Comparison and failure focus

Run comparison aligns semantic events rather than relying only on line offsets.
Failure views focus the relevant window while preserving access to the complete
trace, pending jobs and current simulated time.

### Redaction

Sensitive values, credentials and AI prompts/responses use explicit capture and
redaction policy. Exported or hosted evidence records which fields were removed;
redaction must not silently change assertion input.

## Dependencies

- [conversation-runtime](../conversation-runtime/README.md)

## Acceptance Criteria

### AC: event-correlation

Scenario: A bot reply is inspected
Given an actor message that produced a webhook and outbound platform call
When a developer selects the reply
Then the transcript entry links to its inbound update, webhook span and outbound
API call by stable correlation IDs

### AC:metrics-aggregate-without-double-counting

Scenario: A run contains two bots and three chats
Given message-level size, count and latency metrics
When totals are requested by bot, actor, chat and run
Then each aggregation is reproducible from message metrics
And the run total does not count the same message twice

### AC:redaction-is-visible

Scenario: A trace contains a configured secret field
Given an evidence export with redaction enabled
When the trace is exported
Then the sensitive value is absent
And the export identifies that a field was redacted and by which policy

## Open Questions

- Which trace format should be native, and can OpenTelemetry represent the
  semantic transcript without making it unreadable?
- How are latency boundaries defined for scheduled or streaming replies?
- Where may raw AI prompts be retained, and for how long?

---
*This document follows the https://specscore.md/feature-specification*
