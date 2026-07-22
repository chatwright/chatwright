# Chatwright

**Deterministic and AI-driven testing for conversational applications.**

[![CI](https://github.com/chatwright/chatwright/actions/workflows/ci.yml/badge.svg)](https://github.com/chatwright/chatwright/actions/workflows/ci.yml)

Chatwright is a **Conversation Execution Platform**. Testing is its first execution
mode: you write **one platform-agnostic scenario**, and Chatwright maps it onto a
concrete chat platform — emulating that platform's API server, delivering updates
to the bot's webhook over real HTTP, and capturing the API calls the bot makes
back.

The bot under test can be written in **any language or framework** — Chatwright
only speaks HTTP. Internally it reuses the
[`bots-go-framework`](https://github.com/bots-go-framework) platform adapters
(`bots-api-telegram`, `bots-api-whatsapp`) to parse and build wire messages.

> Chatwright is an independent open-source project developed by
> [Sneat.co](https://sneat.co), intended to grow into its own ecosystem at
> [chatwright.dev](https://chatwright.dev).

## Write once, run on any platform

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

Interactive elements are asserted — and **clicked** — neutrally too.
`ExpectAction(row, col)` maps onto Telegram inline buttons (`text`/`callback_data`)
and WhatsApp interactive replies (`title`/`id`); `Click()` sends the callback
(or text) back to the bot so the conversation continues:

```go
msg.ExpectAction(0, 0).Label("My events").ID("my-events").
	Click().
	ExpectBotMessage().Text("Here are your events")
```

A click doesn't have to produce a *new* message: if the bot edits the message the
action was attached to (e.g. Telegram `editMessageText`), assert that in place
with `ExpectEdited()` on the original message handle instead of expecting a new
one:

```go
msg.ExpectAction(1, 0).Label("Español").ID("lang:es").Click()
msg.ExpectEdited().Within(time.Second).Text("¡Hola, forastero!")
```

## How it works

1. `chatwright.New(t)` boots an **emulated platform API server** (Telegram Bot API
   or WhatsApp Cloud API) on a local port.
2. You point the bot-under-test's API base URL at `cw.BotAPIURL()` and hand
   Chatwright its webhook (an `http.Handler`, or a URL via `WebhookAt` for an
   external process in any language).
3. `SendText` encodes a platform-native update and **POSTs it to the webhook**.
4. The bot replies by calling the emulated API; Chatwright **captures the call**,
   normalizes it, and your assertions run against it — with per-message metrics
   (latency today; tokens, sizes next).

## Why

Conversational apps need two complementary kinds of testing:

1. **Deterministic** — fast, reliable, repeatable, CI-friendly.
2. **AI-driven exploratory** — AI personas that pursue a *goal* instead of a
   script, explore naturally, and report usability problems.

The same runtime is designed to support both. **The MVP delivers deterministic
testing.**

## Status

Early, under active construction:

- ✅ Platform-agnostic scenario API mapped to platform-specific calls
- ✅ Clicking actions (`Click()`) — callback query / interactive reply back to the bot
- ✅ In-place message edits (`ExpectEdited()`) — assert a Telegram `editMessageText`-style edit
- ✅ Telegram platform — text + inline actions + edits, via `bots-api-telegram`
- ✅ WhatsApp platform — text (MVP), via `bots-api-whatsapp`; interactive replies next
- ✅ Real bots driven over HTTP; emulated platform API servers
- ✅ Latency-aware assertions (`ExpectBotMessage().Within(...)`) + first-class metrics
- ⏳ AI actors, Starlark scripting — Phase 2

See the [Chatwright specification](../spec/README.md) and [roadmap](../docs/roadmap.md)
for the problem, architecture direction and MVP boundaries.

## Packages

| Package | Purpose |
|---------|---------|
| `github.com/chatwright/chatwright/chatwrite` | The neutral scenario API you write tests against |
| `github.com/chatwright/chatwright/chatwrite/platform` | Neutral contracts (`Platform`, `Emulator`, `Message`, `Action`) |
| `github.com/chatwright/chatwright/chatwrite/telegram` | Telegram platform + emulated Bot API server |
| `github.com/chatwright/chatwright/chatwrite/whatsapp` | WhatsApp platform + emulated Cloud API server |

## License

[Apache-2.0](./LICENSE) — see also [NOTICE](./NOTICE).
