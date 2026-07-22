---
format: https://specscore.md/feature-specification
status: Draft
---

# Feature: Cloud

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/cloud?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/cloud?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/cloud?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/cloud?op=request-change) |
**Status:** Draft
**Source Ideas:** chatwright

## Summary

Optional managed services that extend the open local platform with hosted
infrastructure, collaboration and intelligence. Cloud enhances Chatwright; it
does not unlock or replace essential local development. See
[Decision 0007: Apache-2.0 local stack with optional commercial Cloud
services](../../../decisions/0007-open-local-stack-closed-cloud.md).

## Product principles

### No account for local use

Runtime, CLI, Platform Emulators, Playground and Studio work locally and
offline. Authentication never gates local bot development, scenario recording,
deterministic testing or transcript inspection.

### Earn the sign-in

A free account should be useful enough that developers choose it voluntarily.
Candidate benefits include a personal workspace, cloud and transcript sync,
hosted reports, web Studio, community personas, public projects, limited AI runs
and limited Cloud Run minutes. Exact limits remain deliberately undecided.

### Portable boundary

Cloud may be a closed commercial service, but scenarios, selected evidence,
approved regression tests and documented export formats remain usable by local
open-source tools. Deleting or losing a cloud account must not make a repository's
local test suite unusable.

## Planned scope (not yet specified in detail)

- **Cloud Run:** hosted execution, queues, scheduled runs and CI integration
  that preserve local scenario meaning; retained run history, transcript
  evidence and reports (regression, latency, cost, coverage trends).
- **Cloud Intelligence:** managed AI actors, evaluators and a persona library
  for evaluation, review and conversation-quality analysis, with findings kept
  distinguishable from raw model output.
- **Model and prompt benchmarking:** comparing LLMs, prompts and evaluator
  combinations against the same versioned scenarios on cost, latency, success
  and quality rather than one model's opinion.
- **AI swarm testing:** large-scale controlled exploration across personas,
  models and conditions, consolidated into failure reports and candidate
  regressions that can leave the cloud as portable scenarios.
- **Collaboration and governance:** shared workspaces, organisations, audit
  logs and enterprise SSO layered on top of the same portable artefacts.

## Acceptance Criteria

### AC: cloud-is-optional

Scenario: A cloud user disconnects a repository
Given scenarios previously synced to a Chatwright Cloud workspace
When the repository is used offline
Then supported local execution, recording and inspection still work
And no cloud-only identifier is required to interpret the local artefacts

### AC: free-account-value-is-explicit

Scenario: A local developer considers signing in
Given all essential local features already work
When Chatwright presents account benefits
Then it describes additive sync, hosted, collaboration or AI capabilities
And does not imply that an account is required for local use

## Open Questions

- Which two free Cloud capabilities most strongly convert repeat local users
  without creating an unsustainable operating cost?
- Which portable data and evidence must be exportable or redactable before a
  hosted beta (Cloud Run, Cloud Intelligence and swarm testing) can be trusted?
- What is the smallest hosted job repeat local users will pay to avoid
  operating themselves?
- Which evaluations and swarm sampling/stopping rules have enough agreement and
  coverage quality to gate CI or justify cross-project aggregation?

---
*This document follows the https://specscore.md/feature-specification*
