---
format: https://specscore.md/feature-specification
status: Draft
---

# Feature: AI-driven testing

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/ai-driven-testing?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/ai-driven-testing?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/ai-driven-testing?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/ai-driven-testing?op=request-change) |
**Status:** Draft
**Source Ideas:** chatwright

## Summary

Persona- and goal-driven actors that explore conversational paths, respect
constraints and produce evidence-linked outcome and UX evaluations over the same
runtime used by deterministic tests.

## Problem

Natural-language flows may reach the same valid outcome through many wordings and
turn sequences. Literal assertions cannot efficiently explore incomplete input,
changed minds, confusion and recovery, while unconstrained AI judgement is
non-repeatable and can sound more authoritative than its evidence warrants.

## Behavior

### AI actors

An AI actor receives a persona, goal, optional constraints, conversation context
and currently available actions. Persona examples—busy parent, limited-English
speaker, impatient customer—are scenario data, not hard-coded product types.

### Goal evidence

Goal completion may use deterministic state, a milestone, an application event,
an observed message, a custom evaluator or an AI judgement. Deterministic
evidence is preferred when available but is not mandatory for inherently
conversational outcomes.

### Evaluation and exploration

Reports may cover success, confidence, turns, dead ends, repeated questions,
misleading responses and constraint violations. Every observation links to the
transcript, trace or external-state evidence from which it was inferred. Reports
label evaluator/provider/model and distinguish fact from judgement.

### Regression extraction

An exploratory run may be distilled into deterministic assertions, a reusable
actor fixture or a portable scenario. The user selects which observations become
requirements; Chatwright does not snapshot every generated phrase by default.

## Dependencies

- [conversation-runtime](../conversation-runtime/README.md)
- [deterministic-testing](../deterministic-testing/README.md)
- [scenario-authoring](../scenario-authoring/README.md)
- [observability](../observability/README.md)

## Acceptance Criteria

### AC: actor-uses-shared-runtime

Scenario: An AI persona tests a booking bot
Given a persona, goal and constraints
When the actor conducts a run
Then every chosen action traverses the same platform adapter and webhook path as
a scripted actor

### AC: judgement-is-traceable

Scenario: The report says the bot asked twice
Given an AI evaluation containing a repeated-question observation
When a developer opens the observation
Then it references the exact transcript turns supporting that judgement
And identifies the evaluator model and confidence

### AC: deterministic-evidence-wins

Scenario: An application event proves completion
Given a verified booking-created event and a conflicting AI opinion
When goal completion is resolved
Then the deterministic evidence remains visible and takes configured precedence

## Open Questions

- Which provider-neutral contract preserves tool use, token accounting and
  reproducibility without reducing providers to a lowest common denominator?
- What evaluation agreement threshold is acceptable before reports influence CI?
- Which persona attributes risk stereotyping and should be disallowed or reframed?

---
*This document follows the https://specscore.md/feature-specification*
