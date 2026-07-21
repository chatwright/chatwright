# Chatwright roadmap

- **Updated:** 2026-07-21
- **Product:** Chatwright — deterministic and AI-driven testing for conversational
  applications
- **Roadmap rule:** a phase advances when its user-value gate is met, not merely
  when its feature list has code.

## Review of the original brief

The brief has the right product split: runtime, deterministic tests, AI tests,
manual emulation, authoring and hosted tooling must remain distinct. Its strongest
idea is also the most practical one: exercise the real webhook over HTTP and make
the fake outbound platform API the source of simulated chat state.

Three corrections improve it:

1. **The repository is no longer at Phase 0.** It already contains an early Go
   runtime, Telegram text/actions/edits, real HTTP delivery, latency assertions
   and an experimental WhatsApp text adapter. The first step is therefore to
   define and harden a trustworthy supported slice, not to create another API
   sketch.
2. **“Telegram first, WhatsApp deferred” needs a precise reading.** Full WhatsApp
   fidelity remains deferred; the existing text adapter is a valuable architecture
   probe. It should neither be deleted nor advertised as a complete platform.
3. **The hierarchy is a map, not a simultaneous backlog.** AI evaluation,
   Starlark, visual authoring and hosted collaboration are important, but they
   should not dilute the immediate developer promise: test a real local bot
   offline and understand a failure in one screenful.

One repository concern is deliberately left as an investigation: runtime files,
including `.github`, currently live under `chatwrite/`. Renaming or relocating
them in this specification/prototype task would mix a potentially disruptive
repository restructure into product definition.

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
2. **Intent in scenarios, mechanics in adapters.** Keep ordinary scenarios
   platform-neutral; make genuine platform requirements explicit extensions.
3. **Deterministic evidence before AI judgement.** AI can explore and interpret,
   but it cannot overwrite observed state, events or assertions.
4. **One semantic transcript, one technical trace.** Correlate them; do not force
   users to choose between readability and causality.
5. **Open local value.** A bot team must receive substantial value without an
   account, cloud run or Sneat dependency.
6. **Fidelity is declared.** HTTP/direct, faithful/logical and supported/partial
   platform modes are visible in every result.

## Phase 0 — Consolidate the proof into a product contract

**Goal:** turn the existing seed into a small, honest and repeatable baseline.

### Practical quick start (first days)

- Freeze one golden greeting scenario: `Hi` → greeting + language actions →
  choose Español → the same message is edited; keep `/time` as a deterministic
  clock fixture rather than the product demo centrepiece.
- Record what the current seed actually supports and mark everything else
  experimental/unsupported.
- Make repository structure, root orientation, package entry point and CI working
  directory unambiguous (after I-30 decides whether `chatwrite/` is intentional).
- Capture a representative passing result and three failures: wrong text, missed
  deadline and invalid outbound request.
- Measure baseline suite duration and repeat runs enough to expose ordering/flaky
  behaviour.

**Immediate gain:** a new contributor can clone the repository, run one real-HTTP
conversation locally and diagnose deliberate failures without a Telegram account.

**Exit gate:** the golden scenario and failure fixtures are repeatable in CI; docs
describe only observed support; no blanket fake-API success hides a supported
method error.

## Phase 1 — Trustworthy deterministic Telegram runtime

**Goal:** be the obvious test harness for one narrow but production-relevant class
of Telegram bots.

### Supported slice

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

## Phase 1.x — Manual local emulator

**Goal:** make Chatwright valuable before a test has been written.

- Local browser UI driven by the same runtime and fake platform path.
- Human actors, multiple identities and several simultaneous chat panels.
- Live transcript/trace/metrics with breakpoints on a small deterministic trigger set.
- Selective recording: choose observations that become assertions; export a Go
  scenario and structured draft.
- Buttons and message edits within the Phase 1 Telegram fidelity boundary.

**Immediate gain:** developers interact with several local bot identities without
accounts, tunnels or deployments, then keep the useful session as a CI scenario.

**Exit gate:** a developer can reproduce a recorded failure, promote selected
observations and run the result headlessly with no manual clean-up of core actors,
actions or message identities.

## Phase 2 — Portable scenarios and AI actors

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

**Immediate gain:** product/QA authors can own portable scenarios, and teams can
explore conversational recovery/wording without weakening hard invariants.

**Exit gate:** structured and Starlark versions of representative scenarios yield
equivalent semantic runs; AI evaluation reaches an agreed evidence/agreement bar
and never silently changes deterministic outcomes.

## Phase 3 — Hosted Chatwright Studio

**Goal:** turn individual runs into a collaborative product loop.

- Connected hierarchy, authoring, emulator and run-inspector views.
- Hosted execution, history, comparison, dashboards and CI/GitHub integration.
- Team collaboration, reusable scenario/persona libraries and organisation policy.
- Scenario/subtree export to coding agents with versioned evidence returned.
- Hosted AI actors and evaluation at scale.
- Optional Sneat accounts and `sneat.work` integration, with standalone Chatwright
  tenancy and URLs remaining first-class.

**Commercial hypothesis:** teams pay for collaboration, retained evidence,
managed execution and AI operating cost—not for the ability to run core scenarios
locally.

**Exit gate:** repeat open-runtime users validate a paid hosted job; tenant/auth
boundaries do not leak into the runtime or portable result formats.

## Later options, not commitments

Production-conversation replay, fuzz/probabilistic actors, load testing,
multilingual persona testing, model/prompt comparison, voice/SMS/email, Slack,
Discord, Teams, embedded website chat and formal human usability studies. Each
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
| Sustainable product | Repeat local/CI users who later activate collaboration, history or managed AI workflows |

## Dependency order

`platform evidence → neutral model → runtime lifecycle → deterministic assertions
→ result bundle → manual recording → structured format/Starlark → AI evaluation
→ hosted collaboration`

Skipping leftward work creates attractive surfaces over unstable semantics. The
connected prototype intentionally explores the UX now, but it does not move web
authoring onto the implementation critical path.
