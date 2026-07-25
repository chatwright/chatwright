# Chatwright glossary

Canonical vocabulary for every Chatwright surface. When wording in another
document conflicts with this file, this file and the decision records win —
fix the other document.

Sources of truth: product vision = [`spec/ideas/chatwright.md`](../spec/ideas/chatwright.md);
sequencing = [`docs/roadmap.md`](roadmap.md); commercial category and pricing =
private backstage. Decisions referenced below live in
[`spec/decisions/`](../spec/decisions/README.md).

## Product and brands

| Term | Meaning |
|---|---|
| **Chatwright** | The product. Always capitalised; never "ChatWright" or "chatwrite". |
| **Tagline** | *Emulate messaging platforms locally. Test real conversational applications.* |
| **Product descriptor** | *An open, local-first conversation development platform.* Use this noun phrase when a sentence needs one. |
| **Conversation Execution Platform** | Retired term. The architecture insight it named (one runtime, many execution modes) is now recorded as declared endpoint profiles (decision 0008). Do not use in new writing. |
| **Chatwright CLI** | The open-source `chatwright` command, released from module `chatwright.dev/cli` (`curl -fsSL https://chatwright.dev/install.sh \| sh`, or `go install chatwright.dev/cli/cmd/chatwright@latest`). "CLI" alone never refers to a repository. |
| **Chatwright Studio** | The open-source (Apache-2.0) web experience — local-first visual inspection, authoring and the Playground UI. Not a paid product (decision 0007). |
| **Chatwright Cloud** | The optional, commercial, operated services: hosted execution, retention, collaboration, organisations, managed AI. The only closed layer. |
| **Playground** | The manual-testing surface where human actors interact with bots through a Platform Emulator. The product term — not "live emulator", not "manual emulator" (a retired spec path). The Studio route `/emulator` predates this term. |
| **chatwrite** | Historical only: the former subdirectory/module of the runtime before it moved to the repository root (2026-07-22). Never a product name. |

## Knowledge platform

| Term | Meaning |
|---|---|
| **North star** | *The best place to learn, design, test and compare conversational UX across messaging platforms.* The platform ambition (idea: executable-knowledge-platform); the Tagline remains the launch-wedge line. |
| **knowledge graph** | The descriptive layer over the run substrate: Jobs, Recipes, Capabilities, Platforms, Implementations, Authors and Repositories, whose edges point at executable artifacts (decision 0011). |
| **Job** | An intent someone wants to accomplish ("collect RSVP"). A thin entry-point node solved by Recipes. |
| **Recipe** | The central executable content asset: an answer to one or more Jobs, with prose, trade-offs, Implementations and a runnable demo. |
| **Capability** | A platform primitive identified by a **capability key** — a stable dotted path (`messaging.buttons.inline`) used identically by compatibility data, emulator fidelity declarations, `CHATWRIGHT.md` manifests, bot-protocol negotiation and search facets. |
| **Implementation** | One Recipe realised on one Platform with one technique, tiered **official / alternative / community**, with documented trade-offs. The unit of comparison. |
| **Recording** | A persisted run — always a run bundle; there is no second recording format. Downloadable without an account; saving to Chatwright Cloud requires authentication. |
| **bot protocol** | The black-box contract with a bot: platform-native payloads over one of two transports — remote HTTPS (the emulated platform API server) or in-browser iframe via `postMessage` with a minimal envelope (decision 0012). |
| **CHATWRIGHT.md** | The repository manifest (format `https://chatwright.dev/formats/chatwright-md/v1`) declaring a repository's bots, platforms, capabilities, implementations and demos. Its `id` is the identity, never the repository name. |
| **central index** | The curated [chatwright/recipes](https://github.com/chatwright/recipes) repository: first-party Jobs/Recipes/Capabilities content plus the registry (and manifest cache) of federated repositories (decision 0013). |
| **Conversation Composer** / **Composer** | The authoring surface — the third door of the Studio's one conversation surface (Player = watch, Playground = try, Composer = perform). "Builder" is reserved for possible future bot code-building. Idea: conversation-composer. |
| **message bar** | The chat input area (text box + send affordances) at the bottom of a conversation surface. One per actor in the Composer. Never "composer" — that word belongs to the surface. |
| **Try in Chatwright badge** | The README badge linking `chatwright.dev/try/github/{owner}/{repo}` — works the moment `CHATWRIGHT.md` exists, no registration. |

## Execution model

| Term | Meaning |
|---|---|
| **Platform Emulator** | A local implementation of a messaging platform as users, apps and bots observe it. It generates platform-shaped updates, delivers them to the real bot, accepts the bot's real API calls and owns the resulting platform state (decision 0006). |
| **Telegram Platform Emulator** | The MVP Platform Emulator. Its two public facets: the **Client Emulator** (actor-facing actions and client-visible view) and the **Server/API Emulator** (bot-facing wire surface: Bot API endpoints and update delivery). Facets of one state authority, not two stateful services. |
| **fake Bot API** / **emulated platform API server** | The bot-facing half of a Platform Emulator — the endpoints the bot under test calls. Both phrasings acceptable; prefer "emulated platform API server" in public copy. |
| **bot under test** / **system under test** | The developer's real software. Chatwright never emulates it. "System under test" is the profile-neutral term (a bot, a conversational engine, or — if promoted — an agent CLI). |
| **endpoint profile** | The declared execution boundary of a run: platform-emulated (strongest), headless engine, or future profiles. Evidence always names its profile and is never interchangeable across profiles (decision 0008). |
| **environment label** | Which deployment a run's bot endpoint actually was: `dev`, `test`, `production` or `unknown`. A dimension *alongside* the endpoint profile (transport), not a rename of it. An unrecognised host is `unknown` — never guessed into `dev` or `production`. |
| **example bot** | A bot the runtime itself ships as an example (`greetbot`), nameable by a scenario document when no authorable URL exists. Not an extension point: it can never introduce third-party code into a runner. |
| **webhook delivery** | Real HTTP delivery of platform updates to the bot's actual webhook — the strongest integration mode (decision 0003). |

## Actors and identity

| Term | Meaning |
|---|---|
| **actor** | Whatever chooses the next action in a conversation: scripted, human, replay or AI. All actors traverse the same declared endpoint. |
| **persona** | Behavioural context an (AI) actor performs with — goals, constraints, traits. A persona is not an identity. |
| **platform identity** | An account on a platform (a Telegram user, a bot token). One user may hold several. |
| **user** | The domain participant in a conversation; distinct from the actor driving them and the identity they appear as. |

## Scenarios and runs

| Term | Meaning |
|---|---|
| **scenario** | The authored, platform-neutral description of a conversation and its assertions. Scenarios express intent; Platform Emulators own mechanics. |
| **scenario document** | A self-contained, committable file that declares *what a scenario is* — bot endpoint, cast, parts, goal, budgets, declared fidelity, verification — executable by both runtimes with no code written. Format `https://chatwright.dev/formats/scenario-document/v1`. Never carries a secret and never carries an executable string. |
| **scenario manifest** | The *invocation* layer: a versioned file naming *which* scenario (a registered one, or a scenario document) with the case, inputs, modes and `verifies` bindings. Format `https://chatwright.dev/formats/scenario-manifest/v1`. A manifest is optional — a scenario document runs on its own. |
| **journal expectation** | One ordered, declarative check a scenario document makes against the journal, built from `{field, op, value}` conditions (operators `exact`, `contains`, `regex`; lists mean any-of) — the declarative form of an independent completion re-derivation. Distinct from an **action matcher**, which selects an action to act on. |
| **secret reference** | The only way a scenario document names a credential: `{"secretRef": "<name>"}` resolving to a declared environment variable or named credential the runner holds. A literal in a secret-bearing field makes the document **rejected**, never warned about. |
| **fragment** | A reusable, input-isolated piece of scenario invoked by path, with provenance recorded (scenario composition). |
| **run** | One execution in one environment with one endpoint profile: an ordered sequence of parts over one continuous conversation and cast. A plain scripted test is a single deterministic part; a plain campaign is a single AI-goal part. A "test" is a deterministic run with assertions. |
| **conversation** / **chat** | The stateful exchange inside a run. Not a synonym for scenario. |
| **milestone** | A named checkpoint of conversational progress a scenario can assert. |
| **breakpoint** | A deterministic pause trigger for inspecting a live run (Playground). |

## State and branching

| Term | Meaning |
|---|---|
| **checkpoint** | A named semantic boundary of coordinated state from which branches start (decision 0009). Checkpoint identity is path-qualified. |
| **branch** (state) | A continuation from a checkpoint with isolated state. The current slice is **database-only** — say so; a branch does not inherit live conversation handles. |
| **state holder** | A registered participant in coordinated checkpoint/branch capture, declaring its real capabilities (decision 0009/0010). |
| **replay fallback** | Re-driving recorded setup instead of snapshotting, when safe capture is unavailable; always distinguishable in evidence. |

## Evidence and observability

| Term | Meaning |
|---|---|
| **evidence** | Everything a run records: transcript, trace, metrics, state assertions, profile and fidelity labels. Evidence is portable and never requires a hosted service to interpret. |
| **transcript** | The semantic record of the conversation (messages, actions, edits as versioned identity). |
| **trace** | The technical record (HTTP requests, API calls, events), correlated to the transcript by stable IDs. |
| **metrics** | First-class measurements (latency, sizes, counts; tokens next) from message to run scope. |
| **fidelity labels** | Declared, never implied: `HTTP`/`direct` (transport), `faithful`/`logical` (platform behaviour), supported/partial/unsupported (coverage). "Fidelity is declared" is doctrine — no "full platform" claims. |
| **freshness** | The deterministic outcome of validating a proposed click against the runtime's current journal state, always `fresh` or `stale`. A validity check against the engine's own state, not a judgement against a criterion — never call this a **verdict** (see that entry). Wire field `freshness` on a `LoopEvent`'s `validation` block (`sdk.Freshness`/`observe.Freshness`; before the 2026-07 rename, this field was itself called `verdict` — a bundle written before that release still carries it under the old name, and every reader falls back to it). |
| **AI-judged assertion** | A scenario assertion whose oracle is a model reading recorded evidence, not a pattern match. The judge interprets evidence and never produces, edits or overrides it (principle 3). Feature: `ai-driven-testing/ai-judged-assertions`. |
| **judgement record** | The evidence one AI-judged assertion adds to a bundle: verdict, rationale, resolved evidence window, judge identity, cassette mode and usage. The only thing a judge is ever allowed to write. |
| **verdict** | Exclusively an AI-judged assertion's outcome, always one of four string constants: `passed`, `failed`, `inconclusive`, `unavailable`. The first two are decisive; the last two are *undecided* and never count as a pass. Studio renders both undecided values as *unverified*. Never use "verdict" for the click-validation outcome — that is **freshness** (see that entry); the two were the same word before the 2026-07 rename and must not drift back together in new writing. |
| **judged** vs **verified** | An outcome supported only by a model's opinion is labelled **judged**; **verified** is reserved for deterministic evidence. Declared fidelity applied to evaluation. |
| **data-sensitivity mode** | Whether a run touched real user data: `synthetic` (the default and the safe value) or `real-subject`. The environment label *defaults* it and never determines it — a `test` endpoint restored from a production dump is still `real-subject`. Declaring `real-subject` makes a redaction policy mandatory. |
| **cassette** | A checked-in, human-readable JSON record of provider interactions (actor proposals, judgements) keyed by provider config + canonical request, replayed in CI at zero token cost. A separate artefact — never embedded in a bundle. |

## Run bundles and playback

| Term | Meaning |
|---|---|
| **run bundle** | A single self-contained `*.chatwright.json` file recording one or more runs — journal, actors roster, parts, observations, loop events, report, evidence, annotations — replayable with no live emulator, service or network. Identified by its format URL (`https://chatwright.dev/formats/run-bundle/v1`), never a bare version number. Cassettes are separate artefacts, never embedded. |
| **journal** | The per-chat, append-only structured record a Platform Emulator keeps (messages, edits as versioned identity, method calls), attributed to platform identities. A bundle carries it verbatim; transcript and trace are views over it. |
| **part** | One ordered passage of a run with a declared kind (`ai-goal` or `deterministic`; both execute — only the deterministic part's bundle payload section is still reserved) and a journal boundary into the run-level journal. Parts are playback's chapters and give findings their context (hybrid-runs idea). |
| **actors roster** | A run's list of every conversation participant — `ai-agent`, `human`, `scripted`, `replay` or `bot` — with their platform identities and, for AI actors, provider and model ids. Every journal entry resolves to a roster actor. |
| **player** | The Studio surface that replays a run bundle entirely client-side: a local file is dropped in and played — nothing is uploaded. |
| **bookmark** | A manually placed fast-forward marker stored in a bundle. Derived markers (part boundaries, task completions, findings) come from bundle content and are not stored as bookmarks. |
| **annotation** | A comment anchored to a conversation moment in a bundle (chat + entry, optionally an exact message version), with author and time; replies thread annotations into a conversation about the conversation. |

## Writing conventions

- **English:** documentation (README, `spec/`, `docs/`) uses British English
  ("licence", "behaviour"); Go code and code comments may use American English
  (ecosystem norm). Never mix within one file.
- **AC references:** `<feature-path>#ac:<id>` (heading format is
  lint-enforced, not documented here).
- **Attribution:** "an independent open-source project developed by Sneat.co" —
  Sneat is always suffixed (Sneat.co, sneat.dev), never bare.
- **Em-dashes:** unspaced (`word—word`) in spec documents; either style in
  runtime docs, consistent per file.
