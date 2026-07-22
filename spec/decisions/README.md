---
format: https://specscore.md/decisions-index-specification
---

# Decisions

## Decisions

| # | Decision | Status | Date | Tags | Affected |
|---|---|---|---|---|---|
| [0001](0001-independent-open-source-project.md) | Independent open-source project with an initial framework integration | Approved | 2026-07-21 | product, boundary | chatwright |
| [0002](0002-platform-neutral-telegram-first.md) | Platform-neutral core, Telegram first, full WhatsApp deferred | Approved | 2026-07-21 | platform, architecture | platform-adapters |
| [0003](0003-http-webhook-and-fake-api.md) | Real HTTP webhook is the strongest mode; fake outbound APIs are required | Approved | 2026-07-21 | runtime, testing | conversation-runtime, deterministic-testing |
| [0004](0004-hybrid-testing-and-authoring.md) | Deterministic and AI testing share one runtime; Go precedes Starlark | Approved | 2026-07-21 | actors, authoring | deterministic-testing, ai-driven-testing, scenario-authoring |
| [0006](0006-platform-emulated-bot-real.md) | The messaging platform is emulated; the bot under test is real | Approved | 2026-07-21 | product, emulator, boundary | platform-emulators, playground |
| [0007](0007-open-local-stack-closed-cloud.md) | Apache-2.0 local stack with optional commercial Cloud services | Approved | 2026-07-22 | open-source, studio, cloud | developer-tooling, cloud, marketplace |
| [0008](0008-declared-endpoint-profiles.md) | Declared endpoint profiles generalise the execution boundary (amends 0006) | Approved | 2026-07-22 | product, runtime, boundary | chatwright, conversation-runtime, agent-harnesses |

## Open Questions

None at this time.

---
*This document follows the https://specscore.md/decisions-index-specification*
