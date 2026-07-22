---
format: https://specscore.md/feature-specification
status: Draft
---

# Feature: Autonomous Exploration

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/goal-driven-ai-testing/autonomous-exploration?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/goal-driven-ai-testing/autonomous-exploration?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/goal-driven-ai-testing/autonomous-exploration?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/goal-driven-ai-testing/autonomous-exploration?op=request-change) |

**Status:** Draft
**MVP Priority:** #1
**Source Ideas:** goal-driven-ai-bot-testing

## Summary

Run a bounded AI loop that observes the user-visible world, selects a task,
plans the next user action, submits validated intent, evaluates progress and
continues until success, blockage or budget exhaustion.

## Loop

1. Receive the current Observation Model and task state.
2. Select the active goal/task and identify missing evidence.
3. Choose current generic action, send text or request a supported assertion.
4. Let Chatwright validate and execute the proposal.
5. Observe messages, edits, actions, changes, milestones and assertion results.
6. Record progress, recovery attempt or finding.
7. Continue or stop with a structured reason.

Discovery is part of the task. The AI may inspect visible help, menus, commands
and actions but does not receive callback data, raw platform messages or a
pre-authored Listus command map.

## Bounds and Recovery

The runner enforces overall/per-task steps, duration, model usage/cost,
repeated-action and repeated-failure limits. A repeated observation/action cycle
triggers a bounded recovery policy before stopping as `no_progress`.
Destructive actions are allowed only inside the declared isolated test scope.

## Acceptance Criteria

### AC:actor-discovers-shopping-list

Scenario: The initial screen does not expose the shopping list directly
Given a goal to test shopping items
When the AI explores visible commands and actions
Then it can record the discovered path
And no platform callback data is required

### AC:loop-detection-stops-repeat

Scenario: The AI alternates between two menus
Given a repeated-state/action threshold
When the threshold is reached without task progress
Then recovery is attempted at most as configured
And the campaign stops with `no_progress` if recovery fails

## Open Questions

- Which progress representation is deterministic enough across models?
- When may the AI retry versus mark a product failure?
- How should model uncertainty be retained without private chain-of-thought?

---
*This document follows the https://specscore.md/feature-specification*
