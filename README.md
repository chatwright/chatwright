# Chatwright

**Emulate messaging platforms locally. Test real conversational applications.**

Chatwright is an independent open-source conversation execution, simulation and
testing product developed by [Sneat.co](https://sneat.co). Chatwright emulates
the messaging platform; the bot under development is the real software under
test. It exercises real bot webhooks through platform-shaped updates and local
bot-facing APIs, while keeping scenarios neutral where platforms permit it.

The repository currently contains an early Go runtime in [`chatwrite/`](chatwrite/README.md),
the product specification in [`spec/`](spec/README.md), the phased
[`roadmap`](docs/roadmap.md), the [product](docs/product-strategy.md) and
[Cloud](docs/cloud-strategy.md) strategies, and a connected PrimeNG Studio
prototype in [`prototype/`](prototype/README.md).

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
| [Playground](prototype/src/app/pages/emulator/emulator.page.html) | [http://localhost:4200/emulator](http://localhost:4200/emulator) | Multiple actors and chats consuming one Telegram Platform Emulator; changing the language edits the existing bot greeting in place |
| [Scenario authoring](prototype/src/app/pages/scenario/scenario.page.html) | [http://localhost:4200/scenario](http://localhost:4200/scenario) | A readable, hierarchical scenario with platform-neutral steps and assertions |
| [Run inspector](prototype/src/app/pages/run/run.page.html) | [http://localhost:4200/run](http://localhost:4200/run) | Transcript, HTTP trace, assertions and first-class latency/message metrics |

The prototype is intentionally local-only and uses sample state. It is a product
conversation aid, not the managed Chatwright Cloud service.

## Product direction

- **Now:** harden the Telegram Platform Emulator MVP—Client Emulator plus
  Server/API Emulator—for private text, actions, edits, real HTTP webhook
  delivery, fake Bot API capture and CI-ready failure reports.
- **Next:** make the Playground a first-class consumer for manual offline testing, then add a
  portable structured scenario model and Starlark.
- **Later:** AI actors, fuzz testing and evidence-linked UX evaluation, followed
  by optional Cloud Run infrastructure, flagship Cloud Intelligence and a
  Marketplace for reusable assets.

Everything required for local development—including the Runtime, CLI, Platform
Emulators, Playground and Studio—is open source and works without an account.
Commercial value should come from operated Cloud services, not from closing the
local Studio. A free account should earn voluntary sign-in through additive sync,
hosted reports, execution, collaboration and AI value.

The [roadmap](docs/roadmap.md) explains the value gates and deliberately excluded
scope. The [Chatwright idea](spec/ideas/chatwright.md) and
[feature hierarchy](spec/features/chatwright/README.md) are the specification
entry points. The [Platform Emulators](spec/features/chatwright/platform-emulators/README.md)
area defines the Telegram MVP and planned platforms; the
[Playground](spec/features/chatwright/playground/README.md) is its manual-testing
consumer.

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
| [`docs/product-strategy.md`](docs/product-strategy.md) | Platform vision, open-source boundary and adoption strategy |
| [`docs/cloud-strategy.md`](docs/cloud-strategy.md) | Cloud Run, Cloud Intelligence, free-tier and paid-service direction |

## Status caveat

The original concept brief described a pre-runtime project. The repository has
already moved beyond that point: Telegram text/actions/edits and an early
WhatsApp text adapter exist. Specifications therefore distinguish **observed
baseline**, **approved direction**, and **future intent** rather than labelling
implemented code as proposed work. Full WhatsApp fidelity remains deferred.

## Licence

Runtime, CLI, Platform Emulators, Playground and Studio are directed to use the
[Apache License 2.0](chatwrite/LICENSE). The separately operated Cloud service
may remain proprietary. Marketplace assets declare their own licences. Pricing
and Cloud packaging remain undecided.
