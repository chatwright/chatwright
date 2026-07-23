# Chatwright bot protocol — v1

**Format id:** `https://chatwright.dev/formats/bot-protocol/v1`
**Status:** Draft (first implementation in flight; the envelope shapes below
are normative, the deferred list is explicit)
**Decided by:** [decision 0012](../../../spec/decisions/0012-black-box-bot-protocol.md)

## The contract in one sentence

A bot speaks its **platform's own API** — Chatwright adds only transport:
remote bots point their API root at an emulated platform server over HTTPS
(no envelope at all), and in-browser bots exchange the same platform-native
JSON with the runtime through a minimal `postMessage` envelope defined
here.

## Remote transport (HTTPS)

Normative by reference: the platform's real wire protocol. For Telegram,
the runtime serves a Bot API-compatible base URL; the bot swaps
`https://api.telegram.org` for it, receives webhook updates or long-polls
`getUpdates`, and calls methods exactly as against the real platform. There
is nothing Chatwright-specific for the bot to implement.

## Iframe transport (postMessage)

The runtime loads the bot page into
`<iframe sandbox="allow-scripts allow-same-origin" src="{bot-url}">`.
`allow-same-origin` is required so the frame keeps its own real origin for
validation (a fully opaque origin cannot be checked); it grants nothing
toward the host, whose origin differs. Hosts must never load a bot URL
from their own origin without dropping `allow-same-origin`.

### Handshake — the bot speaks first

1. When its listener is attached and it is ready to serve, the bot posts to
   `window.parent` (target origin `"*"` — the message carries no secrets):

   ```json
   {"chatwright": "hello", "protocolVersion": "1", "platform": "telegram",
    "capabilities": ["messaging.buttons.inline", "messaging.message.edit"]}
   ```

   `capabilities` uses capability keys (decision 0011) and declares what the
   bot exercises — informative for fidelity display, not an access control.
2. The host validates `event.origin` against the origin the bot's
   `CHATWRIGHT.md` declares (or the origin the operator configured), and
   replies to that exact origin with a transferred `MessagePort`:

   ```json
   {"chatwright": "hello-ack", "protocolVersion": "1", "platform": "telegram"}
   ```

   The port rides in the message's transfer list. All subsequent traffic
   uses the port exclusively; window-level messages after handshake are
   ignored. Origin is checked at handshake only — the private port pair
   cannot be intercepted by other frames.
3. The bot posts nothing before its `hello`; the host queues outbound
   updates until the handshake completes and then flushes them in order.
   A repeated `hello` after handshake resets the session (the old port is
   closed).

### Envelope — on the port

Every port message is one envelope:

```json
{"id": "u-1", "kind": "update", "platform": "telegram", "payload": { }}
```

- `id` — unique per sender within the session.
- `kind` — `"update"` | `"call"` | `"result"`.
- `payload` — **opaque platform-native JSON, never interpreted by the
  envelope layer.**

Kinds:

- **`update`** (host → bot): `payload` is the platform's update object (for
  Telegram: an `Update` exactly as a webhook would deliver it). No reply
  envelope is expected; updates are fire-and-forget, ordered.
- **`call`** (bot → host): `payload` is
  `{"method": "sendMessage", "params": { }}` — the platform method name
  and its parameters exactly as the bot would POST them to the real API.
- **`result`** (host → bot): same `id` as the `call` it answers; `payload`
  is the platform's response wire shape (for Telegram:
  `{"ok": true, "result": { }}` or
  `{"ok": false, "error_code": 501, "description": " "}`). Unemulated
  methods return the platform's own error shape — never a Chatwright
  error object — so a shim can hand the payload straight back to a
  framework as the HTTP response body.

Machine contract: [`schema.json`](schema.json) (canonical here; the served
copy at chatwright.dev is drift-checked).

## Deferred in v1 (deliberately)

Multi-chat routing metadata beyond what payloads already carry; timeout and
liveness semantics; a transport-level error kind; capability negotiation
beyond declaration; worker (non-iframe) transports; the in-iframe
platform-API shim library. Tracked as research item I-68 in
[spec/research/knowledge-platform.md](../../../spec/research/knowledge-platform.md).
