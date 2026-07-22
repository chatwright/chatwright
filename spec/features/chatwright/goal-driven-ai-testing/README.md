---
format: https://specscore.md/feature-specification
status: Draft
---

# Feature: Goal-Driven AI Testing

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/goal-driven-ai-testing?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/goal-driven-ai-testing?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/goal-driven-ai-testing?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/goal-driven-ai-testing?op=request-change) |

**Status:** Draft
**MVP Priority:** #1
**Source Ideas:** goal-driven-ai-bot-testing

## Summary

Give an AI actor a product-level goal and several tasks, let it autonomously
discover and exercise a bot through the Observation Model, verify important
application state through DTQL and return an evidence-backed campaign report.

This is the first implementation outcome required for using Chatwright on
Listus Bot and Sneat Bot. Listus is the initial end-to-end proving target; Sneat
Bot is the second target that validates portability.

## Feature Hierarchy

| Child | MVP responsibility |
|---|---|
| [goal-and-task-contract](goal-and-task-contract/README.md) | Goal, ordered/independent tasks, success criteria, milestones, constraints and budgets |
| [autonomous-exploration](autonomous-exploration/README.md) | Observe–plan–act–validate loop, discovery, progress and stop conditions |
| [dtql-state-verification](dtql-state-verification/README.md) | Run-scoped user/space bindings, parameterised DTQL assertions and state evidence |
| [campaign-reporting](campaign-reporting/README.md) | Findings, task outcomes, coverage gaps and linked evidence |

### Capability Map

~~~text
Goal-Driven AI Testing — MVP Priority #1
├── Goal and Task Contract
│   ├── Goal, tasks and success criteria
│   ├── Milestones and task dependencies
│   └── Safety, step, time and cost budgets
├── Autonomous Exploration
│   ├── Observation → plan → action loop
│   ├── Command/action discovery
│   └── Progress, recovery and stop reasons
├── DTQL State Verification
│   ├── Actor → application user binding
│   ├── User → default family space binding
│   ├── Message/task/milestone checks
│   └── Branch-scoped provenance and redaction
└── Campaign Reporting
    ├── Functional and state-consistency findings
    ├── UX, ambiguity and coverage findings
    └── Replayable transcript/trace/assertion evidence
~~~

## Priority #1 Product Contract

- A user can state a goal without encoding bot commands or callback data.
- A goal can contain several tasks with dependencies and completion criteria.
- The AI sees the same Observation Model as other actors.
- The AI can send text and target current generic actions.
- Chatwright validates every proposal and remains authoritative.
- The runner tracks task progress, milestones, budgets and non-progress.
- DTQL assertions use typed runtime bindings rather than hard-coded user/space
  IDs.
- URL assertions verify parsed structure and runtime-bound information
  independently from configured endpoint availability.
- The report separates verified defects from AI navigation failures and
  unverified coverage gaps.
- Developer Studio may show raw platform/emulator evidence; acting AI/tools do
  not receive it.
- The first usable campaign runs locally against Listus Bot without requiring
  Chatwright Cloud or App State Branching.

## First Campaign

The Listus campaign starts with a new user and must attempt:

1. onboarding and language selection;
2. shopping-list discovery in the auto-created family space;
3. adding several items;
4. adding a duplicate item and characterising behaviour;
5. marking a subset bought;
6. editing/commenting where supported;
7. removing selected and completed items;
8. adding an item after cleanup;
9. removing all items;
10. deterministic checks for discovered URL correctness and configured
    reachability;
11. DTQL verification and a final evidence-backed report.

The second campaign applies the same runtime contract to Sneat Bot with
target-specific goals, resolvers and assertions.

## Dependencies

- [Observation Model](../observation-model/README.md) for actor perception,
  synthetic targets, changes and validation.
- Telegram Platform Emulator for the first bot execution profile.
- AI actor provider/configuration and bounded model invocation.
- DataTug/DTQL integration over the target DALgo databases.
- Deterministic Assertions, beginning with URL Verification (private,
  pre-announcement — not yet promoted to this public tree).
- Target-specific identity/space resolvers and safe test environment.
- Transcript, trace, milestone and result evidence.
- App State Branching later for cheaper variants after onboarding.

## Acceptance Criteria

### AC:listus-goal-runs-without-command-map

Scenario: A new AI actor receives the Listus shopping-list goal
Given an isolated Listus Bot environment and fresh user
And no Listus command or callback-data map is supplied to the actor
When the campaign runs
Then the actor attempts onboarding, list discovery and every requested task
And records a structured outcome for each task

### AC:family-space-state-is-verified

Scenario: Listus confirms that an item was added
Given onboarding resolved `app_user_id` and `family_space_id`
When the add task reaches its verification point
Then a parameterised DTQL assertion queries that family space
And the campaign does not claim verified success from bot prose alone

### AC:campaign-stops-within-budget

Scenario: The bot returns the same non-progressing response
Given a finite step, duration and repeated-failure budget
When the AI cannot make progress
Then the campaign stops deterministically
And reports the active task, attempted recovery and budget/stop reason

### AC:url-correctness-and-availability-are-independent

Scenario: Listus exposes a structurally correct URL whose endpoint times out
Given the URL contains the expected runtime-bound family-space information
When deterministic URL verification runs
Then the structure phase passes
And the configured availability phase fails with timeout and vantage evidence

### AC:report-links-evidence

Scenario: A state inconsistency is found
Given the bot confirms an operation but DTQL disagrees
When the campaign report is produced
Then the finding links its task, observations, messages/actions and assertion
And distinguishes the product inconsistency from AI navigation uncertainty

## Open Questions

- Which AI model and prompt policy should be the first reference driver?
- Which goal/task syntax is the smallest useful portable contract?
- Which Listus and Sneat DTQL resolvers are stable enough for the first demo?
- Which seeded defects establish that the report is useful?

---
*This document follows the https://specscore.md/feature-specification*
