# Telegram compatibility profile — v1

## Fidelity is declared

This document exists because Chatwright's product principle 6 is **"Fidelity
is declared"**: HTTP/direct, faithful/logical, and supported/partial/
unsupported labels must be visible rather than implied (see
[`docs/roadmap.md`](../roadmap.md) and the
[Telegram Platform Emulator feature](../../spec/features/chatwright/platform-emulators/telegram/README.md),
`AC: profile-does-not-claim-full-parity`). The Telegram Platform Emulator does
**not** claim full Telegram feature parity, now or as a long-term promise for
every capability — it claims exactly what is listed below, and nothing more.

Every claim in this document was checked directly against the emulator's
source in [runtime-go](https://github.com/chatwright/runtime-go) —
[`telegram/emulator.go`](https://github.com/chatwright/runtime-go/blob/main/telegram/emulator.go),
[`cw/chat.go`](https://github.com/chatwright/runtime-go/blob/main/cw/chat.go)
and [`cw/expect.go`](https://github.com/chatwright/runtime-go/blob/main/cw/expect.go)
— on its `main` branch, not against the aspirational behaviour described in
`spec/features/`.
Where the specification describes a target the code does not yet reach, that
gap is called out explicitly rather than silently assumed. This is v1 of the
profile: it will change, in both directions, as the emulator's declared
supported slice grows and hardens. If you find a discrepancy between this
document and actual behaviour, please open a
[bug report](../../.github/ISSUE_TEMPLATE/bug_report.md) — an inaccurate
compatibility claim is treated as a bug in its own right.

**Resolved since v1's first draft.** The blanket fake-API success this
section used to flag — every unrecognised Bot API method silently returning
`{"ok":true}` — is fixed for message-producing calls: an unrecognised method
now returns a Telegram-shaped `{"ok":false,"error_code":501,...}` error and is
recorded in the per-chat journal, so a test failure's transcript can show the
bot tried to do something chatwright doesn't capture (e.g. `sendPhoto`)
instead of a bare "no message arrived". A small allowlist of genuinely
content-free methods (`setWebhook`, `deleteWebhook`, `answerCallbackQuery`,
`setMyCommands`) still returns `{"ok":true}` deliberately — see the Bot API
methods table below.

## Scope

- Module: `chatwright.dev/runtime`, package `telegram`.
- Chat shape: private 1:1 chats only (`Chatwright.PrivateChat`). No group or
  channel modelling exists in this code.
- One emulated bot identity per running emulator, always `ChatwrightBot` /
  `chatwright_bot` with numeric ID `1` — see the `getMe` row below.
- Transport: real HTTP only. The emulator runs as an `httptest.Server`; the
  bot under test is pointed at it via `BotAPIURL()` in place of
  `https://api.telegram.org`. Inbound updates reach the bot one of two ways:
  pushed as a real HTTP `POST` to a webhook (`ServeWebhook` or `WebhookAt`),
  or — when no webhook is configured — queued for the bot's own `getUpdates`
  long-polling loop to retrieve. Both are real HTTP; there is still no
  non-HTTP ("direct handler call") delivery mode.

## Bot API methods (bot → emulator)

| Method | Status | Notes |
|---|---|---|
| `getMe` | **Supported** | Always returns the same fixed identity (`ID: 1`, `IsBot: true`, `FirstName: "ChatwrightBot"`, `UserName: "chatwright_bot"`), regardless of the token in the request path or any configuration. There is no way today to make the emulator report a different bot identity. |
| `getUpdates` | **Supported, subset** | A good-enough subset of the real long-polling endpoint: `offset` acknowledges — updates with `update_id < offset` are dropped from the queue and never resent — and `timeout` (seconds) long-polls when nothing is queued yet; `limit` is honoured, capped at 100. Only reachable when no webhook is configured (`SetWebhook("", nil)`, or simply never calling `ServeWebhook`/`WebhookAt`) — otherwise every update is pushed and nothing is queued. There is no `allowed_updates` filtering. |
| `sendMessage` | **Supported, validated** | Accepts `chat_id`, `text` and `reply_markup` from either an `application/json` or a form-urlencoded request body. `chat_id` and non-empty `text` are now required — a missing field or a body that fails to parse returns a Telegram-shaped `{"ok":false,"error_code":400,...}` error instead of silently succeeding. There is still no check of `text` against Telegram's length limits, and no handling of `parse_mode`, entities, or any other field. The response's `result.message_id` is assigned from the chat's shared message-ID sequence (see "Stable message identity" below), not a placeholder. |
| `editMessageText` | **Supported, validated** | Accepts `chat_id`, `message_id`, `text` and `reply_markup` from either an `application/json` or a form-urlencoded body (previously only form bodies were parsed — a bot editing via JSON, e.g. a non-Go client, silently had every field read back empty). `chat_id` and `message_id` are now required, and a body that fails to parse returns 400. Looks up the message among this emulator instance's journal; if found, appends a new, versioned journal entry for it (not a mutation of the original — see "Stable message identity" below) so `WaitForEdit` can observe the change, and if a new `reply_markup` was not supplied, keeps the message's existing keyboard. If the message is not found for that chat, returns `{"ok":false,"error_code":400,"description":"message to edit not found"}`. |
| `answerCallbackQuery`, `setWebhook`, `deleteWebhook`, `setMyCommands` | **Acknowledged, no-op** | These produce no observable chat content, and well-behaved bots routinely call them, so the emulator always returns `{"ok":true,"result":true}` for them and — unlike the row below — does not record them in the journal. |
| Everything else — `sendPhoto`, `sendDocument`, `sendVideo`, `sendAudio`, `sendSticker`, `sendLocation`, `sendContact`, `sendPoll`, `deleteMessage`, `forwardMessage`, `pinChatMessage`, `restrictChatMember`, ... — every Bot API method not named above | **Unsupported, errors** | Returns a Telegram-shaped error, `{"ok":false,"error_code":501,"description":"method not emulated: <method>"}` (HTTP 501; real Telegram never returns that code — it is chatwright's own "not emulated" signal, distinct from a genuine 400), and is recorded in the journal against whatever `chat_id` the request carried (best-effort; not all such methods use one). A subsequent assertion failure's transcript surfaces it, e.g. `bot also called sendPhoto (uncaptured)`, instead of masking it as fake success. |

The bot token in the request path (`/bot<token>/<method>`) is still not
authenticated — any token, or none, is accepted for every method — but it is
now recorded (unvalidated) on journal entries for `sendMessage`,
`editMessageText` and unsupported calls, as a seam for future multi-bot
identity; nothing reads it back yet.

## Update types (emulator → bot, inbound)

| Update type | Status | Notes |
|---|---|---|
| `message` (plain text) | **Supported** | `Emulator.SubmitText` reserves the message's ID from the chat's shared sequence, journals it, and builds a private-chat `Update` with a `Message` carrying `Text`, `From` (the neutral `User`) and a `Chat` of `Type: "private"`. Driven by `Chat.SendText`. |
| `callback_query` | **Supported** | `Emulator.SubmitClick` journals the click and builds an `Update` with a `CallbackQuery` carrying the clicked action's stable ID as `Data`, a synthetic `CallbackID`, and a reference back to the original message (`MessageID`, `Chat`). Driven by `Action.Click()` when the clicked action has a non-empty `ID`; if it has none, `Click()` falls back to sending the action's label as plain text instead of a callback. |
| `edited_message` (user edits their own message) | **Unsupported** | There is no verb for a user editing a message they already sent. Only bot-side edits (`editMessageText`, above) are modelled. |
| Media messages — photo, document, video, audio, voice, sticker, location, contact, poll, etc. (inbound) | **Unsupported** | No submit path or encoder exists for any inbound media; the only inbound content is plain text. |
| Group/channel updates — `my_chat_member`, `chat_member`, new/left chat members, channel posts, etc. | **Unsupported** | `PrivateChat` is the only chat constructor in `chat.go`; there is no group, channel, or membership-event modelling anywhere in this code. |

## Capabilities

| Capability | Status | Notes |
|---|---|---|
| Multiple user identities, isolated private chats | **Supported** | `PrivateChat(user)` derives a stable per-user `int64` chat ID by hashing `user.ID` (FNV-64a); different users get different, stable chat IDs across a test, and calling it twice for the same user returns the same `*Chat` handle. |
| Multiple bot identities | **Not implemented** | Every emulator instance reports the one hardcoded `ChatwrightBot` identity via `getMe` (see above) — there is no way to configure a different bot identity or run more than one bot persona per emulator today. The now-recorded (but unvalidated) request token is a seam for this, not an implementation of it. |
| Update delivery: webhook push or `getUpdates` poll | **Supported** | `Emulator.SetWebhook(url, client)` (called by `ServeWebhook`/`WebhookAt`) registers where updates are pushed; every `SubmitText`/`SubmitClick` call blocks on that real HTTP `POST` and returns an error on a non-2xx response or transport failure, which the harness turns into a test failure. With no webhook configured, updates queue instead and are served via `getUpdates` (see above) — a Telegram bot token is one or the other, never both, matching real behaviour. There is still no non-HTTP ("direct handler call") delivery mode, even though the Server/API Emulator feature spec describes one as a planned lower-fidelity option — that mode is aspirational, not implemented. |
| Inline keyboard actions / callback queries | **Supported** | `reply_markup` is parsed as `tgbotapi.InlineKeyboardMarkup` on both `sendMessage` and `editMessageText`, and normalised into neutral `platform.Action` rows (`Label`, `ID`, `URL`). `BotMessage.ExpectAction(row, col)` and `Action.Click()`/`.Label()`/`.ID()` in `expect.go` are the scenario-facing verbs. |
| Reply keyboards (non-inline) | **Unsupported** | Only `InlineKeyboardMarkup` is parsed from `reply_markup`; there is no handling of `ReplyKeyboardMarkup`, `ReplyKeyboardRemove` or `ForceReply`. |
| In-place message edits | **Supported** | `editMessageText` appends a new, versioned journal entry rather than mutating the message in place; `Emulator.WaitForEdit` blocks until a message's version exceeds a baseline. `BotMessage.ExpectEdited()` in `expect.go` is the scenario-facing verb, and correctly re-resolves against the *edited* message's new identity rather than waiting for a new outbound message. |
| Stable message identity across edits | **Supported** | Message IDs come from a sequence keyed **per chat**, shared by inbound and outbound messages alike (matching real Telegram's per-chat `message_id` space) — a user's message and the bot's reply to it can never collide, which they previously could when both counters started at 1 independently. The journal is append-only: an edit appends a new, higher-version entry for the same message ID rather than mutating a prior one, so intermediate content and true call order both survive; `WaitForMessage`/`WaitForEdit` derive current (highest-version) state from it. |
| Latency assertion (`Within`) | **Supported** | `BotMessage.Within(d)` records a latency *budget*, asserted once a reply arrives — it no longer shortens how long Chatwright waits for it. That ceiling is a separate, harness-wide safety timeout (`Chatwright.safetyTimeout`, default 5s, overridable with `WithSafetyTimeout`), extended to `d` if a budget exceeds it. A reply arriving after its budget but before the safety timeout fails showing the observed latency, the budget, and the reply's actual text; no reply by the safety timeout fails with the transcript (see below). `BotMessage.Metrics()` exposes the captured `Latency`. |
| Size/count metrics beyond latency | **Not implemented** | `chat.go` and `expect.go` only capture per-message latency; there is no size or count metric collection at message, actor, bot, chat, scenario or run scope in this code path, despite that being part of the roadmap's stated Initial supported profile. |
| Deterministic wait (no sleep-based polling) | **Supported** | `WaitForMessage`/`WaitForEdit`/`getUpdates` all block on a broadcast channel (`updated`) that is closed and replaced on every journal append or queued update, rather than polling on a fixed interval — a genuine, code-verified deterministic-draining property, not merely a documented intent. |
| Per-chat transcript | **Supported** | `Emulator.Transcript(chatID)` renders a chronological, human-readable dump of everything recorded for a chat — inbound messages, outbound messages at their current (possibly-edited) text, button clicks, and uncaptured calls to unsupported methods — and is included in the failure message for a timed-out `ExpectBotMessage`/`ExpectEdited`, a missing `ExpectAction`, and `ExpectNoMessage`'s unexpected-reply case. |
| Bot API error responses | **Supported for the modelled surface** | `sendMessage` and `editMessageText` both validate required fields and malformed bodies (400), `editMessageText` also reports a missing target message (400), and any unrecognised, non-allowlisted method reports `501` (see the Bot API methods table). What's still missing: configurable/injectable error conditions on the *supported* path (rate limits, transient 5xx, `429 retry_after`) as described in the Server/API Emulator feature's `AC: api-errors-are-controllable` — every currently-valid `sendMessage`/`editMessageText` call still always succeeds. |
| Rate limits, retries, duplicate delivery, webhook secrets | **Not implemented** | No code path in `telegram/emulator.go` touches rate limiting, delivery retries, duplicate-update handling, or webhook-secret verification. These remain open questions in the Server/API Emulator feature spec, not shipped behaviour. |
| Bot token / auth validation | **Unsupported** | The token segment of the request path is parsed and now recorded on journal entries (see above), but nothing validates it against a configured value or uses it to route to a specific bot identity. |

## Deliberate exclusions (by design, not by gap)

Per [`docs/roadmap.md`](../roadmap.md), Phase 1 deliberately excludes full
Telegram media/group/channel/reaction/rate-limit coverage, arbitrary goroutine
detection, Starlark, AI actors, hosted accounts, and full WhatsApp support.
Several rows above ("Unsupported") land inside that exclusion; the profile is
not attempting to hide them as bugs — they are simply not in scope for the
current phase. The blanket-acknowledgement gap this document originally
tracked as a known issue is resolved (see above); what remains open is fault
injection on the *supported* methods (rate limits, 5xx, retries), which stays
a roadmap item, not a present-tense claim.

## Related reading

- [`docs/roadmap.md`](../roadmap.md) — Phase 1's "Initial supported profile"
  and "Deliberate exclusions".
- [Telegram Platform Emulator](../../spec/features/chatwright/platform-emulators/telegram/README.md)
  and its [Server/API Emulator](../../spec/features/chatwright/platform-emulators/telegram/server-api/README.md)
  child feature — the target behaviour this profile is measured against.
- [`docs/glossary.md`](../glossary.md) — canonical meaning of *fidelity
  labels*, *Platform Emulator*, and *endpoint profile*.
