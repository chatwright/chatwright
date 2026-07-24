---
format: https://specscore.md/idea-specification
status: Draft
---
# Idea: Claude CLI subscription provider

**Status:** Draft
**Date:** 2026-07-24
**Owner:** alex
**Promotes To:** —
**Supersedes:** —
**Related Ideas:** extends:openai-compatible-provider, extends:actor-model-arena

## Problem Statement

How might we let a developer who already pays for a Claude subscription run
AI-driven Chatwright work without buying a second, separately-metered API key?

## Context

Every AI path in Chatwright today—the actor `Provider` seam, the arena, and the
proposed [AI-judged assertions](../features/chatwright/ai-driven-testing/ai-judged-assertions/README.md)—assumes
a metered API credential: an Anthropic console key, an OpenAI-compatible
endpoint, or a local model served over `chatwright server`. That is three
options, and a large population of our exact target user has none of them
readily to hand while nonetheless paying Anthropic every month.

The founder is user #1 here and said so directly (2026-07-24): *"I actually like
that idea — I'd use that myself."* That is a stronger signal than a speculative
idea normally carries. It also matches a friction we have already documented for
ourselves: the live-LLM smoke test in `TODO-for-humans.md` has to open with "your
Claude subscription cannot be used — the provider calls the Messages API, which
needs a console key." We wrote that sentence because the gap was real for us.

The wedge argument: a developer evaluating Chatwright hits the AI features and
must decide whether they are worth provisioning a new billing relationship for.
That is a poor moment to ask for a credit card. `claude` is already installed and
already authenticated on the machines of the people most likely to try us.

Prior art within the project: the parked `ai-agent-cli-harnesses` idea explored
driving agent CLIs over process/PTY as a *harness*—a bot under test. This is the
mirror image and much narrower: an agent CLI as a *provider*, on the actor side
of the seam, with no bot-under-test role.

## Recommended Direction

Add a provider implementation that shells out to the locally-installed,
locally-authenticated `claude` CLI in non-interactive mode, satisfying the same
`Provider` interface the OpenAI and Anthropic providers already satisfy. The
runtime should not know or care that its tokens came from a subscription rather
than a key: same seam, same proposals, same cost accounting hooks, same
cassette record/replay so CI stays zero-token.

Prefer this over asking users to provision a key because the credential already
exists, is already authorised, and never passes through Chatwright—which is the
same privacy posture as BYOK-direct, achieved with strictly less user work. The
provider is a local subprocess: nothing is transmitted to a Chatwright server,
so it composes with the offline mode without weakening it.

The honest constraint is that this is subject to Anthropic's terms for
subscription use, and to a CLI surface that is not a stability-guaranteed API.
Both are governance questions, not engineering ones, and both belong in the
must-be-true tier below rather than being assumed away. If the terms do not
permit programmatic use of a subscription for this purpose, the idea dies there
and should die cleanly rather than shipping and being withdrawn.

## Alternatives Considered

- **Point the existing OpenAI-compatible provider at a local proxy that
  re-exposes `claude`.** Lost because it needs a proxy the user must run and
  configure, which reintroduces exactly the setup step the idea exists to
  remove—and adds a second process to fail.
- **Do nothing; tell subscription users to buy a console key.** Lost on the wedge
  argument: the ask lands at the worst possible moment (first evaluation), and
  local models via `chatwright server` only partly cover it, since a developer
  wanting frontier-model judgement will not accept a small local model.
- **Generalise to an "agent CLI provider" covering `claude`, `codex`, `gemini`
  and friends at once.** Lost for MVP as premature abstraction—one working
  proof beats a plugin system with no proof (principle 6)—but this is the
  obvious follow-up shape, so the seam should not actively preclude it.

## MVP Scope

One job: `chatwright arena run` and a single-actor campaign complete end to end
against a real bot, with the actor driven by the local `claude` CLI, no API key
present in the environment, and a cassette recorded that replays in CI at zero
token cost.

## Not Doing (and Why)

- Judge-side use (AI-judged assertions) in the MVP — the actor seam proves the
  mechanism; extending to the judge seam is a follow-up once that feature exists
- Other agent CLIs (`codex`, `gemini`, …) — premature abstraction before one
  proof exists; the seam should merely not preclude them
- Bundling, installing or auto-updating `claude` — we detect it and report its
  absence as a declared unsupported condition; we never manage someone's toolchain
- Cloud/hosted use — a subscription credential is personal to a machine and must
  never be brokered by a Chatwright server
- Streaming/partial-token semantics — proposals are whole-turn; no reason to
  differ from the existing providers

## Key Assumptions to Validate

| Tier | Assumption | How to validate |
|------|------------|-----------------|
| Must-be-true | Anthropic's terms permit programmatic use of a subscription via the CLI for this purpose | Read the current Claude Code / subscription terms; if ambiguous, ask Anthropic before writing code — do not ship on a guess |
| Must-be-true | `claude` has a non-interactive mode with stable enough machine-readable output to parse a whole-turn proposal | Prototype against the installed CLI; confirm exit codes and output shape across at least two CLI versions |
| Should-be-true | Token usage or cost is recoverable per call, so `RecordCost`/`maxCost`/`RunCeiling` keep working | Inspect the CLI's usage reporting; if unavailable, decide whether an un-costed provider is acceptable and how it is declared (fidelity is declared — principle 4) |
| Should-be-true | Latency is acceptable for multi-turn campaigns (process spawn per turn) | Time a 10-turn greetbot run against the API-keyed provider as baseline |
| Might-be-true | Subscription rate limits tolerate campaign-shaped bursts | Run the arena matrix and observe throttling behaviour |
| Might-be-true | Enough of our target users have `claude` installed for this to be a real wedge rather than a founder convenience | Ask on first user contact; the founder counts as n=1, not as validation |

## SpecScore Integration

- **New Features this would create:** one provider feature under
  `chatwright/ai-driven-testing`, sibling in kind to the existing provider work
- **Existing Features affected:** none structurally — the point of the actor
  `Provider` seam is that a new provider is additive; `docs/runtime-parity.md`
  gains a row, since a Go-only provider is a declared deviation under
  principle 7 (a browser runtime cannot spawn a subprocess)
- **Dependencies:** none blocking; the actor `Provider` seam and
  `CassetteProvider` already exist and are proven

## Open Questions

- Do Anthropic's subscription terms permit this? Everything else is moot until
  this is answered, and it must be answered by reading the terms, not by assuming
- Is this Go-runtime-only forever? A browser cannot spawn `claude`, so principle 7
  parity is unachievable by construction — is that a legitimate
  technical-limitation deviation, or does it argue the provider belongs behind
  `chatwright server` (which *can* spawn it) so the Playground reaches it too?
- If per-call cost is not recoverable, does an un-costed provider get to exist
  given budgets are a first-class run concept — declared and un-budgeted, or
  refused?
- Does the arena admit subscription-driven cells alongside API-keyed ones, given
  the results are no longer cost-comparable on the same axis?

---
*This document follows the https://specscore.md/idea-specification*
