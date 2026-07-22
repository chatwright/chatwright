---
format: https://specscore.md/feature-specification
status: Draft
---

# Feature: Fuzz testing

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/fuzz-testing?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/fuzz-testing?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/fuzz-testing?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/fuzz-testing?op=request-change) |
**Status:** Draft
**Source Ideas:** chatwright

## Summary

Systematically mutate conversation input, event order, platform payloads and
timing to expose robustness failures. This is the dedicated feature for the
brief's “fuzzy testing” direction; the established engineering term is fuzz
testing.

## Behavior

### Deterministic fuzzing

Seeded operators transform a known scenario or corpus while preserving a replay
record. Operators can inject typos, grammar mistakes, incomplete or malformed
messages, unexpected media, invalid callback data, repetitions, duplicates,
reordering, delays, interruptions and timing variation. Stateful operators can
change goals, contradict earlier turns or emit platform-specific edge cases.

The result records original corpus item, seed, operator sequence, platform
profile and logical schedule. Failing cases are minimized where possible and
saved as regression inputs. Deterministic invariants and protocol validation are
the preferred oracles.

### AI-generated fuzzing

An AI generator can create context-aware perturbations that are difficult to
encode as static operators: plausible contradictions, ambiguous follow-ups,
social pressure, shifting intent or unusual multi-turn recovery paths. Because
model sampling is not guaranteed to reproduce from metadata alone, Chatwright
stores the generated messages/actions and evaluates the captured sequence.

### Difference from AI exploration

Fuzzing starts from a mutation space and probes robustness properties; AI
exploration starts from a persona/goal and chooses meaningful next actions to
navigate the product. Either can use AI and either can discover edge cases, but
reports retain the driver, mutation taxonomy and oracle so their coverage claims
are not conflated.

## Dependencies

- [conversation-runtime](../conversation-runtime/README.md)
- [deterministic-testing](../deterministic-testing/README.md)
- [ai-driven-testing](../ai-driven-testing/README.md)
- [platform-emulators](../platform-emulators/README.md)
- [observability](../observability/README.md)

## Acceptance Criteria

### AC: deterministic-failure-is-replayable

Scenario: A seeded event-order mutation fails
Given a scenario, seed, platform profile and logical schedule
When duplicate and out-of-order updates violate an invariant
Then the report stores the mutation recipe and smallest known failing sequence
And the failure can run again locally without an AI or cloud service

### AC: ai-fuzz-output-is-captured

Scenario: AI-generated contradiction reveals a dead end
Given an AI generator and a deterministic outcome oracle
When the generator produces a failing multi-turn sequence
Then every generated input and action is stored for replay
And model metadata is evidence context, not the sole reproduction mechanism

## Open Questions

- Which conversational and platform invariants make strong fuzz oracles?
- What minimization algorithm preserves the state needed to reproduce a
  multi-turn failure?

---
*This document follows the https://specscore.md/feature-specification*
