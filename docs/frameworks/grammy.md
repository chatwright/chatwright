# grammY quickstart

A [grammY](https://grammy.dev) bot runs as a separate Node/TypeScript
process, configured entirely through environment variables before it starts
— the same external-process shape as
[`examples/pybot`](https://github.com/chatwright/runtime-go/tree/main/examples/pybot),
just in a different language.
Chatwright never imports or spawns it; your test starts the process itself
and attaches to its webhook over real HTTP.

**Verified against:** `grammy` v1.45.1 (npm `latest`), `apiRoot` documented
at [grammy.dev/ref/core/apiclientoptions](https://grammy.dev/ref/core/apiclientoptions)
and confirmed against `src/convenience/frameworks.ts` in the grammY source
(the `"http"` adapter targets Node's built-in `http`/`https` modules).

## What you need

- `npm install grammy` (Node ≥ 14.13.1, per grammY's `engines` field)
- A Go test (`go get chatwright.dev/runtime`, import
  `chatwright.dev/runtime/cw`) that starts the bot as a subprocess — mirror
  [`pybot_e2e_test.go`](https://github.com/chatwright/runtime-go/blob/main/examples/pybot/pybot_e2e_test.go)'s
  `startPybot` helper (reserve addresses, set env, wait for the listener)

## Bot-side: read the env-var contract, set `client.apiRoot`

```ts
import { Bot, webhookCallback } from "grammy";
import http from "node:http";

const apiRoot = process.env.TELEGRAM_API_ROOT;
const port = process.env.PORT;
if (!apiRoot) throw new Error("TELEGRAM_API_ROOT is not set");
if (!port) throw new Error("PORT is not set");

const bot = new Bot("TEST:TOKEN", { client: { apiRoot } });
bot.on("message:text", (ctx) => ctx.reply("Howdy stranger"));

http.createServer(webhookCallback(bot, "http"))
  .listen(Number(port), "127.0.0.1");
```

`client.apiRoot` defaults to `https://api.telegram.org`; setting it
redirects every outbound call the whole client makes, same effect as
`tgbotapi`'s endpoint constructor or `telebot`'s `Settings.URL`.

## Chatwright-side: start the process, then attach with `WebhookAt`

```go
apiAddr := freeAddr(t) // reserve like pybot_e2e_test.go's freeAddr helper
botAddr := freeAddr(t)
startGrammyBot(t, "http://"+apiAddr, botAddr) // sets TELEGRAM_API_ROOT, PORT

w := cw.New(t, cw.WithListenAddr(apiAddr))
w.WebhookAt("http://" + botAddr)

chat := w.PrivateChat(cw.User{ID: "alice", FirstName: "Alice"})
chat.SendText("Hi")
chat.ExpectBotMessage().Within(2 * time.Second).Text("Howdy stranger")
```

`cw.WithListenAddr` decides the emulator's address before either process
starts, so it can go straight into the bot's environment — the same reason
[`pybot_e2e_test.go`](https://github.com/chatwright/runtime-go/blob/main/examples/pybot/pybot_e2e_test.go)
needs it.

## Environment-variable contract

| Variable | Set by | Meaning |
|---|---|---|
| `TELEGRAM_API_ROOT` | test | Emulator's Bot API base URL (`w.BotAPIURL()`) — passed to `client.apiRoot` |
| `PORT` | test | Local TCP port the bot's webhook listens on |

## What the emulator supports

`ctx.reply` and inline keyboards map onto `sendMessage`/`editMessageText`
with capture and assertion; most other Bot API methods do not exist yet. See
[`../compatibility/telegram.md`](../compatibility/telegram.md) before
relying on anything beyond text, actions and edits.
