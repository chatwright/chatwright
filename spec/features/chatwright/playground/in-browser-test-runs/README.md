---
format: https://specscore.md/feature-specification
status: Draft
---

# Feature: In-browser test runs

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/playground/in-browser-test-runs?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/playground/in-browser-test-runs?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/playground/in-browser-test-runs?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/playground/in-browser-test-runs?op=request-change) |
**Status:** Draft
**Source Ideas:** —

## Summary

Run deterministic and AI-goal test scenarios against a bot entirely in the
Studio Playground, with selectable AI providers (bring-your-own-key, local
models, Chatwright Cloud) and an optional `chatwright server` companion for
local-model proxying, per-call metrics and DTQL side-effect verification.

## Problem

The actor-model arena — an AI actor that drives a bot toward a natural-language
goal, with the run captured as a replayable bundle — exists today only in the Go
runtime and only as the CLI `arena` command over one built-in scenario. A
developer cannot open a bot in the browser and watch an AI test it. Three things
are missing:

1. **No engine in the browser.** The actor loop, semantic observation, goal and
   budget state machine, and the deterministic assertion evaluator live in
   `runtime-go` only; `runtime-ts` — the runtime Studio uses — has the session,
   journal and iframe transport but none of the testing engine. Runtimes are
   meant to ship in lockstep (decision 0015), so this is a parity gap as much as
   a feature gap.
2. **No way to reach a model from the browser.** A model provider needs a key or
   a local server. Studio has no key storage and no provider selection, and a
   page served over HTTPS cannot reach a local model server directly (mixed
   content, per-server CORS).
3. **No honest handling of what a browser cannot verify.** Side-effect
   assertions — a DTQL query over the bot's database — cannot run in a sandboxed
   page at all, and pretending otherwise would violate "fidelity is declared"
   (principle 4).

## Behavior

### The journey

A developer opens the Playground with a bot loaded, chooses an AI provider mode,
selects the built-in scenario or loads a portable scenario document, and runs it.
An AI **actor** drives the conversation toward the scenario's goal while
deterministic **assertions** evaluate against the live journal. When the run
ends the developer sees a per-assertion report (pass / fail / unverified) and a
**run bundle** they can download or open in the Player, replayable entirely
client-side.

### Runs have two kinds of part, both executed in the browser

A run is an ordered list of parts, each `deterministic` or `ai-goal` (glossary:
*run*, *part*). Both execute in the browser:

- **Deterministic parts** run scripted steps and evaluate deterministic
  assertions on the bot's replies — exact / substring / regex text, an expected
  button (label or callback), an in-place edit, a latency bound — against the
  session journal.
- **AI-goal parts** run the ported actor loop: observe the semantic state,
  propose one next action (send text, click, declare done, give up) via the
  provider, validate it (stale clicks and premature done-claims are rejected),
  act through the session, and record the step under step / duration /
  repeated-failure budgets.

Completion stays **evidence over claims** (principle 3): when an AI-goal part
carries a deterministic completion criterion, that criterion decides completion;
the actor's own "done" claim never overrides it.

### The engine lives in the TypeScript runtime

The actor loop, semantic observation, goal / campaign / budget state machine,
provider seam and deterministic evaluator are implemented in `runtime-ts` to
match `runtime-go`'s semantics — one scenario, two runtimes, same verdict
(decision 0015). Studio consumes the engine; it does not host testing logic.
Deviations forced by the browser (iframe/`postMessage` transport instead of an
HTTP emulator; no model-loader step) are recorded in `docs/runtime-parity.md`.

### Three provider modes over one provider seam

All modes satisfy the same narrow provider contract (propose an action from a
prompt); only the endpoint and credentials differ.

- **Bring-your-own-key (default, zero-install).** The user supplies a base URL,
  model and API key. The key is stored only in the browser and calls go directly
  from the browser to the provider. A user's own key is **never** transmitted to
  any Chatwright server (research I-76; decision 0007). The key's exposure
  surface is stated honestly in the UI.
- **Local AI (via the companion server).** The user selects a local model served
  through `chatwright server`; proposals are proxied by the server to the local
  backend (e.g. Ollama, LM Studio) and each call is metered. This is the answer
  to the HTTPS/mixed-content limit: the browser talks only to the local
  companion, which the browser is allowed to reach.
- **Chatwright Cloud (fast-follow).** A managed endpoint with server-side keys, a
  small demo quota and a subscription for real use (decision 0007). The provider
  key is never exposed to the browser. The Cloud proxy backend lands as its own
  slice; the mode is presented with its quota / subscription state meanwhile.

### The `chatwright server` companion

A host-side daemon in the CLI. Command surface:

- `chatwright server serve` — run in the foreground, logging to stdout.
- `chatwright server start` — start a background daemon (PID file + log file).
- `chatwright server stop` — stop the daemon.
- `chatwright server restart` — stop then start.

It listens on a fixed, discoverable local address and exposes: a health endpoint
so Studio can detect it; an AI-proxy endpoint that forwards proposals to a
configured local backend and records per-call metrics (latency, tokens,
structured-output mode); and a side-effect endpoint that evaluates a scenario's
DTQL assertions via dalgo against the configured database. It sends the CORS and
Private-Network-Access response headers the Studio origin requires, accepting two
origins out of the box — `https://chatwright.dev` (the hosted UI) and
`http://chatwright.localhost` (the locally-served UI) — and any origin added by
configuration. Being host-side infrastructure rather than a runtime feature, it
needs no TypeScript twin.

### Local-first offline mode

The companion can also serve the Studio UI itself, so the whole tester runs with
the network unplugged. The Studio build publishes the built UI as a versioned
`studio-ui-<version>.zip` release asset; the server downloads it once into a
local cache, verifies its integrity, and serves it at `http://chatwright.localhost`.
Because the UI and the API are then the same origin, the cross-origin dance does
not apply to the locally-served UI at all. Fully offline means the locally-served
UI plus a local model (proxied by the server) plus local DB verification (via
dalgo) — no internet on any path. The first UI fetch needs the network; every run
after the cache is populated does not. The server records which UI version it is
serving, and refuses a UI whose version is incompatible with its own contract.

### Declared verifiability of assertions

Every assertion outcome is one of pass, fail, or **unverified**, and the surface
never overclaims:

- Bot-reply (deterministic) and, later, AI-judged assertions are verifiable in
  the browser.
- Side-effect (DTQL / data-state, filesystem) assertions are **unverified** when
  no companion server is present — reported as unverified, never pass or fail,
  and never counted as evidence of completion. With `chatwright server` and a
  configured database they become verifiable via dalgo.

### Capability ladder

| Setup | Actor + deterministic assertions | Local models | DB / DTQL assertions |
| --- | --- | --- | --- |
| BYO key, no server | yes (direct browser→provider) | — | unverified (declared) |
| Chatwright Cloud (fast-follow) | yes (managed, quota-gated) | — | unverified (declared) |
| `chatwright server` running | yes (optionally proxied + metered) | yes (proxied + metered) | verified (dalgo) |

### Out of scope for this feature

The provider matrix and per-scenario leaderboards (the arena idea's later
slices); AI-judged assertions (a coordinated Go + TypeScript slice, kept separate
so no AI opinion is mixed with deterministic evidence); a visual scenario-
authoring UI (the portable-scenario schema is still Draft); the Cloud proxy
backend; and multi-actor conversations.

## Dependencies

- chatwright/goal-driven-ai-testing
- chatwright/deterministic-testing
- chatwright/scenario-authoring/portable-scenario-documents
- chatwright/conversation-runtime
- chatwright/cloud

## Acceptance Criteria

### AC: built-in-scenario-runs-in-browser

Scenario: An AI actor drives the built-in scenario against the loaded bot
Given a bot is loaded in the Playground and a working provider is selected
When the user runs the built-in greetbot scenario
Then an AI actor drives the conversation toward the scenario's goal
And each deterministic assertion is reported as pass or fail
And a run bundle is produced that replays the run client-side in the Player

### AC: byok-key-never-leaves-the-browser

Scenario: A bring-your-own-key run keeps the key client-side
Given the user has entered an API key for the bring-your-own-key mode
When runs execute against the configured provider
Then the key is stored only in the browser
And proposal requests go directly from the browser to that provider
And the key is transmitted to no Chatwright server

### AC: local-ai-runs-through-the-companion-server

Scenario: Local models are reached only via chatwright server
Given `chatwright server` is running with a local model configured
When the user selects Local AI and runs a scenario
Then proposals are proxied through the server to the local backend
And each proposal call records its latency, token counts and structured-output mode
And those per-call metrics are shown for the run

### AC: local-ai-unavailable-without-the-server

Scenario: The surface is honest when no companion server is present
Given no `chatwright server` health endpoint answers
When the user opens the provider modes
Then Local AI is presented as unavailable with guidance to start the server
And bring-your-own-key remains available with nothing to install

### AC: side-effect-assertion-is-unverified-in-a-plain-browser

Scenario: A DTQL assertion cannot be verified without the companion server
Given a scenario with a DTQL data-state assertion
And no `chatwright server` is present
When the run completes
Then that assertion is reported as unverified with the browser-limitation reason
And it is never reported as pass or fail
And it is never counted as evidence that the goal completed

### AC: side-effect-assertion-is-verified-with-the-server

Scenario: The same DTQL assertion is verified when the companion server is present
Given `chatwright server` is running with the bot's database configured
When the same scenario runs
Then the DTQL assertion is evaluated via dalgo against that database
And it is reported as pass or fail with the query evidence

### AC: deterministic-evidence-outranks-the-actor-claim

Scenario: A premature "done" claim does not complete the goal
Given an AI-goal part whose task carries a deterministic completion criterion
When the actor proposes "task-done" before that criterion holds
Then the claim is recorded as invalid and the goal is not marked complete
And the goal completes only once the deterministic criterion holds

### AC: portable-scenario-document-loads-safely

Scenario: Loading a scenario document validates before it runs
Given a portable scenario document that names the built-in scenario
When the document is loaded and validated
Then an unsupported schema version or capability is rejected explicitly
And a valid document runs the named scenario
And validation starts no bot and opens no database

### AC: run-bundle-names-provider-and-profile

Scenario: A run bundle carries the evidence a reader needs
Given any completed run
When the user downloads the bundle or opens it in the Player
Then it replays client-side with the actor proposals, observations and assertion outcomes
And it names the provider and model used and the endpoint profile

### AC: cloud-mode-is-quota-gated-and-key-safe

Scenario: Cloud runs enforce the demo limit and hide managed keys
Given the Chatwright Cloud provider and a demo quota
When the user runs beyond the demo limit without a subscription
Then the run is refused with a quota or subscription prompt
And the provider key is never exposed to the browser

### AC: companion-server-lifecycle-commands

Scenario: The daemon can be run in foreground or managed as a background process
Given the CLI is installed
When the user runs `chatwright server start`
Then a background daemon serves on the fixed local address with a PID file and a log file
And `chatwright server stop` terminates it
And `chatwright server restart` cycles it
And `chatwright server serve` runs the same server in the foreground

### AC: companion-accepts-both-default-origins

Scenario: The companion server works with the hosted and the local UI out of the box
Given `chatwright server` with no origin configuration
When a request arrives from `https://chatwright.dev` and, separately, from `http://chatwright.localhost`
Then both receive the CORS and Private-Network-Access headers allowing the call
And an operator can add further allowed origins by configuration

### AC: companion-serves-cached-ui-offline

Scenario: The companion serves the Studio UI so the tester runs offline
Given the Studio UI is published as a versioned release asset
When the companion server is asked to serve the UI
Then it downloads the asset once into a local cache and verifies its integrity
And it serves the UI at `http://chatwright.localhost` same-origin with its API
And once cached, the UI, a local model and DB verification run with no network
And a UI whose version is incompatible with the server contract is refused

### AC: engine-parity-across-runtimes

Scenario: The browser engine matches the Go runtime
Given the actor engine implemented in the TypeScript runtime
When it runs a scenario that the Go runtime also runs
Then it reaches the same verdict for that scenario
And any deviation is recorded in `docs/runtime-parity.md` with its reason

## Open Questions

- Should a bring-your-own-key run be allowed to route through a running
  `chatwright server` (for the same metrics), given the key would stay on the
  user's machine and still never reach a Chatwright server? Default for now:
  bring-your-own-key stays direct.
- What is the fixed default local address for `chatwright server`, and how does
  Studio let a user point at a non-default one?
- Does the first portable scenario document for this surface freeze any field
  beyond the invocation-manifest minimum already proposed in
  `scenario-authoring/portable-scenario-documents`?

---
*This document follows the https://specscore.md/feature-specification*
