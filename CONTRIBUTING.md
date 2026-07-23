# Contributing to Chatwright

Start with the development principles in [AGENTS.md](AGENTS.md) — they apply
to every contribution, human or AI-assisted.

Thank you for considering a contribution. Chatwright is an Apache-2.0 project:
the Go runtime, CLI, Platform Emulators, Playground and Studio are open source
permanently (see [decision 0007](spec/decisions/0007-open-local-stack-closed-cloud.md)
and the [README](README.md#open-source-and-what-stays-open)). This document
covers where the code and the product specification live, what kind of
contributions are most useful right now, and the conventions pull requests
are expected to follow.

## Where the code lives, and this repository's checks

This repository is the Chatwright standard — specs, the run-bundle format
and docs. The Go code lives in its own repositories:
[chatwright/sdk-go](https://github.com/chatwright/sdk-go) (module
`chatwright.dev/sdk`), [chatwright/runtime-go](https://github.com/chatwright/runtime-go)
(module `chatwright.dev/runtime`) and
[chatwright/cli](https://github.com/chatwright/cli) (module
`chatwright.dev/cli`). Code contributions go there; the Go gates
(`gofmt -l .` empty, `go vet ./...`, `go test -race ./...`) apply in each,
per [AGENTS.md](AGENTS.md).

This repository's own CI is the
[Format drift workflow](.github/workflows/format-drift.yml), which fails when
the published run-bundle schema copies drift from the canonical one in
sdk-go — see [docs/release-process.md](docs/release-process.md).

Runnable, framework-agnostic example bots live in the runtime repository's
[`examples/`](https://github.com/chatwright/runtime-go/tree/main/examples) —
[`examples/greetbot`](https://github.com/chatwright/runtime-go/tree/main/examples/greetbot)
is a real Telegram bot driven end-to-end through the emulator, and
[`examples/pybot`](https://github.com/chatwright/runtime-go/tree/main/examples/pybot)
is a stdlib-only Python bot driven as a real subprocess. Both are good
starting points for exercising a change.

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

- Acceptance-criteria cross-references use `<feature-path>#ac:<id>` (heading
  format is enforced by `specscore spec lint`).
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

- **Telegram emulator fidelity.** Closing gaps between what the emulator
  ([`telegram/emulator.go`](https://github.com/chatwright/runtime-go/blob/main/telegram/emulator.go)
  in runtime-go) claims to support and what it actually validates. See
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
- Make sure the target repository's gates pass locally before opening the
  pull request — `gofmt`, `go vet`, `go build` and `go test -race` in the
  code repositories; `specscore spec lint` for spec changes here.
- Describe what changed and why, and link the acceptance criterion or issue it
  addresses where one exists.
