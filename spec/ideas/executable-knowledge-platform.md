---
format: https://specscore.md/idea-specification
status: Approved
---

# Idea: Executable knowledge platform — the MDN of conversational UX

**Status:** Approved
**Date:** 2026-07-23
**Owner:** alex
**Promotes To:** —
**Supersedes:** —
**Related Ideas:** extends:chatwright, extends:actor-model-arena, extends:live-recording-sdk, extends:third-party-emulator-backends, extends:hybrid-runs

## Problem Statement

Conversational UX knowledge is scattered and inert. A developer who wants to
collect an RSVP, split a bill or request a payment over a messaging platform
finds fragmented platform docs, stale blog posts and Stack Overflow threads —
none of which run. There is no place where "how do I solve this conversation
problem, on which platform, with what trade-offs?" is answered by an example
you can execute, inspect, compare and then connect your own bot to.

## Context

The founder set the direction on 2026-07-23 with a detailed architectural
brief. Everything the platform needs to execute already exists: the run
substrate (runtime-go, sdk-go, the run-bundle v1 format, the Studio
player), a proven black-box bot boundary (the emulated platform API server;
a Python bot passes the same scenarios as a Go bot with zero shared code),
and community mechanics specified for the actor-model arena. What is
missing is the knowledge layer that makes this substrate the destination
for learning, designing and comparing — not only testing. The launch
sequencing is decided: the launch article stays the testing wedge while the
landing presents the full platform.

## North Star

Chatwright becomes **the best place to learn, design, test and compare
conversational UX across messaging platforms** — not merely a Telegram
emulator, a bot-testing framework or a capability matrix, but an executable
knowledge platform: a connected graph of Jobs, Recipes, Capabilities,
Platforms, Implementations, live demos, code, tests and recordings, where
every page can run.

The analogy is MDN: prose that teaches, reference data that is
machine-readable, examples that execute in the page, and compatibility
tables generated from data rather than maintained by hand.

### Aspiration ladder (founder, 2026-07-23)

Three rungs, each a measurable success criterion for the rung below it:

1. **Better documentation than the platforms' own** — every capability
   documented with a live demo running beside the prose, not screenshots.
2. **The reference of habit** — developers reach for Chatwright to learn
   and verify platform behaviour before they reach for the official docs.
3. **The embed** — platform vendors themselves (Telegram, WhatsApp) embed
   Chatwright widgets in their official documentation. Explicitly
   aspirational — it may never happen — but it defines what "best" means
   and gives rung 2 its measuring stick.

## Product Philosophy

Developers enter from many directions — a problem to solve, a capability
they know they need, a wish for inspiration, a platform comparison, a live
demo, production-ready code, a bot of their own to test, an implementation
to publish. Every entry path leads into the same connected knowledge graph;
none is a separate product.

The primary journey is **not** writing bots. It is:

choose a Job or Capability → open a Recipe → run a live demo → compare
implementations → inspect trade-offs → view code → connect your own bot.

## Recommended Direction

Two layers, one platform:

- **The executable substrate already exists.** Scenario × Bot, executed by a
  Runtime against an emulated Platform, produces a Recording — the run
  bundle. A live demo is a run without assertions; a test is a run with
  them; an arena cell is a run driven by an AI actor. The repositioning adds
  **no new execution machinery and no second recording format**.
- **The knowledge graph is the new layer.** Jobs, Recipes, Capabilities,
  Implementations, Authors and Repositories are descriptive nodes whose
  edges point into the substrate: a Recipe's demo is a Bot plus a Scenario;
  an Implementation's evidence is a Recording; a Capability's support table
  is data, not prose. Decision
  [0011](../decisions/0011-executable-knowledge-graph.md) defines the
  domain model.

Supporting decisions:

- Bots become **black boxes speaking platform-native payloads** over two
  transports — remote HTTPS (already proven by the Go runtime's emulated
  Bot API server) and in-browser iframes driven via `postMessage`. A new
  browser runtime (runtime-ts) orchestrates demos inside the
  Playground/player component. Decision
  [0012](../decisions/0012-black-box-bot-protocol.md).
- Every indexed repository carries a **`CHATWRIGHT.md` manifest**; a curated
  central index repository (`chatwright/recipes`) holds first-party content
  plus a registry of federated repositories, and a "Try in Chatwright"
  badge works with no registration at all. Decision
  [0013](../decisions/0013-chatwright-md-federation.md).
- Community appreciation uses **independent metrics, never one opaque
  score**. Decision [0014](../decisions/0014-community-metrics.md).

## What This Reframes

- Testing is no longer the product; it is the wedge and one entry path. The
  launch article deliberately stays testing-led (founder decision
  2026-07-23) while the landing presents the full platform.
- The Studio player is the replay surface of the same bundles the knowledge
  graph embeds as evidence and demos.
- The actor-model arena's community mechanics — per-scenario leaderboards,
  adoption ranking, stars, clone buttons, GitHub identity — generalise to
  every knowledge-graph node instead of remaining benchmark-only.
- The observation model remains the platform-neutral projection that lets
  one Recipe discuss many platforms honestly.

## What This Does Not Change

- **Platform emulated, bot real** (decision 0006) and declared endpoint
  profiles (decision 0008) stay the execution identity.
- **Open local stack, closed Cloud** (decision 0007): the knowledge graph,
  formats, runtimes and index are open; operated services (hosted saves,
  leaderboard backends, verified badges) are the commercial layer.
- The run-bundle v1 format is unchanged; it gains a second producer
  (runtime-ts) and a public role as the Recording format.

## Alternatives Considered

- **Stay a testing platform with a docs site.** Rejected: documentation
  that cannot execute decays into the same inert content the market already
  has; the substrate is Chatwright's differentiation.
- **Build a separate "demo gallery" product.** Rejected: it would duplicate
  the runtime, the player and the bundle format, and split community
  attention across two surfaces.
- **Invent a generic cross-platform bot API.** Rejected: it would make
  Chatwright the lowest common denominator and force every existing bot to
  be rewritten; platform-native payloads keep real bots connectable as-is.

## MVP Scope

Scaffolded now (2026-07-23), deep implementation deliberately deferred:

- Decisions 0011–0014 and this idea recorded; glossary and product
  strategy updated.
- The `CHATWRIGHT.md` manifest format v1 published under
  `formats/chatwright-md/v1/`.
- The `chatwright/recipes` central index created with the content skeleton
  (first Jobs, one Recipe with Implementations, first capability data) and
  the registry format.
- The `chatwright/runtime-ts` repository scaffolded: package structure,
  core interfaces, protocol envelope types — no deep implementation.
- The chatwright.dev landing repositioned to the platform IA (Jobs,
  Recipes, Capabilities, Platforms, runtime, testing, recording,
  community; "Try in browser", "Connect your own bot", "Contribute
  recipes").
- The follow-up design-session backlog recorded
  ([research: knowledge platform](../research/knowledge-platform.md)).

## Not Doing (and Why)

- **Deep runtime-ts implementation** — the browser runtime, emulation
  fidelity, recording/replay and testing surface each deserve a dedicated
  design session (I-66–I-70); scaffolding first keeps extension points
  open instead of foreclosing them.
- **The full bot-protocol envelope spec** — adversarial cases (dead bots,
  origin attacks, timeouts) need focused design (I-68), not a side effect
  of a repositioning session.
- **Community metrics backend, search backend, federation API** — scaffold
  the model only (decisions 0013/0014; I-72–I-74); operating services is
  the Cloud layer's concern and premature before content exists.
- **WhatsApp browser emulation parity** — Telegram stays the reference
  platform (decision 0002); WhatsApp appears first as compatibility data
  and prose.
- **The portable scenario format** — a prerequisite for browser-authored
  demos but a format decision with long-term lock-in (I-71); Go-defined
  scenarios and recorded bundles carry demos until then.

## Key Assumptions to Validate

| Tier | Assumption | How to validate |
|---|---|---|
| Must-be-true | Real recipes are expressible as iframe bots without a backend (or remote HTTPS covers the rest without hurting the demo experience) | Build the first Recipe's demo both ways during the browser-runtime session (I-66/I-68) |
| Must-be-true | One capability vocabulary serves compatibility docs, emulator fidelity, manifests, negotiation and search without forking | Author two capability trees end to end (I-75) and consume them from all five surfaces |
| Should-be-true | The `CHATWRIGHT.md` + badge flow is low-friction enough that third-party authors adopt it unprompted | First three external repositories in the registry; time-to-adopt from first contact |
| Should-be-true | Executable pages attract and retain developers measurably better than static documentation | Landing analytics: demo interaction rate vs bounce on content pages |
| Might-be-true | Wedge-led launch messaging and platform-led landing IA reinforce rather than confuse each other | Launch-article click-through behaviour on the repositioned landing |

## SpecScore Integration

- **Existing Features affected:**
  [`playground`](../features/chatwright/playground/README.md),
  [`platform-emulators`](../features/chatwright/platform-emulators/README.md),
  [`marketplace`](../features/chatwright/marketplace/README.md),
  [`conversation-runtime`](../features/chatwright/conversation-runtime/README.md),
  [`observability`](../features/chatwright/observability/README.md).

## Open Questions

Deferred to dedicated design sessions recorded in
[research: knowledge platform](../research/knowledge-platform.md) — browser
runtime internals, platform emulation fidelity in TypeScript, the bot
protocol envelope details, recording/replay in the browser, the testing
surface, the portable scenario format, search, and the federation API.

*This document follows the https://specscore.md/idea-specification*
