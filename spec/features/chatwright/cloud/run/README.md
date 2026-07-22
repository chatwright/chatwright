---
format: https://specscore.md/feature-specification
status: Draft
---

# Feature: Cloud Run

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/cloud/run?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/cloud/run?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/cloud/run?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/cloud/run?op=request-change) |
**Status:** Draft
**Source Ideas:** chatwright

## Summary

Managed infrastructure for executing, retaining, sharing and reporting
Chatwright runs. Cloud Run is operational infrastructure; AI interpretation
belongs to Cloud Intelligence.

## Behavior

### Execution and CI

Cloud Run accepts a versioned scenario/repository revision, schedules it on a
compatible execution environment and retains status and evidence. It can provide
hosted execution, execution queues, scheduled runs, CI integration,
notifications and scalable concurrency without changing local scenario meaning.

### History and reports

A workspace can retain run history, test reports and transcript evidence. Report
directions include regression, latency and AI-cost trends; model comparisons;
scenario coverage; flaky-scenario detection; platform compatibility; and UX
quality. Each report links aggregates back to runs and relevant evidence.

### Collaboration and governance

Personal and shared workspaces organise projects, members and retained evidence.
Organisation management may add policies, private projects, audit logs and SSO
without leaking tenancy concepts into the local runtime.

## Dependencies

- [observability](../../observability/README.md)
- [developer-tooling](../../developer-tooling/README.md)
- [scenario-authoring](../../scenario-authoring/README.md)

## Acceptance Criteria

### AC: cloud-run-preserves-revision-and-mode

Scenario: CI submits a hosted run
Given a repository revision, scenario revision and declared platform profile
When Cloud Run executes the job
Then history records those revisions, execution mode and environment
And every report observation links to the underlying run evidence

### AC: queues-do-not-change-semantics

Scenario: The same deterministic scenario runs locally and in Cloud Run
Given equivalent declared environments
When queue delay and worker placement differ
Then queue metadata remains outside the semantic transcript
And deterministic outcomes remain comparable

## Open Questions

- What is the smallest hosted job repeat local users will pay to avoid operating?
- Which evidence is retained by default, and which sensitive payloads require
  explicit opt-in or redaction?

---
*This document follows the https://specscore.md/feature-specification*
