---
format: https://specscore.md/decision-specification
status: Approved
---

# Decision: Black-box bots over platform-native payloads; a browser runtime

**Status:** Approved
**Date:** 2026-07-23
**Owner:** alex
**Tags:** runtime, protocol, browser, transport, architecture
**Source Idea:** executable-knowledge-platform
**Supersedes:** —
**Superseded By:** —

## Context

The knowledge platform needs live demos and "connect your own bot" in the
browser. The Go runtime already proves the right boundary: its Telegram
emulator is a real Bot API HTTP server — bots are pointed at
`BotAPIURL()` in place of `api.telegram.org`, receive genuine webhook
updates or long-poll `getUpdates`, and answer with genuine Bot API method
calls; a Python subprocess bot passes the same scenarios as the in-process
Go example with zero shared code. No generic bot API exists anywhere in the
codebase, and none is wanted: platform-neutral types
(`platform.Message`, `platform.JournalEntry`) exist only on the harness
side and never cross the wire to the bot.

The founder direction for the browser: bots load into
`<iframe src="bot-url">` and the runtime communicates with the bot via
`postMessage()`. "Runtime" is an architectural term — the orchestrator
inside the Playground/player component that keeps state and talks to bots —
not a change to website structure.

## Decision

### The contract is the platform's own API

Chatwright defines **no generic bot API**. A Telegram bot receives Telegram
Bot API updates and returns Telegram Bot API method calls; a WhatsApp bot
speaks WhatsApp Cloud API payloads; and so on per platform. Chatwright owns
only the minimal routing envelope where a transport needs one. Existing
development bots therefore connect unmodified.

### Two transports, one mental model: "point your bot at Chatwright"

- **Remote HTTPS bot** — exactly today's Go-runtime pattern, promoted to a
  public contract: the runtime exposes an emulated platform API base URL;
  the bot swaps its API root, registers a webhook or long-polls, and calls
  platform methods against the emulated server. The bot is a black box at
  the end of an HTTPS connection.
- **In-browser iframe bot** — the runtime loads `<iframe src="bot-url">`
  and speaks to it with `postMessage`. The payloads inside are the same
  platform-native JSON; only the envelope is Chatwright's. The iframe is a
  black box: JavaScript, TypeScript, WASM, AI, any framework.

### The iframe envelope (shape, not final spec)

Adopting proven embed-protocol patterns (player.js ready-queueing, Penpal
handshake + MessageChannel handoff):

1. **Handshake**: on load the host sends
   `{chatwright: "hello", protocolVersion, platform}`; the bot answers with
   a hello-ack declaring its protocol version, platform and capability keys
   (decision [0011](0011-executable-knowledge-graph.md)). Origin is
   validated at handshake time against the manifest's declared origin.
2. **Channel handoff**: after the handshake the host transfers a dedicated
   `MessagePort`; all subsequent traffic uses the port, isolating each
   embedded bot instance.
3. **Envelope**: `{id, kind: "update" | "call" | "result", platform,
   payload}` — `id` correlates a bot's `call` (a platform method invocation
   such as `sendMessage`) with the host's `result` (the platform's response
   wire shape); `payload` is passed through opaque and untouched. The
   envelope owns sequencing and identity; the payload owns domain meaning.
4. **Ready-queueing**: updates arriving before hello-ack are buffered and
   flushed in order, so replay and autostart cannot race the iframe's boot.

A small optional shim library may expose a fetch-compatible platform API
base inside the iframe and tunnel it over the port — letting existing bot
frameworks run unmodified in the browser. The shim is convenience; **the
protocol is the contract**.

### runtime-ts: a second runtime implementation, three seams

A new repository, `chatwright/runtime-ts`, scaffolds the browser runtime:
the orchestrator embedded in the Playground/player component, responsible
for scenario execution, the bot registry, request routing, response
correlation, platform emulation, transport abstraction, recording, replay
and state. It re-derives the Go runtime's proven concepts without
mirroring Go idioms, decomposing the Go emulator's monolith into three
seams:

1. **Platform codec** — builds/parses platform-native payloads (per
   platform, isolated, like the Go `telegram` package).
2. **Transport** — iframe-postMessage or remote-HTTPS delivery (like
   webhook push vs `getUpdates`).
3. **Journal + observation** — the append-only, per-chat, versioned-on-edit
   journal as ground truth, with the observation projection for
   correlation, ported as an algorithm from the Go `observe` engine.

Shared contracts are **language-independent formats, never code**: the
run-bundle v1 schema (runtime-ts becomes its second producer,
byte-compatible), the bot-protocol envelope, `CHATWRIGHT.md`
(decision [0013](0013-chatwright-md-federation.md)), capability keys, and
later a portable scenario format. Conformance is proven by shared fixtures,
not shared libraries.

### Recording is effectively free

Both transports pass every update and method call through the runtime's
journal, so transcript, event trace, bot requests and bot responses are
captured as a side effect of routing — the same property the Go runtime
has. Downloading a Recording requires no account; saving to Chatwright
Cloud requires authentication (decision 0007's boundary).

## Rationale

- The boundary is **proven, not speculative**: the Go runtime already runs
  cross-language black-box bots against an emulated platform API server,
  so promoting that pattern to the public contract carries no design risk.
- **Zero-SDK adoption**: existing development bots connect by swapping an
  API root; existing bot frameworks work unmodified. Any invented bot API
  would demand rewrites and cap fidelity at the lowest common denominator.
- **A minimal envelope minimises specification surface**: Chatwright only
  standardises identity, sequencing and negotiation; every platform's own
  wire format stays authoritative, so platform evolution never requires an
  envelope change.
- **Recording as a routing side effect** keeps "recording is effectively
  free" true in the browser exactly as it is in Go.
- The three-seam decomposition mirrors the layering the Go runtime
  converged on (platform codec / transport / journal+observation), which
  the code-split already validated.

## Declined Alternatives

### A generic cross-platform bot API

Rejected: lowest common denominator, forces rewrites, contradicts the
black-box goal and the Go runtime's proven design.

### Web Workers instead of iframes for in-browser bots

Rejected as the primary mode: iframes give origin isolation, arbitrary
hosting of the bot page, and a URL as the bot's address — matching the
federation model where a repository's demo is just a URL. A worker
transport can be added later behind the same envelope if needed.

### Running bots server-side for "in-browser" demos

Rejected as the default: it reintroduces hosting costs and latency for
every visitor interaction; remote HTTPS stays available for bots that
genuinely need a backend.

## Consequences at Decision Time

- `chatwright/runtime-ts` is scaffolded now (interfaces, package structure,
  envelope types); deep implementation is deliberately deferred.
- The envelope's full specification (error semantics, timeouts, sandbox and
  CSP attributes, multi-chat routing, port lifecycle, version negotiation
  edge cases) is a dedicated follow-up design session
  ([research: knowledge platform](../research/knowledge-platform.md)).
- The Go runtime is untouched; its emulated-server pattern is now the
  normative description of the remote transport.
- Platform emulation fidelity in the browser must be declared with the same
  capability keys and honesty rules as everywhere else (decisions 0008 and
  0011); the browser emulator may cover a narrower slice than Go's.
- chatwright.dev currently ships no CSP and no iframe `sandbox` attributes;
  hosting third-party bot iframes requires introducing both from scratch
  before any untrusted bot loads.

## Observed Consequences

None yet — recorded on the day the decision was made.

## Affected Features

- [`conversation-runtime`](../features/chatwright/conversation-runtime/README.md)
- [`platform-emulators`](../features/chatwright/platform-emulators/README.md)
- [`playground`](../features/chatwright/playground/README.md)

## Open Questions

- The full envelope specification is backlog item I-68 in
  [research: knowledge platform](../research/knowledge-platform.md); the
  browser emulator's first fidelity slice is I-67.

*This document follows the https://specscore.md/decision-specification*
