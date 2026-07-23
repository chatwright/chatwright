# Runtime parity register

**Rule** ([decision 0015](../spec/decisions/0015-runtime-parity.md),
development principle 7): every runtime feature ships in both
[runtime-go](https://github.com/chatwright/runtime-go) and
[runtime-ts](https://github.com/chatwright/runtime-ts) with identical
semantics. Deviations exist only under documented technical limitation.
Catch-up rows are debt with a tracking link; deviation rows carry an
explanation and proof. If a feature is missing from this register, it is
expected to behave identically in both runtimes.

Updated: 2026-07-23 (runtime-ts first slice in flight).

## Status legend

- ✅ **Works** — implemented and proven
- 🚧 **In progress** — being built now
- 📅 **Planned** — parity debt with a tracking pointer; never silently permanent
- ⛔ **Blocked** — technical limitation; the note carries explanation and proof
- ➖ **N/A by design** — does not apply to this runtime's environment (explained)

## Register

| Feature | Go runtime | TS runtime | Note |
|---|---|---|---|
| Telegram emulation: text, inline keyboards, versioned edits | ✅ Works | 🚧 In progress | First TS slice in flight (2026-07-23), semantics mirrored from the Go emulator |
| WhatsApp surface (text, webhook-only) | ✅ Works (preview) | 📅 Planned | Follows the Telegram slice; capability data in chatwright/recipes marks chatwright-ts unsupported meanwhile |
| Remote bots: webhook delivery over HTTPS | ✅ Works | ⛔ Blocked | Browsers cannot accept inbound HTTP (no server/listener primitive in the web platform); needs a relay/tunnel design — research item I-68 |
| Remote bots: `getUpdates` long-polling | ✅ Works | ⛔ Blocked | Same limitation — no inbound server surface in a page; a relay could poll on the page's behalf (I-68) |
| Iframe bots (postMessage, bot protocol v1) | ➖ N/A by design | 🚧 In progress | iframes/`postMessage` do not exist in Go's environment (decision 0012); protocol proven live against greetbot 2026-07-23 |
| Deterministic scenario verbs (send/click/expect/edited/within) | ✅ Works (`cw`) | 📅 Planned | The expect layer is the next TS slice after core; portable scenario format = I-71 ("one file, two runtimes, same verdict") |
| Run-bundle v1 recording | ✅ Works | 🚧 In progress | `toBundle()` in the first slice must validate against the published schema |
| Replay (bundle playback) | ➖ N/A by design | ✅ Works | Playback is a rendering concern; the Studio player is the shared replay surface for bundles from BOTH runtimes — parity holds at the format level |
| AI actors (goal-driven campaigns) | ✅ Works | 📅 Planned | Needs a design for AI API-key security in the browser (keys must not leak into page context); research items I-66/I-70 |
| Arena (model comparison) | ✅ Works | 📅 Planned | Follows browser AI actors |
| Data-state assertions (DTQL) + checkpoint/branching | ✅ Works | 📅 Planned | Browser needs a bridge to app databases — expected via a local CLI bridge (idea: local-studio-continuity) |
| AI cassette record/replay | ✅ Works | 📅 Planned | Ports as a concept together with browser AI actors |

## How to change this file

Adding a runtime feature? Ship it in both runtimes, or add a row here in
the same PR — either "Catch-up (tracked: <link>)" or a technical-limitation
entry with explanation and proof link. Reviews in both runtime
repositories treat a missing register row as a blocking defect.
