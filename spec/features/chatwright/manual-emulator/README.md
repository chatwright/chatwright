---
format: https://specscore.md/feature-specification
status: Deprecated
---

# Feature: Manual emulator compatibility path

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/manual-emulator?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/manual-emulator?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/manual-emulator?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/manual-emulator?op=request-change) |
**Status:** Deprecated
**Source Ideas:** chatwright

## Summary

Historical SpecScore path retained for approved-decision links. The current
product feature is the [Chatwright Playground](../playground/README.md), which
consumes Platform Emulators rather than being one.

## Problem

Removing this path would break immutable decisions written before the Playground
and Platform Emulator product boundary was clarified. Treating it as a current
product branch would preserve the wrong mental model.

## Behavior

This compatibility feature contains no independent scope. New manual-testing,
multi-panel, breakpoint and recording requirements belong to the Playground.
Platform simulation requirements belong to Platform Emulators.

## Dependencies

- [playground](../playground/README.md)
- [platform-emulators](../platform-emulators/README.md)

## Acceptance Criteria

### AC: compatibility-path-points-to-current-product

Scenario: A historical decision links to manual-emulator
Given the approved decision cannot be rewritten
When a reader follows the link
Then they are directed to the Playground as the current product feature
And are told that Platform Emulators own simulated platform behaviour

## Open Questions

None; this is a compatibility path, not an active product branch.

---
*This document follows the https://specscore.md/feature-specification*
