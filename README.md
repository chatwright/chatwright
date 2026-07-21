# Chatwright

**Deterministic and AI-driven testing for conversational applications.**

Chatwright is an independent open-source conversation execution, simulation and
testing platform developed by [Sneat.co](https://sneat.co). It exercises real bot
webhooks through realistic platform-shaped updates and fake outbound platform
APIs, while keeping scenarios platform-neutral where the platforms permit it.

The repository currently contains an early Go runtime in [`chatwrite/`](chatwrite/README.md),
the product specification in [`spec/`](spec/README.md), the phased
[`roadmap`](docs/roadmap.md), and a connected PrimeNG Studio prototype in
[`prototype/`](prototype/README.md).

## Explore the connected mock-ups

Run the prototype once, then move between all four views from its shared sidebar:

```bash
cd prototype
pnpm install
pnpm start
```

| Mock-up | Local route | What it demonstrates |
|---|---|---|
| [Workspace overview](prototype/src/app/pages/workspace/workspace.page.html) | [http://localhost:4200/workspace](http://localhost:4200/workspace) | Hierarchical scenario coverage, recent runs and the path into an active test |
| [Live emulator](prototype/src/app/pages/emulator/emulator.page.html) | [http://localhost:4200/emulator](http://localhost:4200/emulator) | Multiple actors and chats; changing the language edits the existing bot greeting in place |
| [Scenario authoring](prototype/src/app/pages/scenario/scenario.page.html) | [http://localhost:4200/scenario](http://localhost:4200/scenario) | A readable, hierarchical scenario with platform-neutral steps and assertions |
| [Run inspector](prototype/src/app/pages/run/run.page.html) | [http://localhost:4200/run](http://localhost:4200/run) | Transcript, HTTP trace, assertions and first-class latency/message metrics |

The prototype is intentionally local-only and uses sample state. It is a product
conversation aid, not the hosted Chatwright application.

## Product direction

- **Now:** harden the existing deterministic Telegram slice—private text,
  actions, edits, real HTTP webhook delivery, fake Bot API capture and CI-ready
  failure reports.
- **Next:** make the same runtime useful for manual offline testing, then add a
  portable structured scenario model and Starlark.
- **Later:** AI actors and evidence-linked UX evaluation, followed by hosted
  authoring, collaboration and run history.

The [roadmap](docs/roadmap.md) explains the value gates and deliberately excluded
scope. The [Chatwright idea](spec/ideas/chatwright.md) and
[feature hierarchy](spec/features/chatwright/README.md) are the specification
entry points.

## Repository map

| Path | Purpose |
|---|---|
| [`chatwrite/`](chatwrite/README.md) | Early Go-first runtime and examples; retained at its current path |
| [`spec/ideas/`](spec/ideas/README.md) | Product thesis and MVP boundary |
| [`spec/features/`](spec/features/README.md) | Capability hierarchy and acceptance criteria |
| [`spec/decisions/`](spec/decisions/README.md) | Current product and architecture decisions |
| [`spec/research/`](spec/research/README.md) | Explicit investigation backlog and evidence to collect |
| [`spec/plans/`](spec/plans/README.md) | Near-term executable delivery plan |
| [`prototype/`](prototype/README.md) | Connected Angular + PrimeNG mock-ups |

## Status caveat

The original concept brief described a pre-runtime project. The repository has
already moved beyond that point: Telegram text/actions/edits and an early
WhatsApp text adapter exist. Specifications therefore distinguish **observed
baseline**, **approved direction**, and **future intent** rather than labelling
implemented code as proposed work. Full WhatsApp fidelity remains deferred.

## Licence

The runtime is [Apache-2.0 licensed](chatwrite/LICENSE). No licence or pricing
decision is made here for a future hosted service.
