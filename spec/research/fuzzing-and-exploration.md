# Research: Fuzzing and AI exploration

**Date:** 2026-07-22
**Owner:** alex
**Status:** Proposed
**Consumed by:** [`fuzz-testing`](../features/chatwright/fuzz-testing/README.md), [`ai-driven-testing`](../features/chatwright/ai-driven-testing/README.md)

## Purpose

Define a reproducible conversational fuzzing model and keep its claims distinct
from persona- and goal-driven AI exploration.

## Initial finding

Fuzzing and AI exploration overlap in edge-case discovery but start from
different contracts:

| Dimension | Deterministic fuzzing | AI-generated fuzzing | AI exploration |
|---|---|---|---|
| Driver | Seeded mutation/generation operators | Model generates context-aware perturbations | Actor pursues a persona, goal and constraints |
| Primary question | Does a robustness invariant survive input/event/timing variation? | Which plausible adversarial variations evade fixed operators? | Can this kind of user reach a goal, and what is the experience? |
| Reproduction | Corpus item + seed + operators + schedule | Captured generated sequence; model metadata is context | Captured transcript/actions; optional replay fixture |
| Preferred oracle | Deterministic invariant, protocol rule, crash/timeout | Deterministic oracle where possible; labelled evaluator otherwise | Goal evidence and evidence-linked UX evaluation |
| Typical output | Minimized failing input/event sequence | Captured adversarial conversation | Finding, journey observation or regression proposal |

Go's fuzzing guidance says targets should be fast and deterministic and writes a
failing input into a replayable seed corpus. That supports Chatwright's local
seed/operator/sequence record. Research on stateful greybox fuzzing shows that
protocol failures often require event sequences that first reach a particular
state; conversational fuzzing therefore cannot be limited to isolated strings.

Sources:

- [Go Fuzzing](https://go.dev/doc/security/fuzz/)
- [Stateful Greybox Fuzzing, USENIX Security 2022](https://www.usenix.org/conference/usenixsecurity22/presentation/ba)
- [OWASP overview of mutation- and generation-based fuzzing](https://owasp.org/www-community/Fuzzing)

## Investigation backlog

| ID | Question | Required evidence and output |
|---|---|---|
| I-49 | Which text, action, payload, event-order and timing operators expose real conversational failures? | Operator taxonomy exercised against Telegram fixtures, including typos, incomplete input, invalid callbacks, duplicates and out-of-order updates. |
| I-50 | How are random seeds, logical time and concurrent event schedules recorded so deterministic fuzz failures replay? | Reproduction manifest plus repeated local/CI runs of timing and ordering failures. |
| I-51 | How can a failing multi-turn sequence be minimized without removing prerequisite conversation state? | Stateful shrinker design and three minimized failures retaining required setup turns. |
| I-52 | When does AI-generated fuzzing find useful perturbations beyond fixed operators? | Blind comparison on the same bots, classifying unique failures, noise, cost and replay success. |
| I-53 | Which result taxonomy keeps fuzzing, AI fuzz generation and persona-driven exploration distinct? | Report examples with driver, operator, oracle, coverage and evidence fields. |
| I-54 | How should a fuzz or exploration failure become a reviewed deterministic regression? | End-to-end capture, minimize, propose, approve, commit and local replay walkthrough. |

## Open Questions

The backlog above is intentionally unresolved.
