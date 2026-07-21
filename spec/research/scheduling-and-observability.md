# Research: Scheduling, expectations and observability

**Date:** 2026-07-21
**Owner:** alex
**Status:** Proposed
**Consumed by:** [`conversation-runtime`](../features/chatwright/conversation-runtime/README.md), [`deterministic-testing`](../features/chatwright/deterministic-testing/README.md), [`observability`](../features/chatwright/observability/README.md)

## Purpose

Make asynchronous conversation tests deterministic and their results measurable
without conflating simulated time, test deadlines and observed latency.

## Investigation backlog

| ID | Question | Required evidence and output |
|---|---|---|
| I-13 | What virtual-clock interface supports timers, delayed messages, retries and scheduled jobs without global time mutation? | Clock/scheduler spike and integration rules for application code under test. |
| I-14 | When can the environment truthfully declare asynchronous work idle? | Drain algorithm, registered-work contract and adversarial fixtures for newly enqueued work. |
| I-15 | How are latency, size and count captured once then aggregated per message, actor/user, bot, chat, scenario and run? | Metric event schema and aggregation tests that prove no double counting. |
| I-16 | How are AI input/output tokens, model, provider and optional estimated cost propagated? | Provider-neutral token record with unknown/estimated states and example aggregation. |
| I-17 | What storage/correlation model keeps readable transcript and technical trace aligned? | Result-bundle prototype with stable IDs, schema version, redaction marker and round-trip test. |
| I-18 | Which fluent assertion shapes are readable, cancellable and free from duplicated timing state? | API ergonomics study using at least five representative scenarios and failure outputs. |
| I-19 | How do initial milestones trigger after N messages, regex/keyword or message type, and how are order/cardinality/data asserted? | Deterministic milestone spike and rules for one-shot versus repeatable triggers. |

## Required distinctions

Every proposed API and report must distinguish:

- **simulated time**, advanced by the test environment;
- **wall-clock safety timeout**, preventing hung tests;
- **observed latency**, measured across a defined causal boundary.

`Within(duration)` should constrain the same observed latency recorded in metrics,
not a parallel stopwatch held only by the assertion.

## Open Questions

The backlog above is intentionally unresolved.
