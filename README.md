# Chatwright

**Emulate messaging platforms locally. Test real conversational applications.**

[![CI](https://github.com/chatwright/chatwright/actions/workflows/ci.yml/badge.svg)](https://github.com/chatwright/chatwright/actions/workflows/ci.yml)

Chatwright is an open, local-first conversation development platform — an
independent open-source project developed by [Sneat.co](https://sneat.co).
Chatwright emulates the messaging platform; the bot under development is the
real software under test. It exercises real bot webhooks through platform-shaped updates and local
bot-facing APIs, while keeping scenarios neutral where platforms permit it.

This repository contains the Go runtime and test API at its root (importable as
`github.com/chatwright/chatwright`), the product specification in
[`spec/`](spec/README.md), the phased [`roadmap`](docs/roadmap.md), the
[product](docs/product-strategy.md) and [Cloud](docs/cloud-strategy.md)
strategies, and a connected PrimeNG Studio prototype in
[`prototype/`](prototype/README.md).

## Install and write a first test

```bash
go get github.com/chatwright/chatwright
```

```go
// One neutral scenario — no platform-specific calls.
func greetScenario(cw *chatwright.Chatwright) {
	chat := cw.PrivateChat(chatwright.User{ID: "alice", FirstName: "Alice"})
	chat.SendText("Hi")
	chat.ExpectBotMessage().
		Within(time.Second).
		Text("Howdy stranger")
}

func TestGreeting(t *testing.T) {
	t.Run("telegram", func(t *testing.T) {
		cw := chatwright.New(t) // Telegram is the default platform
		cw.ServeWebhook(myTelegramBot(cw.BotAPIURL()))
		greetScenario(cw)
	})
	t.Run("whatsapp", func(t *testing.T) {
		cw := chatwright.New(t, chatwright.OnPlatform(whatsapp.Platform()))
		cw.ServeWebhook(myWhatsAppBot(cw.BotAPIURL()))
		greetScenario(cw)
	})
}
```

How it works: `chatwright.New(t)` boots an **emulated platform API server**
(Telegram Bot API or WhatsApp Cloud API) on a local port; you point the bot
under test's API base URL at `cw.BotAPIURL()` and hand Chatwright its webhook
(an `http.Handler`, or a URL for an external process in any language —
Chatwright only speaks HTTP). `SendText` POSTs a platform-native update to the
webhook; the bot's replies to the emulated API are captured, normalised and
asserted — including neutral `ExpectAction(...).Click()` on inline actions and
`ExpectEdited()` for in-place message edits. See
[`examples/greetbot`](examples/greetbot/) for a complete real-bot example and
[`example_test.go`](example_test.go) for a framework-free HTTP bot.

The small CLI installs with:

```bash
go install github.com/chatwright/chatwright/cmd/chatwright@latest
```

| Package | Purpose |
|---------|---------|
| `github.com/chatwright/chatwright` | The neutral scenario API you write tests against |
| `.../platform` | Neutral contracts (`Platform`, `Emulator`, `Message`, `Action`) |
| `.../telegram` | Telegram platform + emulated Bot API server |
| `.../whatsapp` | WhatsApp platform + emulated Cloud API server |
| `.../branching` | All-or-none state checkpoint/branch coordinator |
| `.../cmd/chatwright` | Command-line entry point |

Status: Telegram supports text + inline actions + in-place edits; WhatsApp is
text-only (interactive replies next); AI actors and Starlark are Phase 2. The
[roadmap](docs/roadmap.md) records the supported slice and exclusions honestly.

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
| `*.go`, [`platform/`](platform/), [`telegram/`](telegram/), [`whatsapp/`](whatsapp/), [`branching/`](branching/) | The Go runtime, neutral test API and Platform Emulators (module root) |
| [`cmd/chatwright/`](cmd/chatwright/) | Command-line entry point |
| [`examples/`](examples/) | Runnable example bots and end-to-end tests |
| [`spec/ideas/`](spec/ideas/README.md) | Product thesis and MVP boundary |
| [`spec/features/`](spec/features/README.md) | Capability hierarchy and acceptance criteria |
| [`spec/decisions/`](spec/decisions/README.md) | Current product and architecture decisions |
| [`spec/research/`](spec/research/README.md) | Explicit investigation backlog and evidence to collect |
| [`spec/plans/`](spec/plans/README.md) | Near-term executable delivery plan |
| [`prototype/`](prototype/README.md) | Connected Angular + PrimeNG mock-ups |
| [`docs/product-strategy.md`](docs/product-strategy.md) | Platform vision, open-source boundary and adoption strategy |
| [`docs/cloud-strategy.md`](docs/cloud-strategy.md) | Cloud Run, Cloud Intelligence, free-tier and paid-service direction |
| [`docs/glossary.md`](docs/glossary.md) | Canonical vocabulary for every Chatwright surface |

The Go runtime previously lived in a `chatwrite/` subdirectory (module
`github.com/chatwright/chatwright/chatwrite`). It now lives at the repository
root as `github.com/chatwright/chatwright`; existing consumers of the old
nested module path keep resolving their pinned pseudo-versions and should
switch import prefixes on their next upgrade.

## Status caveat

The original concept brief described a pre-runtime project. The repository has
already moved beyond that point: Telegram text/actions/edits and an early
WhatsApp text adapter exist. Specifications therefore distinguish **observed
baseline**, **approved direction**, and **future intent** rather than labelling
implemented code as proposed work. Full WhatsApp fidelity remains deferred.

## Licence

Runtime, CLI, Platform Emulators, Playground and Studio are directed to use the
[Apache License 2.0](LICENSE). The separately operated Cloud service may remain
proprietary. Marketplace assets declare their own licences. Pricing and Cloud
packaging remain undecided.
