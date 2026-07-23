---
format: https://specscore.md/idea-specification
status: Specifying
---

# Idea: OpenAI-compatible actor provider — local models for local development

**Status:** Specifying
**Date:** 2026-07-23
**Owner:** alex
**Promotes To:** chatwright/goal-driven-ai-testing
**Supersedes:** —
**Related Ideas:** extends:goal-driven-ai-bot-testing

## Problem Statement

The only real actor provider speaks the Anthropic Messages API, so every AI
campaign — including quick local development iterations — needs an API key
and paid calls. Developers running Ollama or LM Studio locally (founder
included) cannot point a campaign at a local model, although the entire rest
of the loop (emulator, bot, evidence) already runs on the laptop.

## Context

The Provider seam is deliberately narrow (`Propose(ctx, Prompt) → Proposal,
Usage, error`); providers are dumb transports and ALL safety lives in the
loop — invalid proposals are recorded and re-prompted, non-progress
detection stops a run, budgets bound cost and steps. Ollama and LM Studio
both expose OpenAI-compatible endpoints and schema-constrained JSON output,
so one provider covers both plus OpenRouter/vLLM/OpenAI with nothing but
`{baseURL, model, optional key}`. Record/replay cassettes are
provider-agnostic by design.

## Recommended Direction

- One `actor/openai`-style provider (post-split: in runtime-go): base URL +
  model + optional API key; structured output via JSON-schema response
  format where the server supports it, with the same never-fabricate,
  typed-action contract as the Anthropic provider.
- Usage reporting: token counts as reported by the server; cost left zero
  unless configured (local models are free — the pricing-snapshot mechanism
  stays Anthropic-provider-specific).
- Docs frame the intended split honestly: local models for the development
  loop (free, offline, weaker actors — expect more ai-navigation-failure
  findings); a strong hosted model for recorded flagship campaigns.
- Positioning note: this completes the fully-local story — emulated
  platform + real bot + local model, zero external calls.

## Alternatives Considered

- **Per-vendor providers (ollama, lmstudio, …).** Rejected: they share the
  OpenAI wire shape; one provider with a base URL covers all and stays
  honest about capability differences via configuration, not code forks.
- **A Claude Code CLI provider (subscription auth).** Separate candidate
  idea — different transport and terms; not folded in here.

## MVP Scope

- The provider + cassette-recorded tests (CI zero-token, same pattern as
  actor/anthropic) + a live smoke gated behind env vars.
- Proof (principle 6): a greetbot campaign driven by a local model via
  Ollama or LM Studio completes (or stops with correctly-classified
  findings) and its bundle replays in the player.

## Not Doing (and Why)

- Building before the repo split lands — `actor/` is mid-restructuring into
  runtime-go; this is a natural first post-split lane.
- Embeddings/vision/tool-calling surfaces — the actor contract needs none
  of them.
- Model-quality gating (refusing weak models) — budgets and non-progress
  detection already bound the damage; the choice stays with the developer.

## Key Assumptions to Validate

| Tier | Assumption | How to validate |
|---|---|---|
| Must-be-true | Schema-constrained output on Ollama/LM Studio is reliable enough for the typed proposal contract | Run the greetbot proof against both; count invalid-proposal rates |
| Should-be-true | A capable local model can complete a simple campaign | Greetbot proof with a mid-size local model |
| Might-be-true | Local-model campaigns are useful beyond smoke (real exploration) | Try a Listus exploration part locally once the flagship exists |

## SpecScore Integration

- **Existing Features affected:**
  [`goal-driven-ai-testing`](../features/chatwright/goal-driven-ai-testing/README.md)
  (provider roster), docs/comparison and quickstarts (local-development
  story).

## Open Questions

- Minimum local model size that reliably follows the proposal schema?
- Should Usage carry a "local" marker so reports distinguish free runs from
  paid ones beyond cost=0?

---
*This document follows the https://specscore.md/idea-specification*
