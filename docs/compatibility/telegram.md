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
source — [`telegram/emulator.go`](../../telegram/emulator.go),
[`chat.go`](../../chat.go) and [`expect.go`](../../expect.go) — on the `main`
branch, not against the aspirational behaviour described in `spec/features/`.
Where the specification describes a target the code does not yet reach, that
gap is called out explicitly rather than silently assumed. This is v1 of the
profile: it will change, in both directions, as the emulator's declared
supported slice grows and hardens. If you find a discrepancy between this
document and actual behaviour, please open a
[bug report](../../.github/ISSUE_TEMPLATE/bug_report.md) — an inaccurate
compatibility claim is treated as a bug in its own right.

**Known issue.** The single biggest gap in this profile: the emulator's HTTP
handler currently **blanket-acknowledges any Bot API method it does not
specifically implement**, returning a fake `{"ok":true}` success instead of a
"method not supported" error. This means a bot that calls an unsupported
method today (e.g. sending a photo) gets silent fake success rather than a
clear, honest failure. It directly conflicts with the Phase 0 exit gate in the
roadmap ("no blanket fake-API success hides a supported method error") and is
a known issue being tracked for a fix — see the "Unsupported (blanket-
acknowledged)" rows below.

## Scope

- Module: `github.com/chatwright/chatwright`, package `telegram`.
- Chat shape: private 1:1 chats only (`Chatwright.PrivateChat`). No group or
  channel modelling exists in this code.
- One emulated bot identity per running emulator, always `ChatwrightBot` /
  `chatwright_bot` with numeric ID `1` — see the `getMe` row below.
- Transport: real HTTP only. The emulator runs as an `httptest.Server`; the
  bot under test is pointed at it via `BotAPIURL()` in place of
  `https://api.telegram.org`, and inbound updates are POSTed to the bot's real
  webhook (`ServeWebhook` or `WebhookAt`).

## Bot API methods (bot → emulator)

| Method | Status | Notes |
|---|---|---|
| `getMe` | **Supported** | Always returns the same fixed identity (`ID: 1`, `IsBot: true`, `FirstName: "ChatwrightBot"`, `UserName: "chatwright_bot"`), regardless of the token in the request path or any configuration. There is no way today to make the emulator report a different bot identity. |
| `sendMessage` | **Supported, unvalidated** | Accepts `chat_id`, `text` and `reply_markup` from either an `application/json` or a form-urlencoded (`application/x-www-form-urlencoded`) request body. Every call succeeds: there is no validation of `chat_id` referring to a real chat, no check that `text` is non-empty or within Telegram's length limits, and no handling of `parse_mode`, entities, or any other field. This is a real gap against the roadmap's stated Phase 1 goal of "validating fake Bot API methods ... including realistic error responses" — validation exists for edits (below) but not for sends yet. |
| `editMessageText` | **Supported, partially validated** | Looks up the message by `(chat_id, message_id)` among calls this emulator instance has recorded; if found, mutates its `text` and (if a new `reply_markup` was supplied) its inline keyboard in place, and increments an internal version counter so `WaitForEdit` can observe the change. If the message is **not** found for that chat, it returns a Telegram-shaped error envelope (`{"ok":false,"error_code":400,"description":"message to edit not found"}`) — the one method in this emulator with a real error path. **Caveat found while writing this profile:** unlike `sendMessage`, this handler only calls `r.ParseForm()` — it has no `application/json` branch. The bundled `bots-go-framework` Telegram client (used by the example bots) always POSTs Bot API calls form-encoded, so it is unaffected, but a bot that sends `editMessageText` as a JSON body (which real Telegram accepts) will have `chat_id`/`message_id`/`text` read back as empty by the emulator today. |
| Everything else — `answerCallbackQuery`, `setWebhook`, `deleteWebhook`, `setMyCommands`, `sendPhoto`, `sendDocument`, `sendVideo`, `sendAudio`, `sendSticker`, `sendLocation`, `sendContact`, `sendPoll`, `deleteMessage`, `forwardMessage`, `pinChatMessage`, `restrictChatMember`, ... — every Bot API method not named above | **Unsupported (blanket-acknowledged)** | The router's `default` case returns a bare `{"ok":true,"result":true}` for *any* unrecognised method name, with no state change and no record kept. This is deliberately lenient today ("so arbitrary bots don't error") but means these calls are indistinguishable from success in a test — see the "Known issue" callout above. |

There is also no authentication check on the bot token in the URL path
(`/bot<token>/<method>`): `parsePath` extracts it but the handler discards it,
so any token — or none — is accepted for every method.

## Update types (emulator → bot, inbound)

| Update type | Status | Notes |
|---|---|---|
| `message` (plain text) | **Supported** | `EncodeInboundText` builds a private-chat `Update` with a `Message` carrying `Text`, `From` (the neutral `User`) and a `Chat` of `Type: "private"`. Driven by `Chat.SendText`. |
| `callback_query` | **Supported** | `EncodeCallback` builds an `Update` with a `CallbackQuery` carrying the clicked action's stable ID as `Data`, a synthetic `CallbackID`, and a reference back to the original message (`MessageID`, `Chat`). Driven by `Action.Click()` when the clicked action has a non-empty `ID`; if it has none, `Click()` falls back to sending the action's label as plain text instead of a callback. |
| `edited_message` (user edits their own message) | **Unsupported** | There is no `Inbound`-side verb for a user editing a message they already sent. Only bot-side edits (`editMessageText`, above) are modelled. |
| Media messages — photo, document, video, audio, voice, sticker, location, contact, poll, etc. (inbound) | **Unsupported** | No `Inbound` type or encoder exists for any inbound media; the only inbound content is plain text. |
| Group/channel updates — `my_chat_member`, `chat_member`, new/left chat members, channel posts, etc. | **Unsupported** | `PrivateChat` is the only chat constructor in `chat.go`; there is no group, channel, or membership-event modelling anywhere in this code. |

## Capabilities

| Capability | Status | Notes |
|---|---|---|
| Multiple user identities, isolated private chats | **Supported** | `PrivateChat(user)` derives a stable per-user `int64` chat ID by hashing `user.ID` (FNV-64a); different users get different, stable chat IDs across a test. |
| Multiple bot identities | **Not implemented** | Every emulator instance reports the one hardcoded `ChatwrightBot` identity via `getMe` (see above) — there is no way to configure a different bot identity or run more than one bot persona per emulator today. |
| Real HTTP webhook delivery | **Supported** | `ServeWebhook` stands up an `httptest.Server` around the given `http.Handler`; `WebhookAt` points at an already-running process. Both deliver every encoded update as a real HTTP `POST`; `chatwright.go`'s `post()` fails the test outright on a non-2xx response. There is currently no non-HTTP ("direct handler call") delivery mode in this code, even though the Server/API Emulator feature spec describes one as a planned lower-fidelity option — that mode is aspirational, not implemented. |
| Inline keyboard actions / callback queries | **Supported** | `reply_markup` is parsed as `tgbotapi.InlineKeyboardMarkup` on both `sendMessage` and `editMessageText`, and normalised into neutral `platform.Action` rows (`Label`, `ID`, `URL`). `BotMessage.ExpectAction(row, col)` and `Action.Click()`/`.Label()`/`.ID()` in `expect.go` are the scenario-facing verbs. |
| Reply keyboards (non-inline) | **Unsupported** | Only `InlineKeyboardMarkup` is parsed from `reply_markup`; there is no handling of `ReplyKeyboardMarkup`, `ReplyKeyboardRemove` or `ForceReply`. |
| In-place message edits | **Supported** | `editMessageText` mutates the stored message and bumps a `version` counter; `Emulator.WaitForEdit` blocks until a message's version exceeds a baseline. `BotMessage.ExpectEdited()` in `expect.go` is the scenario-facing verb, and correctly re-resolves against the *edited* message's new identity rather than waiting for a new outbound message. |
| Stable message identity across edits | **Supported** | Message IDs come from a single counter (`nextMessageID`) that is **global to the emulator instance, not per-chat** — every `outgoing` call across every chat shares one sequence. An edit mutates the existing `outgoing` entry rather than appending a new one, so `MessageID` and accumulated `Version` are consistent across `WaitForMessage`/`WaitForEdit` calls for the same message. |
| Latency assertion (`Within`) | **Supported** | `BotMessage.Within(d)` sets the wait window and, once the message resolves, compares the observed latency (`msg.ReceivedAt` minus the chat's `lastSent` timestamp, captured in `Chat.SendText`/`Action.Click()`) against `d`, failing the test via `t.Errorf` if it was exceeded. `BotMessage.Metrics()` exposes the same `Latency` value. |
| Size/count metrics beyond latency | **Not implemented** | `chat.go` and `expect.go` only capture per-message latency; there is no size or count metric collection at message, actor, bot, chat, scenario or run scope in this code path, despite that being part of the roadmap's stated Initial supported profile. |
| Deterministic wait (no sleep-based polling) | **Supported** | `WaitForMessage`/`WaitForEdit` block on a broadcast channel (`updated`) that is closed and replaced on every new call, rather than polling on a fixed interval — a genuine, code-verified deterministic-draining property, not merely a documented intent. |
| Bot API error responses | **Partial** | Only `editMessageText`'s "message not found" case returns a Telegram-shaped `{"ok":false,...}` error; `sendMessage` and every blanket-acknowledged method always report success. Configurable/injectable error conditions (as described in the Server/API Emulator feature's `AC: api-errors-are-controllable`) do not exist in this code yet. |
| Rate limits, retries, duplicate delivery, webhook secrets | **Not implemented** | No code path in `telegram/emulator.go` touches rate limiting, delivery retries, duplicate-update handling, or webhook-secret verification. These remain open questions in the Server/API Emulator feature spec, not shipped behaviour. |
| Bot token / auth validation | **Unsupported** | As noted above, the token segment of the request path is parsed but discarded; nothing checks it against a configured value. |

## Deliberate exclusions (by design, not by gap)

Per [`docs/roadmap.md`](../roadmap.md), Phase 1 deliberately excludes full
Telegram media/group/channel/reaction/rate-limit coverage, arbitrary goroutine
detection, Starlark, AI actors, hosted accounts, and full WhatsApp support.
Several rows above ("Unsupported") land inside that exclusion; the profile is
not attempting to hide them as bugs — they are simply not in scope for the
current phase. What *is* a gap, and is being tracked, is the blanket
acknowledgement of unsupported Bot API methods (see "Known issue" above),
because it silently hides an unsupported-method error instead of surfacing it.

## Related reading

- [`docs/roadmap.md`](../roadmap.md) — Phase 1's "Initial supported profile"
  and "Deliberate exclusions".
- [Telegram Platform Emulator](../../spec/features/chatwright/platform-emulators/telegram/README.md)
  and its [Server/API Emulator](../../spec/features/chatwright/platform-emulators/telegram/server-api/README.md)
  child feature — the target behaviour this profile is measured against.
- [`docs/glossary.md`](../glossary.md) — canonical meaning of *fidelity
  labels*, *Platform Emulator*, and *endpoint profile*.
