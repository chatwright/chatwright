# Contributing to Chatwright

Start with the development principles in [AGENTS.md](AGENTS.md) — they apply
to every contribution, human or AI-assisted.

Thank you for considering a contribution. Chatwright is an Apache-2.0 project:
the Go runtime, CLI, Platform Emulators, Playground and Studio are open source
permanently (see [decision 0007](spec/decisions/0007-open-local-stack-closed-cloud.md)
and the [README](README.md#open-source-and-what-stays-open)). This document
covers how to build and test the runtime, where the product specification
lives, what kind of contributions are most useful right now, and the
conventions pull requests are expected to follow.

## Build and test

Chatwright targets the Go version pinned in [`go.mod`](go.mod). From the
repository root:

```bash
go build ./...
go vet ./...
gofmt -l .          # must print nothing; use `gofmt -w .` to fix
go test -race ./...
```

These are the same checks [`.github/workflows/ci.yml`](.github/workflows/ci.yml)
runs on every push and pull request to `main`. A change that fails any of them
will fail CI.

Runnable, framework-agnostic example bots live in [`examples/`](examples/) —
[`examples/greetbot`](examples/greetbot/) is a real `bots-go-framework`
Telegram bot driven end-to-end through the emulator, and
[`example_test.go`](example_test.go) shows a bot written with nothing but
`net/http`. Both are good starting points for exercising a change.

## Where the specification lives

Chatwright is specified with [SpecScore](https://specscore.md) under
[`spec/`](spec/README.md):

- [`spec/ideas/`](spec/ideas/README.md) — product thesis and MVP boundary.
- [`spec/features/`](spec/features/README.md) — the capability hierarchy and
  acceptance criteria (what the product does and how it is verified).
- [`spec/decisions/`](spec/decisions/README.md) — accepted architecture and
  product decisions, including the open/closed boundary (0007).
- [`spec/research/`](spec/research/README.md) — open investigations and
  evidence to collect before a capability is specified further.
- [`spec/plans/`](spec/plans/README.md) — near-term executable delivery plans.

Non-trivial behavioural changes should trace to an acceptance criterion in
`spec/features/`. If the AC doesn't exist yet, propose it as part of your pull
request or open a discussion first — do not guess at scope.

### Spec conventions

- Acceptance criteria are headed exactly `### AC: <id>` (a space after the
  colon); cross-references use `<feature-path>#ac:<id>`.
- Documentation — this file, README, everything under `spec/` and `docs/` —
  uses British English (*licence*, *behaviour*); Go code and code comments may
  use American English. Never mix within one file. See
  [`docs/glossary.md`](docs/glossary.md) for canonical product vocabulary.
- Before opening a pull request that touches `spec/`, run:

  ```bash
  specscore spec lint
  ```

  and fix reported errors (warnings should be addressed where reasonable).
  `docs/` is not linted by this command, but should still follow the same
  conventions above.

## What's wanted now

The current focus is [Phase 1 of the roadmap](docs/roadmap.md#phase-1--telegram-platform-emulator-mvp):
hardening the Telegram Platform Emulator's declared supported profile so its
behaviour is fully honest and its exit gate can be met. Especially valuable
right now:

- **Telegram emulator fidelity.** Closing gaps between what
  [`telegram/emulator.go`](telegram/emulator.go) claims to support and what it
  actually validates — for example, `sendMessage` currently accepts any
  request without validation, and unrecognised Bot API methods are
  blanket-acknowledged (`{"ok":true}`) instead of failing explicitly. See
  [`docs/compatibility/telegram.md`](docs/compatibility/telegram.md) for the
  current, code-verified profile and its known gaps.
- **Non-Go example bots.** A bot written in Python (e.g. aiogram) or Node
  (e.g. grammY), driven via `WebhookAt`, substantiates the "any language"
  claim with real evidence rather than only Go examples.
- **Documentation.** Keeping the compatibility profile, examples and guides
  accurate as the emulator changes; the "fidelity is declared" doctrine only
  holds if the docs are kept honest alongside the code.

## What's deferred

The roadmap deliberately excludes the following from the current phase (see
[`docs/roadmap.md`](docs/roadmap.md) — "Deliberate exclusions" under Phase 1,
and "Later options, not commitments"). Contributions in these directions are
welcome as discussion or research, but are unlikely to be merged as code until
the current profile is solid:

- Full Telegram media, group, channel, reaction and rate-limit coverage.
- New platforms beyond the Telegram MVP — full WhatsApp fidelity, Slack,
  Discord, Teams, embedded website chat, voice/SMS/email.
- Starlark scenario authoring and portable structured scenario formats
  (Phase 2).
- AI actors and AI-driven evaluation (Phase 2).
- Anything under the closed **Chatwright Cloud** layer (Phase 3/4) — this is
  a separately operated service and out of scope for this repository.

If you're unsure whether an idea fits the current phase, open an issue first
rather than sending a large, unsolicited pull request.

## Developer Certificate of Origin (DCO)

Chatwright uses the [Developer Certificate of Origin](https://developercertificate.org/)
instead of a CLA. Every commit must be signed off, certifying you have the
right to submit the change under the project's Apache-2.0 licence:

```bash
git commit -s -m "your commit message"
```

This adds a `Signed-off-by: Your Name <your.email@example.com>` trailer to the
commit. Pull requests with unsigned commits will be asked to amend before
merge.

## Pull requests

- Keep changes focused; large, unrelated changes are hard to review and slow
  everyone down.
- Make sure `gofmt`, `go vet`, `go build` and `go test -race` all pass locally
  before opening the pull request.
- Describe what changed and why, and link the acceptance criterion or issue it
  addresses where one exists.
