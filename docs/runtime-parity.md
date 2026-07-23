# Runtime parity register

**Rule** ([decision 0015](../spec/decisions/0015-runtime-parity.md),
development principle 7): every runtime feature ships in both
[runtime-go](https://github.com/chatwright/runtime-go) and
[runtime-ts](https://github.com/chatwright/runtime-ts) with identical
semantics. Deviations exist only under documented technical limitation.
Catch-up rows are debt with a tracking link; deviation rows carry an
explanation and proof. If a feature is missing from this register, it is
expected to behave identically in both runtimes.

Updated: 2026-07-23 (WhatsApp text-only codec landed in runtime-ts).

## Status legend

- ✅ **Works** — implemented and proven
- 🚧 **In progress** — being built now
- 📅 **Planned** — parity debt with a tracking pointer; never silently permanent
- ⛔ **Blocked** — technical limitation; the note carries explanation and proof
- ➖ **N/A by design** — does not apply to this runtime's environment (explained)

## Register

| Feature | Go runtime | TS runtime | Note |
|---|---|---|---|
| Telegram emulation: text, inline keyboards, versioned edits | ✅ Works | ✅ Works | TS first slice landed 2026-07-23: sendMessage/editMessageText/answerCallbackQuery/getMe, 501+uncaptured for the rest; 20 tests, CI green |
| WhatsApp surface (text, webhook-only) | ✅ Works (preview) | ✅ Works | text-only codec landed 2026-07-23, mirrors the Go emulator's slice (sendMessage/type:"text" → success; anything else → the Cloud API's own error envelope + uncaptured; 12 tests, CI green); interactive buttons = 📅 both runtimes |
| Remote bots: webhook delivery over HTTPS | ✅ Works | ⛔ Blocked | Browsers cannot accept inbound HTTP (no server/listener primitive in the web platform); needs a relay/tunnel design — research item I-68 |
| Remote bots: `getUpdates` long-polling | ✅ Works | ⛔ Blocked | Same limitation — no inbound server surface in a page; a relay could poll on the page's behalf (I-68) |
| Iframe bots (postMessage, bot protocol v1) | ➖ N/A by design | ✅ Works | IframeHost landed (handshake, port handoff, correlation, queueing); protocol proven live against greetbot 2026-07-23 |
| Deterministic scenario verbs (send/click/expect/edited/within) | ✅ Works (`cw`) | ✅ Works | expect layer landed 2026-07-23 (`chatOf`/`Chat`/`BotMessageExpectation` in runtime-ts's `src/expect/`, subscribe-based, per-chat consumption cursor, transcript-in-failure; 25 tests, CI green; covers the founder's [Yes,No]-buttons canonical case); portable file format still I-71 ("one file, two runtimes, same verdict") |
| Run-bundle v1 recording | ✅ Works | ✅ Works | `Session.toBundle()` output validates against the published schema in CI (ajv); single deterministic part per run so far |
| Replay (bundle playback) | ➖ N/A by design | ✅ Works | Playback is a rendering concern; the Studio player is the shared replay surface for bundles from BOTH runtimes — parity holds at the format level |
| AI actors (goal-driven campaigns) | ✅ Works | 📅 Planned | Key-security design = research item I-76; founder direction: bring-your-own-key (client-side, "for the brave") or chatwright.dev subscription (managed keys, "for the lazy/busy") |
| Arena (model comparison) | ✅ Works | 📅 Planned | Follows browser AI actors |
| Data-state assertions (DTQL) + checkpoint/branching | ✅ Works | 📅 Planned | Browser needs a bridge to app databases — expected via a local CLI bridge (idea: local-studio-continuity) |
| AI cassette record/replay | ✅ Works | 📅 Planned | Ports as a concept together with browser AI actors |

## How to change this file

Adding a runtime feature? Ship it in both runtimes, or add a row here in
the same PR — either "Catch-up (tracked: <link>)" or a technical-limitation
entry with explanation and proof link. Reviews in both runtime
repositories treat a missing register row as a blocking defect.
