# go-telegram-bot-api (tgbotapi) quickstart

An in-process Go bot built on
[`go-telegram-bot-api/telegram-bot-api`](https://github.com/go-telegram-bot-api/telegram-bot-api)
runs inside the same test binary as Chatwright, so it is wired the way
[`examples/greetbot`](../../examples/greetbot/) is wired — no separate
process, no environment variables.

**Verified against:** `github.com/go-telegram-bot-api/telegram-bot-api/v5`
v5.5.1 (its latest tagged release), source read directly from `bot.go`.

## What you need

- `go get github.com/go-telegram-bot-api/telegram-bot-api/v5`
- A `chatwright.Chatwright` from `cw := chatwright.New(t)`

## Point the client at the emulator

v5.5.1 ships a constructor that takes an API endpoint directly, no
RoundTripper needed. The catch: `apiEndpoint` is a `fmt.Sprintf` template
with **two** `%s` verbs (token, method) — the same shape as the package's own
`APIEndpoint` constant, `"https://api.telegram.org/bot%s/%s"` — so keep the
`/bot%s/%s` suffix when substituting the host:

```go
import tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"

endpoint := cw.BotAPIURL() + "/bot%s/%s" // %s, %s = token, method
bot, err := tgbotapi.NewBotAPIWithAPIEndpoint("TEST:TOKEN", endpoint)
```

**Fallback — the RoundTripper redirect trick.** Not every tgbotapi-shaped
client exposes an endpoint constructor — this repository's own
[`examples/greetbot`](../../examples/greetbot/greetbot.go) is built on an
in-house fork that only exposes `NewBotAPIWithClient(token, client)`, so it
redirects scheme+host at the transport layer instead. The same trick works
against any client whose endpoint is a compile-time constant:

```go
func redirect(base *url.URL) http.RoundTripper {
	return roundTripFunc(func(r *http.Request) (*http.Response, error) {
		r.URL.Scheme, r.URL.Host, r.Host = base.Scheme, base.Host, base.Host
		return http.DefaultTransport.RoundTrip(r)
	})
}
// bot, err := tgbotapi.NewBotAPIWithClient(token, &http.Client{Transport: redirect(base)})
```

## Wire it into a Chatwright test

```go
cw := chatwright.New(t) // Telegram is the default platform
bot, err := tgbotapi.NewBotAPIWithAPIEndpoint("TEST:TOKEN", cw.BotAPIURL()+"/bot%s/%s")
if err != nil {
	t.Fatal(err)
}
cw.ServeWebhook(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
	var update tgbotapi.Update
	_ = json.NewDecoder(r.Body).Decode(&update)
	if update.Message != nil {
		_, _ = bot.Send(tgbotapi.NewMessage(update.Message.Chat.ID, "Howdy stranger"))
	}
	w.WriteHeader(http.StatusOK)
}))

chat := cw.PrivateChat(chatwright.User{ID: "alice", FirstName: "Alice"})
chat.SendText("Hi")
chat.ExpectBotMessage().Within(time.Second).Text("Howdy stranger")
```

`ServeWebhook` (not `WebhookAt`) is correct here: the bot's handler lives in
the same process as the test, so Chatwright runs it on its own local
listener rather than attaching to one you started yourself.

## Environment-variable contract

Not applicable — this is an in-process bot. There is no separate process to
configure, so the `TELEGRAM_API_ROOT`/`PORT` contract used by external
processes (see [`examples/pybot`](../../examples/pybot/)) does not apply;
the endpoint is set directly at construction time, in Go, as above.

## What the emulator supports

`bot.Send` for `sendMessage`/`editMessageText` and inline keyboards are
captured and asserted; most other Bot API methods are not. See
[`../compatibility/telegram.md`](../compatibility/telegram.md) for the full,
code-verified breakdown before relying on anything beyond text, actions and
edits.
