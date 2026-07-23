# Chatwright Cloud strategy

- **Updated:** 2026-07-22
- **Boundary:** optional closed services around an Apache-2.0 local platform

## Role of Cloud

Cloud should remove operational work, retain team knowledge and deliver managed
intelligence. It should never be the only place where a developer can run,
record, inspect or deterministically test a local bot.

## Two product areas

### Cloud Run — infrastructure

Cloud Run owns hosted execution, CI integration, queues, schedules,
notifications, history, transcript storage, reports, metrics history, shared
workspaces and organisation management. Its promise is reliable managed capacity
and evidence retention, not AI judgement.

### Cloud Intelligence — orchestration and evaluation

Cloud Intelligence is a flagship long-term product area. It manages AI actors
and persona libraries; AI evaluation and UX review; conversation-quality and
prompt analysis; model benchmarks; autonomous exploration; regression proposals;
implementation prompts and review; optimisation; and generated personas and
scenarios.

Its value is not reselling access to model APIs. It coordinates actors, models,
evaluators, evidence and repeated experiments, then converts noisy exploration
into traceable decisions and portable improvements.

## AI swarm direction

A swarm campaign can run hundreds or thousands of conversations across personas,
models, temperatures, random seeds, goals and constraints. It should report
failure clusters, UX observations, candidate regression scenarios and
implementation suggestions while preserving outliers and source evidence.

Swarm scale is a natural paid service because it combines orchestration,
concurrency, model cost, consolidation and retained evidence. Exported failures
and approved regression scenarios still run with the open local stack.

## Illustrative free direction

Possible free-account value includes one personal workspace, cloud/transcript
sync, web Studio, community personas, public projects, limited AI runs and
limited execution minutes. Local execution remains unlimited and account-free.
These are hypotheses, not promised limits.

## Illustrative paid direction

Potential paid capabilities include larger AI and execution allowances, swarm
testing, advanced reports, organisation workspaces, team collaboration,
historical analytics, private persona libraries, audit logs, enterprise SSO,
custom model connections and hosted execution at scale. Pricing and packaging
remain undecided.

## Reporting direction

Cloud reports may cover regression, conversation-quality, latency and AI-cost
trends; model comparisons; scenario coverage; flaky scenarios; platform
compatibility; and UX quality. Aggregates always link back to versioned runs and
evidence, label judgement and distinguish configured comparisons from facts.

## Trust requirements

- Upload, sync and retention are explicit; local data is not silently copied.
- Scenario and result formats do not depend on a Cloud tenant identifier.
- AI findings record model/evaluator context, uncertainty and evidence.
- Users approve generated requirements and regression tests.
- Standalone Chatwright accounts and URLs remain first-class if Sneat integration
  is offered.

## Sequencing

1. Validate repeat local and CI use.
2. Test the smallest pull feature, likely sync or a hosted report.
3. Add bounded managed execution and retained history.
4. Validate one evidence-linked Intelligence job.
5. Expand organisations, reporting and swarm scale from observed demand.

## Measures

Track repeat local users who voluntarily connect Cloud, time saved per hosted
run, report revisit/share rate, approved-regression yield from AI exploration,
cost per useful finding and export/replay success. Sign-up count alone does not
prove Cloud value.

## Recordings and spaces (founder direction, 2026-07-23)

Saved recordings follow the Sneat ecosystem's space model: an authenticated
user saves run bundles into their **personal space** first; later they can
create a **team space** (the Sneat.work/Sneat.team pillar) and share
recordings with team members. Boundaries that hold regardless:

- Downloading a recording never requires an account (decision 0012); saving
  is the Cloud layer (decision 0007).
- The run-bundle format stays Sneat-free — spaces are a storage/sharing
  concern of the operated service, never of the open formats or runtimes.
- Chatwright must remain usable standalone (research item I-34); Sneat
  accounts are the Cloud's first identity and storage provider, not a
  coupling of the open stack. How Sneat identity relates to the community's
  GitHub identity (decision 0014) is an open question for the I-33 session.
