# Chatwright roadmap

- **Updated:** 2026-07-22
- **Product:** Chatwright — the open local development and managed intelligence
  platform for conversational applications
- **Roadmap rule:** a phase advances when its user-value gate is met, not merely
  when its feature list has code.

## Review of the original brief

The brief has the right product split: runtime, deterministic tests, AI tests,
manual emulation, authoring and Cloud services must remain distinct. Its strongest
idea is also the most practical one: exercise the real webhook over HTTP and make
the fake outbound platform API the source of simulated chat state.

Three corrections improve it:

1. **The repository is no longer at Phase 0.** It already contains an early Go
   runtime, Telegram text/actions/edits, real HTTP delivery, latency assertions
   and an experimental WhatsApp text adapter. The first step is therefore to
   define and harden a trustworthy supported slice, not to create another API
   sketch.
2. **“Telegram first, WhatsApp deferred” needs a precise reading.** The Telegram
   Platform Emulator is the MVP and reference architecture. Full WhatsApp
   emulation remains deferred; the existing text adapter is a valuable
   architecture probe, not a WhatsApp Platform Emulator.
3. **The hierarchy is a map, not a simultaneous backlog.** AI evaluation,
   Starlark, visual authoring, Cloud and Marketplace are important, but they
   should not dilute the immediate developer promise: test a real local bot
   offline and understand a failure in one screenful.

The former repository concern about runtime files living under `chatwrite/` is
resolved (I-30, 2026-07-22): the Go runtime, `.github` CI and `cmd/chatwright`
now live at the repository root as module `github.com/chatwright/chatwright`.

## North star

A developer can describe a conversation once, run it through the real bot on a
supported platform, and move without context loss between four activities:

```text
specify → run automatically or manually → understand evidence → improve bot/spec
```

The same environment supports scripted, human, replay and AI actors. The mode
changes who chooses the next action and how outcomes are evaluated—not how the
message reaches the bot.

## Product principles

1. **A real boundary before a broad API.** Real HTTP webhooks and fake outbound
   APIs are more valuable than a large convenience DSL over direct handler calls.
2. **Intent in scenarios, mechanics in Platform Emulators.** Keep ordinary
   scenarios platform-neutral; make genuine platform requirements explicit
   extensions.
3. **Deterministic evidence before AI judgement.** AI can explore and interpret,
   but it cannot overwrite observed state, events or assertions.
4. **One semantic transcript, one technical trace.** Correlate them; do not force
   users to choose between readability and causality.
5. **The complete local workflow is open.** Runtime, CLI, Platform Emulators,
   Playground and Studio use Apache-2.0 and require no account, Cloud or Sneat
   dependency.
6. **Fidelity is declared.** HTTP/direct, faithful/logical and supported/partial
   platform modes are visible in every result.
7. **Earn sign-in.** Free Cloud capabilities should make developers choose an
   account for additive value, never to unlock local usage.
8. **Sell operated value.** Commercial differentiation comes from managed
   infrastructure, collaboration and intelligence rather than a closed Studio.

## Phase 0 — Consolidate the proof into a product contract

**Goal:** turn the existing seed into a small, honest and repeatable baseline.

### Practical quick start (first days)

- Freeze one golden greeting scenario: `Hi` → greeting + language actions →
  choose Español → the same message is edited; keep `/time` as a deterministic
  clock fixture rather than the product demo centrepiece.
- Record what the current seed actually supports and mark everything else
  experimental/unsupported.
- Make repository structure, root orientation, package entry point and CI working
  directory unambiguous (done 2026-07-22: runtime at root, module
  `github.com/chatwright/chatwright`).
- Capture a representative passing result and three failures: wrong text, missed
  deadline and invalid outbound request.
- Measure baseline suite duration and repeat runs enough to expose ordering/flaky
  behaviour.

**Immediate gain:** a new contributor can clone the repository, run one real-HTTP
conversation locally and diagnose deliberate failures without a Telegram account.

**Exit gate:** the golden scenario and failure fixtures are repeatable in CI; docs
describe only observed support; no blanket fake-API success hides a supported
method error.

## Phase 1 — Telegram Platform Emulator MVP

**Goal:** run a complete local Telegram execution loop for one narrow but
production-relevant compatibility profile. Telegram is emulated; the bot is the
real application under test.

### Product shape

- **Telegram Client Emulator:** multiple users, identities and chats producing
  client actions and retaining client-visible history.
- **Telegram Server/API Emulator:** update generation and webhook delivery plus
  fake Bot API endpoints, responses, errors and authoritative platform state.

This is the complete public hierarchy. Lower-level method handlers, transports,
state stores and protocol fixtures remain architecture concerns.

### Initial supported profile

- multiple bot and user identities in isolated private chats;
- Telegram text updates, inline actions/callbacks and in-place edits;
- real HTTP webhook delivery to in-process handlers and documented local processes;
- validating fake Bot API methods in the supported slice, including realistic
  error responses;
- stable message identity, transcript/trace correlation and source-linked failures;
- `Within(duration)` over the same latency observation exposed in metrics;
- size/count/latency metrics at message, actor, bot, chat, scenario and run scopes;
- deterministic draining for explicitly registered work, with limitations visible;
- Go-first scenario API, examples and CI integration.

### Deliberate exclusions

Full Telegram media/group/channel/reaction/rate-limit coverage; arbitrary
goroutine detection; Starlark; AI actors; hosted accounts; full WhatsApp support.

**Immediate gain:** teams replace live-account smoke scripts with fast offline
integration tests that cover wire and outbound API seams.

**Exit gate:** at least one non-trivial `bots-go-framework` bot and one
framework-independent HTTP fixture run the supported slice; repeated suites meet
an agreed duration/flake budget; unfamiliar developers can explain supplied
failures from the result bundle alone.

## Phase 1.5 — State branching, data-state assertions and the headless rung

Already executing through the Listus branching reference plan, ahead of the
Phase 1 exit gate — acknowledged here so the roadmap matches reality rather
than pretending this work waits its turn.

- Named database-state checkpoints, all-or-none branch coordination and replay
  fallback ([state-branching](../spec/features/chatwright/state-branching/README.md),
  decisions 0009/0010).
- Data-state assertions gating checkpoint publication
  ([data-state-assertions](../spec/features/chatwright/deterministic-testing/data-state-assertions/README.md)).
- The headless engine harness as the fast diagnostic rung beneath the
  platform-emulated gate
  ([headless-engine-harness](../spec/features/chatwright/conversation-runtime/headless-engine-harness/README.md),
  decision 0008).

**Exit gate:** the Listus reference plan's frozen contract tests and dual-rung
scenario pass repeatedly; branching evidence labels the database-only scope and
the mechanism used; this work does not displace the Phase 0/1 gates, which
remain the release blockers for v0.1.0.

## Phase 1.x — Chatwright Playground and open Studio foundation

**Goal:** make Chatwright valuable before a test has been written.

- Local browser UI consuming the same Telegram Platform Emulator as automated tests.
- Human actors, multiple identities and several simultaneous chat panels.
- Live transcript/trace/metrics with breakpoints on a small deterministic trigger set.
- Selective recording: choose observations that become assertions; export a Go
  scenario and structured draft.
- Buttons and message edits within the Phase 1 Telegram fidelity boundary.
- Apache-2.0 Studio packaging, offline operation and a local CLI/runtime bridge;
  optional Cloud actions fail gracefully when disconnected.

**Immediate gain:** developers interact with several local bot identities without
accounts, tunnels or deployments, then keep the useful session as a CI scenario.

**Exit gate:** a developer can reproduce a recorded failure, promote selected
observations and run the result headlessly with no manual clean-up of core actors,
actions or message identities.

## Phase 2 — Portable scenarios, fuzzing and AI actors

**Goal:** separate scenario ownership from Go while adding outcome-oriented
testing without creating a second runtime.

### Portable authoring

- Versioned structured scenario format for supported visual/recorded constructs.
- Hierarchy, inherited configuration with provenance, branches and coverage state.
- Starlark sandbox, cancellation, reusable actors/personas and debugger hooks.
- Explicitly no promise of lossless arbitrary Go/Starlark-to-visual round-tripping.

### AI testing

- Provider-neutral AI actor interface with persona, goal, constraints and actions.
- Goal evaluation that prefers deterministic evidence when available.
- Evidence-linked UX reports, uncertainty and evaluator/model/token metadata.
- Exploratory-run extraction into deterministic regressions or reusable fixtures.

### Fuzz testing

- Seeded text, payload, event-order and timing mutation with replay manifests.
- Stateful minimization and promotion of failures into local regression inputs.
- AI-generated perturbations captured as concrete sequences, reported separately
  from persona/goal-driven exploration.

**Immediate gain:** product/QA authors can own portable scenarios, and teams can
explore conversational recovery/wording without weakening hard invariants.

**Exit gate:** structured and Starlark versions of representative scenarios yield
equivalent semantic runs; AI evaluation reaches an agreed evidence/agreement bar
and never silently changes deterministic outcomes.

## Phase 3 — Cloud Run and voluntary account pull

**Goal:** validate the smallest managed-infrastructure jobs that repeat local
users choose to connect.

- Optional sign-in from the offline-capable Studio; local state remains usable
  before, during and after account connection.
- Test a generous free direction with personal workspace, sync, hosted reports,
  web Studio, public projects and bounded execution.
- Hosted execution, queues, schedules, CI integration, history, transcript
  storage, notifications and comparison.
- Shared workspaces and organisation capabilities only after personal Cloud Run
  value is demonstrated.
- Reports for regression, latency, AI cost, coverage, flakes and platform
  compatibility, always linked to versioned run evidence.

**Commercial hypothesis:** teams pay for collaboration, retained evidence,
managed execution and operational scale—not for the ability to run, author,
record or inspect locally.

**Exit gate:** repeat local users voluntarily activate and revisit at least one
managed job; cost and retention are understood; tenant/auth boundaries do not
leak into local or portable formats.

## Phase 4 — Cloud Intelligence and Marketplace

**Goal:** convert managed exploration into trustworthy, reusable improvements
and begin compounding an ecosystem.

- Managed AI actors, persona libraries, AI evaluation and UX review.
- Conversation-quality and prompt analysis, model comparison and benchmarks.
- Autonomous exploration and bounded AI swarm campaigns across personas, models,
  temperatures, seeds, goals and constraints.
- Failure clustering, UX observations and developer-approved deterministic
  regression proposals.
- First-class design → scenario → implementation prompt → coding agent → run →
  analyse → improve loop, with evidence and approval at each boundary.
- A minimal Marketplace for versioned, licensed and provenance-visible personas,
  scenarios, assertions, milestones, evaluators, adapters, fixtures, templates
  and industry packs.
- Optional Sneat account and Sneat Work integration, while standalone Chatwright
  tenancy, URLs and workflows remain first-class.

**Commercial hypothesis:** teams pay for managed orchestration, evaluation,
historical intelligence, private libraries, governance and scale. Open-source
and community assets expand the local ecosystem.

**Exit gate:** one Intelligence job produces evidence-linked findings with an
acceptable approval yield and cost; approved regressions replay locally; one
asset type demonstrates safe community reuse before broader Marketplace work.

## Later options, not commitments

Production-conversation replay, load testing, voice/SMS/email, Slack, Discord,
Teams, embedded website chat and formal human usability studies. Each
must enter through the actor/platform/observability seams rather than expand the
core model pre-emptively.

## Measures that matter

| Outcome | Early measure |
|---|---|
| Fast confidence | Median and p95 deterministic suite duration; flake rate across repeated unchanged runs |
| Better boundary coverage | Supported scenarios exercising both inbound webhook and outbound API, not only direct handlers |
| Diagnosable failures | Time for a developer unfamiliar with the fixture to identify the cause from exported evidence |
| Offline usefulness | Runs/manual sessions completed without real platform accounts, public endpoints or hosted Chatwright |
| Portable intent | Share of common scenarios using neutral operations; number and clarity of required platform extensions |
| AI trust | Evaluation agreement, evidence-link completeness and rate of deterministic-evidence conflicts |
| Voluntary Cloud pull | Repeat local/CI users who connect and revisit sync, reports or managed execution without a local feature gate |
| Cloud utility | Time/operations saved, report revisit/share rate and hosted-run cost |
| Intelligence yield | Useful findings per cost; developer approval rate; approved regressions replaying locally |
| Ecosystem reuse | Projects reusing pinned community assets; compatibility and maintenance burden |

## Dependency order

`platform evidence → neutral model → runtime lifecycle → deterministic assertions
→ state branching/data-state assertions → result bundle → manual recording/open
Studio → structured format/Starlark → deterministic fuzzing → AI evaluation
→ Cloud Run → Cloud Intelligence → Marketplace`

Skipping leftward work creates attractive surfaces over unstable semantics. The
connected prototype intentionally explores the UX now, but it does not move web
authoring onto the implementation critical path.
