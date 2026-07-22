---
format: https://specscore.md/feature-specification
status: Draft
---

# Feature: Marketplace

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/marketplace?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/marketplace?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/marketplace?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/marketplace?op=request-change) |
**Status:** Draft
**Source Ideas:** chatwright

## Summary

A discoverable ecosystem of reusable Chatwright assets from the project,
community and commercial publishers, without making Marketplace access a local
development prerequisite.

## Asset directions

Marketplace may distribute personas, scenario and assertion libraries,
milestone packs, evaluation modules, AI evaluators, platform adapters, reusable
fixtures, conversation templates and industry packs. Assets may be open-source,
free community content or commercial content.

Every asset exposes publisher, version, compatible Chatwright/platform profiles,
licence, provenance and required capabilities before use. Trust, review and
supply-chain policy must be investigated before executable third-party modules
are treated like data-only packs.

Community-maintained assets—personas, conversation packs, regression suites,
platform profiles and testing recipes—are the first planned direction. They use
versioned portable formats and declare compatibility, licence, maintainers and
provenance; a project can pin a library revision, inspect its contents and
retain the revision needed to reproduce a run. Community status is not a claim
of Chatwright endorsement. Useful early candidates are focused packs with
observable value: platform compatibility profiles, common recovery
conversations and testing recipes. Persona libraries require explicit
safeguards against stereotyping, sensitive attributes and unsupported claims
about real populations.

## Boundaries

The first marketplace direction is portable package metadata and discovery—not
an elaborate transaction system. Open assets can be installed and used by local
tools without a Cloud account. Commercial assets may require a separate licence,
but cannot be required for Chatwright's essential local workflow.

## Acceptance Criteria

### AC: asset-terms-are-visible

Scenario: A developer evaluates a persona pack
Given open-source, community and commercial alternatives
When the developer compares them
Then licence, publisher, version, provenance and compatibility are visible
And installing one does not silently upload project data

### AC: open-assets-work-locally

Scenario: A developer installs an open regression suite
Given a compatible repository and no Chatwright account
When the suite is installed from a portable package or source repository
Then supported scenarios run with the open local stack
And Cloud is required only for explicitly selected hosted capabilities

## Open Questions

- Which single asset type creates enough reuse to validate a Marketplace?
- Which executable extension types require sandboxing, signatures or manual
  review before distribution?
- Should the first community registry be a curated index of source repositories
  rather than a hosted package service?
- What maintainer and deprecation signals help teams assess long-lived packs?

---
*This document follows the https://specscore.md/feature-specification*
