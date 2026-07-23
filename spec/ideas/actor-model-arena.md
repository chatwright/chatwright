---
format: https://specscore.md/idea-specification
status: Approved
---

# Idea: Actor model arena — benchmark and compare models on Chatwright tasks

**Status:** Approved
**Date:** 2026-07-23
**Owner:** alex
**Promotes To:** —
**Supersedes:** —
**Related Ideas:** extends:goal-driven-ai-bot-testing, extends:openai-compatible-provider

## Problem Statement

Choosing an actor model is guesswork: which local or hosted model is good
enough for a campaign, how much slower is it, what does it cost, and where
does it fail? The founder wants a comparison report — time to response,
token usage, quality — across the models he actually runs (Ollama, LM
Studio, hosted).

## Context

The evidence pipeline already records everything a benchmark needs: every
actor.LoopEvent carries per-proposal latency, token usage, model id,
validation verdict and action outcome; every campaign.Report carries task
outcomes and stop reasons; every run serialises to a replayable bundle. A
model comparison is therefore the same goal × same bot run across N
providers, one bundle per cell, plus a comparator that reads bundles and
emits a table — no new measurement machinery, and every number traceable to
a bundle a human can replay in the player to see *why* a model failed.

## Recommended Direction

- **Matrix runner**: run one goal/bot scenario across a declared set of
  provider configs (model, base URL, provider kind), N repeats each, with
  identical budgets; emit one bundle per run.
- **Warm-up is mandatory for every provider/model (founder rule
  2026-07-23)**: one untimed call before any timed repeat — local servers
  JIT-load models (observed: LM Studio loading a 27B exceeded a 60s call
  timeout), and hosted providers have cold paths too. The measured
  cold-start/load time is reported as its own metric, never mixed into
  proposal latency.
- **Comparator/report**: read the bundles, emit a markdown (later HTML)
  table per model: proposal latency p50/p95 + total wall time; tokens
  in/out; cost; structured-output mode used; a **retry breakdown**
  (founder-required metric): re-prompts by cause — invalid/stale action,
  malformed output, no-effect — plus schema-mode downgrades, transport
  retries, and non-progress stops (all already recorded per loop event;
  bounds: NonProgressLimit default 3, budgets maxSteps/maxRepeatedFailures);
  outcome (completed / gave up / stopped + reason); steps-to-goal;
  repeat consistency. Every cell links its bundle.
- **Quality stays objective** (evidence over claims): completion measured
  against deterministic/DTQL-verified success criteria only. AI-judge
  scoring is a later, explicitly-labelled addition.
- **Home**: post-split, an `arena` package in runtime-go, surfaced later as
  a CLI subcommand; the first incarnation is a scratchpad harness giving
  the founder his report the day the OpenAI-compatible provider lands.
- **Open source (founder decision 2026-07-23)**: the comparator is a local
  capability and ships open, like every local capability; operated
  comparison services (hosted matrices, historical tracking) belong to the
  Cloud layer.
- **Sharing, publishing and a leaderboard (founder direction 2026-07-23)**:
  comparisons serialise to a shareable arena-report JSON format (sibling of
  the run bundle; Studio renders it locally like the player renders
  bundles; markdown becomes a by-product). chatwright.dev gains a publish
  surface for comparisons and **one leaderboard per canonical scenario**
  (founder: "apples to apples and oranges to oranges") — the scenario is
  the leaderboard's unit, never a filter on a global board. Canonical
  arena scenarios are versioned in the standard repo (same goal, budgets,
  scenario version); entries carry a declared hardware/environment block;
  published entries must attach their bundles (shared evidence, not
  certified — anyone can replay; a Cloud-operated verified-rerun badge may
  come later). Above the per-scenario boards sits a **leaderboard of
  scenarios** (founder direction): scenarios ranked by adoption — published
  comparisons using them, distinct models compared — which drives
  discovery (join the largest comparable pool), gives scenario authors an
  incentive to promote their scenario, and tells us which conversational
  patterns people actually test. A third board ranks **contributors by
  adoption** (founder direction): the summed adoption of a contributor's
  scenarios — recognition that turns scenario authorship into standing in
  the community. Every scenario page carries a GitHub-style **clone button**
  (founder direction): a copyable one-liner fetching the pinned canonical
  `scenario-id@version` (future CLI, e.g. `chatwright arena run --scenario
  <id>@<version>`), plus a raw file link and open-in-Studio. The button IS
  the comparability mechanism — the easy path runs the pinned reference, so
  entries stay canonical by construction rather than by policing. Scenarios also carry **stars**
  (founder direction) — strictly a bookmark/interest signal, never the
  ranking: boards rank by earned, evidence-attached adoption; stars serve
  bookmarking and cold-start discovery (trending new scenarios with no
  published runs yet). Stars imply lightweight identity — GitHub OAuth is
  the natural fit and doubles as contributor identity for the contributor
  board, answering the moderation/identity open question. Every published
  comparison links back — the negative-CAC loop applied to benchmarks.

## Alternatives Considered

- **Generic LLM benchmarks (MMLU-style) for model choice.** Rejected: they
  do not measure the actual task — proposing valid, goal-advancing actions
  against a live conversation with schema constraints.
- **A separate metrics store.** Rejected: bundles are already the record;
  a second store would fork evidence.

## MVP Scope

- Scratchpad matrix harness + markdown report over the greetbot goal across
  the founder's live line-up (Ollama qwen3.6; LM Studio gemma-4-e4b,
  gemma-4-26b-a4b-qat, qwen3.6-27b), N≥3 repeats.
- Proof (principle 6): the report is delivered with its bundles, and at
  least one conclusion in it (e.g. "model X completes the goal, model Y
  gives up") is verifiable by replaying the linked bundles.

## Not Doing (and Why)

- AI-judge quality scoring — later, labelled, never silently mixed with
  evidence-backed metrics.
- Hosted-model cost optimisation studies — needs API keys and priorities.
- Parallel arena execution — sequential first; timing fidelity beats speed.

## Key Assumptions to Validate

| Tier | Assumption | How to validate |
|---|---|---|
| Must-be-true | Same-scenario repeats vary little enough for a meaningful table | Run N≥3 repeats; report variance alongside medians |
| Should-be-true | Local models differ visibly on the greetbot goal | The first report itself |
| Might-be-true | The arena doubles as a regression guard when upgrading a model | Re-run after a model update; diff reports |

## SpecScore Integration

- **Existing Features affected:**
  [`goal-driven-ai-testing`](../features/chatwright/goal-driven-ai-testing/README.md)
  (provider evaluation), developer-tooling (future CLI subcommand).

## Open Questions

- Should repeats vary the persona/system prompt to probe robustness, or
  stay identical for variance measurement first?

---
*This document follows the https://specscore.md/idea-specification*
