# aiogram quickstart

An [aiogram](https://aiogram.dev) bot runs as a separate Python process,
configured entirely through environment variables before it starts — the
same external-process shape as
[`examples/pybot`](https://github.com/chatwright/runtime-go/blob/main/examples/pybot/pybot.py)
(which deliberately avoids aiogram to prove the stdlib-only case; this page
is what a real aiogram bot does instead). Chatwright never imports it; your test starts the process
and attaches to its webhook over real HTTP.

**Verified against:** `aiogram` v3.30.0 (PyPI latest, Python ≥3.10), the
[custom API server docs](https://docs.aiogram.dev/en/latest/api/session/custom_server.html)
and `aiogram/client/telegram.py` source (`TelegramAPIServer.from_base`).

## What you need

- `pip install aiogram` (no extras needed for a webhook bot)
- A Go test (`go get chatwright.dev/runtime`, import
  `chatwright.dev/runtime/cw`) that starts the bot as a subprocess — mirror
  [`pybot_e2e_test.go`](https://github.com/chatwright/runtime-go/blob/main/examples/pybot/pybot_e2e_test.go)'s
  `startPybot` helper, substituting the Python interpreter and script

## Bot-side: read the env-var contract, set a custom `TelegramAPIServer`

```python
import os
from aiohttp import web
from aiogram import Bot, Dispatcher, Router
from aiogram.client.session.aiohttp import AiohttpSession
from aiogram.client.telegram import TelegramAPIServer
from aiogram.webhook.aiohttp_server import SimpleRequestHandler, setup_application

api_root = os.environ["TELEGRAM_API_ROOT"]  # raises if unset, like pybot's api_root()
port = int(os.environ["PORT"])

session = AiohttpSession(api=TelegramAPIServer.from_base(api_root))
bot = Bot(token="TEST:TOKEN", session=session)

router = Router()

@router.message()
async def greet(message):
    await message.answer("Howdy stranger")

dp = Dispatcher()
dp.include_router(router)

app = web.Application()
SimpleRequestHandler(dispatcher=dp, bot=bot).register(app, path="/webhook")
setup_application(app, dp, bot=bot)
web.run_app(app, host="127.0.0.1", port=port)
```

`TelegramAPIServer.from_base(api_root)` builds both the method URL template
(`{base}/bot{token}/{method}`) and the file-download template from one root
— no manual string formatting, unlike `tgbotapi`'s endpoint constructor.

## Chatwright-side: start the process, then attach with `WebhookAt`

```go
apiAddr := freeAddr(t)
botAddr := freeAddr(t)
startAiogramBot(t, "http://"+apiAddr, botAddr) // sets TELEGRAM_API_ROOT, PORT

w := cw.New(t, cw.WithListenAddr(apiAddr))
w.WebhookAt("http://" + botAddr + "/webhook")

chat := w.PrivateChat(cw.User{ID: "alice", FirstName: "Alice"})
chat.SendText("Hi")
chat.ExpectBotMessage().Within(2 * time.Second).Text("Howdy stranger")
```

## Environment-variable contract

| Variable | Set by | Meaning |
|---|---|---|
| `TELEGRAM_API_ROOT` | test | Emulator's Bot API base URL (`w.BotAPIURL()`) — passed to `TelegramAPIServer.from_base` |
| `PORT` | test | Local TCP port the bot's webhook listens on |

## What the emulator supports

`message.answer` and inline keyboards map onto `sendMessage`/
`editMessageText` with capture and assertion; most other Bot API methods do
not exist yet. See [`../compatibility/telegram.md`](../compatibility/telegram.md)
before relying on anything beyond text, actions and edits.
