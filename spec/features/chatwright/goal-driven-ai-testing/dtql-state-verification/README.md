---
format: https://specscore.md/feature-specification
status: Draft
---

# Feature: DTQL State Verification

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/goal-driven-ai-testing/dtql-state-verification?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/goal-driven-ai-testing/dtql-state-verification?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/goal-driven-ai-testing/dtql-state-verification?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/goal-driven-ai-testing/dtql-state-verification?op=request-change) |

**Status:** Draft
**MVP Priority:** #1
**Source Ideas:** goal-driven-ai-bot-testing

## Summary

Verify that conversational actions changed the correct application data by
running parameterised DTQL checks with typed, run-scoped application identities.
For Listus, shopping-item queries are scoped to the default family space owned
by or assigned to the new user.

## Runtime Bindings

The binding chain is explicit:

~~~text
scenario actor `alice`
  → test platform identity
  → application `user_id`
  → membership/default family `space_id`
  → list and item records
~~~

Bindings have a name, type, value, resolver, creation point, provenance,
redaction classification and run/branch scope. Resolution must fail on zero or
ambiguous matches unless the scenario supplies a deterministic selection rule.
Replayed onboarding resolves new values; restored state may retain compatible
values; sibling branches never share mutable binding state implicitly.

DTQL receives named parameters rather than query-string interpolation. Domain
IDs are available to the assertion engine and authorised developer evidence,
not automatically to the AI actor.

## Assertion Points

Checks may run:

- after a message/action;
- when a task claims completion;
- at a milestone such as `items-added`;
- before final campaign success;
- as a diagnostic after a visible failure.

An assertion records its query identity/version, bindings, result summary,
redaction outcome and evidence reference. Developer Studio can show approved
records, while the AI normally receives a semantic result such as “four items
exist in Alice's family space”.

## Acceptance Criteria

### AC:ids-are-resolved-after-onboarding

Scenario: Sneat auth auto-creates a family space
Given the AI completes onboarding as `alice`
When the onboarding milestone resolves assertion context
Then exactly one application user and expected default family space are bound
And subsequent list checks use those run-scoped values

### AC:wrong-space-write-is-a-failure

Scenario: The bot stores an item in another space
Given `family_space_id` identifies Alice's expected space
When the bot confirms an add operation
But DTQL finds the record only in another space
Then the task is not reported as verified success
And the campaign records a state-consistency finding

### AC:bindings-do-not-leak-across-runs

Scenario: Two campaigns create different users
Given each run resolves its own user and family space
When DTQL assertions execute
Then every query uses its run's bindings
And no value from the other run is reused

## Open Questions

- Which identity starts the Listus/Sneat resolver chain reliably?
- Who owns reusable resolvers: scenario, application adapter or DTQL workspace?
- Which record fields may be exposed in Studio and reports?
- How are binding compatibility and re-resolution represented after branching?

---
*This document follows the https://specscore.md/feature-specification*
