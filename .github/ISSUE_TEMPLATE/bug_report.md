---
name: Bug report
about: Something in the runtime, CLI or a Platform Emulator does not behave as documented
title: "[Bug] "
labels: bug
---

## What happened

<!-- A clear, concise description of the incorrect or unexpected behaviour. -->

## Bot framework and language

<!--
What is the bot-under-test written in? E.g. plain net/http, bots-go-framework,
aiogram (Python), grammY (Node), something else. If it uses a Bot API client
library, name it and its version.
-->

## Emulator platform

<!-- Which Platform Emulator: telegram, whatsapp, or other. -->

## Minimal scenario to reproduce

<!--
The smallest scenario (Go test, or webhook payloads + expected behaviour) that
reproduces the issue. A link to a branch/gist/repo is fine if a snippet does
not fit. Please try to trim unrelated setup.
-->

```go
// paste here
```

## Expected behaviour

<!-- What you expected Chatwright (or the emulator) to do. -->

## Actual behaviour

<!-- What actually happened — include the failing assertion, error message, or output. -->

## Environment

- Chatwright version / commit: <!-- go.mod pseudo-version or commit SHA -->
- Go version: <!-- `go version` -->
- OS: <!-- e.g. macOS 15, Ubuntu 24.04 -->

## Additional context

<!-- Anything else worth knowing: is this a documented-but-unsupported case per docs/compatibility/telegram.md? A regression? -->
