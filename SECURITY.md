# Security policy

## Supported versions

Chatwright has not tagged a release yet — the project is pre-release. Only the
`main` branch is supported with security fixes.

| Version | Supported |
|---------|-----------|
| `main`  | :white_check_mark: |
| Any tagged pre-1.0 release, once they exist | Best effort; upgrade to `main` recommended |

This table will be replaced with a normal supported-version range once
Chatwright starts tagging releases (see the roadmap's release-process work).

## Reporting a vulnerability

Please **do not** open a public GitHub issue for a suspected security
vulnerability.

Report it privately through **GitHub Security Advisories**: on this
repository, go to the **Security** tab → **Report a vulnerability**. This
opens a private draft advisory visible only to you and the maintainers, where
you can describe the issue, its impact, and steps to reproduce it.

We aim to acknowledge new reports promptly and to keep you updated as the
issue is investigated and fixed. Please give us reasonable time to address a
confirmed vulnerability before any public disclosure.

## Scope

This policy covers the open local stack in this repository: the Go runtime,
CLI, Platform Emulators (Telegram, WhatsApp), and the Playground/Studio code
that lives here. It does not cover the separately operated, closed
**Chatwright Cloud** service (see
[decision 0007](spec/decisions/0007-open-local-stack-closed-cloud.md)) — if a
report turns out to concern Cloud infrastructure rather than this repository,
say so and we will route it appropriately.

## Areas of special interest

Chatwright emulates untrusted-by-design inputs (platform updates, Bot API
calls) and is meant to run entirely offline against a real bot under test, so
we're especially interested in reports about:

- Anything that lets the emulator's fake Bot API server be reached, or
  influenced, from outside the local machine when it is not intended to be.
- As the planned local **CLI/runtime bridge** for Studio lands (see the
  [roadmap](docs/roadmap.md), Phase 1.x — "a local CLI/runtime bridge"), its
  loopback-only binding and authentication story will be a particular area of
  security review. If you spot a way for that bridge to accept connections or
  commands from anywhere other than the intended local, authenticated caller,
  please report it under this policy even before it is generally documented.
- Any way a scenario, fixture, or recorded run could cause code execution, file
  access, or network access beyond what the local development workflow it
  supports requires.

## Disclosure

We do not currently operate a bug-bounty programme. Credit will be given in
the advisory (and, where relevant, the release notes) to reporters who wish to
be named, once a fix is available.
