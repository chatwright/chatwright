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
| **Chatwright CLI** | The open-source distribution: the Go runtime packages plus the `chatwright` command (`go install github.com/chatwright/chatwright/cmd/chatwright@latest`). "CLI" alone never refers to a repository. |
| **Chatwright Studio** | The open-source (Apache-2.0) web experience — local-first visual inspection, authoring and the Playground UI. Not a paid product (decision 0007). |
| **Chatwright Cloud** | The optional, commercial, operated services: hosted execution, retention, collaboration, organisations, managed AI. The only closed layer. |
| **Playground** | The manual-testing surface where human actors interact with bots through a Platform Emulator. The product term — not "live emulator", not "manual emulator" (a retired spec path). The Studio route `/emulator` predates this term. |
| **chatwrite** | Historical only: the former subdirectory/module of the runtime before it moved to the repository root (2026-07-22). Never a product name. |

## Execution model

| Term | Meaning |
|---|---|
| **Platform Emulator** | A local implementation of a messaging platform as users, apps and bots observe it. It generates platform-shaped updates, delivers them to the real bot, accepts the bot's real API calls and owns the resulting platform state (decision 0006). |
| **Telegram Platform Emulator** | The MVP Platform Emulator. Its two public facets: the **Client Emulator** (actor-facing actions and client-visible view) and the **Server/API Emulator** (bot-facing wire surface: Bot API endpoints and update delivery). Facets of one state authority, not two stateful services. |
| **fake Bot API** / **emulated platform API server** | The bot-facing half of a Platform Emulator — the endpoints the bot under test calls. Both phrasings acceptable; prefer "emulated platform API server" in public copy. |
| **bot under test** / **system under test** | The developer's real software. Chatwright never emulates it. "System under test" is the profile-neutral term (a bot, a conversational engine, or — if promoted — an agent CLI). |
| **endpoint profile** | The declared execution boundary of a run: platform-emulated (strongest), headless engine, or future profiles. Evidence always names its profile and is never interchangeable across profiles (decision 0008). |
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
| **fragment** | A reusable, input-isolated piece of scenario invoked by path, with provenance recorded (scenario composition). |
| **run** | One execution of a scenario in one environment with one endpoint profile. A "test" is a deterministic run with assertions. |
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

## Writing conventions

- **English:** documentation (README, `spec/`, `docs/`) uses British English
  ("licence", "behaviour"); Go code and code comments may use American English
  (ecosystem norm). Never mix within one file.
- **Acceptance criteria headings:** `### AC: <id>` (space after the colon);
  references use `<feature-path>#ac:<id>`.
- **Attribution:** "an independent open-source project developed by Sneat.co" —
  Sneat is always suffixed (Sneat.co, sneat.dev), never bare.
- **Em-dashes:** unspaced (`word—word`) in spec documents; either style in
  runtime docs, consistent per file.
