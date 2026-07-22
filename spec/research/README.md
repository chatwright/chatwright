# Research

Explicit investigations that must convert assumptions into code-, protocol- or
user-grounded evidence before the corresponding feature is approved.

## Contents

| Document | IDs | Purpose |
|---|---|---|
| [Runtime integration](runtime-integration.md) | I-01–I-03, I-11–I-12 | Existing framework seams, HTTP hosting, shared state, queues and event buses |
| [Platform semantics](platform-semantics.md) | I-04–I-06 | Telegram inbound/outbound fidelity and bot-to-bot constraints |
| [Conversation model](conversation-model.md) | I-07–I-10 | Neutral actions/messages/chats and actor/persona/identity boundaries |
| [Scheduling and observability](scheduling-and-observability.md) | I-13–I-19 | Virtual time, draining, metrics, trace, assertions and milestones |
| [Authoring, emulator and AI](authoring-and-ai.md) | I-20–I-28 | Manual UI, recording, formats, AI providers/evaluation, agent export and SpecScore |
| [Product boundaries](product-boundaries.md) | I-29–I-34 | CLI, repository/licence/hosted boundaries and Sneat integration |
| [Platform Emulator architecture](platform-emulators.md) | I-35–I-48 | Shared emulator infrastructure, Telegram compatibility, state engines and offline/manual workflows |
| [Fuzzing and AI exploration](fuzzing-and-exploration.md) | I-49–I-54 | Deterministic and AI-generated fuzzing, stateful minimization, replay and regression extraction |
| [Cloud and Marketplace strategy](cloud-and-marketplace.md) | I-55–I-65 | Cloud pull, free tier, sync, reports, hosted trust, managed intelligence and ecosystem assets |

## Completion rule

An item is not complete because an API was proposed. It needs a durable output:
an evidence note citing inspected code/protocol behaviour, a decision or feature
update, and—where behaviour is executable—a focused fixture or spike result.

## Open Questions

None beyond the indexed investigations.
