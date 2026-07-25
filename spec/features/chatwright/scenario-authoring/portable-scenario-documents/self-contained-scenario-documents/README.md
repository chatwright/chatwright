---
format: https://specscore.md/feature-specification
status: Draft
---

# Feature: Self-contained scenario documents

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/scenario-authoring/portable-scenario-documents/self-contained-scenario-documents?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/scenario-authoring/portable-scenario-documents/self-contained-scenario-documents?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/scenario-authoring/portable-scenario-documents/self-contained-scenario-documents?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/scenario-authoring/portable-scenario-documents/self-contained-scenario-documents?op=request-change) |
**Status:** Draft
**Source Ideas:** —

## Summary

One committed, language-neutral document—format
`https://chatwright.dev/formats/scenario-document/v1`—that declares a bot
endpoint, an AI goal with its tasks and budgets, the cast, the declared
fidelity and an independent journal verification, and is executed by both
runtimes to the same verdict with no Go or TypeScript written.

## Problem

Today a runnable scenario is Go code. `arena.GreetbotScenario()` is a function:
its goal, budgets, cast, emulator wiring and journal verification are all
compiled in, reachable only by importing `chatwright.dev/runtime` and rebuilding.
Two consequences block work already committed to:

1. **The founder cannot point Chatwright at Listus Bot with an AI goal, record
   the run and show the recording, without writing Go.** Every step of that
   journey exists except the one that says *what the run is*.
2. **A third party cannot hand us a runnable scenario at all.** The knowledge
   platform runs scenarios against bots we do not control—the
   [`recipes`](https://github.com/chatwright/recipes) index, the
   `chatwright.dev/try/github/{owner}/{repo}` badge, a `CHATWRIGHT.md`
   `demos[].scenario` reference. A registered-in-code scenario cannot cross a
   repository boundary, and the greetbot repository's `scenarios/README.md`
   already reserves a directory for the file this format defines.

The parent feature's invocation manifest is the wrong layer for this: it names a
*registered* scenario and carries inputs, so something must still have registered
the scenario in code first. The parent explicitly deferred the answer, asking
"when is the runtime model stable enough to promote actors, fragments,
checkpoints and branches from registered code into the structured schema?" For
the AI-goal subset the answer is now, because `run.Run`, `run.Part`,
`goal.Goal`, `goal.Budgets` and `run.RunCeiling` are frozen and already
serialised in run-bundle v1.

The document is also the file a stranger commits to a public repository and we
then fetch and execute. That makes two things load-bearing rather than
hygienic: it must never carry a secret, and it must never carry anything a
runner would execute.

## Behaviour

### Two layers, one execution path

| Layer | Format | Answers |
|---|---|---|
| Invocation manifest | `https://chatwright.dev/formats/scenario-manifest/v1` | *Which* scenario, which case, which inputs, which modes, which acceptance criteria |
| Scenario document | `https://chatwright.dev/formats/scenario-document/v1` | *What the scenario is*—endpoint, cast, parts, goal, budgets, verification |

The manifest is not superseded and is not duplicated. A document may be executed
directly, with no manifest at all—that is the zero-code path. A manifest may
alternatively point at a document when a caller needs the manifest's own
concerns: case selection, input binding, `verifies` bindings, Rehearse and
SpecScore references.

**The precise manifest addition.** `scenario-manifest/v1` gains one optional
field, `document`, carrying the document's URL or a path relative to the
manifest. `scenario` and `document` become mutually exclusive and exactly one is
required. A manifest that uses `document` MUST also declare
`requiresCapabilities: ["scenario-document"]`.

That last rule is what makes the addition safe against runners already shipped:
the manifest parser in `runtime-ts` validates `requiresCapabilities` against
`["deterministic", "ai-goal", "hybrid"]`, so an unchanged runner reports
`unsupported-capability` for `scenario-document` and refuses—explicitly, with the
original document retained. `schemaVersion` therefore stays `1`: bumping it
would invalidate every existing manifest to obtain a refusal the capability gate
already produces, and would still not describe *what* the older runner lacks.

### Shape

Object keys are camelCase with `Id`/`Url` acronym casing. String constants are
reused verbatim from run-bundle v1 and the sdk wire vocabulary—`ai-goal`,
`deterministic`, `ai-agent`, `bot`, `platform-emulated`, `user`, `message`,
`abort`, `coverage-gap`—so no runtime has to translate a value between the
document and the evidence it produces. There are no integer enums anywhere.

Top-level members:

| Member | Required | Purpose |
|---|---|---|
| `format`, `schemaVersion` | yes | Format identity and schema version |
| `id`, `version`, `title` | yes | The scenario's stable identity, its own revision, its one-line summary |
| `description` | no | Prose for a reader |
| `requires` | no | Capability strings a runner must support |
| `fidelity` | yes | `endpointProfile`, `transport`, `environment`, `dataSensitivity` |
| `platform` | yes | Platform id (`telegram`) |
| `chats` | yes | Declared chats; exactly one in v1 |
| `bot` | yes | The bot under test: how it is reached, and its roster identity |
| `cast` | yes | Non-bot participants, each with its platform identity and, for an `ai-agent`, its provider |
| `secrets` | no | Named secret *references*—never values |
| `inputs`, `cases` | no | Declared inputs and named input bindings the manifest's `case`/`inputs` select |
| `parts` | yes | The ordered passages of the run |
| `ceiling` | no | Run-level aggregate ceiling across ai-goal parts |
| `verify` | no | Independent journal verification of what actually happened |
| `verifies` | no | Descriptive acceptance-criterion bindings—non-executable |

`chats[*]` is `{"id", "platformChatId"}`; the `id` is document-local and is what
a part's `chat` references, so no part hard-codes a platform chat number.
Declaring more than one chat is rejected in v1 with `unsupported-capability:
multi-chat`—`run.Environment.ChatIDs` is already a list, so the shape is
reserved, not designed away.

### The bot endpoint

`bot` declares how the runtime reaches the bot under test and, at the same time,
the bot's roster entry—`ScenarioSession.BotActor` and the emulator wiring are one
declaration, not two:

| Member | Purpose |
|---|---|
| `id`, `name` | Roster actor id and display name |
| `transport` | `http` or `iframe` (the two bot-protocol transports), or `direct` for the headless-engine profile |
| `delivery` | `http` only: `webhook` (the emulator pushes to `url`) or `polling` (the bot long-polls the emulator's `getUpdates`) |
| `url` | The bot's webhook URL, or the iframe `src` |
| `headers` | Optional request headers for `webhook` delivery; each value is a secret reference |
| `exampleBot` | Instead of `url`: an example bot the *runtime itself* ships |

Exactly one of `url` or `exampleBot` is present. `url` is required for `iframe`
and for `http` + `webhook`, and forbidden for `http` + `polling`—a polling bot
needs no inbound address at all, which is what makes "point Chatwright at Listus
Bot" expressible: the operator points the bot's Bot API base URL at the
emulator, and the document declares nothing about the bot's own address.

**There is no bot-token member, deliberately.** The Telegram emulator records the
token from the `/bot<token>/<method>` request path but never validates it, so
Chatwright has no reason to know a bot's credential. Removing the field removes
the single most likely secret from every committed scenario file.

**`exampleBot` names a bot the runtime ships, and is not an extension point.**
It exists because `arena.GreetbotScenario()` boots
`chatwright.dev/runtime/examples/greetbot` in-process on an ephemeral port—there
is no authorable URL. Both runtimes ship greetbot already
(`runtime-go/examples/greetbot`, `runtime-ts/src/scenario/greetbot.ts`), so the
id is language-neutral while the implementation differs, which is exactly what
principle 7 permits. A document using it declares
`requires: ["exampleBot:greetbot"]` so a runner without that example refuses by
name. Third-party bots use `url`; nothing in this member can introduce
third-party code into the runner.

**The bot's platform identity is assigned by the emulator, not the document.**
`bot.name` becomes both the roster `name` and the platform identity's
`firstName`; the platform user id comes from the emulator and is recorded in the
bundle roster. Omission means "the emulator assigns it", never "unknown".

### The cast and its providers

`cast[*]` is `{"id", "type", "name", "platformIdentity", "provider"}`.
`platformIdentity` (`{"userId", "firstName"}`) is one declaration serving both
the roster entry and the user the loop acts as, matching how `platform.User` and
the roster entry carry the same identity today.

An `ai-agent` actor carries its own `provider`, because a model *is* what an AI
actor is; a part references the actor, so nothing declares a provider twice. Two
kinds in v1:

- `{"kind": "model", "providerId", "model", "baseUrl", "apiKey"}`—a live
  provider. `apiKey` is a secret reference.
- `{"kind": "cassette", "mode": "replay", "cassette"}`—replay a checked-in
  cassette at zero token cost. `mode: "record"` additionally requires
  `wraps`, a `model` provider.

**`scripted` is deliberately not expressible.** A scripted provider must name the
action it clicks, and an available action's id is opaque and only known once the
picker has been observed—`runtime-ts`'s own greetbot module says so and uses an
observation-driven policy provider instead of `ScriptedProvider` for exactly this
reason. A document therefore cannot author a click today, which is precisely the
gap action matchers close (see *Reserved for action matchers* below). Offering a
`scripted` kind now would produce documents that cannot work.

A runner may override a declared provider—the arena substitutes one per cell—and
MUST record the override in evidence rather than presenting the document's
declaration as what ran.

### Parts, budgets and ceilings

`parts[*]` is `{"id", "kind", "title", "chat", "actorId", "failurePolicy",
"goal", "loop"}`, mapping onto `run.Part` and `run.AIGoalPartInput` member for
member. `failurePolicy` is `abort` or `coverage-gap`; omitted means `abort`,
the documented—not silent—default `run.FailurePolicy.effective` already applies.

`goal` is `goal.Goal`: `id`, `title`, `description`, `tasks[*]`
(`id`, `title`, `dependsOn`, `successCriteria`, `milestones`), `constraints`
and `budgets`.

**Budgets are required, not optional.** An `ai-goal` part MUST declare `budgets`
with at least one of `maxSteps`, `maxDurationSeconds` or `maxCost` set to a
positive value; a part declaring none is rejected. This is stricter than
`goal.Budgets`, whose zero value means "unlimited"—correctly so for a Go caller
who wrote the code, and unacceptable for a file that arrives from a stranger's
repository and spends tokens against someone's bot.

`ceiling` maps to `run.RunCeiling` (`maxSteps`, `maxCost`,
`maxDurationSeconds`) and aggregates across ai-goal parts on top of each part's
own budgets. It is optional, and its absence is *reported* by validation as
`noRunCeiling` so an unbounded aggregate is a visible authoring choice.

**Durations are integer seconds** (`maxDurationSeconds`,
`actWaitTimeoutSeconds`), never nanoseconds and never fractional. The wire shape
in run-bundle v1 keeps `maxDurationNanoseconds` because it is generated from
`time.Duration`; this is an authoring format, and a hand-authored nanosecond
count is a defect waiting to happen. Integers only, because a fractional second
multiplied out independently in two runtimes is a parity hazard for no benefit.

`loop` carries the `actor.Config` tunables with identical defaults in both
runtimes: `historyWindow` (10), `nonProgressLimit` (3),
`actWaitTimeoutSeconds` (5), `retainObservations` (true), `overshootProbe`
(true). The last two are positively named; they map to Go's
`DisableObservationRetention` and `DisableOvershootProbe` inverted. A document
omitting `loop` entirely gets those defaults in both runtimes.

### Declared fidelity and environment

`fidelity` is required, because a result that does not name its endpoint profile
and its environment is not a result (principle 4):

- `endpointProfile`—`platform-emulated` or `headless-engine`, the vocabulary of
  decision 0008 and `sdk.EndpointProfilePlatformEmulated`. Evidence is never
  interchangeable across profiles.
- `transport`—`http`, `iframe` or `direct`, reusing `CHATWRIGHT.md`'s existing
  `transport` values plus `direct` for the headless profile.
- `environment`—`dev`, `test`, `production` or `unknown`, the vocabulary the
  sensitive-data-redaction idea fixed (founder, 2026-07-25). A document's
  explicit declaration is the most authoritative source; below it sit a
  configured URL→environment map and a heuristic for the unambiguous hosts
  (`localhost`, `127.0.0.1`, `*.localhost` → `dev`). An unrecognised host is
  recorded as `unknown`, never guessed.
- `dataSensitivity`—`synthetic` (the default and the safe value) or
  `real-subject`. Environment *defaults* sensitivity and never determines it:
  `production` defaults to `real-subject`, and `real-subject` may be declared on
  a `test` endpoint, which is the case that leaks in silence otherwise.
  Declaring `real-subject` makes a redaction policy mandatory, so a document
  declaring it without one is rejected.

### Secrets: referenced, never carried

A scenario document is written to be committed and shared, including by people
we have no relationship with. The rules are therefore rejections, not warnings.

`secrets[*]` declares a *name* and where the runner resolves it from—exactly one
of `{"env": "VAR"}` or `{"credential": "name"}`, resolved from the runner's own
credential store:

```json
"secrets": [
  {"name": "listusAuth", "from": {"env": "LISTUS_BOT_AUTH_HEADER"}},
  {"name": "anthropicKey", "from": {"credential": "anthropic-default"}}
]
```

1. **Secret-bearing fields are a closed list**, enumerated by the format:
   `bot.headers[*].value` and `cast[*].provider.apiKey` (plus
   `cast[*].provider.wraps.apiKey`). A closed list is the point: an open one
   means the next field added silently becomes a leak path.
2. **A secret-bearing field MUST be `{"secretRef": "<name>"}`.** A string
   literal there is a rejection, not a warning. `secretRef` may carry no
   sibling members—no `value`, no `default`, no `fallback`—anywhere inside
   `secrets` or a secret-bearing field. `${VAR:-literal}` shaped defaults are
   how inline secrets get committed.
3. **A `secretRef` naming an undeclared secret is rejected.** A declared but
   unused secret is reported, not rejected.
4. **A `url` carrying credentials is rejected**: userinfo (`//user:pass@`) or a
   query parameter whose name case-insensitively matches `token`, `apiKey`,
   `api_key`, `access_token`, `accessToken`, `key`, `password`, `secret` or
   `signature`. The redaction idea strips these before recording a URL in a
   bundle; a document is authored rather than captured, so here the same values
   are refused outright.
5. **Rejection is whole-document.** No part of a rejected document executes, and
   no field of it is resolved.
6. **A rejection names the JSON pointer and the rule, and never echoes the
   value.** Echoing it would copy the secret into logs, CI output, issue
   attachments and screen shares—the diagnostic becomes the leak.
7. **Resolved values never reach an artefact**: not the bundle, not the semantic
   digest, not the validation report (parent AC
   `resolved-secrets-are-not-serialized`).

Known limit, stated rather than papered over: a secret pasted into a *non*-secret
field—a task's `successCriteria` prose, a title—is beyond any parser's reach.
That is the redaction pipeline's job, not this format's, and the format claims
nothing about it.

### Parsing is inert, and refusal is explicit

Parsing validates structure and nothing else. It never starts a bot, loads an
example bot, opens a database, reads an environment variable, resolves a
credential, opens a network connection or executes anything—the precedent the
manifest parser already set. Secret *resolution* is a separate, explicit step
that runs only after validation has succeeded.

**The document contains no executable strings.** There is no `command`, no
`script`, no `shell`, no `entrypoint`, no template-expression syntax, and a
document carrying such a member is rejected. This is not stylistic: the badge
resolves `chatwright.dev/try/github/{owner}/{repo}` against a stranger's
repository, so a launch-command member would make the badge a remote code
execution primitive. It also means the format cannot start a bot for you; for
`transport: "http"` the operator points the bot at the emulator's Bot API base
URL out of band, and that prerequisite is documented rather than automated.

Validation reports, each naming a machine-readable code and a JSON pointer:
unsupported `format`, `schemaVersion` or capability; secret-rule violations;
unresolved, cyclic or duplicate identities; an `actorId`, `chat` or `secretRef`
that resolves to nothing; an `ai-goal` part without budgets; more than one chat;
a deterministic part; and `noRunCeiling`. An unsupported version or capability is
named, and the original document is retained (parent AC
`unsupported-schema-is-safe`).

### Independent verification of what happened

`verify` is the declarative form of `arena.Scenario.Verify`—a deterministic
re-derivation of completion from the journal, independent of whatever the actor
claimed (principle 3). It is an ordered list of journal expectations over one
chat:

```json
"verify": {
  "chat": "main",
  "metDetail": "started, clicked English, acknowledged — all journal-verified",
  "journal": [
    {"id": "sent-start", "unmetDetail": "never sent /start", "all": [
      {"field": "kind", "op": "exact", "value": "message"},
      {"field": "direction", "op": "exact", "value": "user"},
      {"field": "text", "op": "exact", "value": "/start"}
    ]}
  ]
}
```

- Each condition is a **`{field, op, value}` triple with an optional
  `negate`**—the same shape the exploration-to-regression idea fixed for action
  matchers (founder, 2026-07-25), so when matchers land they extend one
  vocabulary in an action scope instead of introducing a second one. Operators
  are `exact`, `contains` and `regex`; `exact` and `contains` accept a list of
  values meaning any-of. `regex` is restricted to the RE2 ∩ JavaScript subset—no
  backreferences, no lookaround—and out-of-subset patterns are rejected at
  validation, never at replay in one runtime.
- v1 fields are `kind` (`message`, `action`, `uncaptured`), `direction` (`user`,
  `bot`), `text` and `edited`. `edited` is the boolean projection of
  `JournalEntry.Version > 0`, named for what an author means rather than
  exposing a version counter. `contains` and `regex` on a non-string field are
  rejected.
- **Expectations are ordered**: expectation *N* matches the earliest journal
  entry strictly after the entry expectation *N−1* matched. This is a deliberate
  tightening of `verifyGreetbotJournal`, whose `sawStart` check is
  index-independent; the two agree on every reachable greetbot journal, and
  ordered reads the way an author expects.
- The verdict maps to `VerifyResult`: all expectations met yields
  `verified: true` with `metDetail`; otherwise `verified: false` with the fixed
  runtime prefix `journal evidence incomplete: ` followed by the unmet
  expectations' `unmetDetail` values joined with `; `, in declared order. The
  prefix and join belong to the runtime and are identical in both, so the whole
  detail string is byte-comparable across runtimes.

**A document with no `verify` block is not reported as verified.** Its outcome is
labelled *judged*, per the glossary's judged-versus-verified rule, and validation
reports `noIndependentVerification`. `arena.Scenario.Verify` may be nil, so the
absence must remain expressible—but it must never read as evidence.

### Reserved for action matchers, not precluded

`parts[*].kind: "deterministic"` is reserved with a reserved `steps` member. A v1
document declaring one is rejected with `unsupported-capability:
deterministic-steps`; a future document announces it with
`requires: ["deterministic"]`. Deterministic steps need action matchers to select
a button, matchers are specified by
[exploration-to-regression](../../../../../ideas/exploration-to-regression.md)
and are not built, and this feature does not pre-empt them. What it does
guarantee: the part list, the failure policy, the matcher triple and the
journal-expectation vocabulary are already in place, so matchers arrive as a new
`steps` member over an unchanged document skeleton.

### Format publication

The format is published at `formats/scenario-document/v1/` with a normative
`README.md` and a `schema.json` whose `$id` is
`https://chatwright.dev/formats/scenario-document/v1/schema.json`, generated
from the Go types rather than hand-authored, and guarded by the same
`format-drift` workflow that guards run-bundle v1 against both the canonical
generator repository and the copy served at `chatwright.dev`.

### Not in v1, and why

Multiple bots and multiple chats (the shapes are reserved; `run.Environment`
already takes a chat list); fragments, checkpoints and branches (the parent's
open question stays open for these—they are not yet frozen the way
`goal.Goal` is); Starlark (a separate authoring surface, not this document);
matcher synthesis and promotion from an ai-goal part (exploration-to-regression);
a redaction policy body (sensitive-data-redaction owns it—this format only
declares which policy applies); binding a secret through an `input` (an input is
a plain value in v1, and the secret-bearing-field rule refuses an `inputRef`
there on purpose).

### Worked example: greetbot, expressed

This is `arena.GreetbotScenario()` with nothing compiled in—the feature's named
proof, and the file an implementer builds against. Its `successCriteria` is the
Go string verbatim; its budgets, ids, title, chat, user and journal verification
are the Go values verbatim.

```json
{
  "format": "https://chatwright.dev/formats/scenario-document/v1",
  "schemaVersion": 1,
  "id": "greetbot-language-onboarding",
  "version": "v1",
  "title": "Complete language onboarding and acknowledge the greeting",
  "description": "Send /start, click the action labelled exactly \"English\" among three choices, recognise the in-place edit to the English greeting, and acknowledge it with free text before declaring done.",
  "requires": ["ai-goal", "exampleBot:greetbot"],
  "fidelity": {
    "endpointProfile": "platform-emulated",
    "transport": "http",
    "environment": "dev",
    "dataSensitivity": "synthetic"
  },
  "platform": "telegram",
  "chats": [
    {"id": "main", "platformChatId": 42}
  ],
  "bot": {
    "id": "greetbot",
    "name": "GreetBot",
    "transport": "http",
    "delivery": "webhook",
    "exampleBot": "greetbot"
  },
  "cast": [
    {
      "id": "arena",
      "type": "ai-agent",
      "name": "Arena",
      "platformIdentity": {"userId": 7, "firstName": "Arena"},
      "provider": {
        "kind": "cassette",
        "mode": "replay",
        "cassette": "cassettes/greetbot-language-onboarding.json"
      }
    }
  ],
  "parts": [
    {
      "id": "language-onboarding",
      "kind": "ai-goal",
      "title": "Complete language onboarding",
      "chat": "main",
      "actorId": "arena",
      "failurePolicy": "abort",
      "goal": {
        "id": "language-onboarding-arena",
        "title": "Complete language onboarding and acknowledge the greeting",
        "tasks": [
          {
            "id": "language-onboarding",
            "title": "Complete language onboarding",
            "successCriteria": "Send \"/start\" as text to begin the conversation. Wait for the bot's language picker message, which carries labelled available actions. Click the action labelled exactly \"English\" (a click proposal, using its listed action id) — do not send free text for this step, and do not click any other label. After the bot's greeting message changes (it is edited in place to an English greeting), send one short text message acknowledging the greeting (for example \"Thanks!\" or \"Great, thanks for the greeting!\"). Only once you have sent that acknowledgement should you declare the task done."
          }
        ],
        "budgets": {
          "maxSteps": 12,
          "maxDurationSeconds": 240
        }
      }
    }
  ],
  "verify": {
    "chat": "main",
    "metDetail": "started, clicked English, acknowledged — all journal-verified",
    "journal": [
      {
        "id": "sent-start",
        "unmetDetail": "never sent /start",
        "all": [
          {"field": "kind", "op": "exact", "value": "message"},
          {"field": "direction", "op": "exact", "value": "user"},
          {"field": "text", "op": "exact", "value": "/start"}
        ]
      },
      {
        "id": "greeting-changed",
        "unmetDetail": "never got the English greeting (wrong/no click)",
        "all": [
          {"field": "kind", "op": "exact", "value": "message"},
          {"field": "direction", "op": "exact", "value": "bot"},
          {"field": "edited", "op": "exact", "value": true},
          {"field": "text", "op": "exact", "value": "Howdy stranger"}
        ]
      },
      {
        "id": "acknowledged",
        "unmetDetail": "never sent an acknowledgement after the greeting changed",
        "all": [
          {"field": "kind", "op": "exact", "value": "message"},
          {"field": "direction", "op": "exact", "value": "user"},
          {"field": "text", "op": "regex", "value": "\\S"},
          {"field": "text", "op": "exact", "value": "/start", "negate": true}
        ]
      }
    ]
  },
  "verifies": [
    "chatwright/scenario-authoring/portable-scenario-documents/self-contained-scenario-documents#ac:greetbot-scenario-is-expressible"
  ]
}
```

Point it at a real deployed bot instead of the bundled example by replacing
`bot` and `fidelity`, and nothing else:

```json
{
  "fidelity": {
    "endpointProfile": "platform-emulated",
    "transport": "http",
    "environment": "test",
    "dataSensitivity": "synthetic"
  },
  "bot": {
    "id": "listus",
    "name": "Listus Bot",
    "transport": "http",
    "delivery": "polling"
  }
}
```

## Dependencies

- [Portable scenario documents](../README.md)
- [Scenario authoring](../../README.md)
- [Scenario composition](../../scenario-composition/README.md)
- [Goal and task contract](../../../goal-driven-ai-testing/goal-and-task-contract/README.md)
- [In-browser test runs](../../../playground/in-browser-test-runs/README.md)
- [Hybrid runs](../../../../../ideas/hybrid-runs.md) — the part model this
  document declares
- [Sensitive data redaction](../../../../../ideas/sensitive-data-redaction.md) —
  the environment and data-sensitivity vocabulary
- [Exploration to regression](../../../../../ideas/exploration-to-regression.md)
  — the matcher triple this document reuses, and the owner of action matchers
- Research item I-71 in
  [`spec/research/knowledge-platform.md`](../../../../../research/knowledge-platform.md)

## Acceptance Criteria

### AC: greetbot-scenario-is-expressible

Scenario: The hardcoded arena greetbot scenario is replaced by a document
Given the document in this feature's worked example and no manifest
When the Go runtime validates and executes it
Then its resolved run declares the same scenario id, version and title, the same
goal id, task id, success criteria and budgets, the same chat, user and bot
roster identity, and the same ordered part as `arena.GreetbotScenario()`
And the journal verification returns the same verdict and the same detail string
as `verifyGreetbotJournal` for that run's journal
And no Go or TypeScript source was written or rebuilt to run it

### AC: same-document-same-verdict-in-both-runtimes

Scenario: One document, two runtimes, same verdict
Given the greetbot document as a shared conformance fixture
When the Go runtime and the TypeScript runtime each parse and resolve it
Then both produce byte-identical resolved run descriptions
And executing it against the same recorded provider evidence yields the same
verdict and the same verification detail string in both
And any deviation is recorded in `docs/runtime-parity.md` with its reason and
proof link

### AC: inline-secret-is-rejected

Scenario: A document carries a literal API key
Given a document whose `cast[0].provider.apiKey` is a string literal rather than
a `secretRef`
When it is validated
Then the document is rejected, not warned about
And no part of it executes
And the report names the JSON pointer to that field and the rule it broke
And the report does not contain the literal value

### AC: credential-bearing-url-is-rejected

Scenario: A bot URL smuggles a credential
Given a document whose `bot.url` carries `user:pass@` userinfo, and another
whose `bot.url` carries a `?token=` query parameter
When each is validated
Then each is rejected with the offending member named and its value withheld
And neither is silently stripped and accepted

### AC: parsing-resolves-nothing-and-starts-nothing

Scenario: Validation of a fully populated document has no side effects
Given a document declaring an `env`-backed secret, a `credential`-backed secret,
an `exampleBot`, an HTTP bot URL and a cassette provider
When it is parsed and validated
Then no environment variable is read and no credential store is consulted
And no bot is started, no example bot is loaded, no database is opened, no
cassette file is read and no network connection is made
And secret resolution happens only in a later, explicit step that a failed
validation never reaches

### AC: executable-string-members-are-rejected

Scenario: A third-party document tries to make the runner execute something
Given a document carrying a `command`, `script`, `shell` or `entrypoint` member
anywhere in it
When it is validated
Then it is rejected naming that member
And the rejection is independent of where the document came from, so the
`chatwright.dev/try/github/{owner}/{repo}` path cannot execute a stranger's
command

### AC: ai-goal-part-without-budgets-is-rejected

Scenario: An unbounded AI-goal part is refused
Given an `ai-goal` part whose `budgets` is absent, empty, or has every bound at
zero
When the document is validated
Then it is rejected naming that part and the budgets member
And a part with any one positive bound is accepted

### AC: ceiling-trip-attributes-run-and-part

Scenario: A run-level ceiling stops a document-declared run
Given a document with two `ai-goal` parts and a `ceiling` smaller than their
combined budgets
When it runs
Then the run stops and the stop reason names both the run ceiling dimension and
the part that was executing
And each part's own budgets still bind independently of the ceiling

### AC: undeclared-verification-is-never-reported-as-verified

Scenario: A document declares no independent journal verification
Given a document with no `verify` member
When it runs to a successful actor task-done claim
Then validation reported `noIndependentVerification`
And the outcome is labelled judged, never verified
And the run is not presented as evidence that the goal was met

### AC: environment-is-declared-and-never-guessed

Scenario: Environment and data sensitivity are recorded honestly
Given a document declaring an unrecognised bot host and no `environment`
When it is resolved
Then the environment is recorded as `unknown`, never inferred as `dev` or
`production`
And a document declaring `production` defaults to `real-subject`
And a document declaring `real-subject` on a `test` endpoint keeps
`real-subject`
And a `real-subject` document with no redaction policy is rejected

### AC: unsupported-capability-is-named-not-dropped

Scenario: A runner meets a document it cannot execute
Given a document declaring `requires: ["deterministic"]` with a `deterministic`
part, and another declaring two chats
When each is validated by a v1 runner
Then each is rejected naming the unsupported capability
And the original document content is retained, not discarded
And no member is silently ignored

### AC: manifest-can-reference-a-document

Scenario: An invocation manifest points at a self-contained document
Given a `scenario-manifest/v1` manifest with `document`, a `case`, `inputs`,
`verifies` and `requiresCapabilities: ["scenario-document"]`
When a runner supporting documents executes it
Then it resolves the referenced document, binds the named case's inputs, and
runs it
And the result identifies both the manifest and the document revisions
And a manifest declaring both `scenario` and `document`, or neither, is rejected
And an unchanged runtime-ts v1 manifest parser reports
`unsupported-capability` for `scenario-document` rather than running anything

### AC: published-schema-does-not-drift

Scenario: The format is published and guarded like run-bundle v1
Given `formats/scenario-document/v1/README.md` and `schema.json` with `$id`
`https://chatwright.dev/formats/scenario-document/v1/schema.json`
When the `format-drift` workflow runs
Then it fails if this repository's copy differs from the generated canonical
schema or from the copy served at `chatwright.dev`
And the worked example in this feature validates against that schema

## Open Questions

- A single cassette replayed by both runtimes would make the parity proof
  model-free and free, but the Go key is
  `sha256(providerConfig + "\x00" + json.Marshal(prompt))`—Go struct field
  order—and `runtime-ts` has no cassette implementation at all yet. Does a
  cross-runtime cassette need a canonical-JSON keying contract, or does each
  runtime keep its own cassette and parity rest on the resolved run description
  plus the verdict?
- Journal expectations need `negate` for the greetbot proof (the acknowledgement
  must not be another `/start`), but the matcher triple that
  exploration-to-regression fixed has no negation. Does that feature adopt
  `negate`, or does it stay a journal-expectation-only modifier?
- Where does a document's redaction policy live—inline, a sibling file
  referenced by name, or workspace configuration that the document only names?
  The redaction idea leaves this open, and `real-subject` cannot be accepted
  until it is answered.
- Should `exampleBot` exist in the published format at all, or only in a
  runtime-internal profile? It is the only member whose meaning depends on what
  the runtime ships, and the greetbot proof needs it.
- Does a document declare its own semantic digest inputs, or is the digest
  purely derived? The parent feature requires each resolved dependency
  (cassette, redaction policy, referenced document) to participate in the
  digest, and a cassette path that changes content without changing name would
  otherwise be invisible.
- Is `polling` delivery honest enough for a `production` bot? The operator has
  to repoint the bot's Bot API base URL, which is a real configuration change to
  a running system, and nothing in the document can prove it happened.

---
*This document follows the https://specscore.md/feature-specification*
