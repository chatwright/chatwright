---
format: https://specscore.md/feature-specification
status: Draft
---

# Feature: Observation Context

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/observation-model/observation-context?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/observation-model/observation-context?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/observation-model/observation-context?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/observation-model/observation-context?op=request-change) |

**Status:** Draft
**Source Ideas:** observation-model

## Summary

Construct a bounded, actionable observation from complete recent conversation
units, current actions and relevant journey context instead of exposing an
arbitrary “last N messages” rule as the product model.

## Context Components

Potential components are:

- recent complete turns and bot responses;
- every currently visible action;
- history summary and journey memory;
- current and visited states;
- unexplored actions;
- goal and persona;
- active and completed milestones;
- relevant facts.

The MVP should begin with observable conversation and current actions. Context
fields may deepen incrementally, but their meaning remains independent of actor
kind. A scripted actor may assert the same milestone an AI actor uses to choose
a goal-directed action.

## Window Policy

Size is a resource constraint, not the conceptual selection model. A window
policy should prioritise actionable current state and coherent conversation
units, then use explicit summaries for displaced history. It should expose
provenance and confidence where a fact is summarised or inferred rather than
directly visible.

Token budgets, character budgets and platform history limits may influence one
serialisation, but must not make the observation nondeterministic or silently
drop the action an actor is expected to choose.

## Journey Awareness

Journey fields can describe the current state, visited states, unexplored
actions, goal, active milestone and relevant facts. They are optional semantic
context rather than an AI chain of thought. Private actor memory and runtime
authority remain distinct: context may inform an actor, while Chatwright still
validates all proposed actions.

## Acceptance Criteria

### AC:current-actions-survive-windowing

Scenario: An actionable message is near a history boundary
Given the observation must be size-limited
When the context policy selects content
Then all currently visible actions remain addressable
And their owning message/context remains intelligible

### AC:complete-turns-are-preserved

Scenario: A turn contains several user and bot messages
Given including one message would split the semantic turn
When the observation window is built
Then the complete turn is retained or replaced with an explicit summary

### AC:journey-context-is-actor-neutral

Scenario: A milestone is active
Given HumanActor and AIActor observe the same run state
When journey context is included
Then the milestone has the same representation for both actors
And no AI-only reasoning field is required

## Open Questions

- How should observation size be bounded and old history summarised?
- Which context is directly observed, derived or actor-private?
- How are summaries made deterministic, attributable and replayable?
- Which journey fields belong in the core schema versus optional extensions?

---
*This document follows the https://specscore.md/feature-specification*
