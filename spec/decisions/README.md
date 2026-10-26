---
format: https://specscore.md/decisions-index-specification
---

# Decisions

## Decisions

| # | Decision | Status | Date | Tags | Affected |
|---|---|---|---|---|---|
| [0001](0001-independent-open-source-project.md) | Independent open-source project with an initial framework integration | Approved | 2026-07-21 | product, boundary, open-source | [`chatwright`](../features/chatwright/README.md), [`platform-adapters`](../features/chatwright/platform-adapters/README.md), [`developer-tooling`](../features/chatwright/developer-tooling/README.md) |
| [0002](0002-platform-neutral-telegram-first.md) | Platform-neutral core, Telegram first, full WhatsApp deferred | Approved | 2026-07-21 | platform, adapter, telegram, whatsapp | [`platform-adapters`](../features/chatwright/platform-adapters/README.md), [`scenario-authoring`](../features/chatwright/scenario-authoring/README.md) |
| [0003](0003-http-webhook-and-fake-api.md) | Real HTTP webhook is the strongest mode; fake outbound APIs are required | Approved | 2026-07-21 | http, runtime, platform-api, fidelity | [`conversation-runtime`](../features/chatwright/conversation-runtime/README.md), [`deterministic-testing`](../features/chatwright/deterministic-testing/README.md), [`platform-adapters`](../features/chatwright/platform-adapters/README.md) |
| [0004](0004-hybrid-testing-and-authoring.md) | Deterministic and AI testing share one runtime; Go precedes Starlark | Approved | 2026-07-21 | deterministic, ai, actors, starlark | [`deterministic-testing`](../features/chatwright/deterministic-testing/README.md), [`ai-driven-testing`](../features/chatwright/ai-driven-testing/README.md), [`manual-emulator`](../features/chatwright/manual-emulator/README.md), [`scenario-authoring`](../features/chatwright/scenario-authoring/README.md) |
| [0006](0006-platform-emulated-bot-real.md) | The messaging platform is emulated; the bot under test is real | Approved | 2026-07-21 | product, platform-emulator, playground, boundary | [`platform-emulators`](../features/chatwright/platform-emulators/README.md), [`telegram`](../features/chatwright/platform-emulators/telegram/README.md), [`playground`](../features/chatwright/playground/README.md), [`deterministic-testing`](../features/chatwright/deterministic-testing/README.md) |
| [0007](0007-open-local-stack-closed-cloud.md) | Apache-2.0 local stack with optional commercial Cloud services | Approved | 2026-07-22 | open-source, studio, cloud, commercial, accounts | [`chatwright`](../features/chatwright/README.md), [`developer-tooling`](../features/chatwright/developer-tooling/README.md), [`cloud`](../features/chatwright/cloud/README.md), [`marketplace`](../features/chatwright/marketplace/README.md) |
| [0008](0008-declared-endpoint-profiles.md) | Declared endpoint profiles generalise the execution boundary | Approved | 2026-07-22 | product, runtime, boundary, positioning | [`chatwright`](../features/chatwright/README.md), [`conversation-runtime`](../features/chatwright/conversation-runtime/README.md), [`headless-engine-harness`](../features/chatwright/conversation-runtime/headless-engine-harness/README.md), [`agent-harnesses`](../features/chatwright/agent-harnesses/README.md) |
| [0009](0009-complete-environment-branching.md) | Branch a coordinated environment with replay fallback | In Review | 2026-07-22 | checkpoint, snapshot, branch, isolation, replay | [State branching](../features/chatwright/state-branching/README.md), [Database state holders](../features/chatwright/state-branching/database-state-holders/README.md), [DALgo provider decision](0010-dalgo-branchable-database-providers.md) |
| [0010](0010-dalgo-branchable-database-providers.md) | Use DALgo with dalgo2memory and inGitDB first | Approved | 2026-07-22 | dalgo, dalgo2memory, ingitdb, database, provider | [State branching](../features/chatwright/state-branching/README.md), [Database state holders](../features/chatwright/state-branching/database-state-holders/README.md) |
| [0011](0011-executable-knowledge-graph.md) | An executable knowledge graph over the run substrate | Approved | 2026-07-23 | product, domain-model, knowledge-graph, positioning | [`chatwright`](../features/chatwright/README.md), [`playground`](../features/chatwright/playground/README.md), [`marketplace`](../features/chatwright/marketplace/README.md) |
| [0012](0012-black-box-bot-protocol.md) | Black-box bots over platform-native payloads; a browser runtime | Approved | 2026-07-23 | runtime, protocol, browser, transport, architecture | [`conversation-runtime`](../features/chatwright/conversation-runtime/README.md), [`platform-emulators`](../features/chatwright/platform-emulators/README.md), [`playground`](../features/chatwright/playground/README.md) |
| [0013](0013-chatwright-md-federation.md) | CHATWRIGHT.md manifests and a federated central index | Approved | 2026-07-23 | federation, community, formats, repositories, discovery | [`marketplace`](../features/chatwright/marketplace/README.md), [`developer-tooling`](../features/chatwright/developer-tooling/README.md) |
| [0014](0014-community-metrics.md) | Community appreciation through independent metrics | Approved | 2026-07-23 | community, metrics, anti-gaming, product | [`marketplace`](../features/chatwright/marketplace/README.md), [`cloud`](../features/chatwright/cloud/README.md) |
| [0015](0015-runtime-parity.md) | Runtime parity — every runtime feature ships in both runtimes | Approved | 2026-07-23 | runtime, parity, conformance, architecture | [`conversation-runtime`](../features/chatwright/conversation-runtime/README.md), [`platform-emulators`](../features/chatwright/platform-emulators/README.md), [`playground`](../features/chatwright/playground/README.md) |

## Open Questions

None at this time.

---
*This document follows the https://specscore.md/decisions-index-specification*
