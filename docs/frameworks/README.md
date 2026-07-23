# Framework quickstarts

Chatwright only ever speaks HTTP: it emulates the Telegram Bot API on a local
port and expects the bot-under-test to call back into it instead of
`https://api.telegram.org`. Every Telegram bot framework exposes a way to
point its client at a different host — these pages show that one setting for
five popular frameworks, plus the matching Chatwright-side Go test.

The Chatwright-side tests are written against the scenario API
`chatwright.dev/runtime/cw` (`go get chatwright.dev/runtime`); by convention
the handle is `w := cw.New(t, ...)`, leaving `cw` for the package. There are
two integration shapes, following the two worked examples in the runtime
repository's
[`examples/`](https://github.com/chatwright/runtime-go/tree/main/examples):

- **In-process (Go)** — the bot runs inside the same test binary as
  Chatwright. Point the framework's client at `w.BotAPIURL()` at
  construction time, then hand its webhook handler to `w.ServeWebhook`. See
  [`examples/greetbot`](https://github.com/chatwright/runtime-go/tree/main/examples/greetbot).
- **External process (any language)** — the bot runs as a separate process,
  configured entirely through environment variables before it starts, and
  Chatwright attaches to its webhook over real HTTP with `w.WebhookAt`. See
  [`examples/pybot`](https://github.com/chatwright/runtime-go/tree/main/examples/pybot),
  which establishes the `TELEGRAM_API_ROOT` / `PORT` env-var contract every
  external-process guide below reuses.

## Guides

| Framework | Language | Shape | Client setting |
|---|---|---|---|
| [go-telegram-bot-api](go-telegram-bot-api.md) | Go | In-process | `NewBotAPIWithAPIEndpoint` (+ the RoundTripper redirect fallback) |
| [telebot](telebot.md) | Go | In-process | `Settings.URL` |
| [grammY](grammy.md) | Node/TypeScript | External process | `client: { apiRoot }` |
| [aiogram](aiogram.md) | Python | External process | `AiohttpSession(api=TelegramAPIServer.from_base(...))` |
| [python-telegram-bot](python-telegram-bot.md) | Python | External process | `ApplicationBuilder().base_url(...)` |

## Verification

Every framework-specific claim on these pages — constructor signatures,
option names, minimum versions — was checked against that framework's current
official documentation or source at the time of writing, not recalled from
memory. Each page states the exact package version its snippet was verified
against. A claim that could not be verified this way is marked explicitly
**"unverified — check your framework's docs"** rather than guessed. Chatwright
itself declares fidelity the same way: see
[`docs/glossary.md`](../glossary.md#evidence-and-observability).

## What the emulator actually supports

None of these guides describe a "real" Telegram bot talking to Telegram —
they describe a real bot talking to Chatwright's **Telegram Platform
Emulator**, which is deliberately not a full reimplementation of the Bot API.
Before relying on a capability beyond `sendMessage`, `editMessageText`,
inline keyboards and `getMe`, read
[`docs/compatibility/telegram.md`](../compatibility/telegram.md) — the
code-verified list of what is supported, partial, or not implemented.
