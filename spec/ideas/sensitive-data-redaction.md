---
format: https://specscore.md/idea-specification
status: Draft
---
# Idea: Sensitive data redaction

**Status:** Draft
**Date:** 2026-07-25
**Owner:** alex
**Promotes To:** —
**Supersedes:** —
**Related Ideas:** extends:exploration-to-regression, extends:hybrid-runs, extends:live-recording-sdk, extends:openvaultdb-artifact-storage

## Problem Statement

How might we let a support engineer reproduce a real user's bug against real data
without the resulting recording becoming a durable, shareable copy of that user's
financial, identity or health information?

## Context

The founder's scenario (2026-07-25): a user reports a chatbot problem. Support runs
a test scenario against that user's real profile and ID. The bot dutifully replies
with the user's balance, passport number, or whatever else it is designed to show.
All of it lands in a run bundle—an artefact whose entire purpose is to be saved,
replayed, attached to a ticket, committed beside a test, and uploaded to Cloud.

Chatwright's design makes this worse rather than better, precisely because
recordings are meant to be durable and portable:

- **Bot message text** is the obvious surface—a balance, an account number, an
  address.
- **Button labels** carry the same values (`Pay £4,231.55`).
- **Hidden attributes** carry user identifiers and tokens in callback data, and
  those are now first-class matcher inputs under
  [exploration-to-regression](exploration-to-regression.md).
- **Actor text** includes whatever the user typed, which is where a passport
  number most often enters a conversation.
- **The actors roster** carries `PlatformIdentities`—real platform user IDs. That
  is PII in *metadata* rather than message text, so it survives any redaction
  aimed only at transcripts.
- **Data-state assertion results** can return rows of real records.
- **Provider cassettes** are the worst path and the least obvious: an actor or
  judge cassette records the evidence it was shown *verbatim*, and cassettes are
  designed to be **checked into a repository**. A leak here does not sit in a
  ticket; it sits in git history, possibly public, permanently.

One existing decision informs the answer without settling it. OVDB decided against
at-rest encryption *as its* privacy mechanism—users pick a private repository
instead—and parked encryption as opt-in if ever. That is OVDB-scoped and not an
ecosystem ban, and it concerns **server-held** at-rest encryption, where the
custodian holds the keys and therefore gains little. **Client-side encryption under
a user-held key is a different threat model**: the custodian structurally cannot
read the content, even when compromised. The Playground already establishes that
pattern here—a BYOK key is held client-side and never transmitted to Chatwright
(I-76).

And `cloud/recordings` establishes the posture for a limit it cannot meet:
`MaxStoredBundleBytes` rejects an oversized recording with a clear error rather
than truncating it silently.

**Redaction and encryption defend against different adversaries, and neither
substitutes for the other.** Encryption protects content from anyone without the
key—the storage provider, an attacker, a mis-shared bucket. Redaction protects
content from everyone who is *legitimately handed the key*: the colleague on the
ticket, the AI agent dispatched to fix the bug, the reviewer reading a committed
cassette. A bundle can be perfectly encrypted and still expose a passport number
to every authorised reader. Both layers are needed.

## Recommended Direction

**Prefer not capturing it.** Redaction is the fallback, not the plan. The strongest
answer to the founder's scenario is to reproduce against a *synthetic subject
seeded from the shape of the real one*—same state-machine position, same account
type, fabricated values—so the passport number never enters the run at all. A
redaction pipeline is for cases where reproduction genuinely requires production
data, and it should never become the normal path, because every redaction
mechanism is a thing that can be misconfigured.

For those remaining cases, five decisions:

**1. A run declares its data-sensitivity mode, and the safe value is the default.**
A run is `synthetic` unless someone explicitly declares `real-subject`, and
declaring `real-subject` makes a redaction policy mandatory. The value here is less
enforcement than the moment it creates: the engineer about to touch a real profile
has to say so, and that is exactly when a policy can be attached and a warning
shown.

**1b. The bundle records the endpoint it ran against and what kind of environment
that is** (founder, 2026-07-25): both the bot **URL** and an **environment**
label—`dev`, `test`, `production`, or `unknown`. This is a new dimension
*alongside* the existing declared fidelity labels, not a rename of one: the
endpoint profile records transport (`HTTP`/`direct`), while environment records
which deployment was on the other end. Both belong in a result under principle 4,
and it is independently useful outside privacy—an arena comparing a run against
production with a run against a local mock is comparing nothing.

Resolution order, most authoritative first: an explicit per-run declaration; a
configured URL→environment map; a heuristic for the unambiguous cases
(`localhost`, `127.0.0.1`, `*.localhost` → `dev`); otherwise `unknown`. An
unrecognised host is recorded as **`unknown`, never guessed into `dev` or
`production`**—inventing a fact about where data came from is worse than admitting
ignorance. But labelling honestly and behaving cautiously are different things:
`unknown` should attract the *conservative* redaction default, so the pattern floor
applies.

**Environment must default the sensitivity mode, never determine it.** These are
orthogonal, and the dangerous case is precisely where they diverge: a `test`
environment restored from a production dump holds real user data while every label
says "test". If environment determined sensitivity, that case would leak in
silence—and it is the most common way test systems come to hold real data. So
`production` defaults to `real-subject`, and someone can still declare
`real-subject` on a `test` endpoint.

The recorded URL needs care of its own: strip credentials and query-string tokens
(`user:pass@`, `?token=…`) before storing, or the field meant to improve
diagnostics becomes a secret-leak path. Internal hostnames are themselves mildly
sensitive, which is one more reason a bundle's sensitivity declaration covers
metadata and not only transcripts.

**2. Redact at capture, in the journal write path—not at export.** Anything else
means an unredacted copy existed: on disk, in a temp file, in a process that
crashed and dumped. You cannot un-leak. Export-time scanning still exists, but as a
*backstop* for what capture-time rules missed, never as the primary mechanism.

**3. Deterministic pseudonymisation, not masking.** This is a correctness
requirement, not a preference. Matchers and assertions are built over recorded
values, so blanket masking to `****` destroys the thing that makes a recording
replayable. Each distinct sensitive value maps to a **stable token within a run**
(`AB1234567` → `«passport:7f3a»`), preserving structure where possible so a matcher
like `contains: "Balance: "` survives. Redaction itself is **one-way**: it removes
what should not be visible to *any* reader, so there is nothing to recover. That is
independent of whether the surviving content is then encrypted at rest, which
decision 6 covers.

**4. Redaction runs before matcher synthesis.** Ordering matters and getting it
wrong is subtle: synthesise matchers over raw values and they reference strings that
no longer exist once the recording is redacted, so the scenario passes for the
person who recorded it and fails for everyone else. Same for cassettes—they must be
produced from already-redacted evidence. That follows from decision 2 but needs
stating, because a cassette is the artefact most likely to reach a public
repository.

**5. Sources of "what is sensitive", in preference order.** No single mechanism
suffices:

| Source | Strength | Cost |
|---|---|---|
| **Bot-declared** — the bot marks a field sensitive over the bot protocol | Strongest: the bot is the only party that actually knows | Needs bot cooperation, so never the only mechanism |
| **Scenario-declared** — the author names sensitive fields or paths | Precise, reviewable, versioned with the test | Needs the shape known in advance |
| **Pattern floor** — card numbers, IBANs, emails, phone numbers, common passport shapes | Cheap, deterministic, no model, catches the classics | High false-negative rate; a balance figure is not detectable by shape |
| **Local-model classification** | Catches semantic PII that patterns miss | Nondeterministic, slow, and see the trap below |

**The trap to avoid: never send data to a remote model to ask whether it is
sensitive.** That transmits the exact payload being protected, to a third party,
before any decision is made. If classification is used at all it must be
local-only—a capability `chatwright server` already provides.

**6. Cloud stores plaintext metadata plus client-side-encrypted content, under a
user-held key** — ⏸️ **PARKED 2026-07-25, direction recorded, mechanism deferred to
a dedicated security session** (founder: "I want later a dedicated session on
security — for now let's focus on getting things off the ground"). Nothing below is
settled beyond the two decisions already taken: the split shape, and the key being
user-held rather than Sneat-derived. Do not begin implementing this section without
that session.

So the question is not whether Cloud may keep a production, real-subject bundle,
but *in what form*: a bounded plaintext envelope—run id, timestamp, scenario id,
environment label, sensitivity mode, verdict, counts, durations—beside an opaque
encrypted body carrying the journal, labels, hidden attributes and cassettes.

Two costs this incurs, both product decisions rather than cryptographic ones:

- **Cloud features that need content stop working for encrypted bundles**:
  server-side search over transcripts, server-side replay or rendering,
  server-side judging, any quota computed from content. Those must move
  client-side or be declared unavailable for encrypted bundles. Silently
  degrading them would be the worst outcome.
- **Metadata leaks more than "metadata" suggests.** Scenario names, internal bot
  hostnames and timing are all inferences about a business. The plaintext envelope
  needs an explicit field list, not a "everything except the body" default.

**The key is genuinely user-held** (founder, 2026-07-25)—never derived from the
Sneat sign-in, because a key Cloud can derive is a key Cloud can use, and then "we
structurally cannot read it" is false and the whole reason to build this for
production bundles evaporates. The Playground's BYOK key is the working precedent:
held client-side, never transmitted.

The costs are real and must be designed for, not discovered: a lost key is
permanently lost bundles with no recovery path, a second device needs the key
transferred, and sharing—with a colleague, or with an AI agent dispatched to fix
the bug, which the north-star loop requires—means wrapping the content key per
recipient. None of that is optional work; it is what user-held keys cost, and the
alternative was a weaker guarantee dressed up as a strong one.

**Verification, because a redaction pipeline you cannot check is a liability.** A
bundle declares which policy was applied, so a bundle carrying *no* declaration is
treated as **unknown, never as clean**. A `scan` verb re-runs the pattern floor over
a finished bundle and fails on a hit, so it can gate a commit or an upload in CI.
Anything dropped or truncated is declared rather than quietly omitted, per
principle 4.

## Alternatives Considered

- **Server-held at-rest encryption, decrypted for authorised viewers.** Lost
  because the custodian holds the keys, so it defends against a stolen disk and
  little else — and it does nothing about the readers who are handed the
  plaintext legitimately. Superseded by decision 6's client-side, user-held-key
  model, which is a different threat model rather than a stronger version of the
  same one.
- **Encryption instead of redaction.** Lost on adversary mismatch: encryption
  cannot protect content from someone holding the key, and every legitimate reader
  holds the key. They are layers, not alternatives.
- **Redact only on export or share.** Lost as a primary mechanism: the unredacted
  artefact exists first, which is the whole risk. Retained as a backstop.
- **Blanket masking to a fixed placeholder.** Lost on correctness—it destroys
  matcher and assertion resolution, so the recording stops being replayable, which
  was the reason to record it.
- **Forbid real-subject runs entirely.** Lost as unrealistic: some bugs only
  reproduce against production state, and a rule engineers must break to do their
  job is bypassed silently rather than obeyed.
- **Remote AI classification of every message.** Lost on self-defeat: it transmits
  the payload in order to decide whether the payload may be transmitted.

## MVP Scope

One job: a `real-subject` run against a bot that emits a synthetic passport number
and balance produces a bundle in which neither value appears anywhere—transcript,
button labels, callback data, actor roster or cassette—while the scenario's
matchers and assertions still resolve on replay.

## Not Doing (and Why)

- Reversible redaction — what redaction removes should be visible to no reader, so
  recoverability only adds a key to manage and leak; encryption of the *surviving*
  content is a separate layer (decision 6), not a contradiction of this
- Remote AI classification — transmits what it is meant to protect
- Jurisdiction-specific compliance framing (GDPR/HIPAA article mapping) — the
  mechanism should be sound first; legal mapping is a separate exercise an
  engineering idea should not pretend to settle
- Retroactively redacting existing recordings — a separate migration question whose
  honest answer may be "delete them"
- Cross-run stable pseudonyms — within-run stability is what replay needs, and
  cross-run linkability is a re-identification vector needing its own decision

## Key Assumptions to Validate

| Tier | Assumption | How to validate |
|------|------------|-----------------|
| Must-be-true | Deterministic pseudonymisation preserves matcher and assertion resolution | Take a passing scenario, re-run it under a redaction policy, confirm identical verdicts |
| Must-be-true | Redaction at capture reaches every surface, not just the transcript | MVP bundle: grep the whole artefact — transcript, labels, callback data, roster, cassette — for both planted values |
| Must-be-true | A `test`-labelled endpoint holding real data can still be declared `real-subject` and redacts correctly | Point a `test`-mapped URL at a bot serving real-shaped data, declare `real-subject`, confirm redaction applies despite the environment label |
| Should-be-true | Recorded URLs never carry credentials or tokens | Run against a URL containing `user:pass@` and a `?token=` query; confirm neither survives into the bundle |
| Must-be-true | A cassette produced under redaction still replays | Record under policy, replay in CI with no model, confirm no cache miss |
| Should-be-true | The pattern floor catches classic identifiers at an acceptable false-positive rate | Run it over the greetbot corpus and a fabricated-PII fixture; count both error directions |
| Should-be-true | The `synthetic` default plus explicit `real-subject` is friction an engineer accepts | Walk the founder's support scenario end to end; does the declaration read as a control or an obstacle? |
| Might-be-true | Bot-declared sensitivity is adoptable — bots will mark their own fields | Add it to greetbot and the bot template; see whether it survives contact with a second bot |
| Might-be-true | Synthetic-subject reproduction covers most support cases, keeping redaction rare | Track how often a real bug needs production data once a synthetic path exists |

## SpecScore Integration

- **New Features this would create:** a redaction policy format and capture-path
  pipeline; a bundle-level sensitivity declaration; an environment + endpoint
  declaration with a configurable URL→environment map; a `scan` verb for CI gating
- **Existing Features affected:** run-bundle format v1 gains a policy declaration;
  [exploration-to-regression](exploration-to-regression.md) gains the
  redact-before-synthesis ordering constraint; the bot protocol gains an optional
  field-sensitivity signal; `cloud/recordings` gains a reason to refuse an
  undeclared bundle
- **Dependencies:** none blocking, though the bot-declared tier needs a bot
  protocol addition and local classification needs `chatwright server`

## Open Questions

- Does a bundle with no sensitivity declaration get refused by Cloud upload, or
  merely labelled unknown? Refusing is safer and breaks every bundle recorded
  before this exists.
- Is the pattern floor always on, even for `synthetic` runs? Always-on catches a
  mislabelled run, which is the likeliest real failure — at the cost of
  occasionally mangling fabricated test data that happens to look like a card
  number.
- Where does the policy live — beside the scenario in its store, or as
  workspace/Cloud configuration? Per-scenario is precise; workspace-level is what
  stops someone forgetting.
- Should `PlatformIdentities` be pseudonymised *unconditionally*, given a real
  platform user ID is PII with no test value beyond within-run consistency?
- What happens to a bundle recorded under a policy later found insufficient —
  re-redact, or delete and re-record? Re-redaction cannot undo copies already
  distributed, which may make deletion the only honest answer.
- Where does the URL→environment map live: workspace configuration, Cloud
  configuration, or both with one overriding the other? Whoever owns it owns the
  `production` label, and therefore owns the redaction default.
- Should a `production` run require a second, explicit confirmation rather than
  just a declaration?
### ⏸️ Parked for the dedicated security session

These belong to decision 6 and are deliberately unanswered. They are recorded so
the session starts from a list rather than a blank page.

- How is an encrypted bundle shared, given the key is user-held and the north-star
  loop requires an AI agent to *read* one? Per-recipient key wrapping is the
  standard answer, which makes revocation and agent key custody first-class design
  work rather than a footnote. Alternatives raised and not chosen: run the agent
  client-side where the key already is (simplest, but no hosted agent can ever read
  a bundle), or hand the agent a scoped short-lived plaintext copy (creates the
  plaintext this design exists to prevent).
- Is there any recovery path for a lost user-held key, or is permanent loss the
  accepted and documented outcome? An escrow would restore recoverability at the
  cost of the guarantee just chosen, so "none" is the consistent answer — but it
  needs saying out loud, in the UI, before the first bundle is written.
- Exactly which fields sit in the plaintext metadata envelope? Scenario names and
  internal bot hostnames are business inferences, so this needs an explicit
  allow-list rather than "everything except the body".
- Which Cloud features are declared unavailable for encrypted bundles — search,
  server-side rendering, server-side judging — versus moved client-side?

---
*This document follows the https://specscore.md/idea-specification*
