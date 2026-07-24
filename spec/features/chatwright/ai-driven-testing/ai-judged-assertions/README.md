---
format: https://specscore.md/feature-specification
status: Draft
---

# Feature: AI-judged assertions

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/ai-driven-testing/ai-judged-assertions?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/ai-driven-testing/ai-judged-assertions?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/ai-driven-testing/ai-judged-assertions?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/ai-driven-testing/ai-judged-assertions?op=request-change) |
**Status:** Draft
**Source Ideas:** —

## Summary

Let a scenario assert something semantic—"the bot explained how to add a task,
in the user's language, without leaking internal IDs"—by having a model read
already-recorded evidence and return a verdict from a closed vocabulary.

The judge is a reader, never a writer: it interprets observed state, events and
deterministic assertions and can never overwrite or add to them. Its verdict is
recorded as its own evidence, cassette-backed so a run bundle replays
identically, budgeted against the campaign's existing cost accounting, and
identical in both runtimes.

## Problem

A Chatwright scenario can assert exact text, a regular expression, a button's
presence and a data-state query. Everything else about a conversation—whether an
explanation was actually helpful, whether the reply stayed in the user's
language, whether an internal identifier leaked into user-visible prose—is
unassertable. That caps scenarios at smoke tests: they prove the bot said
*something matching a pattern*, never that it *communicated*.

Three things have blocked closing that gap, and each is a constraint on the
answer rather than an argument against it:

1. **An AI opinion is not evidence.** Deterministic evidence comes before AI
   judgement (product principle 3; development principle 3). A judge that could
   mark a task complete, silence a failing assertion or rewrite an observation
   would invert the product's foundation.
2. **A judge is nondeterministic; a run bundle is a reproducible artefact.** A
   bundle that replayed differently each time—or that cost tokens to replay—
   would stop being evidence.
3. **A judge that fails must not look like a judge that passed.** Assertion
   frameworks whose evaluator errors degrade to green teach developers to
   distrust the suite.

## Behaviour

### What an AI-judged assertion is

A declared, named assertion in a scenario, carrying:

- **`id`**—stable within its part; the identity a report, a bundle and a CI
  failure all use.
- **`criterion`**—the natural-language claim to evaluate, written as a
  statement that is true or false about the evidence.
- **`window`**—the declared slice of recorded evidence the judge may read (see
  *The evidence model*). A judgement over unbounded evidence is not accepted.
- **`attachmentPoint`**—where the judgement runs, from the same vocabulary
  [data-state assertions](../../deterministic-testing/data-state-assertions/README.md)
  already use: after a settled message or action, at a named milestone, at task
  end or at part end.
- **`rubric`** *(optional)*—enumerated sub-checks, each judged separately; the
  assertion's verdict is the conjunction of its rubric items.
- **`whenUndecided`** *(optional)*—the run-verdict policy for a non-decisive
  outcome; default `fail` (see *Failure semantics*).

An AI-judged assertion is available to **both** part kinds. A `deterministic`
part may carry one—that is the "smoke test to real test" upgrade this feature
exists for—and an `ai-goal` part may carry one at a task or milestone boundary.

### Deterministic evidence before AI judgement

This is the binding constraint, and it is enforced structurally rather than by
convention:

- **The judge has no actuator.** Its seam takes a judgement request and returns
  a verdict. It cannot send text, activate an action, declare a task done or
  give up—those belong to the actor's `Provider` seam, which is a different
  interface reached through a different configuration. A judge cannot be wired
  into the observe-plan-act-validate loop even by mistake.
- **The judge runs over closed evidence.** A judgement is requested only after
  its window's evidence has been recorded. Nothing a judge returns re-opens,
  edits, reorders or deletes a journal entry, an observation, a loop event, a
  deterministic assertion outcome or a data-state evidence record.
- **The judge only ever adds one thing:** a *judgement record* appended to the
  bundle. Running a scenario with judging enabled and the same scenario with
  judging disabled must produce byte-identical journals, observations, loop
  events and data-state evidence.
- **A deterministic criterion always outranks the judge.** Where a task carries
  machine-checkable success criteria, `goal-met-by-evidence`
  ([evidence-defined completion](../../../../ideas/evidence-defined-completion.md))
  decides completion and a judged verdict cannot complete, un-complete or
  re-open it. A judged verdict may fail a run; it may never be what marks a
  deterministically-governed task successful.
- **A judged pass is labelled `judged`, never `verified`.** Fidelity is declared
  (principle 4) applies to evaluation exactly as it applies to transport: where
  an outcome's only support is a model's opinion, the report, the bundle and
  Studio say so.

### The evidence model

A judgement request is assembled by the runtime from recorded evidence only. It
may contain:

- the **visible conversation** slice from the
  [Observation Model](../../observation-model/README.md) projection—normalised
  Markdown, stable message identity, versions and generic actions;
- the assertion's **criterion** and rubric;
- the **goal and task context** (title, description, success criteria,
  constraints) when the assertion sits in an `ai-goal` part;
- the actor's own **proposals and rationales**, explicitly labelled as claims
  rather than facts;
- named **data-state evidence** already produced by a DTQL assertion, carried
  with that feature's redaction and truncation declarations intact.

It may **not** contain raw platform payloads, callback data, native platform
IDs, webhook bodies or emulator internals. The Observation Model's doctrine—raw
platform evidence is available to a developer inspector and never to an AI
acting on chat events—extends to judges without exception.

Redaction happens before the request is assembled. The judgement record declares
its redacted and excluded fields exactly as data-state evidence does, so nothing
can be hidden from a reader while still having been shown to the judge.

The window is recorded as **resolved references**, not as a copy: observation
sequences, journal-entry indexes and loop-event indexes into the bundle the
judgement lives in. A reader can therefore reconstruct exactly what the judge
saw from the bundle alone.

### Verdict vocabulary

Every judgement produces exactly one verdict, from a closed set of
human-readable string constants (never integer enums):

| Verdict | Meaning |
|---|---|
| `passed` | The judge decided the criterion holds on the evidence in the window. |
| `failed` | The judge decided the criterion does not hold. |
| `inconclusive` | The judge ran and explicitly declined to decide—insufficient evidence in the window, or an ambiguous criterion. |
| `unavailable` | No judgement was obtained at all: no judge configured, provider error, budget or quota exhausted, or a replay cache miss. |

`passed` and `failed` are **decisive**; `inconclusive` and `unavailable` are
**undecided**. Only `passed` is ever evidence of anything.

An undecided verdict carries an `undecidedReason` from its own closed set:
`insufficient-evidence`, `ambiguous-criterion`, `judge-error`,
`judge-not-configured`, `budget-exhausted`, `quota-exhausted`, `cassette-miss`.

Studio's declared-verifiability ladder
([in-browser test runs](../../playground/in-browser-test-runs/README.md))
renders both undecided verdicts as *unverified*: the surface vocabulary is
three-valued, the recorded vocabulary is four-valued, and the mapping is
one-way and stated.

### Failure semantics

A judge that errors must never look like a test that passed.

- Any `failed` assertion fails its part, and the part's failure policy decides
  the rest of the run—identical to a deterministic assertion failure.
- An undecided assertion is **never** a pass. With the default
  `whenUndecided: "fail"` it fails the run and the failure names the verdict and
  its `undecidedReason`.
- With an explicit `whenUndecided: "skip"` the assertion is excluded from the
  run verdict but is still printed, still recorded in the bundle, and still
  counted: the report carries an `undecidedJudgements` count that a passing run
  cannot hide.
- A run with no `failed` assertion but at least one skipped undecided assertion
  reports status `incomplete`, never `passed`, and exits non-zero with a code
  distinct from an assertion failure—so CI can tell "the bot is broken" apart
  from "the judge was not available".
- Configuring a judge and then failing to reach it is a run failure, not a
  silently skipped assertion. Declaring no judge at all for a scenario that
  carries judged assertions is likewise `unavailable` with reason
  `judge-not-configured`.

### Reproducibility: cassettes, and what replay means

The judge seam reuses the actor `Provider` seam's existing record/replay
decorator pattern verbatim—the same three modes as human-readable string
constants:

- **`live`**—call the configured judge, no cassette I/O. Exploratory only;
  never CI.
- **`record`**—call the configured judge and append every judgement request's
  key, prompt summary, verdict and usage to a cassette, saved as reviewable JSON
  under the scenario's `testdata`.
- **`replay`**—never call a judge: every judgement is served from the cassette
  by key, at zero token cost. A cache miss is recorded as `unavailable` with
  reason `cassette-miss`, which fails the run by default—never a live call, and
  never a silent pass.

The cassette key is a deterministic hash of the judge configuration plus the
canonical serialisation of the judgement request, so a judgement recorded
against a different judge model, prompt revision or window is a miss rather than
a silent mismatch. The judgement request must therefore be canonicalisable:
built only from recorded evidence and declared configuration, with no wall-clock
value, no random identifier and no unordered map.

Two distinct things are called "replay", and they behave differently:

| Situation | What happens |
|---|---|
| **Replaying a run bundle** (Player, `chatwright` bundle playback, Studio) | No judge is called, ever, in any mode. The bundle already carries the judgement records; playback renders recorded verdicts. This is why a bundle replays identically and free: the verdict is recorded evidence, not a recomputation. |
| **Re-running a scenario** in `replay` mode | The scenario executes again against the bot; each judgement is served from the judge cassette by key. The same cassette over the same run gives the same verdicts. A miss is `unavailable`/`cassette-miss`. |
| **Re-running a scenario** in `live` or `record` mode | The judge is called; verdicts may differ between runs. The bundle records the mode, so a reader always knows whether a verdict was obtained live or replayed. |

Cassettes are separate artefacts and are never embedded in a bundle. A judge
cassette is separate from an actor cassette—different seam, different
configuration—and both use the same format and modes.

### Cost and budget

Judging spends tokens, and that spend is not free of consequences:

- Every judge call returns usage—model, input and output tokens, latency and an
  optional priced cost—in the same shape actor proposals already return.
- A priced judge call accrues to the **same** campaign cost accounting the actor
  uses (`RecordCost`), so a goal's `maxCost` bounds actor and judge spend
  together, and a run-level ceiling aggregates both across parts. One budget,
  one number, no separate pot to overlook.
- Judge calls are **not** loop steps. `maxSteps` bounds the actor's actions
  through the conversation; a judgement is not an action and never advances or
  consumes that budget.
- The report's aggregate usage separates an actor subtotal from a judge
  subtotal, so a reader can see what judging cost without arithmetic.
- **Budget exhausted mid-run.** A judgement is attempted only while the campaign
  has not stopped. A judgement whose recorded cost trips `maxCost` is retained—
  it was paid for and it is real evidence—the campaign stops with the existing
  `budget-cost` stop reason, and every judgement not yet attempted is recorded
  as `unavailable` with reason `budget-exhausted`. The default undecided policy
  then fails the run: exhausting the budget cannot quietly turn a suite green.
  The report names the stop reason and the count of unattempted judgements
  together.
- Replay mode costs nothing, so a CI suite full of judged assertions has a zero
  token bill—the same property the actor cassette already gives campaigns.

### Provider modes

The judge seam is as narrow as the actor `Provider` seam—read a request, return
a verdict and its usage—so all three shipped Playground provider modes serve it
unchanged:

- **Bring-your-own-key (direct).** Judge calls go from the browser straight to
  the user's configured provider. The key is stored only in the browser and is
  transmitted to no Chatwright server, exactly as for actor proposals.
- **Local via `chatwright server`.** Judge calls are proxied to the local
  backend and metered per call, tagged as judgement calls so the per-call
  metrics never conflate judging with acting.
- **Chatwright Cloud.** Managed keys, quota-gated. A judgement refused by quota
  is `unavailable` with reason `quota-exhausted`—never a pass.

The judge model is configured independently of the actor model: a run may pair a
cheap actor with a stronger judge, or the reverse. The bundle names both.

Because a judged verdict is only comparable across runs that used the same
judge, every judgement record carries the judge's provider id, model, prompt
revision and a configuration digest. Where the judge model id equals the acting
model id, the record sets `selfJudged`, so a comparison report can discount a
model marking its own homework rather than silently averaging it in.

### Runtime parity

This is a runtime feature, so it ships in both `runtime-go` and `runtime-ts`
with identical observable semantics (decision
[0015](../../../../decisions/0015-runtime-parity.md), development principle 7).
The contract is language-neutral. A conforming implementation must provide:

1. a **judge seam**—one operation taking a judgement request and returning a
   verdict plus usage—with no action-producing capability;
2. **record/replay** over that seam with the identical mode vocabulary and the
   identical key derivation, so a cassette recorded by one runtime replays in
   the other: one cassette, two runtimes, same verdict;
3. the identical **verdict and `undecidedReason` vocabularies**, as string
   constants;
4. the identical **run-verdict arithmetic**—which combinations of assertion
   outcomes produce `passed`, `failed` and `incomplete`, and which exit codes;
5. the identical **judgement record** in the emitted bundle for the same
   scenario, cassette and evidence, modulo timestamps.

A deviation is permitted only for a genuine technical limitation, recorded in
[`docs/runtime-parity.md`](../../../../../docs/runtime-parity.md) with
explanation and proof link. Until the TypeScript runtime's judge lands, the
Playground reports judged assertions as `unavailable` with reason
`judge-not-configured`—declared and visible, never silently omitted—and the
register carries the catch-up row with its tracking link.

### Wire model

The judgement record is a new, additive shape in the run-bundle format,
uniformly camelCase with acronyms as `Id`/`Url`, and every enumerated value a
human-readable string constant rather than an integer:

- `assertionId`, `criterion`, `attachmentPoint`, `partId`
- `verdict`—`passed` | `failed` | `inconclusive` | `unavailable`
- `undecidedReason`—the closed set above; absent when the verdict is decisive
- `rationale`—the judge's short justification, and `rubric[]` when declared,
  each item with its own `criterion` and `verdict`
- `evidence`—resolved `observationSequences`, `journalEntryIndexes`,
  `loopEventIndexes` and named data-state evidence references
- `judge`—`providerId`, `model`, `promptRevision`, `configDigest`
- `mode`—`live` | `record` | `replay`; `cassetteKey`
- `usage`—`model`, `inputTokens`, `outputTokens`, `latencyNanoseconds`,
  optional `cost`
- `whenUndecided`, `selfJudged`, `redactedFields`, `excludedFields`

Judgement records attach at **part** level, so a `deterministic` part carries
them without depending on that part kind's still-reserved bundle payload
section. The SDK (`chatwright.dev/sdk`, `@chatwright/runtime`) owns the wire
shape; each runtime converts its internal types at bundle assembly and invents
no field of its own. The
[`run-bundle/v1`](../../../../../formats/run-bundle/v1/schema.json) schema gains
these definitions additively, in the same change that ships the implementation—
not before, so the published schema never describes something no runtime emits.

### Out of scope

- **Numeric quality scores and judged leaderboards.** This feature produces
  verdicts, not ratings; scoring belongs to the model-arena work and must stay
  labelled and separate.
- **Judged completion of a task that carries deterministic criteria.** Reserved
  by principle; see *Deterministic evidence before AI judgement*.
- **Multi-judge ensembles and agreement thresholds.** The parent feature's open
  question about an acceptable agreement threshold before reports influence CI
  is unchanged by this slice.
- **Promoting a judged finding into a deterministic regression assertion.** That
  is the parent's regression-extraction behaviour, driven by a human choosing
  what becomes a requirement.
- **Judging raw platform payloads, database rows outside declared data-state
  evidence, or the bot's source code.**
- **A Cloud-managed judge fleet**, which belongs to Cloud Intelligence.

## Proof

Per development principle 6, this capability enters only with a working proof.
The proof is the standing reference bot, [greetbot](https://chatwright.github.io/greetbot),
and the built-in `greetbot-language-onboarding` scenario, extended with one
judged assertion:

> *After the language choice, the bot's greeting is in English and addresses the
> user without exposing any internal identifier.*

Six executable demonstrations, all in both runtimes:

1. **Judged pass, free and offline.** A checked-in judge cassette replays the
   assertion to `passed` in CI at zero token cost.
2. **Judged fail.** A fixture in which the language action is never activated
   produces `failed`, with a rationale and an evidence window naming the exact
   observation sequences.
3. **Undecided fails the run.** With no judge configured, the assertion is
   `unavailable`/`judge-not-configured`, the run reports `incomplete` and exits
   non-zero with a code distinct from an assertion failure.
4. **Budget exhaustion is honest.** With `maxCost` set below the recorded judge
   call's cost, the campaign stops with `budget-cost`, the unattempted
   judgement is `unavailable`/`budget-exhausted`, and the bundle shows both.
5. **The judge changed nothing.** The bundle from a judged replay run and the
   bundle from the same run with judging disabled are byte-identical in their
   journal, observations, loop events and data-state evidence; they differ only
   by the added judgement records.
6. **Same verdict in the browser.** The same scenario runs in the Playground
   against greetbot over the iframe bot protocol in bring-your-own-key mode, and
   its downloaded bundle's judgement records match the CLI's for the same
   cassette.

## Dependencies

- chatwright/ai-driven-testing
- chatwright/observation-model
- chatwright/deterministic-testing
- chatwright/deterministic-testing/data-state-assertions
- chatwright/goal-driven-ai-testing
- chatwright/playground/in-browser-test-runs
- A judge-capable model provider reached through one of the three shipped provider modes
- The actor provider's cassette record/replay decorator, whose modes and key derivation this feature reuses

## Acceptance Criteria

### AC: judge-never-mutates-observed-evidence

Scenario: The same run is executed with and without judging
Given a scenario with one AI-judged assertion and a recorded judge cassette
When it runs once in judge replay mode and once with judging disabled
Then the two bundles' journals, observations, loop events and data-state
evidence are byte-identical
And the judged bundle differs only by its added judgement records

### AC: verdict-vocabulary-is-closed-and-string-valued

Scenario: A bundle records a judged assertion
Given any completed run containing a judged assertion
When its judgement record is read
Then `verdict` is one of `passed`, `failed`, `inconclusive` or `unavailable`
And every enumerated field is a human-readable string constant, never an integer
And an undecided verdict carries an `undecidedReason` from its own closed set

### AC: undecided-judgement-never-passes-a-run

Scenario: The configured judge cannot be reached
Given a scenario whose judged assertion has the default undecided policy
When the judge returns an error or is not configured
Then the assertion is recorded as `unavailable` with its reason
And it is never reported as passed
And the run fails, naming the verdict and reason

### AC: skipped-undecided-still-blocks-a-passing-run

Scenario: An assertion declares `whenUndecided: "skip"`
Given no assertion in the run failed
And one judged assertion is undecided
When the run verdict is computed
Then the run reports `incomplete`, never `passed`
And it exits non-zero with a code distinct from an assertion failure
And the report carries the count of undecided judgements

### AC: bundle-replay-calls-no-judge

Scenario: A recorded run is replayed in the Player
Given a run bundle containing judgement records
When it is replayed client-side
Then no judge is called in any mode
And the rendered verdicts are exactly the recorded ones
And replaying the same bundle twice produces the same result

### AC: cassette-replay-is-deterministic-and-free

Scenario: A CI run replays its judgements
Given a checked-in judge cassette and a scenario re-run in replay mode
When every judgement request matches a recorded key
Then each verdict equals the recorded one and no provider call is made
And a request with no matching key is recorded as `unavailable` with reason
`cassette-miss` rather than falling back to a live call

### AC: judge-spend-accrues-to-the-campaign-budget

Scenario: A live judged campaign is priced
Given a goal with a cost budget and a judge that returns a priced usage
When judgements execute
Then their cost accrues to the same campaign cost the actor's proposals accrue to
And no judgement is counted as a loop step against the step budget
And the report shows the actor and judge usage subtotals separately

### AC: budget-exhaustion-marks-pending-judgements-unavailable

Scenario: A judge call exhausts the campaign's cost budget
Given a cost budget lower than the run's total actor plus judge spend
When the judgement that trips the budget completes
Then its verdict is retained as evidence
And the campaign stops with the `budget-cost` stop reason
And every unattempted judgement is recorded as `unavailable` with reason
`budget-exhausted`
And the run does not report passed

### AC: deterministic-criterion-outranks-the-judge

Scenario: A judge disagrees with a machine-checkable criterion
Given a task whose success criteria are deterministically evaluated
And a judged assertion whose verdict contradicts them
When completion is resolved
Then the deterministic evaluation decides the task's status
And the judged verdict is recorded as judgement, changing no task outcome
And a pass whose only support is a judged verdict is labelled judged, not
verified

### AC: judgement-record-names-judge-window-and-mode

Scenario: A reader audits a judged verdict
Given a bundle containing a judgement record
When the record is opened
Then it names the judge's provider, model, prompt revision and configuration
digest
And it resolves its evidence window to concrete observation, journal and
loop-event references in the same bundle
And it declares the mode the verdict was obtained under and its redacted and
excluded fields

### AC: judge-sees-no-raw-platform-payloads

Scenario: A judgement request is assembled
Given a platform-emulated run whose journal contains native payloads
When the runtime builds the judgement request
Then the request carries only Observation Model content, declared context and
named data-state evidence
And it contains no callback data, webhook body, native platform ID or emulator
internal
And redaction is applied before the request is assembled

### AC: byok-judge-key-never-leaves-the-browser

Scenario: A judged run uses a bring-your-own-key judge
Given the user has configured a judge key in the Playground
When judgements execute
Then the key is stored only in the browser
And judgement requests go directly from the browser to that provider
And the key is transmitted to no Chatwright server

### AC: judged-verdicts-match-across-runtimes

Scenario: One cassette, two runtimes
Given the same scenario, judge cassette and bot in the Go and TypeScript runtimes
When both run in judge replay mode
Then both produce the same verdict for every judged assertion
And both emit the same judgement records apart from timestamps
And any deviation is recorded in `docs/runtime-parity.md` with its reason and
proof link

### AC: greetbot-judged-assertion-is-the-proof

Scenario: The reference bot proves the capability
Given the built-in greetbot scenario carrying the greeting-quality judged
assertion
When it runs against greetbot with the checked-in cassette
Then the assertion is `passed` with an evidence window citing the edited
greeting message
And the negative fixture, in which the language action is never activated,
is `failed`
And both outcomes are reproducible offline at zero token cost

## Open Questions

- **Cassette portability mechanism.** The contract requires one cassette to
  replay in both runtimes, which requires the judgement request to serialise
  byte-identically in Go and TypeScript. Should the format mandate one shared
  canonical serialisation—a field order declared in the schema, or an
  established canonical-JSON standard—or should each runtime record its own
  cassette with
  parity proven only at the verdict level—accepting two fixture files per
  scenario?
- **Self-judging.** The default is allowed-but-labelled (`selfJudged`), so
  comparison reports can discount it. Should the model arena instead refuse a
  judge whose model id equals the acting model id outright?
- **The `incomplete` exit code in CI.** The default makes an undecided
  judgement a non-zero exit, on the grounds that a broken judge is a broken
  test. Should the default instead be a zero exit with a warning, leaving
  strictness opt-in?
- **Prompt-revision churn.** The judge prompt template is part of the cassette
  key, so editing it invalidates every checked-in cassette at once. Accept the
  churn, or version the template and keep old cassettes replayable against the
  revision they recorded?
- **A judgement-count budget.** Cost bounds judging today. Is a separate
  per-part maximum-judgements dimension worth adding, for scenarios where the
  cost of a call is unknown in advance?
- **The reference judge model.** Which model and prompt policy is the first
  reference judge for the built-in proof, and is it the same choice as the
  reference actor driver?

---
*This document follows the https://specscore.md/feature-specification*
