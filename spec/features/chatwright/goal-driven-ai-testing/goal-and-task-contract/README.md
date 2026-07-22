---
format: https://specscore.md/feature-specification
status: Draft
---

# Feature: Goal and Task Contract

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/goal-driven-ai-testing/goal-and-task-contract?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/goal-driven-ai-testing/goal-and-task-contract?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/goal-driven-ai-testing/goal-and-task-contract?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/goal-driven-ai-testing/goal-and-task-contract?op=request-change) |

**Status:** Draft
**MVP Priority:** #1
**Source Ideas:** goal-driven-ai-bot-testing

## Summary

Represent the desired product outcome as a goal with several trackable tasks,
milestones, success criteria, constraints and budgets. The contract describes
intent rather than bot commands or platform mechanics.

## Contract

The MVP supports:

- one natural-language campaign goal;
- ordered, partially ordered or independent tasks;
- required versus exploratory tasks;
- preconditions and success evidence;
- milestones such as `onboarding-complete` and `items-added`;
- allowed/destructive action policy;
- step, duration, token/cost and repeated-failure budgets;
- per-task `pending`, `active`, `completed`, `failed`, `blocked` or `skipped`
  status with reason.

A task can request behavioural exploration—such as determining duplicate-item
semantics—without prescribing the exact messages or buttons used.

## Acceptance Criteria

### AC: several-tasks-share-one-goal

Scenario: A shopping-list goal contains lifecycle tasks
Given onboarding, add, duplicate, buy, edit and delete tasks
When the campaign begins
Then the runner retains each task identity and dependency
And the report produces an outcome for every task

### AC: goal-does-not-leak-platform-mechanics

Scenario: Listus presents commands differently
Given a goal expressed through user-visible intent
When the AI discovers another valid path
Then the task can complete without changing callback data or command syntax in
the goal document

## Open Questions

- Are tasks declarative records, a small DSL or both?
- How should required, optional and exploratory success be scored?
- Can an actor propose new subtasks without changing the authored goal?

---
*This document follows the https://specscore.md/feature-specification*
