# Changelog

User-visible changes per release. Format follows
[Keep a Changelog](https://keepachangelog.com/); pre-1.0 versioning intent is
described in [docs/release-process.md](docs/release-process.md).

## Unreleased

### Added

- New `goal` package: the goal/task/budget contract for goal-driven AI
  testing (`Goal`, `Task`, `Budgets`) and a guarded `CampaignState` state
  machine with deterministic `StopReason`s (`goal-complete`, `budget-steps`,
  `budget-duration`, `repeated-failure`, `cancelled`, `error`);
  construction-time validation rejects duplicate/unresolved task ids,
  dependency cycles and negative budgets. Pure contract — no AI, emulator or
  I/O, and time comes from an injected clock rather than `time.Now` so
  behaviour is deterministic in tests.
- Structured journal read seam (`platform.Emulator.Journal`, `platform.JournalEntry`) with `Transcript` now rendering from the same data in both emulators, plus a new `observe` package (`Observation`, `Engine`, stale-action `Validate`) providing the minimum Observation Model slice — visible messages with stable logical IDs/versions, generic available actions and explicit changes — without exposing raw platform payloads (e.g. Telegram callback data) to actors.
- New `datastate` package: the smallest provider-neutral data-state assertion runtime for the data-state-assertions feature. A `Runner` executes named `Assertion`s (a canonical DTQL `Query` plus an `Expectation`) after a settled message/action, at checkpoint publication (`Gate`, which withholds its commit callback until every assertion passes) or at branch completion, against a `Handles` set naming the current environment's registered database holders — an omitted holder resolves only when exactly one is registered, and an unknown/ambiguous name fails deterministically before any query runs. Every run produces JSON-serialisable `Evidence` (query, params, holder, outcome, a bounded/redacted/deterministically-ordered row preview and the declared excluded/redacted fields). Query execution goes through a fake `Executor` in this package's own contract tests; the real DTQL/DALgo executor lands in a later slice.
- `chatwright.WithListenAddr` binds the emulated platform API server to a caller-chosen local address instead of a random port (Telegram support via new `platform.AddrPlatform`), plus `examples/pybot`: a stdlib-only Python bot and end-to-end test proving the bot-under-test can be written in any language, driven as a real subprocess.
- `goal.CampaignState.RecordCost` accrues spend against `Budgets.MaxCost` and stops the campaign with the new `StopBudgetCost` reason once it is reached — the cost-budget enforcement `Budgets.MaxCost`'s godoc previously deferred to the actor loop.
- New `actor` package: the goal-driven AI loop. A narrow `Provider` interface (`Propose(ctx, Prompt) (Proposal, Usage, error)`) is the only seam to a model/vendor — every safety property (budgets, stale-action validation, non-progress detection) lives in `Loop`, never in a `Provider`. `Loop.RunTask`/`RunCampaign` drive observe (`observe.Engine`) → plan (`Provider.Propose`) → validate (`observe.Engine.Validate` for clicks) → act (a narrow `Actuator` seam over `platform.Emulator`) → record (`LoopEvent`), enforcing `goal.Budgets` (steps, duration, repeated failures via `RecordFailure` on an unresolvable-but-validated click, cost) through the injected `goal.CampaignState`, plus the loop's own non-progress detection (N consecutive invalid-or-no-effect proposals) which stops the campaign deterministically. Invalid proposals are recorded and re-prompted, never acted on. Ships a deterministic `ScriptedProvider` (fixed proposal sequence, zero cost) and a `CassetteProvider` record/replay decorator — any `Provider` is recordable — keyed by a hash of provider config + canonical prompt JSON; cassettes are human-readable JSON, and a replay-mode cache miss is an error carrying the missing prompt's summary. No real LLM provider ships in this slice.
- New `campaign` package: `Report`, a versioned (`SchemaVersion`), JSON-serialisable evidence-backed campaign report assembled (`Assemble`) from a `Goal`, a `goal.CampaignSnapshot` and `[]actor.LoopEvent`. Findings are classified `verified-defect` | `ai-navigation-failure` | `coverage-gap`, always linking back to observation sequences and loop-event indexes by reference; this slice's mechanical rules derive `ai-navigation-failure` (a failed/blocked task whose history shows stale/invalid proposals) and `coverage-gap` (a task never attempted, or never concluded, before the campaign stopped), and accept caller-supplied findings (`AssembleInput.CallerFindings`) for `verified-defect`, which needs deterministic or DTQL evidence this slice does not yet have.

## v0.1.0 — 2026-07-22

First tagged release. Telegram-first deterministic conversation testing:
emulate the platform locally, test the real bot over real HTTP. Supported
surface is declared in
[docs/compatibility/telegram.md](docs/compatibility/telegram.md) as of this tag.

### Added

- Go runtime and test API at the repository root as
  `github.com/chatwright/chatwright`, with the CLI at
  `cmd/chatwright` (`go install github.com/chatwright/chatwright/cmd/chatwright@v0.1.0`).
- Append-only per-chat event journal with one shared per-chat
  message-identifier sequence; assertion failures now include the chat
  transcript (including uncaptured/unsupported Bot API calls the bot made).
- `getUpdates` long-polling support in the Telegram emulator — bots that poll
  instead of registering a webhook are now testable; used automatically when no
  webhook is configured.
- New assertions: `TextContains`, `TextMatches`, `ExpectNoMessage(within)`.
- Diagnostic latency semantics: `Within(d)` records a latency budget while the
  wait continues to a safety timeout (`WithSafetyTimeout`, default 5s) — a late
  reply reports its actual text and observed latency instead of "none arrived".
- Scenario fragments with provenance-recording execution context and the
  all-or-none state checkpoint/branch coordinator (`branching/`).
- Docs and governance: Telegram compatibility profile, development principles
  (`AGENTS.md`), glossary, testing comparison, CONTRIBUTING (DCO), Code of
  Conduct, SECURITY policy, issue templates.

### Changed

- The fake Telegram Bot API validates the supported slice: unrecognised
  methods return a Telegram-shaped 501 error and are journaled; malformed
  `sendMessage`/`editMessageText` return 400; `editMessageText` accepts JSON
  bodies as well as form-encoded (previously form-only, which silently dropped
  fields for non-Go bots).
- Update construction, identifier assignment and delivery moved from the test
  harness into the emulator (webhook push and long-polling are delivery
  strategies over one update queue).
- The `platform.Emulator` interface was reshaped for the above (pre-1.0 break,
  plain prose per our policy): implementations now provide `BotAPIURL`,
  `Close`, `SetWebhook`, `SubmitText`, `SubmitClick`, `WaitForMessage`,
  `WaitForEdit`, `Transcript`.
- `PrivateChat` returns one cached handle per chat, so repeated calls share the
  consumption cursor; unresolved expectations fail the test at cleanup.
