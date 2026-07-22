---
format: https://specscore.md/feature-specification
status: Draft
---

# Feature: Cloud Intelligence

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/cloud/intelligence?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/cloud/intelligence?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/cloud/intelligence?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/cloud/intelligence?op=request-change) |
**Status:** Draft
**Source Ideas:** chatwright

## Summary

A flagship managed-intelligence layer that orchestrates AI actors, evaluators,
models and evidence to discover conversational risks and improve bots. Its value
is orchestration, evaluation and accumulated intelligence—not API proxying.

## Contents

| Child | Purpose |
|---|---|
| [ai-swarm-testing](ai-swarm-testing/README.md) | Large-scale exploration across personas, models, goals and controlled variation |

## Behavior

### Managed actors and reusable intelligence

Cloud Intelligence can operate AI actors and a persona library, generate
candidate personas and scenarios, and manage evaluator configurations. Private,
community and curated assets retain provenance, version and evaluation context.

### Evaluation and review

Capabilities may include AI evaluation, AI UX review, conversation-quality and
prompt analysis, edge-case discovery, autonomous exploratory testing and
conversation optimisation. Findings distinguish observed facts from model
judgement and link to transcript, trace or application-state evidence.

### Models and benchmarks

Teams can benchmark multiple LLMs, prompts and evaluator combinations against
the same versioned scenarios. Comparison records model/provider configuration,
cost, latency, success, quality scores and variance rather than presenting one
model's opinion as ground truth.

### From discovery to improvement

Exploration may propose deterministic regression tests, implementation prompts
and implementation reviews. Developers approve requirements and repository
changes; generated claims do not silently become passing specifications.

## Dependencies

- [ai-driven-testing](../../ai-driven-testing/README.md)
- [fuzz-testing](../../fuzz-testing/README.md)
- [agent-implementation-loop](../../agent-implementation-loop/README.md)
- [Cloud Run](../run/README.md)
- [Marketplace](../../marketplace/README.md)

## Acceptance Criteria

### AC: intelligence-is-more-than-model-access

Scenario: A managed AI run reports a conversational failure
Given versioned actors, evaluators, scenarios and model configurations
When Cloud Intelligence identifies a failure
Then the report includes orchestration context and evidence links
And the finding remains distinguishable from raw model output

### AC: discovered-regressions-require-approval

Scenario: Exploration discovers a repeatable failure mode
Given a minimized conversation and proposed deterministic assertions
When a developer reviews and approves the proposal
Then Chatwright can add a portable scenario to the repository library
And rejection leaves the executable specification unchanged

## Open Questions

- Which evaluations have enough agreement and evidence quality to gate CI?
- Which intelligence improves with cross-project aggregation while preserving
  tenant privacy and consent?

---
*This document follows the https://specscore.md/feature-specification*
