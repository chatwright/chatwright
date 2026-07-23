# python-telegram-bot quickstart

A [python-telegram-bot](https://python-telegram-bot.org) (PTB) bot runs as a
separate Python process, configured entirely through environment variables
before it starts — the same external-process shape as
[`examples/pybot`](https://github.com/chatwright/runtime-go/blob/main/examples/pybot/pybot.py).
Chatwright never imports
it; your test starts the process and attaches to its webhook over real
HTTP.

**Verified against:** `python-telegram-bot` v22.8 (PyPI latest, Python
≥3.10), `ApplicationBuilder.base_url` / `Bot.base_url` docs at
[docs.python-telegram-bot.org](https://docs.python-telegram-bot.org/en/stable/telegram.ext.applicationbuilder.html).

## What you need

- `pip install python-telegram-bot` (no extras needed for a webhook bot)
- A Go test (`go get chatwright.dev/runtime`, import
  `chatwright.dev/runtime/cw`) that starts the bot as a subprocess — mirror
  [`pybot_e2e_test.go`](https://github.com/chatwright/runtime-go/blob/main/examples/pybot/pybot_e2e_test.go)'s
  `startPybot` helper, substituting the Python interpreter and script

## Bot-side: read the env-var contract, set `base_url`

`base_url` defaults to `"https://api.telegram.org/bot"`; the token is
appended directly after it (or substituted into a `{token}` placeholder if
present), so pass the emulator's root plus the literal `/bot` suffix:

```python
import os
from telegram import Update
from telegram.ext import ApplicationBuilder, ContextTypes, MessageHandler, filters

api_root = os.environ["TELEGRAM_API_ROOT"]  # raises if unset, like pybot's api_root()
port = int(os.environ["PORT"])

app = (
    ApplicationBuilder()
    .token("TEST:TOKEN")
    .base_url(f"{api_root}/bot")
    .build()
)

async def greet(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text("Howdy stranger")

app.add_handler(MessageHandler(filters.TEXT, greet))

# No webhook_url: Chatwright's WebhookAt registers the target itself, so PTB
# only needs to listen locally, exactly like pybot's bare HTTPServer.
app.run_webhook(listen="127.0.0.1", port=port, url_path="webhook")
```

## Chatwright-side: start the process, then attach with `WebhookAt`

```go
apiAddr := freeAddr(t)
botAddr := freeAddr(t)
startPTBBot(t, "http://"+apiAddr, botAddr) // sets TELEGRAM_API_ROOT, PORT

w := cw.New(t, cw.WithListenAddr(apiAddr))
w.WebhookAt("http://" + botAddr + "/webhook")

chat := w.PrivateChat(cw.User{ID: "alice", FirstName: "Alice"})
chat.SendText("Hi")
chat.ExpectBotMessage().Within(2 * time.Second).Text("Howdy stranger")
```

## Environment-variable contract

| Variable | Set by | Meaning |
|---|---|---|
| `TELEGRAM_API_ROOT` | test | Emulator's Bot API base URL (`w.BotAPIURL()`) — passed to `base_url` with `/bot` appended |
| `PORT` | test | Local TCP port the bot's webhook listens on |

## What the emulator supports

`reply_text` and inline keyboards map onto `sendMessage`/`editMessageText`
with capture and assertion; most other Bot API methods do not exist yet. See
[`../compatibility/telegram.md`](../compatibility/telegram.md) before
relying on anything beyond text, actions and edits.
