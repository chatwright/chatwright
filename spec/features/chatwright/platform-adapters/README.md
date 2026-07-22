---
format: https://specscore.md/feature-specification
status: Deprecated
---

# Feature: Platform adapters compatibility path

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/platform-adapters?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/platform-adapters?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/platform-adapters?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/platform-adapters?op=request-change) |
**Status:** Deprecated
**Source Ideas:** chatwright

## Summary

Historical SpecScore path retained for approved-decision links. Platform adapters
are internal architecture mechanisms; the current public product feature is
[Platform Emulators](../platform-emulators/README.md).

## Problem

Approved decisions and the initial implementation use “adapter” for the seam that
generates inbound updates and handles outbound platform APIs. Removing the path
would break immutable records, while keeping it as a public peer would expose
implementation detail as product hierarchy.

## Behavior

New product requirements belong to a named Platform Emulator. Architecture may
continue using adapters, transports, method handlers and mappers internally.
This path carries no independent roadmap or user promise.

## Dependencies

- [platform-emulators](../platform-emulators/README.md)
- [conversation-runtime](../conversation-runtime/README.md)

## Acceptance Criteria

### AC: architecture-alias-does-not-create-product-scope

Scenario: A historical decision links to platform-adapters
Given the approved decision cannot be rewritten
When a reader follows the link
Then they are directed to Platform Emulators for current product scope
And adapter terminology remains explicitly internal architecture

## Open Questions

None; this is a compatibility path, not an active product branch.

---
*This document follows the https://specscore.md/feature-specification*
