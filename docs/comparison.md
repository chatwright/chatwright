# Three ways to test a Telegram bot

An honest comparison of the approaches teams actually use, and where Chatwright
sits. Chatwright does not replace unit tests — it covers the seam they cannot.

| | Handler unit test | **Chatwright boundary test** | Live-account smoke test |
|---|---|---|---|
| What runs | Your handler function with mocked inputs | **Your real bot process, real HTTP webhook, emulated Bot API** | Your real bot against real Telegram |
| Catches update-parsing bugs | No — you construct the update struct yourself | **Yes — the emulator sends wire-shaped JSON over HTTP** | Yes |
| Catches outbound API bugs (wrong chat id, bad payload, missed edit) | No — outbound is mocked | **Yes — the bot's real API calls are captured and validated** | Partly — you see symptoms in the chat, not causes |
| Works offline / in CI | Yes | **Yes — no account, token, tunnel or network** | No — needs credentials, network, a public webhook |
| Deterministic / flake-resistant | Yes | **Yes — local, controlled, latency-aware assertions** | No — rate limits, network, shared state |
| Speed per scenario | Milliseconds | **Tens of milliseconds** | Seconds to minutes |
| Multi-user / multi-chat scenarios | Hard — hand-built fixtures | **First-class: multiple users, identities and chats** | Painful — real accounts per participant |
| Inline buttons, clicks, in-place edits | Only as struct assertions | **First-class: `ExpectAction(...).Click()`, `ExpectEdited()`** | Manual eyeballing |
| Evidence on failure | Stack trace | **Transcript + captured API calls + latency metrics** | Screenshots and guesswork |
| Fidelity to real Telegram | None claimed | **Declared per profile — see the [compatibility profile](compatibility/telegram.md)** | Perfect, by definition |
| Any language/framework | Your language's test tools | **Yes — the bot only needs HTTP** | Yes |

## When to use which

- **Unit tests** stay the right tool for pure logic inside your handlers.
- **Chatwright** covers the integration seam where most bot bugs live: a
  platform-shaped update crosses your real webhook, your code runs, and its
  outbound API calls become messages, edits and actions in a stateful chat —
  locally, deterministically, in CI.
- **A live smoke test** remains worth keeping — one, run rarely — as the final
  fidelity check against real Telegram. Chatwright's declared compatibility
  profile tells you exactly what that smoke test still needs to cover.
