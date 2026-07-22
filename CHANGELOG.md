# Changelog

User-visible changes per release. Format follows
[Keep a Changelog](https://keepachangelog.com/); pre-1.0 versioning intent is
described in [docs/release-process.md](docs/release-process.md).

## Unreleased

### Added

- Go runtime and test API at the repository root as
  `github.com/chatwright/chatwright`, with the CLI at `cmd/chatwright`
  (previously the nested `chatwrite` module).
- Scenario fragments with provenance-recording execution context, and the
  all-or-none state checkpoint/branch coordinator (`branching/`).
- Telegram compatibility profile (`docs/compatibility/telegram.md`),
  development principles (`AGENTS.md`), glossary, governance pack
  (CONTRIBUTING, Code of Conduct, SECURITY, issue templates).

### Changed

- (pending) Runtime fixes in flight: diagnostic `Within()` semantics,
  append-only per-chat event journal with transcript-in-failure output,
  emulator-owned update delivery with `getUpdates` long-polling support,
  validating fake Bot API. To be confirmed here when merged.
