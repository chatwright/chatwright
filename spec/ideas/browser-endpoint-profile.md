---
format: https://specscore.md/idea-specification
status: Draft
---

# Idea: Browser endpoint profile: driving real web applications

**Status:** Draft
**Date:** 2026-07-30
**Owner:** alex
**Promotes To:** —
**Supersedes:** —
**Related Ideas:** extends:chatwright, extends:exploration-to-regression

## Problem Statement

How might Chatwright add a real browser as a new declared endpoint profile —
driving a real web application's UI directly, with N independently
authenticated browser contexts as first-class actors — without collapsing its
bot/platform model or silently overclaiming chat-platform fidelity for
something that is not a chat platform at all?

## Context

This is a design-only advancement of research item **I-66** ("Browser runtime
internals") in
[`spec/research/knowledge-platform.md`](../research/knowledge-platform.md).
No runtime code accompanies it.

**Terminology collision, resolved up front.** "Browser runtime" already means
something in this codebase, and it is not what this idea is about. Decision
[0012](../decisions/0012-black-box-bot-protocol.md) and
`runtime-ts/src/runtime/runtime.ts:1-98` use "runtime" for the orchestrator
*embedded inside a browser tab* — `ChatwrightRuntime`, the Playground/player
component that keeps state and talks to bots over `postMessage`. That
orchestrator runs **in** a browser, driving emulated chat platforms and
iframe-hosted bots; I-66's literal question ("how does runtime-ts structure
orchestration... inside the Playground/player component") is about that
surface. This idea is the opposite relationship: a Chatwright runtime, running
server- or CLI-side, **driving** an external, real browser as its target — no
chat platform involved, nothing emulated. The two ideas share a noun and
almost nothing else. Everywhere below, "the browser profile" means the latter;
"the Playground orchestrator" or "runtime-ts's own runtime" means the former,
and I-66's original question about that orchestrator stays open, unaddressed
here.

**Why this is filed under I-66 anyway.** It is the founder's own framing,
already recorded in a downstream, already-approved plan:
`sneat-co/chess`'s
[`spec/plans/browser-play-surface.md`](https://github.com/sneat-co/chess/blob/main/spec/plans/browser-play-surface.md)
Task 6 states "Chatwright's own browser runtime (research item I-66) is
designed in parallel and absorbs this suite later." Nothing else in the
research backlog owns "what does it mean for a browser to be a Chatwright
target" — I-67/I-68/I-69 are about the browser-*hosted* Telegram/WhatsApp
emulator and bot protocol, I-70 is about turning an existing Playground
session into a regression test, neither is about testing an arbitrary,
unrelated real web application. I-66 is the closest anchor because "browser"
is the only word in the backlog that names the concept at all. This document
treats that as a scope broadening of I-66, not a resolution of its literal
question, and says so rather than quietly answering a different question under
the same ID (development principle 4).

**The forcing workload.** ChessRaiders (`sneat-co/chess`) needs a two-browser
end-to-end proof: two independently signed-in browser sessions — separate
cookies, separate IndexedDB, separate Firebase auth — playing one real-time
match. Founder decision 2026-07-30: that scenario ships now, directly on
Playwright inside the chess repository (Task 6, unblocked by this idea); this
document designs the path by which Chatwright could eventually express and run
the *same* scenario natively. The chess feature spec
(`spec/features/rts-multilayer-chess/browser-play-surface/README.md`) supplies
real, already-approved acceptance criteria this design is checked against
directly, rather than an invented toy scenario — see *The acceptance workload*
below.

**What exists today, precisely.** Chatwright drives emulated **chat**
platforms only. `runtime-go/platform/platform.go`'s `Emulator` interface
(lines 114–168) is the whole contract: `SubmitText(chatID, user, text)`,
`SubmitClick(chatID, user, data, targetMessageID)`, `WaitForMessage(chatID,
consumed, timeout)`, `WaitForEdit(chatID, messageID, afterVersion, timeout)`.
Every parameter is chat-shaped — a numeric chat, a message sequence position,
a version counter for in-place edits. `platform.Platform.Start()` boots a fake
platform API server; the bot under test is real, the *platform* is fake
(decision [0006](../decisions/0006-platform-emulated-bot-real.md)). Decision
[0008](../decisions/0008-declared-endpoint-profiles.md) generalised the
execution boundary once already, naming `platform-emulated` and `headless
engine` as declared, non-interchangeable endpoint profiles and explicitly
reserving room for "future profiles." That is the extension point this idea
uses.

## Recommended Direction

### Fork 1: does the browser go through `platform.Platform`/`Emulator`, or is it a new endpoint profile?

The task framing (and a first instinct) is to slot a browser in behind
Chatwright's existing `Emulator`-like interface, the way Telegram and WhatsApp
do. It doesn't fit, for a reason sharper than convenience: `Emulator` is
shaped around Chatwright **owning** platform state — it assigns message IDs,
tracks edit versions, decides delivery. For a real browser pointed at a real
web app, Chatwright owns none of that; the server under test assigns every ID,
every state transition, and Chatwright only observes. Retrofitting
`SubmitText`/`WaitForMessage`'s chat-shaped signatures onto DOM actions would
either grow parameters no browser call needs (`chatID`, `targetMessageID`,
edit `Version`) or force the browser world to fake a message sequence it does
not have — the same "lowest common denominator" failure mode the
[third-party-emulator-backends](third-party-emulator-backends.md) idea already
rejected for a related reason.

**Recommendation: a new declared endpoint profile, `browser`, sitting beside
`platform-emulated` and `headless-engine` per decision 0008 — not a new
`Platform` implementation.** Decision
[0012](../decisions/0012-black-box-bot-protocol.md)'s black-box bot protocol
(webhook or iframe `postMessage` to a bot that speaks a platform's own wire
format) simply does not apply: there is no "bot," there is a real web
application, and Chatwright reaches it the same way a human does — through its
rendered UI — not through an emulated platform API. This is not a smaller
version of the existing model; it inverts which side is fake. Today: platform
fake, system under test real. Here: nothing is fake — strongest possible
fidelity, weakest possible resemblance to a `Platform`/`Emulator` pair. Decision
0008 anticipated exactly this ("other execution boundaries are explicit,
capability-declared endpoint profiles... a profile declares what it can
observe; evidence always names its profile") and its public-positioning
discipline ("messaging-led... endpoint profiles are supporting architecture,
not the headline") applies unchanged: the browser profile does not become
Chatwright's new headline any more than the headless-engine profile did.

### Fork 2: engine — playwright-core (via `playwright-go`) or raw CDP?

**Recommendation: `playwright-go`** (`github.com/playwright-community/playwright-go`),
which drives Playwright's own Node-based driver process over its client
protocol — not a Go rewrite of Playwright, and not raw CDP. Weighed against
`chromedp` (a native-Go, dependency-free CDP client):

| | `playwright-go` | `chromedp` (raw CDP) |
|---|---|---|
| Auto-waiting / actionability checks | Built in | Hand-rolled, or every check races the DOM |
| Cross-browser (Chromium/Firefox/WebKit) | Yes | Chromium-only (CDP) |
| Isolated multi-context (cookies/storage/IndexedDB) | `browser.NewContext()`, first-class | Possible, more manual |
| Matches the tool the migration source already uses | Yes — chess's Task 6 and sneat-apps' e2e suite are both Playwright | No |
| Pure-Go, no subprocess dependency | No — spawns a Node driver process | Yes |

The pure-Go property is real and not nothing — `runtime-go` has no other
non-Go runtime dependency today, and `AGENTS.md`'s Go gates (`gofmt`, `go vet`,
`go test -race`) assume a plain Go toolchain. But `runtime-ts` is already a
wholly separate Node/TypeScript codebase living beside `runtime-go`, so
Chatwright already tolerates a second-language dependency at the repository
level; this would be the first *inside* a Go binary, which is a real but
survivable packaging cost (documented install step, not a design blocker).
Against that: `chromedp` would mean re-implementing actionability, retry and
cross-browser support that Playwright already solved, for a browser profile
whose entire reason to exist is a cheap migration from Playwright suites that
already work this way — the concrete one, chess's Task 6, and the pattern one,
`sneat-apps/tests/common/firebase-helpers.ts` and `playwright.config.ts`. A
second driving API (chromedp's) alongside the one the whole surrounding
ecosystem already standardised on (founder decision 2026-07-30, "Playwright,
explicitly not Cypress") would make the migration story (below) expensive
instead of cheap, which is the opposite of the point.

### The scenario-document mapping: what's new, what's shared

The [self-contained-scenario-documents](../features/chatwright/scenario-authoring/portable-scenario-documents/self-contained-scenario-documents/README.md)
feature (`format: https://chatwright.dev/formats/scenario-document/v1`) is the
right layer to extend, not bypass — but two of its top-level members are
irreducibly chat-shaped and need browser-profile siblings, mutually exclusive
with the chat members the way `document` is mutually exclusive with `scenario`
in the manifest:

| Chat member | Browser sibling (proposed) | Why not reuse |
|---|---|---|
| `bot` (transport `http`/`iframe`/`exampleBot`, a black-box endpoint) | `target` — `{type: "web-app", baseUrl}` | There is no bot endpoint; the target is a whole application reached through its UI, not a wire protocol |
| `chats[*]` (`{id, platformChatId}`) | `sessions[*]` — `{id, browser: "chromium"}`, one isolated `BrowserContext` each | A "session" (isolated cookies/storage) is the browser world's unit of continuity, the way a chat is the messaging world's |
| `platform: "telegram"` \| `"whatsapp"` | `platform: "browser"` | Declares which fidelity/observation model applies, same purpose as today |

**What stays identical, deliberately:** `id`/`version`/`title`/`description`,
`requires`, `fidelity` (`endpointProfile`, `environment`, `dataSensitivity`),
`cast[*]` (a browser session becomes a new cast member scoped to a
`sessionId` instead of a chat), `secrets[*]` and the secret-reference rule (a
test user's email/password or a custom-token seed is exactly the kind of
value that rule already exists to protect), `parts[*]`'s
`id`/`kind`/`title`/`failurePolicy`/`goal`/`budgets` shape, `ceiling`, and the
`verify` block's independent-verification stance. None of that is
chat-specific; it is *run*-shaped, and a run over a browser session is still a
run.

**New step vocabulary, and where it plugs in.** The document format's
`parts[*].kind: "deterministic"` is **already reserved** for exactly this kind
of scripted step list — and already rejected in v1, for *every* platform,
chat included, pending the [exploration-to-regression](exploration-to-regression.md)
idea's action matchers. That is good news, not a blocker: it means the browser
profile's step vocabulary — `navigate`, `click`, `fill`, `expectVisible`,
`expectText`, `waitForResponse`, `screenshot` — is not a second scripting
system to invent, it is the *same* reserved `steps` member, and each step's
target selection reuses exploration-to-regression's `{field, op, value}`
matcher triple with one addition: a selector-shaped `field` (e.g. `field:
"selector"`, `field: "attribute:data-testid"`) alongside chat's
`field: "text"/"kind"/"direction"`. That idea's own Not-Doing list already
names this exact gap ("multi-platform matcher semantics beyond one worked
platform... the neutral slot must be *designed* for Telegram callback data /
web href / WhatsApp button id, but only one need be implemented for the
proof") — this is that second platform materialising, not a fork of the
mechanism. Concretely: **the browser profile inherits action matchers'
schedule.** It cannot ship scripted `deterministic` parts before chat can,
because it is the same gate.

### Multi-session actors: N independent contexts as first-class cast

Today, isolation is `world.PrivateChat(cw.User{...})` — one `chatID`, one
platform `User`, inside one shared `Emulator` process; several such calls give
several isolated chats (see `sneat-co/chess/e2e/chess_e2e_test.go`'s
`aliceChat`/`bobChat` pattern). A browser context is a *stronger* and more
literal actor boundary than a chat ever was: `browser.NewContext()` gives a
completely separate cookie jar, `localStorage`, `IndexedDB` and service-worker
registration — no shared process state to accidentally leak across actors,
unlike a chat's shared `Emulator`. Each `sessions[*]` entry becomes one
`BrowserContext`; each `cast[*]` member carries a `sessionId` instead of
living inside a `chats[*]` scope; the actors-roster shape in the run bundle
gains a `browserIdentity` (authenticated display name / uid) alongside — not
replacing — `platformIdentity`, since a browser cast member has no Telegram-
or WhatsApp-shaped identity to report.

### Auth injection

Two patterns, both already proven in `sneat-apps/tests/common/firebase-helpers.ts`,
and both needed — chess's own AC set requires exercising real sign-in UI at
least once (`AC three-provider-signin`), which rules out programmatic seeding
as the *only* pattern:

1. **UI-driven sign-in** — `loginViaUI`'s pattern: click the sign-in
   affordance, fill email/password (or drive the OAuth/Telegram-widget flow),
   submit. This is itself part of what the scenario must prove, not a setup
   step to skip.
2. **Programmatic seeding** — `initializeFirebaseEmulators` +
   `createUserWithEmailAndPassword`/`signInWithEmailAndPassword` against the
   Auth emulator, for cast members whose sign-in path is not the thing under
   test. In Playwright terms this is `context.addInitScript` /
   `storageState` seeding before first navigation, so a run doesn't pay the
   UI-sign-in cost for every session in every scenario.

Both resolve secret material the same way the document format already
requires: a seeded test user's credentials are `secretRef`s, never literals,
exactly like `cast[*].provider.apiKey` today. Absorbing
`firebase-helpers.ts` into a reusable Chatwright package (rather than
Chatwright re-inventing the Auth-emulator dance) is itself an instance of the
"reuse existing code" default this idea should follow, not just this
founder's general engineering preference.

### Async observation: what "waiting" means without an owned sequence

`Emulator.WaitForMessage(chatID, consumed, timeout)` and `WaitForEdit(chatID,
messageID, afterVersion, timeout)` both wait on a position **Chatwright itself
assigned** — it fabricates every message, so "the (consumed+1)-th message"
and "edited past version N" are authoritative, Chatwright-owned facts. A real
browser watching a real SSE-with-polling-fallback UI (exactly chess's
transport) has no such sequence Chatwright controls; the server assigns state,
Chatwright only observes it through the DOM or the network. The honest
replacement is a **predicate**, not a **position**: "poll this
selector/response condition until it holds, or time out" — which is also
already Playwright's own model (`expect(locator).toHaveText(...)`'s built-in
retry, `page.waitForResponse(...)`). The proposed `expectVisible`/`expectText`/
`waitForResponse` steps carry the same bounded-timeout contract
`WaitForMessage` already has (a declared timeout, a clear timeout failure,
never an indefinite hang) without pretending Chatwright owns a sequence
number it does not.

### Evidence: trace and transcript, not a chat journal

`platform.JournalEntry`'s shape — `Direction` (`user`/`bot`), `Kind`
(`message`/`action`/`uncaptured`), `MessageID`, `Version` — is chat-specific
by construction, and widening it to also mean "a DOM mutation" or "a network
request" would blur a format that today has one honest meaning. The run
bundle's existing vocabulary already has the right seam, though: **transcript**
(the semantic record) and **trace** (the technical record — HTTP requests,
API calls, events — correlated to the transcript by stable IDs) are already
declared as two views, not one. A browser session's evidence maps onto
**trace** directly (network requests/responses, console, a structured action
log) with **transcript** as a thin, human-readable projection over it ("Alice
clicked Start"; "Bob's board updated to reflect White e2-e4") — no journal
required. `run`, `part`, the actors roster, `report`, `evidence` and the
run-bundle container stay unchanged; only the chat-specific `journal` field is
genuinely inapplicable, and its absence should be declared, not backfilled
with a lookalike.

### Backend orchestration: stays out of the document, on principle already established

Does Chatwright gain a `webServer`-style lifecycle (Playwright's own
`playwright.config.ts` pattern — see `sneat-apps/playwright.config.ts`'s
three-entry `webServer` array, which boots Firebase emulators, the webapp and
`serve_backend.sh` before any test runs)? **Recommendation: never inside the
portable scenario document; optionally, as local/CI runner configuration
outside it.** This is not a new judgement call — the self-contained-scenario-
documents feature already forbids exactly this shape: "there is no `command`,
no `script`, no `shell`, no `entrypoint`, and a document carrying such a
member is rejected... a launch-command member would make the badge
[`chatwright.dev/try/github/{owner}/{repo}`] a remote code execution
primitive." A `webServer.command` field is precisely that member. So the
browser profile inherits decision 0006's stance unchanged — Chatwright never
starts the system under test, only reaches an endpoint that is already live —
and a `webServer` convenience, if built at all, belongs beside
`chatwright.yaml`/CLI flags (an operator-trusted local file, exactly where
Playwright's own `webServer` already lives), never inside the fetchable,
stranger-authored document. Concretely: chess's local API server
(`server-go/api4chess`) and the Firebase emulators are started by the operator
or CI job *before* `chatwright run`, the same way chess's own Task 6 already
plans to start them for its Playwright suite — Chatwright's job starts at
"here is a live `baseUrl`," never at "here is a command to make one live."

### The acceptance workload: the chess two-browser scenario

This design is done when Chatwright could express and run the actual acceptance
criteria in `sneat-co/chess`'s
`spec/features/rts-multilayer-chess/browser-play-surface/README.md` — not an
invented toy. Walked through the members above (illustrative field names —
none of this is a committed schema):

1. **`AC cta-reaches-live-board`** — session `alice` navigates `/board/`;
   `expectVisible` on the sign-in panel and New-game affordance.
2. **Alice creates a lobby and copies the invite link** — `click` New game,
   `expectVisible` the lobby panel, `click` copy-link, capture the link text
   for session `bob`'s next step.
3. **`AC anonymous-lobby-view`** — session `bob` navigates to the captured
   link **signed out**. `expectVisible`/`expectText` assert both rosters,
   ready status and capture mode are visible with no authentication —
   deliberately **not** "joins anonymously": ChessRaiders rejects anonymous
   auth on principle (sign-in-at-submit), so `bob` is an unauthenticated
   *visitor*, and the scenario must say so precisely rather than borrow the
   word "anonymous" from Firebase's anonymous-auth feature, which this
   product does not use.
4. **`AC three-provider-signin`** — `bob` clicks Join, `expectVisible` the
   sign-in panel (the queued-action pattern), completes UI-driven email
   sign-in, and the queued Join executes without re-entry.
5. **`AC start-with-countdown`** — once both are joined and ready,
   either session clicks Start; both boards `expectVisible` the countdown,
   then the live board.
6. **Real-time play from both sides** — alternating `click`/board-tap steps
   from `alice` and `bob`, each followed by `waitForResponse`/`expectText`
   against the SSE/poll-driven board state on **both** sessions, until a king
   is delivered.
7. **`AC results-and-restart`** — both sessions `expectVisible` the
   end-of-match panel naming the winning side, per-player moves and duration;
   `click` New game on one session, `expectVisible` a fresh lobby.

Every `expectVisible`/`expectText` step above is a matcher-triple check over
DOM state, exactly mirroring how `verify`'s journal expectations check
chat-message state today — the same declarative, independent-of-actor-claim
verification principle 3 already requires, applied to a DOM instead of a
journal.

### Migration story: what the chess Playwright suite must keep compatible

Chess's Task 6 ships this now, independently, using raw Playwright — the
founder's assumption in `browser-play-surface.md` is explicit that this idea
"absorbs this suite later." For that absorption to be cheap rather than a
rewrite, the chess suite should (none of this blocks Task 6; all of it is free
if adopted along the way):

- **One Playwright `test()` per scenario `part`, not per assertion** —
  today's part boundary (`id`, `kind`, `failurePolicy`) maps onto a test
  function only if the test doesn't span what would become two parts.
- **Named, selector-based locators** (`data-testid` attributes, not text or
  position) for every interactive element — this is the `field: "selector"`
  matcher's raw material; a suite built on visible-text matching would need
  re-authoring, not translation.
- **Auth helpers kept separate from flow logic** (as `firebase-helpers.ts`
  already is) — they become the seeding/UI-sign-in step implementations
  directly.
- **The `webServer` list stays declarative** (command + port + health-wait),
  matching `sneat-apps/playwright.config.ts`'s shape — it becomes runner
  configuration outside the document, not a rewrite.
- **Assertions stated as "what must be true," not "what the last run looked
  like"** — a golden-screenshot-diff suite would not port; a
  `data-testid`/text-content suite does.

None of this is a requirement on chess today — Task 6 is explicitly unblocked
by this idea and free to ship however is fastest. It is a list of what makes
the eventual port cheap versus what makes it a rewrite, so the chess team can
prefer the cheap shape when it costs nothing extra.

### Runtime parity, named honestly now rather than discovered later

`runtime-ts` cannot implement this. A `ChatwrightRuntime` instance runs inside
a sandboxed browser tab (decision 0012); it has no process-spawn or
filesystem access with which to launch and drive a *second*, external browser
via Playwright's driver protocol or CDP. This mirrors an asymmetry
`docs/runtime-parity.md` already records in the opposite direction — remote
HTTP bots are `⛔ Blocked` in `runtime-ts` because "browsers cannot accept
inbound HTTP," and iframe bots are `➖ N/A by design` in `runtime-go`. The
browser endpoint profile would add a third such row, `➖ N/A by design` for
`runtime-ts`, the moment it becomes a real feature under decision 0015's
register — not edited into that file now, since nothing here is implemented
yet and the register's own rule ties a row to a feature that exists in at
least one runtime.

## Alternatives Considered

- **Force the browser through `platform.Platform`/`Emulator`.** Rejected in
  Fork 1 above: nothing is emulated, so the interface's core promise (Chatwright
  owns platform state) is false for this profile, and the chat-shaped
  parameters (`chatID`, `targetMessageID`, edit `Version`) have no browser
  analogue to carry.
- **`chromedp` / raw CDP.** Rejected in Fork 2 above: loses auto-waiting,
  cross-browser support, and — most importantly for the migration story —
  diverges from the tool the concrete forcing workload (chess Task 6) and the
  ecosystem prior art (`sneat-apps`) already use.
- **Widen `JournalEntryKind`/`Message` to cover DOM events.** Rejected: the
  shape is irreducibly chat-specific (`chatID`, `MessageID`, `Version`); the
  run bundle's existing `trace`/`transcript` split already generalises without
  inventing a lookalike journal that means something different per platform.
- **A `webServer`-style field inside the scenario document.** Rejected: it
  reintroduces exactly the executable-command member the format's own
  secrets/RCE rule already forbids, for the same reason (a document fetched
  from a stranger's repository must never carry something a runner executes).
- **Design and ship deterministic browser steps ahead of exploration-to-
  regression's action matchers.** Rejected: `deterministic` parts are already
  reserved and rejected in v1 for chat too; shipping a browser-only exception
  would fork the matcher mechanism instead of extending it, and would produce
  a browser profile with a scripting vocabulary chat scenarios still cannot
  use.
- **Let the Playground consume this too, in v1.** Rejected for now: the
  Playground is explicitly a Platform-Emulator consumer (its own feature doc:
  "Chatwright Playground → Telegram Platform Emulator → real bot"); a real,
  external browser under CI/CLI control is a different operating context, and
  folding it into the manual-testing surface is a separate design question
  this idea does not answer.

## MVP Scope

One job: **express and run the chess two-browser scenario end-to-end** — two
isolated Playwright browser contexts, real Firebase-emulator sign-in on both
sessions (one UI-driven, one seeded), the real chess local stack (webapp +
`api4chess` + Firebase emulators) as the target, SSE/poll-driven board updates
observed and asserted on both sides, the results panel asserted on both sides
— as a native Chatwright run producing a valid run-bundle v1 with a
`browser`-profile `fidelity` declaration. That, not a synthetic demo, is the
proof this design fits a real, already-shipping, adversarial workload
(development principle 6).

## Not Doing (and Why)

- Any runtime implementation code in this pass — this is a design-only
  document; chess's Task 6 ships independently and is not blocked by it.
- Forcing the browser profile through `platform.Platform`/`Emulator` — see
  Fork 1; nothing is emulated, so the interface's central promise doesn't
  hold.
- Widening the chat journal format to also describe DOM/network events — the
  run's existing trace/transcript split already covers it without a lookalike
  journal.
- A `webServer`/launch-command member inside the portable scenario-document
  format — forbidden by the same RCE-safety rule that already forbids
  `command`/`script`/`shell`/`entrypoint` there.
- `runtime-ts` implementation — structurally excluded (no process/filesystem
  access from a sandboxed tab); to be recorded in `docs/runtime-parity.md` as
  `➖ N/A by design` once this becomes a real, in-progress feature.
- AI-goal-driven (autonomous) browser exploration — needs an `observe`
  projection over the DOM that does not exist yet; this idea covers only the
  deterministic, scripted case the chess workload needs.
- A second action-matcher mechanism for DOM selectors — reuses whatever
  exploration-to-regression lands for chat, adding a selector-shaped `field`
  to the same triple, not a parallel system.
- Firefox/WebKit coverage, mobile emulation, visual regression/screenshot
  diffing — none of it is needed to express the forcing workload; each is a
  separate, later decision if a real workload asks for it.

## Key Assumptions to Validate

| Tier | Assumption | How to validate |
|------|------------|-----------------|
| Must-be-true | `playwright-go`'s Node driver-process dependency is acceptable inside `runtime-go`'s Go-only build/CI/install story | Spike `playwright-go` in a `runtime-go` branch; confirm `go build`, `gofmt`, `go vet`, `go test -race` and the CLI's install path all still work with the driver dependency declared |
| Must-be-true | Isolated `BrowserContext`s keep two signed-in Firebase sessions fully separate under real use | Run the chess two-browser scenario and inspect that session `bob` never observes session `alice`'s auth/storage state |
| Must-be-true | SSE/poll-driven UI state can be waited on with bounded, declared timeouts without flaking under CI load | Run the chess scenario N times in CI once it exists; compare flake rate against the plain Playwright suite's own numbers on the same stack |
| Should-be-true | The trace+transcript projection (no chat journal) gives a reviewer enough evidence to diagnose a failed run | Deliberately break one AC (e.g. results panel) and confirm a reviewer can diagnose it from the bundle alone, with no journal |
| Should-be-true | The `{field, op, value}` matcher triple, extended with a selector-shaped field, is expressive enough for real DOM assertions | Check it against every assertion the chess scenario actually needs (visibility, text content, roster membership, countdown, results fields) |
| Might-be-true | The eventual chess Playwright suite can be mechanically restructured into scenario-document parts/steps with near-zero rewrite | Once Task 6 lands, spike the port and measure how much of the suite survives unchanged versus needs re-authoring |

## SpecScore Integration

- **New Features this would create:** a browser endpoint profile feature
  (home TBD — see Open Questions), extending
  [portable-scenario-documents](../features/chatwright/scenario-authoring/portable-scenario-documents/README.md)
  with `target`/`sessions` members and a browser step vocabulary layered on
  the same reserved `deterministic`/`steps` mechanism.
- **Existing Features affected:**
  [platform-emulators](../features/chatwright/platform-emulators/README.md)
  (clarifies it does **not** gain a browser Platform Emulator — the profile
  deliberately sits outside that abstraction);
  [scenario-authoring/portable-scenario-documents](../features/chatwright/scenario-authoring/portable-scenario-documents/README.md)
  (new top-level members, mutually exclusive with `bot`/`chats`);
  [observability](../features/chatwright/observability/README.md) (a
  non-chat evidence source projecting into the existing trace/transcript
  split); [playground](../features/chatwright/playground/README.md)
  (explicitly *not* extended in this pass — see Alternatives Considered).
- **Dependencies:** decision [0008](../decisions/0008-declared-endpoint-profiles.md)
  (the endpoint-profile extension point this uses); decision
  [0006](../decisions/0006-platform-emulated-bot-real.md) (the
  never-start-the-system-under-test ethos behind the backend-orchestration
  stance); decision [0012](../decisions/0012-black-box-bot-protocol.md)
  (named as the boundary this profile sits outside, not extends);
  [exploration-to-regression](exploration-to-regression.md) (the matcher
  triple this reuses — the browser profile cannot ship scripted steps before
  that idea's action matchers land for chat); the
  [self-contained-scenario-documents](../features/chatwright/scenario-authoring/portable-scenario-documents/self-contained-scenario-documents/README.md)
  feature (the format extended, and the source of the no-executable-strings
  rule that resolves the `webServer` question); research item I-66 in
  [`spec/research/knowledge-platform.md`](../research/knowledge-platform.md);
  `sneat-co/chess`'s
  `spec/plans/browser-play-surface.md` Task 6 and
  `spec/features/rts-multilayer-chess/browser-play-surface/README.md` (the
  concrete, already-approved acceptance workload this design is checked
  against).

## Open Questions

- Does this land as a new child under
  [conversation-runtime](../features/chatwright/conversation-runtime/README.md)
  (beside `headless-engine-harness`, the other non-platform-emulated profile),
  or as its own top-level feature area, given how much of the scenario-
  document format it touches (`target`, `sessions`, a second step vocabulary)?
- Does `parts[*].chat` generalise into a platform-neutral field naming either
  a chat or a session, or does the browser profile grow its own
  `parts[*].session` and every reader learns two field names for the same
  role? Cheaper to decide once than to migrate the format twice.
- Is Chromium-only a permanent, declared v1 limitation (matching
  chessraiders.com's supported-browser reality and CI cost), or does
  cross-browser coverage matter enough to build from day one given
  `playwright-go` already supports it?
- Where do captured screenshots and Playwright traces live — inside the run
  bundle (which today stays well under the Cloud module's 900 KiB
  stored-bundle cap for chat runs, and would not for a screenshot-heavy
  browser run) or as sibling artefacts the bundle references by ID?
- Does the `browser` endpoint profile's fidelity declaration need vocabulary
  beyond `environment` (`dev`/`test`/`production`) to distinguish "a real,
  independently-running backend" from "a backend Chatwright's own
  runner-level `webServer` convenience just booted," or does `environment`
  already carry that distinction well enough?
- Does a `sessionId`-scoped `browserIdentity` in the actors roster need its
  own schema now, or can it wait until a second real browser scenario (beyond
  chess) tests whether one shape actually generalises?

---
*This document follows the https://specscore.md/idea-specification*
