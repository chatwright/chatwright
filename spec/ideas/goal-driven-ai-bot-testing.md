---
format: https://specscore.md/idea-specification
status: Specifying
---

# Idea: Autonomous Goal-Driven Bot Testing

**Status:** Specifying
**Date:** 2026-07-22
**Owner:** alex
**MVP Priority:** #1
**Promotes To:** chatwright/goal-driven-ai-testing, chatwright/goal-driven-ai-testing/goal-and-task-contract, chatwright/goal-driven-ai-testing/autonomous-exploration, chatwright/goal-driven-ai-testing/dtql-state-verification, chatwright/goal-driven-ai-testing/campaign-reporting
**Supersedes:** —
**Related Ideas:** depends_on:observation-model, extends:app-state-branching

## Problem Statement

How might we give Chatwright a product-level goal such as “register, find the
shopping list and test its lifecycle”, let an AI actor discover and exercise the
bot autonomously, verify the resulting application state and return an
evidence-backed defect report that is immediately useful on Listus Bot and Sneat
Bot?

## Context

Scripted scenarios are valuable after a workflow is understood, but the first
useful Chatwright outcome for Listus Bot and Sneat Bot is exploratory
automation. The AI must enter a real bot as a new user, understand onboarding,
discover commands and visible actions, pursue several related tasks and notice crashes,
inconsistent state, ambiguous behaviour and UX obstacles.

A shopping-list response is not sufficient evidence by itself. Listus data is
backed by DALgo, and DTQL can verify that the expected records exist in the
default family space belonging to the created user. Runtime identifiers such as
application `user_id` and family `space_id` are created during the run, so the
assertion layer needs typed, run-scoped bindings with provenance.

The [Observation Model](observation-model.md) supplies the actor-visible world.
It intentionally excludes callback data and raw platform envelopes from AI/tool
input while allowing developers to inspect those details in Studio. Goal-driven
testing is the first product outcome that turns that contract into immediate
value.

## Recommended Direction

Make **Autonomous Goal-Driven Bot Testing the number-one MVP priority**.
Implement one bounded `AIActor` loop which receives a goal, task list,
constraints, milestones and budgets; observes the bot; discovers how to
progress; proposes generic actions or text; and accumulates evidence until it
succeeds, becomes blocked or exhausts its budget.

The first proving target is **Listus Bot**. The second target is **Sneat Bot** so
the design is validated against another real application rather than becoming a
Listus-specific script.

### Priority #1 Listus goal

~~~yaml
priority: mvp-1
target: listus_bot
actor: alice

goal: |
  Register a new user, discover the shopping-list workflow and test the
  lifecycle of shopping items. Report functional failures, state
  inconsistencies, ambiguous behaviour and UX obstacles with evidence.

tasks:
  - complete onboarding, including language selection
  - find or open the shopping list in the user's default family space
  - add several items
  - add an item already present and determine duplicate behaviour
  - mark some items as bought
  - edit an item and add a comment where supported
  - remove selected items
  - remove completed items
  - add another item after cleanup
  - remove all items
  - verify resulting database state at important milestones
  - verify visible URLs have correct structure and run-specific information
  - check URL availability where network policy permits
  - produce a final report

milestones:
  - onboarding-complete
  - family-space-resolved
  - items-added
  - shopping-item-lifecycle-exercised

budgets:
  max_steps: 80
  max_duration: 10m
  max_repeated_failures: 3

safety:
  environment: isolated_test
  destructive_actions: allowed_within_test_scope
~~~

Tasks may be ordered, partially ordered or independently satisfiable. The AI
may discover commands and actions rather than receiving a Listus command map.
The run records which task is active, completed, failed, skipped or blocked and
why.

### State verification and runtime bindings

Chatwright maintains a separate assertion context. The AI reasons about `alice`
and `family_space`; the assertion engine resolves actual domain IDs:

~~~yaml
bindings:
  app_user_id:
    resolve:
      dtql: |
        from users
        where platform_user_id = $alice_platform_user_id
        select id
      expect: exactly_one

  family_space_id:
    resolve:
      dtql: |
        from space_members
        where user_id = $app_user_id
          and space_type = "family"
        select space_id
      expect: exactly_one
~~~

The query is illustrative; the Listus/Sneat schema determines final collection
and field names. Bindings are typed, parameterised and scoped to one run or
branch. They retain source/provenance, fail on missing or ambiguous identity and
are never cached across unrelated users or sibling branches.

The AI does not need raw IDs. It receives semantic assertion outcomes. The
developer report may show resolved IDs, parameters and records according to
redaction policy.

### Finding model

The final report distinguishes:

- functional failure or crash;
- timeout or non-progress loop;
- visible response versus database-state inconsistency;
- malformed, incorrect, secret-bearing or unreachable URL;
- unmet goal or blocked task;
- confusing discoverability or UX obstacle;
- ambiguous product behaviour such as undocumented duplicate handling;
- successful behaviour with verified evidence;
- coverage gap where reliable verification was unavailable.

Each finding links to the relevant task, observations, messages/actions,
accepted proposals, trace events, milestones and DTQL assertion evidence.

## Alternatives Considered

- **Script the complete Listus flow first.** Rejected as the primary MVP because
  it proves deterministic execution but not autonomous discovery or reusable AI
  exploration. Successful AI paths can later become scripted regressions.
- **Let the AI read callback data and raw emulator events.** Rejected because it
  would optimise against platform internals that a real user cannot perceive.
- **Trust bot confirmation messages as state evidence.** Rejected because the
  bot may acknowledge an operation which was not stored or was stored in the
  wrong user/space.
- **Hard-code one test user and family-space ID.** Rejected because onboarding,
  isolated runs, replay and branches produce different domain identities.
- **Require App State Branching before AI testing.** Rejected as a blocker.
  Branching will make repeated exploration faster, but the first campaign can
  run sequentially in one isolated environment.
- **Permit unbounded autonomous exploration.** Rejected because loops, model
  cost and destructive operations need explicit limits and scope.

## MVP Scope

- One goal-driven AI actor operating sequentially through the Telegram Platform
  Emulator.
- Listus Bot as the first real proving target and Sneat Bot as the second.
- A goal with multiple tasks, success criteria, milestones and constraints.
- Command/action discovery from the Observation Model rather than hard-coded
  callback data or bot commands.
- Text input and generic visible actions with authoritative validation.
- Step, duration, token/cost and repeated-failure budgets.
- Progress tracking, non-progress detection and structured stop reasons.
- DTQL checks at message-, task- or milestone-level checkpoints.
- Run-scoped resolution of application user and default family-space IDs.
- Deterministic URL structure/information assertions and explicitly configured
  reachability checks.
- Evidence-backed finding classification and final campaign report.
- Full developer access to raw trace/emulator evidence through Studio without
  adding it to AI actor input.

## Not Doing (and Why)

- Production bot testing or unrestricted destructive actions—the first target
  is an explicitly isolated test environment.
- Guaranteeing exhaustive coverage from one AI campaign.
- Depending on database branching for the first usable run.
- Teaching the model application database schemas through unrestricted access;
  approved DTQL assertions and resolvers define the state boundary.
- Allowing the AI to invent authoritative success from prose without assertion
  evidence where state verification is configured.
- Implementing many platforms, models or parallel AI actors before one Listus
  campaign works end to end.
- Automatically converting every exploratory finding into a permanent scenario;
  promotion remains reviewable.

## Key Assumptions to Validate

| Tier | Assumption | How to validate |
|---|---|---|
| Must-be-true | An AI actor can discover and complete Listus onboarding and shopping-list tasks from the generic Observation Model. | Run fresh-user campaigns without supplying Listus commands or callback data. |
| Must-be-true | Runtime bindings reliably resolve the created application user and its default family space. | Repeat onboarding with new identities and deliberately test missing/ambiguous memberships. |
| Must-be-true | DTQL catches state failures that transcript-only evaluation misses. | Inject acknowledgement-without-write and wrong-space defects and compare findings. |
| Must-be-true | URL assertions distinguish incorrect information from endpoint unavailability deterministically. | Seed a wrong-space URL, a reachable wrong URL and a valid timed-out URL and inspect independent phase results. |
| Must-be-true | Budgets and non-progress detection stop loops predictably. | Exercise repeated menus, unavailable actions, timeouts and contradictory responses. |
| Should-be-true | The same goal/task contract works for Sneat Bot with only target-specific resolvers/assertions. | Port one campaign without changing actor or runtime semantics. |
| Should-be-true | Findings are actionable without replaying the run manually. | Ask a developer to diagnose seeded failures from the report and linked evidence. |
| Might-be-true | App State Branching materially reduces onboarding/model cost for task variants. | Compare sequential replay with branches from `onboarding-complete`. |

## SpecScore Integration

- **Umbrella feature:** [Goal-Driven AI Testing](../features/chatwright/goal-driven-ai-testing/README.md)
- **Goal contract:** [Goal and Task Contract](../features/chatwright/goal-driven-ai-testing/goal-and-task-contract/README.md)
- **Actor loop:** [Autonomous Exploration](../features/chatwright/goal-driven-ai-testing/autonomous-exploration/README.md)
- **State oracle:** [DTQL State Verification](../features/chatwright/goal-driven-ai-testing/dtql-state-verification/README.md)
- **Deterministic assertions:** Deterministic Assertions (private, pre-announcement — not yet promoted to this public tree)
- **URL checks:** URL Verification (private, pre-announcement — not yet promoted to this public tree)
- **Outcome:** [Campaign Reporting](../features/chatwright/goal-driven-ai-testing/campaign-reporting/README.md)
- **Required perception contract:** [Observation Model](../features/chatwright/observation-model/README.md)
- **Future accelerator:** [App State Branching](../features/chatwright/state-branching/README.md)
- **Priority roadmap:** MVP Priority #1 (private backstage roadmap track)

## Open Questions

- Which model/configuration is the first reference `AIActor`?
- Which tasks are strict requirements versus exploratory suggestions?
- How does the actor request clarification when the goal is contradictory?
- Which DTQL resolvers and assertions belong to the reusable scenario versus a
  Listus/Sneat adapter?
- Should controlled or disabled availability be the default for URL assertions
  in offline/local campaigns?
- What evidence threshold distinguishes a product defect from an AI navigation
  failure?
- When should a successful exploratory path be proposed as a scripted scenario?

---
*This document follows the https://specscore.md/idea-specification*
