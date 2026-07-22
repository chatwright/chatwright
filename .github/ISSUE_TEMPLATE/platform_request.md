---
name: Platform request
about: Ask for (or propose starting) a new Platform Emulator beyond Telegram/WhatsApp
title: "[Platform] "
labels: platform
---

## Which messaging platform

<!--
E.g. Slack, Discord, Microsoft Teams, embedded website chat, SMS, voice,
email, something else. One platform per issue, please.
-->

## Which capabilities matter first

<!--
Real platforms are large; Chatwright ships narrow, honest compatibility
profiles rather than claiming full parity (see
docs/compatibility/telegram.md for what that looks like for Telegram).
For your use case, rank what actually matters, e.g.:
  1. Plain text messages, inbound and outbound
  2. Interactive components (buttons / menus / quick replies)
  3. In-place message edits
  4. Threads
  5. Reactions
  6. Media (images, files, audio, ...)
  7. Group/channel semantics vs. 1:1 only
-->

## Your use case

<!-- What bot or application would you test with this? Is it in production today? -->

## Existing draft or prior art

<!--
Chatwright's spec tree already has draft pages for some platforms under
spec/features/chatwright/platform-emulators/ — check there first and link the
relevant one if it exists. Note any existing client library you'd want the
emulator to be compatible with (its wire format, SDKs, etc.).
-->

## Willingness to contribute

<!--
Would you be interested in implementing the platform.Platform / Emulator
interfaces (see platform/platform.go) yourself, with review support? Not
required, but it materially changes how quickly this can move.
-->
