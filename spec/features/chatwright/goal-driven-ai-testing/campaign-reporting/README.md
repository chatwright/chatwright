---
format: https://specscore.md/feature-specification
status: Draft
---

# Feature: Campaign Reporting

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/goal-driven-ai-testing/campaign-reporting?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/goal-driven-ai-testing/campaign-reporting?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/goal-driven-ai-testing/campaign-reporting?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/goal-driven-ai-testing/campaign-reporting?op=request-change) |

**Status:** Draft
**MVP Priority:** #1
**Source Ideas:** goal-driven-ai-bot-testing

## Summary

Produce an actionable report of what the AI attempted, what succeeded, what
failed, what remains uncertain and which transcript, trace and database evidence
supports every conclusion.

## Finding Types

- functional failure/crash;
- timeout or non-progress loop;
- response/state inconsistency;
- malformed, incorrect, secret-bearing or unavailable URL;
- goal or task failure;
- UX/discoverability obstacle;
- ambiguous behaviour;
- verified success;
- coverage or evidence gap.

Every finding records severity, goal/task identity, summary, expected and
observed behaviour, reproducible action sequence where available, observation
and message/action IDs, trace references, DTQL evidence and confidence/evidence
qualification. URL findings retain separate structure/information and
availability phase outcomes. Raw callback/platform details may be shown to
developers through linked inspection but are not inputs to the AI's actor
decisions.

## Campaign Summary

The report includes task status, milestones, budgets consumed, stop reason,
verified state, unverified claims and suggested deterministic regression
scenarios. It must distinguish “the bot failed” from “the AI did not discover a
path” and “verification was unavailable”.

## Acceptance Criteria

### AC:report-separates-defect-from-navigation

Scenario: The AI cannot find an edit operation
Given no visible path is discovered within budget
When the report is generated
Then it records a discoverability or coverage finding
And does not claim that editing is functionally broken without evidence

### AC:state-mismatch-has-linked-proof

Scenario: Visible confirmation disagrees with DTQL
Given the task, observation and assertion evidence
When a state-consistency finding is emitted
Then a developer can navigate from the finding to both visible and database
evidence

### AC:url-report-preserves-independent-phases

Scenario: A reachable URL contains the wrong space ID
Given availability passed and the information check failed
When the finding is reported
Then the report does not describe the URL as fully valid
And links the parsed/redacted components, bindings and reachability evidence

## Open Questions

- Which severity and confidence scales are useful for exploratory campaigns?
- Which evidence is embedded versus linked for portable reports?
- How are duplicate or causally related findings grouped?

---
*This document follows the https://specscore.md/feature-specification*
