---
format: https://specscore.md/decision-specification
status: Approved
---

# Decision: Declared endpoint profiles generalise the execution boundary

**Status:** Approved
**Date:** 2026-07-22
**Owner:** alex
**Tags:** product, runtime, boundary, positioning
**Source Idea:** headless-conversational-engine-testing
**Supersedes:** —
**Superseded By:** —

## Context

Decision [0006](0006-platform-emulated-bot-real.md) fixed the product boundary
as "Chatwright emulates messaging platforms; developers test real bots." The
Listus reference work then added a faster diagnostic rung that exercises the
real conversational engine directly through semantic events, with no Platform
Emulator involved, under the Telegram-emulated gate. Separately, an idea exists
for driving AI-agent CLIs through process, terminal and MCP boundaries. Without
a recorded decision, the feature tree's summary drifted toward a generalised
"conversational-system test harness" identity that decision 0006 does not
describe.

## Decision

Decision 0006 is amended, not replaced:

- The **system under test is always real** — a bot, a conversational engine or
  (if ever promoted) an agent CLI. Chatwright never emulates the product being
  verified.
- The **messaging platform is emulated when a platform profile is declared.**
  The platform-emulated profile with real HTTP webhook delivery remains the
  strongest integration mode and the product's public identity.
- Other execution boundaries are **explicit, capability-declared endpoint
  profiles** (the headless engine profile now; process/terminal profiles only
  if the parked agent-CLI idea is promoted). A profile declares what it can
  observe; evidence always names its profile.
- **Profile evidence is never interchangeable.** Headless or other
  non-platform evidence cannot satisfy an acceptance binding that requires
  platform-emulated evidence, and coverage reporting must not blend profiles.
- **Public positioning stays messaging-led.** "Emulate messaging platforms
  locally; test real bots" remains the external category; endpoint profiles
  are described as supporting architecture, not as the headline.

## Rationale

The runtime concepts (actors, transcripts, settlement, branching, evidence)
genuinely transfer across execution boundaries, and the headless rung already
earns its keep as the fast diagnostic layer beneath the Telegram gate. Naming
the generalisation — with non-interchangeable evidence and a messaging-led
identity — keeps that leverage without trading a crisp, ownable wedge for an
abstract category.

## Declined Alternatives

### Silent generalisation

Rejected: rewriting summaries without a decision record left 0006, the
repository README and the roadmap contradicting each other.

### A separate product for non-messenger testing

Rejected: it would duplicate the runtime, actors, evidence and branching for
no boundary gain; profiles share one runtime with declared capabilities.

### Restricting Chatwright to platform profiles only

Rejected: the Listus plan already demonstrates the value of a headless
diagnostic rung, and refusing it would push real users to bypass the runtime.

## Consequences at Decision Time

- The feature-root summary describes a platform that emulates messaging
  platforms and additionally supports declared endpoint profiles.
- `conversation-runtime` owns profile declaration and semantic evidence; each
  endpoint owns its transport mechanics.
- The agent-CLI adapters remain a parked idea; only the MCP tool harness is
  specified as a draft feature.
- Compatibility and coverage surfaces must label profiles wherever results are
  shown.

## Observed Consequences

The headless engine harness is specified under `conversation-runtime` and is
exercised by the Listus branching reference plan as the diagnostic rung
beneath the Telegram-emulated gate.

## Affected Features

- [`chatwright`](../features/chatwright/README.md)
- [`conversation-runtime`](../features/chatwright/conversation-runtime/README.md)
- [`headless-engine-harness`](../features/chatwright/conversation-runtime/headless-engine-harness/README.md)
- [`agent-harnesses`](../features/chatwright/agent-harnesses/README.md)

## Open Questions

- Which profile metadata belongs in every exported result bundle so external
  consumers can enforce non-interchangeability?

---
*This document follows the https://specscore.md/decision-specification*
