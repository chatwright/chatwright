---
format: https://specscore.md/feature-specification
status: Draft
---

# Feature: Community libraries

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/marketplace/community-libraries?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/marketplace/community-libraries?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/marketplace/community-libraries?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/marketplace/community-libraries?op=request-change) |
**Status:** Draft
**Source Ideas:** chatwright

## Summary

Community-maintained personas, conversation packs, regression suites, platform
profiles and testing recipes that compound shared knowledge across Chatwright
projects.

## Behavior

Libraries use versioned portable formats and declare compatibility, licence,
maintainers and provenance. A project can pin a library revision, inspect its
contents, override allowed data and retain the revision needed to reproduce a
run. Community status is not a claim of Chatwright endorsement.

Useful early candidates are focused packs with observable value: platform
compatibility profiles, common recovery conversations and testing recipes.
Persona libraries require explicit safeguards against stereotyping, sensitive
attributes and unsupported claims about real populations.

## Acceptance Criteria

### AC: community-dependency-is-reproducible

Scenario: A project depends on a community conversation pack
Given a pinned pack revision and compatible local runtime
When the suite is run later
Then the exact pack content and licence can be resolved or vendored
And a mutable marketplace listing cannot silently change the run

## Open Questions

- Should the first community registry be a curated index of source repositories
  rather than a hosted package service?
- What maintainer and deprecation signals help teams assess long-lived packs?

---
*This document follows the https://specscore.md/feature-specification*
