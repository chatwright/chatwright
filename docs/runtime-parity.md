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

## Register

| Feature | runtime-go | runtime-ts | Classification |
|---|---|---|---|
| Telegram: text messages, inline keyboards, message edits (versioned journal) | ✅ | 🚧 first slice in flight | Catch-up (tracked: runtime-ts first-slice work, 2026-07-23) |
| Telegram: webhook delivery to remote HTTPS bots | ✅ | ❌ | **Technical limitation**: a browser page cannot accept inbound HTTP connections, so the browser runtime cannot deliver webhooks to a remote bot directly. Remote-bot support in the browser requires a relay/tunnel design — deferred to research item I-68. Proof: browsers expose no server socket API (no listener primitive in the web platform). |
| Telegram: `getUpdates` long-polling for remote bots | ✅ | ❌ | Same technical limitation as webhook delivery (no inbound server surface); a browser-hosted poll *endpoint* is impossible, though a relay could poll on the page's behalf — same I-68 design. |
| Iframe postMessage transport (bot protocol v1) | ❌ | 🚧 first slice in flight | **Technical limitation (inverse)**: iframes and `postMessage` do not exist in the Go runtime's execution environment; the iframe transport is browser-native by design (decision 0012). Not planned for Go. |
| WhatsApp surface (text, webhook-only) | ✅ (preview) | ❌ | Catch-up (tracked: follows the Telegram slice; capability data in chatwright/recipes marks chatwright-ts unsupported). |
| Deterministic scenario verbs (send/click/expect/edited/within) | ✅ (`cw` package) | ❌ | Catch-up (tracked: the expect layer is the planned slice after runtime-ts core; portable format is I-71). |
| Run-bundle v1 recording | ✅ | 🚧 first slice in flight | Catch-up (tracked: `toBundle()` in the first slice must validate against the schema). |
| Replay (bundle playback) | ❌ (records only) | ✅ (Studio player) | **Technical limitation (inverse-ish)**: playback is a rendering concern; the Go runtime has no UI surface. The player is the shared replay surface for bundles from both runtimes — parity holds at the format level. |
| AI actor loop, campaigns, arena | ✅ | ❌ | Catch-up (tracked: browser-side AI actors deferred until after the Playground slice; design in research items I-66/I-70). |
| Data-state assertions (DTQL), checkpoint/branching | ✅ | ❌ | Catch-up (tracked: requires a browser story for reaching app databases — expected to route through a local CLI bridge, see idea local-studio-continuity). |
| Cassette record/replay for AI providers | ✅ | ❌ | Catch-up (tracked: ports as a concept with the AI actor loop). |

## How to change this file

Adding a runtime feature? Ship it in both runtimes, or add a row here in
the same PR — either "Catch-up (tracked: <link>)" or a technical-limitation
entry with explanation and proof link. Reviews in both runtime
repositories treat a missing register row as a blocking defect.
