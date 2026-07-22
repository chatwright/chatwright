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
- New `actor/anthropic` package: the first real `actor.Provider`, calling the Anthropic Messages API via the official `anthropic-sdk-go`. Defaults to `claude-haiku-4-5` (fast/cheap — a campaign is many small per-turn action selections, not open-ended reasoning); the API key is read from `ANTHROPIC_API_KEY`, never from an `actor.Prompt` or a cassette. Renders `Prompt` to a deterministic, versioned system+user prompt and asks for exactly one JSON object (`send-text` | `click` | `task-done` | `give-up` + rationale) via Anthropic structured outputs (`output_config.format`), with one JSON-repair attempt and a typed `InvalidResponseError` — never a fabricated `Proposal` — on anything that still fails to parse or violates the response contract. Maps `Usage` (model, token counts, latency) from the API response and estimates `Usage.Cost` from a dated pricing snapshot (`pricing.go`) for models it has a rate for, leaving it nil otherwise. Composes with `actor.CassetteProvider` like any other `Provider`; tests run entirely against a fake HTTP transport at zero token cost, plus one optional live smoke test gated behind `CHATWRIGHT_LIVE_LLM=1` and `ANTHROPIC_API_KEY`. See `actor/anthropic/README.md`.
- New `bundle` package: the run-bundle format v1, the persisted, self-contained artifact a Web UI player (Chatwright Studio) replays — superseding the earlier draft `campaign.Bundle` (`campaign` now keeps only `Report` and its assembly). A `Bundle` declares its shape with a namespaced format id (`FormatV1`, `"https://chatwright.dev/formats/run-bundle/v1"`, replacing the draft's integer `schemaVersion`) and carries one or more `Run`s; a `Run` carries an `Actors` roster (`ActorType`: `ai-agent` | `human` | `scripted` | `replay` | `bot`, each with optional `PlatformIdentities` and, for `ai-agent`/`replay`, a `Provider`), a run-level continuous per-chat journal (`Chats`), and an ordered `Parts` list. Each `Part` names a `Kind` (`ai-goal` ships with a writer today; `deterministic` is reserved for the hybrid-runs runtime — see `spec/ideas/hybrid-runs.md` — with no section modelled yet) and a `JournalBoundary` slicing the run-level journal by chat (`firstEntry`/`entryCount`) rather than duplicating it; an `ai-goal` part's `AIGoalSection` carries the `Goal`, the roster `actorId` that ran the loop, `Events`, retained `Observations`, the assembled `Report` and optional `Evidence` — exactly what the draft `campaign.Bundle` carried at its top level. `bundle.SingleAIGoalRun` assembles the single-part, single-run shape every writer produces today (a plain campaign is one ai-goal part spanning the whole journal). `Write`/`Read` give deterministic, human-readable, indented JSON I/O; `Read` rejects an unrecognised `format` with a typed `ErrUnknownBundleFormat`, an unrecognised part `kind` with `ErrUnknownPartKind`, and an `ai-goal` part with no `aiGoal` section with `ErrMissingAIGoalSection`, all naming what was found, rather than silently misparsing. Bundle files use the `*.chatwright.json` naming convention. `actor.Config.DisableObservationRetention` (default off, i.e. retention on) plus `actor.Loop.Observations` still supply the retained observation bodies a Bundle needs. Every kind/direction/verdict field that surfaces in the bundle (`platform.Direction`, `platform.JournalEntryKind`, `observe.Verdict`, `observe.Actor`, `observe.ChangeKind`, `actor.ProposalKind`, `actor.ActionOutcomeKind`) is now a string type with human-readable wire values (`user`/`bot`, `message`/`action`/`uncaptured`, `fresh`/`stale`, `new-message`/`edited-message`/`actions-changed`, `send-text`/`click`/`task-done`/`give-up`, `skipped-invalid`/`executed`/`executed-no-effect`/`resolution-failed`/`task-completed`/`task-given-up`) rather than a bare int, matching AGENTS.md's JSON-artefact convention; the Go constant identifiers are unchanged. `Metadata` gains an optional, never-auto-populated `Author` (`name`/`email` — bundles get emailed and committed publicly, so this is never harvested from git config or the environment). `Run` gains optional `Bookmarks` (manual fast-forward markers a player cannot already derive from part boundaries/task completions/findings) and `Annotations` (comments on a conversation moment, threaded via `ReplyTo`), both anchored by a shared `Anchor` (`chatId`/`entryIndex` required, optional `messageId`/`version` to pin an exact edited revision) — `Read` deliberately never validates a dangling `replyTo` or an out-of-range `Anchor`, since bundles are hand-editable files and surfacing that is a consumer's job. The full wire shape is now published as a JSON Schema (draft 2020-12) at `formats/run-bundle/v1/schema.json`, generated from these Go types (`internal/schemagen`, `go generate ./bundle/...`) and gated by tests validating both the golden bundle and a real e2e-produced bundle against it, plus a drift guard proving regeneration matches the committed file.
- `platform.JournalEntry` gains `FromID` (the platform-native id of the entry's originator — the sending client's id for a client-originated entry, the bot's own id for a bot-originated one, 0 when no identity is available), so a run-bundle roster (`bundle.Actor.PlatformIdentities`) can attribute every journal entry to whoever produced it. The Telegram emulator now stamps it on every journal entry it appends; the new `telegram.EmulatedBotUserID` names the single bot identity (`1`) it simulates.
- New `run` package: the part-composition runtime spec/ideas/hybrid-runs.md calls for — an ordered sequence of `Part`s (`NewDeterministicPart`/`NewAIGoalPart`) executing strictly in order over one shared `Environment` (one `platform.Emulator`, one declared set of chat ids, one injected clock), so a deterministic scenario fragment and an ai-goal actor-loop passage share one continuous journal and cast. `Run.Execute` captures each Part's `bundle.JournalBoundary` by snapshotting `Emulator.Journal` immediately before and after it runs; a deterministic Part executes an existing `chatwright.Fragment` via `chatwright.InvokeFragment` (provenance retained in `DeterministicOutcome`), an ai-goal Part drives a fresh `goal.CampaignState`/`actor.Loop` pair task by task (mirroring `actor.Loop.RunCampaign`'s own eligible-task order) so an optional run-level `RunCeiling` (steps/cost/duration, aggregated across every ai-goal Part on top of each Part's own `goal.Budgets`) can interrupt between two tasks of the same Part — the resulting `CeilingTrip` names both the aggregate `goal.StopReason` and the Part it tripped in. A per-part `FailurePolicy` (`FailurePolicyAbort`, the documented zero-value default, or `FailurePolicyCoverageGap`) declares whether a failed Part halts the Run outright or marks every subsequent Part a coverage gap without executing it. `AssembleBundleRun` extends `bundle.SingleAIGoalRun`'s single-part mapping to however many Parts actually ran, so a plain campaign remains expressible as a Run with a single ai-goal Part through this same layer. Proven end to end by a two-part run against the real greetbot fixture (deterministic onboarding, then an ai-goal acknowledgement) in one `bundle.Run`, including that the ai-goal Part's first observation already shows the state the deterministic Part established.

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
