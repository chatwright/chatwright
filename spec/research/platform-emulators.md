# Research: Platform Emulator architecture and workflows

**Date:** 2026-07-21
**Owner:** alex
**Status:** Proposed
**Consumed by:** [`platform-emulators`](../features/chatwright/platform-emulators/README.md), [`telegram`](../features/chatwright/platform-emulators/telegram/README.md), [`playground`](../features/chatwright/playground/README.md)

## Purpose

Define what can be shared across local messaging-platform implementations without
making Telegram the accidental universal model. Convert the “platform is
emulated; bot is real” boundary into compatibility, state and workflow contracts
that support automated and manual use.

## Relationship to existing research

Items I-04–I-06 remain the detailed Telegram protocol/fidelity backlog. Items
I-20–I-21 remain the detailed Playground and recording backlog. The items below
connect those studies into a first-class multi-platform product architecture.

## Investigation backlog

| ID | Question | Required evidence and output |
|---|---|---|
| I-35 | What is the smallest generic Platform Emulator abstraction that represents a complete local execution loop without erasing platform-specific semantics? | Interface and responsibility map tested against Telegram plus WhatsApp, Slack and Discord counterexamples. |
| I-36 | Which infrastructure can Platform Emulators safely share? | Component inventory covering identities, actors, chats, messages, clocks, scheduling, state, evidence and capability declarations; explicit non-shared cases. |
| I-37 | Which Telegram protocol behaviours define the first named emulator compatibility profile? | Versioned profile and protocol fixture matrix covering client actions, updates, Bot API operations and known exclusions. |
| I-38 | How is Telegram Bot API compatibility measured rather than asserted? | Method-level conformance harness, request/response/error fixtures and policy for undocumented or version-dependent behaviour. |
| I-39 | Which webhook behaviours must match Telegram for local bot results to be credible? | Fixtures for payloads, secrets, responses, ordering, retries, duplicates and readiness, separated into default and opt-in fault profiles. |
| I-40 | What fake API architecture supports exact bot-client calls, validation, controllable errors and observable state changes? | Architecture decision and executable spike using at least send, edit and failure paths through a replaceable base URL. |
| I-41 | What is authoritative in the platform state engine? | State model for registrations, identities, chats, messages, versions, keyboards, updates and scheduled work with isolation and lifecycle rules. |
| I-42 | What is authoritative in the client state engine, and how does it relate to server/platform state? | Client-view projection model covering history, concurrent chats, pending actions and consistency after edits/deletes. |
| I-43 | What is the shortest credible offline development workflow for an existing bot? | Framework-independent walkthrough from clone/configure to manual message, trace inspection and deterministic run without account, tunnel or public network. |
| I-44 | Which Playground workflow makes manual testing efficient without making the UI authoritative? | Usability walkthrough covering several chat windows, actor switching, breakpoint inspection and evidence navigation over emulator-owned state. |
| I-45 | How should one emulator instance isolate and coordinate many users? | Multi-user scenario fixtures for private and group contexts, distinct identities, concurrent actions and deterministic evidence ordering. |
| I-46 | Which multi-bot behaviours are platform-faithful, observable-only or logical simulation? | Capability matrix and scenarios that clearly label real delivery limits versus useful logical mode for Telegram and future platforms. |
| I-47 | How are platform capabilities declared, versioned and queried by scenarios and UI? | Capability schema with supported, partial, logical-only and unsupported states plus negotiation and failure examples. |
| I-48 | Which reusable emulator components should be product modules versus internal libraries? | Dependency map and two-platform design exercise showing stable reuse seams without exposing implementation details in the public hierarchy. |

## Completion rule

An investigation completes only when its output names the selected compatibility
profile or design decision, cites protocol/code/user evidence and updates the
affected feature specifications. A generic interface sketch alone is insufficient.

## Open Questions

The backlog above is intentionally unresolved.
