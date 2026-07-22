---
format: https://specscore.md/feature-specification
status: Draft
---

# Feature: AI swarm testing

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/cloud/intelligence/ai-swarm-testing?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/cloud/intelligence/ai-swarm-testing?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/cloud/intelligence/ai-swarm-testing?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/cloud/intelligence/ai-swarm-testing?op=request-change) |
**Status:** Draft
**Source Ideas:** chatwright

## Summary

Run hundreds or thousands of controlled AI conversations across diverse
personas, models and conditions, then consolidate the evidence into actionable
failures, UX observations and candidate regressions.

## Behavior

### Exploration matrix

A swarm varies declared dimensions such as persona, model, temperature, random
seed, goal and constraints. Sampling and budgets are explicit so a run is a
versioned experiment rather than an unbounded collection of chats.

### Consolidation

Cloud Intelligence groups similar failures, preserves representative and
outlier transcripts, reports incidence and uncertainty, and avoids counting
duplicate symptoms as independent defects. Outputs may include failure reports,
UX observations, proposed regression scenarios and implementation suggestions.

### Reproduction

A swarm run stores generated messages and action sequences in addition to model
metadata. A selected failure can be replayed from its recorded conversation and,
where possible, reduced to a deterministic local scenario.

## Acceptance Criteria

### AC: swarm-dimensions-are-auditable

Scenario: A team compares two swarm campaigns
Given campaigns with different models, personas and sampling settings
When a developer opens their reports
Then each result identifies its full exploration cell and evidence
And aggregates do not hide model or persona-specific failures

### AC: failure-can-leave-the-cloud

Scenario: A swarm discovers a critical recovery failure
Given a recorded failing conversation
When the developer exports it
Then the repository receives a reviewable portable scenario proposal
And approved deterministic assertions can run without Cloud Intelligence

## Open Questions

- Which sampling and stopping rules provide useful coverage claims?
- How should clusters preserve low-frequency severe failures?

---
*This document follows the https://specscore.md/feature-specification*
