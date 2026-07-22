# telebot quickstart

An in-process Go bot built on
[`telebot`](https://github.com/go-telebot/telebot) (`gopkg.in/telebot.v4`)
runs inside the same test binary as Chatwright — the same in-process shape
as [`examples/greetbot`](../../examples/greetbot/), just with `telebot`'s
own settings struct instead of `tgbotapi`'s constructor functions.

**Verified against:** `gopkg.in/telebot.v4` v4.0.0-beta.10 (the version its
own README recommends via `go get -u gopkg.in/telebot.v4`), source read
directly from `bot.go`. **v4 is still tagged beta** at time of writing; if
that matters for your project, `gopkg.in/telebot.v3` (stable, v3.3.8) has the
same `Settings.URL` field.

## What you need

- `go get -u gopkg.in/telebot.v4`
- A `chatwright.Chatwright` from `cw := chatwright.New(t)`

## Point the client at the emulator

`telebot.Settings` has a plain `URL string` field. Leave it empty and
`NewBot` defaults it to `DefaultApiURL` (`"https://api.telegram.org"`); set
it to redirect the whole client, no format string or RoundTripper required:

```go
import tele "gopkg.in/telebot.v4"

b, err := tele.NewBot(tele.Settings{
	Token:  "TEST:TOKEN",
	URL:    cw.BotAPIURL(),
	Poller: &tele.LongPoller{Timeout: 10 * time.Second},
})
```

## Wire it into a Chatwright test

telebot's `*tele.Webhook` poller doubles as an `http.Handler` (`ServeHTTP`)
when its own `Listen` field is left empty — its doc comment says so
explicitly: *"you can also leave the Listen field empty. In this case it is
up to the caller to add the Webhook to a http-mux."* That is exactly
`cw.ServeWebhook`'s job. `IgnoreSetWebhook: true` skips telebot's own
outbound `setWebhook` call, which Chatwright doesn't need:

```go
cw := chatwright.New(t) // Telegram is the default platform
wh := &tele.Webhook{IgnoreSetWebhook: true}
b, err := tele.NewBot(tele.Settings{Token: "TEST:TOKEN", URL: cw.BotAPIURL(), Poller: wh})
if err != nil {
	t.Fatal(err)
}
b.Handle(tele.OnText, func(c tele.Context) error {
	return c.Send("Howdy stranger")
})
go b.Start() // runs the update-dispatch loop; Poll() just parks since Listen == ""
t.Cleanup(b.Stop)
cw.ServeWebhook(wh)

chat := cw.PrivateChat(chatwright.User{ID: "alice", FirstName: "Alice"})
chat.SendText("Hi")
chat.ExpectBotMessage().Within(time.Second).Text("Howdy stranger")
```

## Environment-variable contract

Not applicable — this is an in-process bot, wired the same way as
[go-telegram-bot-api's in-process guide](go-telegram-bot-api.md). The
`TELEGRAM_API_ROOT`/`PORT` contract is for external processes only (see
[`examples/pybot`](../../examples/pybot/)).

## What the emulator supports

`c.Send`/`c.Edit` map onto `sendMessage`/`editMessageText`, and inline
keyboards built with `tele.InlineButton` are captured as neutral actions.
See [`../compatibility/telegram.md`](../compatibility/telegram.md) for the
full, code-verified breakdown of what else is (and is not) modelled.
