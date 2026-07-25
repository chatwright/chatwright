---
format: https://specscore.md/idea-specification
status: Draft
---
# Idea: Exploration to regression

**Status:** Draft
**Date:** 2026-07-25
**Owner:** alex
**Promotes To:** —
**Supersedes:** —
**Related Ideas:** extends:hybrid-runs, extends:observation-model, extends:goal-driven-ai-bot-testing, extends:actor-model-arena

## Problem Statement

How might we turn one successful AI exploration of a bot into a durable
deterministic regression test that keeps passing when volatile data, wording and
layout change—and still fails when the flow actually breaks?

## Context

Today an AI actor can explore a bot and reach a goal, and the run can be
replayed via `actor.CassetteProvider`. But what replay keys on is a SHA-256 of
`json.Marshal(prompt)`, where `Prompt` carries `Observation.Messages` (the full
text of every visible message) and `History` (the last N loop events). So the
cassette key is an **implicit, total, unnamed assertion over the entire
conversation state**. Nothing declares what mattered; everything matters
equally.

**The motivating example is already in this codebase, and nothing is wrong with
the bot.** `runtime-go/examples/greetbot` labels its language button `English`.
The public `chatwright/greetbot` repo's shared model labels it `English` too—but
its Telegram adapter renders `English (1)`, deliberately, spelling out the digit
that types the same pick so a tap and a typed reply agree on numbering
(`telegram/bot.js`: *"purely how this adapter draws buttons"*). The arena
scenario's success criteria say *click the action labelled exactly "English"*.

So the same bot, with identical semantics, is unrunnable against its own
published adapter—because the scenario bound to **rendered text** instead of to
the action's identity. No regression, no bug, no volatile data: just one adapter
drawing a label differently. That is the whole problem in one case, and
`contains: "English"` survives it while `exact` on rendered text does not.

The founder identified the general consequence (2026-07-25): a bot that renders a
live exchange rate, or any date or time, in a message or a button label produces a
different prompt tomorrow, so the key changes, so replay is a cache miss—a
failure reported as `ErrCassetteCacheMiss` rather than anything a reader can act
on. Because `History` carries N previous loop events, one volatile value poisons
the key for N turns after it appears. The same brittleness covers changes nobody
cares about: a reworded sentence, a localised label, a word turned bold. In the
founder's words, formatting is "unit tests' concern"—a conversation-level
regression test should assert flow, not markup.

A second, quieter defect: `observe.availableActionID` derives an action's
identity as `act-<msgID>-<version>-r<row>c<col>`. That is version-coupled and
positional. The version coupling is deliberate and correct for the actor
loop—it makes a proposal targeting stale buttons deterministically invalid, as
`Validate` requires—but it is the wrong identity for a scenario matcher, which
must survive an edit and a reordering. One identifier is answering two different
questions: *"is this proposal stale?"* and *"which button do I mean?"*

## Recommended Direction

Treat exploration and regression as **two modes with different contracts**, and
make the transition between them an explicit, reviewable artefact.

**Exploration mode** is user-faithful. The actor sees only what a user sees—no
URLs, no callback data. This is not a limitation to be relaxed: an actor that
could read `lang:en` would navigate by identifiers no human can see, and the
exploration would stop being evidence that a real user can reach the goal. The
existing `observe` projection is already correct for this consumer.

**Test-runner mode** is a deterministic regression tester, and *is* allowed to
see hidden attributes. It does not care how a button is rendered; it cares that
the end-to-end flow still works. Critically it does not care **who** recorded
the scenario—AI, human, or a bot logger—so a scenario is a portable artefact,
not an AI by-product.

Between the two modes sit **two distinct AI steps**, which today are conflated:

1. **Decide what to do** — identify the actionable item and act. In-loop,
   real-time, blinded, user-faithful. This is the existing actor loop.
2. **Decide how to match that item in future** — analyse both visible and hidden
   data and choose the matcher: exact, regex, or an AI matcher. Post-hoc over
   the journal, sighted, and *not* part of the loop. Its oracle is the AI judge
   or a human reviewer.

Step 2 being post-hoc is a feature, not an implementation detail: matcher
synthesis can be batched in one pass after the run, and **re-run later against
journals already recorded**, so improving synthesis never requires re-exploring
a bot.

A matcher is not decided once. It has a **repair loop over its whole lifetime**
(founder, 2026-07-25): the AI proposes, a human reviews and corrects, and later—
when the UI or the callback data changes and the test fails—the human adjusts the
matcher **from the test report** and re-runs with the corrected matching. Three
things follow, and they are requirements rather than niceties:

1. **The report's first job is triage, not blame.** When a bot message matches no
   expected action, the reader has to answer one question: *is the bot actually
   broken, or was the matcher too strict?* The report therefore presents the
   actions that really were available with **both** their titles and their hidden
   data, because that is precisely the evidence that separates "this flow is
   gone" from "the label was reworded" or "the callback data gained a version
   suffix". A report that shows only the failure decides nothing.
2. **Correcting is cheap to validate, then real to confirm.** A corrected matcher
   can be checked instantly against the captured failing journal—does it now
   resolve to exactly one action?—before any re-run. The re-run itself then goes
   against the current bot, because the bot changing is what broke the matcher in
   the first place.
3. **Re-synthesis must never clobber a human correction.** This directly
   constrains the re-runnable synthesis above: every matcher carries its origin
   (synthesised or human-authored), and a later synthesis pass leaves
   human-authored matchers alone. Without that rule the two capabilities fight
   each other and the human silently loses.

**Record diagnostics generously; the only bound is volume, not principle**
(founder, 2026-07-25). If a detail helps troubleshooting and is cheap, it goes
in. So a matcher resolution records the field and operator it used, the value
that actually matched—including **which member of a value list** matched, so
rotted translations cannot hide behind a green scenario—any regex capture groups,
the candidate actions that were considered and rejected, and the matcher's
origin. A refusal records why it refused.

The bound is size and sensitivity, and it already has a precedent: the Cloud
module caps a stored bundle at `MaxStoredBundleBytes` (900 KiB, sized to
Firestore's document limit) and rejects an oversized recording with a clear error
rather than truncating it silently. Diagnostics inherit that posture—bounded, and
when something *is* dropped or truncated it is **declared**, never quietly
omitted, per principle 4. Conversation text is user data in any real bot, so
"generous" means generous with *structure and provenance*, not with unbounded
transcript volume.

**The store is a shared component, and the runner and the UI are peers over it.**
Neither owns it. The UI reads and writes the store directly—it lists scenarios,
opens one, and saves a corrected matcher—and it starts a run by dispatching the
runner with a scenario **ID**, not scenario content. The runner loads that
scenario from the same store, executes it, and writes its report back.

This removes a mutation channel entirely: the UI never asks the runner to change
a matcher. It writes the correction to the store and dispatches a run by ID. The
runner needs no scenario-editing API at all; its surface stays "run this
scenario, produce this report."

Where a scenario lives—local file, git, a Cloud service, the user's own
storage—is a store implementation detail and must not leak into the report
format, the UI or the runner. The precedent already exists in the Cloud module:
`RecordingStore` is a `Create`/`Get`/`List` seam over dalgo, wired to
dalgo2firestore in production and dalgo2memory in tests. A scenario store is its
sibling, with one addition—recordings are immutable, so `RecordingStore` has no
`Update`, whereas matcher repair is an update by definition. That is exactly
where the concurrency question below bites.

Keeping both clients equal over one store is also what keeps the CLI and the
Studio true peers rather than one being a degraded view of the other.

A non-human operator is then just another store client: an agent triaging a
failed run reads the report, writes the corrected matcher, and dispatches a run
by ID—the same three operations the UI performs, with no special API. That
matters for the north-star loop—find a bug, dispatch an agent, verify the
scenario passes—but the repair loop is worth building for the human case alone.

There is no universal stability ordering to encode. Callback data is *not*
inherently stable—it can carry timestamps, versions or nonces—so choosing a
matcher is a judgement about a specific bot, which is precisely why it earns its
own step rather than a preference table.

### Matcher vocabulary

A matcher is a triple—**field, operator, value**—since it applies to visible and
hidden attributes alike: `{field: callbackData, op: regex, value: "^lang:"}`.

Operators for v1 are **`exact`**, **`contains`** and **`regex`** (founder,
2026-07-25). `exact` is not redundant with `regex` for three reasons that
outlive any performance argument:

- **Escaping is a correctness hazard.** Bot labels are full of regex
  metacharacters—`50% off`, `Total (USD)`, `4.5★`, `Yes / No`. If regex is the
  only tool, every literal must be escaped, and an unescaped `.` silently
  matches any character. That is a matcher that is *too loose*: false pass,
  green suite, broken bot. With `exact`, the common case cannot be got wrong.
- **Readability is the premise.** The reason declared matchers replace a hash is
  that a human can read and correct them. `exact: "Buy (2) items"` beats
  `regex: "^Buy \(2\) items$"`, which must be mentally unescaped to see it is
  just a literal.
- **The operator is evidence.** `exact` records a belief that the value is
  stable; `contains` records that only a fragment matters; `regex` records that
  part varies by a known shape. An `exact` matcher that starts failing is a more
  interesting signal than a regex that does—something presumed stable moved.

`contains` earns its place on the same evidence-of-belief argument. Its looseness
is mitigated—but not eliminated—by exactly-one resolution: the gate catches a
matcher that is ambiguous *today*, not one that a button added next month would
also satisfy. So synthesis should prefer `exact` where the evidence allows, and
treat `contains` as more naturally a human choice than a synthesised default.

**`exact` and `contains` accept a list of values, meaning any-of** (founder,
2026-07-25). This is not ergonomic sugar: it moves whole classes of case out of
the AI tier, which is the expensive and drift-prone one. A localised label
becomes `exact: ["Continue", "Продолжить", "Continuar"]`—deterministic, free,
stable—where a single-value vocabulary would have forced an AI matcher.
Variation that is *enumerable* (translations, a bot's serious/humorous phrasing
variants, anything whose set lives in the bot's own source) belongs here, not in
the AI tier. It also restores a symmetry: `regex` already has alternation via
`(a|b|c)`, so lists give the literal operators equivalent power without pushing
authors into regex and its escaping hazard.

Two rules the list semantics must pin down:

- **A list is always any-of, for both operators.** `contains: [a, b, c]` means
  "contains a, or b, or c"—never "contains all of them". If all-of is wanted,
  that is several matchers, not one list. Inconsistent list semantics between the
  two operators would be a permanent source of misread scenarios.
- **A list is a matching tool, never a locale assertion.** `exact: ["Continue",
  "Продолжить"]` passes whether the bot replied in English or Russian—including
  when the scenario set the user's locale to Russian and the bot wrongly answered
  in English. In a scenario *about* language onboarding that is a false pass. So a
  list finds the action; a separate assertion claims the bot used the right
  language. This is the match/assert split again, and lists are the sharpest case
  for why it exists.

A list is also mostly **not derivable from run diffs**: two runs in one locale
reveal one variant. Lists therefore come from human authoring or from reading the
bot's own source, which is a real limit on record-twice-and-diff rather than a
gap in it.

**`startsWith` and `endsWith` are deferred**, on a real hazard rather than
scope discipline: they are unambiguous as string operations but ambiguous in the
author's *intent* for right-to-left text, where the logically-first character is
displayed last. Bidirectional labels—an Arabic string carrying a Latin product
name or a number—have a logical order that does not match the visual one, so
"starts with" means two different things to the author and the runtime. Deciding
which one the operator promises is a prerequisite, not a detail.

That hazard generalises beyond the deferred operators. Labels can carry
**invisible directional-control characters** (U+200E, U+200F, U+202A–U+202E), so
an `exact` matcher written from what a human sees on screen can fail against what
is actually in the string. Normalisation must therefore cover invisible and
bidi-control characters, not only markup and whitespace.

Regex must pin a **common subset across runtimes**. Go's `regexp` is RE2—no
backreferences, no lookahead—while JavaScript has both, so `(?=...)` would work
in `runtime-ts` and fail in `runtime-go`, breaking "one scenario file, two
runtimes, same verdict" (principle 7). The validator rejects out-of-subset
constructs at synthesis time, not at replay time in one runtime.

### Testing the matcher judgement

Step 2 is a judgement, so it needs its own test suite, built from hand-authored
fixture tables rather than live recordings—controlled volatility is the point.
Each case is the same action observed across two or more runs, and the expected
outcome is a matcher *kind* plus a behaviour.

The suite must cover all three outcomes and, most importantly, refusal:

| Expected | Case |
|---|---|
| `exact` | stable label across runs |
| `exact` | stable label containing regex metacharacters (`50% off (today)`) — the escaping trap |
| `exact` | volatile label, stable callback → matches the stable *field*, not a stable substring |
| `regex` | volatile numeric suffix (`Rate: 0.92` / `Rate: 0.94`) |
| `regex` | volatile embedded date (`Book for 25 Jul` / `26 Jul`) |
| `regex` | volatile callback token (`lang:en:tok_abc` / `lang:en:tok_xyz`) |
| `exact` list | localised label with a known translation set (`Continue` / `Продолжить` / `Continuar`) — must NOT escalate to AI |
| `exact` list | bot's own tone variants (`Let's go` / `Onward, adventurer`) read from its source |
| AI matcher | unbounded LLM-phrased label (`Sure, let's go` / `Okay, proceed` / `Right, onward`) |
| AI matcher | localised label whose translation set is open-ended or unavailable |
| refuse | list matcher used where the scenario asserts a specific locale — the locale claim belongs in an assertion, not the matcher |
| refuse | proposed matcher resolves to two actions |
| refuse | proposed matcher also matches a decoy action |
| refuse | nothing stable in label or hidden data and no semantic anchor — must report "cannot synthesise, needs human" rather than emit something that will flap |

Enumerable variation is *not* an AI case: weekday names are handled by
`(Mon|Tue|…)`, and translations or tone variants by a value list. The AI tier is
for text that is unbounded, not merely variable—and a synthesiser that reaches
for it on an enumerable set is failing, which is why two of the cases above
assert the *absence* of escalation.

**Assert behaviour, never the regex string.** `^Rate: [\d.]+$` and
`^Rate: \d+\.\d+$` are both correct, so string-equality assertions would make
this suite brittle in precisely the way this idea exists to fix. Assert instead
that the synthesised matcher resolves to exactly one action on run 1, exactly one
on run 2, and does not match the decoy—which is the same exactly-one gate
production needs, so harness and validator are one implementation.

These tests replay judge cassettes, which is circular only in appearance: the
judge cassette keys on a *constructed synthesis request*, not on a live bot
conversation, so it is not exposed to the volatility problem being solved.

Separate **how an action is found** from **what is claimed about it**. Match on
whatever is stable for this bot; assert separately on what the user must see. A
scenario matching purely on callback data would keep passing with every button
rendered blank—green suite, unusable bot. Matching and asserting are different
jobs and must be declared separately.

A matcher must resolve to **exactly one** action. Anything else—zero, or
several—is a test error naming the matcher, never a silent first-match, because
silent first-match is how a suite rots. Applying that same gate to step 2's own
output, against the recorded journal, cheaply catches an over-loose regex, which
is the dangerous direction (false pass).

The recorder is sighted **when serialising**, though the actor was blinded
**when deciding**. That is not a loophole: the decision was already made on
user-visible information, and the recording merely describes it precisely
afterwards. Blinding the recorder too would leave only label and position
matchers, reintroducing every brittleness this idea exists to remove.

In existing vocabulary this is **promotion**: an `ai-goal` part that reached its
goal is promoted into a `deterministic` part, with matchers and assertions
synthesised from the journal.

## Alternatives Considered

- **Patch the cassette key**—hash a normalised or field-filtered prompt instead
  of the whole thing. Lost because it treats the symptom: the prompt is the
  actor's blinded view and a regression runner has no use for it at all. A
  filter list also becomes a hidden, unreviewable spec of what matters, which is
  the current defect with extra steps.
- **Positional replay**—play back recorded actions in order, ignoring state.
  Lost because it fails silently: break the bot and positional replay presses
  the old turn-2 action regardless, going green against a broken bot. The
  current hash at least fails loudly, and any replacement must preserve that.
- **Hand-write every matcher.** Lost as the default because it discards the
  exploration's main value—the AI already determined which actions matter—but
  retained as an override, since a human reviewer must be able to read and
  correct a synthesised matcher.
- **Mechanical volatility detection only** (record twice, diff, regex the
  differences, no judgement). Lost as a *replacement* for step 2 and retained as
  an *input* to it: the diff supplies hard evidence about which bytes actually
  moved, which is far stronger than a model reasoning about whether `0.92` looks
  volatile. Judgement still decides the matcher's shape.

## MVP Scope

One job: an AI exploration of greetbot that reached its goal is promoted into a
deterministic part whose matchers and assertions survive a deliberately volatile
bot—a rendered timestamp in both a message and a button label—and which still
fails, with a readable reason, when the flow is genuinely broken.

## Not Doing (and Why)

- Retiring the version-coupled `availableActionID` — the actor loop's staleness
  check needs it; this adds a second, matcher-facing identity rather than
  replacing the first
- Exposing hidden attributes to the actor in exploration mode — that would
  destroy the user-faithfulness the exploration's evidence rests on
- Asserting formatting by default — markup comparison is opt-in; the default
  compares normalised text, or every styling tweak becomes a false failure
- `startsWith` / `endsWith` in v1 — deferred pending a decision on what they
  promise for right-to-left and bidirectional text; the vocabulary ships as
  `exact`, `contains`, `regex`
- A matcher algebra beyond those three plus exactly-one resolution — richer
  selectors can wait for a scenario that needs them
- Auto-committing a promoted scenario — synthesis produces a proposal for a
  human or judge to approve, never a silently committed test
- Multi-platform matcher semantics beyond one worked platform — the neutral slot
  must be *designed* for Telegram callback data / web href / WhatsApp button id,
  but only one need be implemented for the proof

## Key Assumptions to Validate

| Tier | Assumption | How to validate |
|------|------------|-----------------|
| Must-be-true | A matcher synthesised from the journal can uniquely and durably identify an action across volatile labels, reordering and message edits | Build the volatile greetbot variant in MVP Scope; replay across two days' data plus a reordered keyboard |
| Must-be-true | Replay can fail loudly on a genuinely broken flow without the total-prompt hash | Break greetbot's keyboard; confirm the failure names the unresolved matcher, not a generic miss |
| Should-be-true | Step 2's judgement produces matchers a human can read and correct | Have the founder review a synthesised set cold and see whether the intent is obvious without reading the journal |
| Should-be-true | The exactly-one-action gate catches over-loose regexes | Deliberately synthesise a too-loose matcher; confirm the gate rejects it against the recorded journal |
| Might-be-true | Record-twice-and-diff earns its cost as a volatility signal | Compare matcher quality with and without the diff on the same runs; drop it if judgement alone suffices |
| Might-be-true | AI matchers stay rare enough to keep regression runs effectively deterministic | Count deterministic vs AI matchers across the first real scenarios; if AI matchers dominate, the approach needs rethinking |
| Must-be-true | The report lets a reader distinguish "the bot is broken" from "the matcher was too strict" without opening the journal | Break greetbot's keyboard, then separately just reword a label; hand the founder only the reports and see whether each is correctly triaged |
| Should-be-true | The repair loop is store-agnostic — the same UI and report work over a local file, git and a hosted store | Walk the loop once against a local file and once against a hosted store; the report format and UI actions must be identical |

## SpecScore Integration

- **New Features this would create:** scenario action matchers (vocabulary and
  resolution semantics); promotion of an ai-goal part into a deterministic part;
  a matcher-synthesis step over the journal
- **Existing Features affected:**
  [ai-judged-assertions](../features/chatwright/ai-driven-testing/ai-judged-assertions/README.md)
  becomes the third oracle tier *and* the engine for step 2 — one judge seam,
  two customers;
  [observation-model](../features/chatwright/observation-model/README.md) gains a
  second, sighted projection for the test runner over the same journal, so no new
  source of truth appears;
  [deterministic-testing](../features/chatwright/deterministic-testing/README.md)
  gains matchers as a first-class concept
- **Dependencies:** the judge seam from ai-judged-assertions is the natural first
  build, since step 2 and the semantic assertion tier share it

## Open Questions

- Does a promoted deterministic part keep provenance back to the exploration that
  produced it, or stand alone as a plain scenario? Provenance needs a new
  reference in the run-bundle format, so it is cheaper to decide before
  implementation than after.
- Should an AI matcher be permitted in a part declared deterministic at all, or
  must it force a weaker declared kind? Reporting the count is the minimum;
  refusing it outright is the stricter option.
- Where does the neutral hidden-attribute slot live — the journal only, or
  promoted into the sighted projection as a named per-platform field?
- Does matcher synthesis run at the end of every ai-goal part, or only on
  explicit promotion? Automatic gives every run a candidate scenario; explicit
  avoids synthesising matchers nobody will review.
- Should normalised-text comparison be the only default, or should an assertion
  be able to declare presentation-sensitivity from day one?
- When `startsWith` / `endsWith` arrive, do they operate on logical string order
  (what the runtime sees) or visual order (what the author saw)? Logical is the
  only implementable answer, which means the UI must show authors where the
  logical start actually is for a bidirectional label, or they will write
  matchers that look right and match nothing.
- What is the minimum scenario-store interface both clients need beyond
  `Create`/`Get`/`List`/`Update`? Because scenarios are mutable where recordings
  are not, two people or two agents can repair the same scenario at once —
  does the seam carry a version for optimistic concurrency, and does a
  git-backed store satisfy it the same way a Firestore-backed one does?
- Is a human-authored matcher permanently locked against re-synthesis, or can a
  later pass propose a replacement for review without applying it? The lock is
  safe; the proposal is more useful, and both need the origin field either way.

---
*This document follows the https://specscore.md/idea-specification*
