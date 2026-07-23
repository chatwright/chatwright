---
format: https://specscore.md/decision-specification
status: Approved
---

# Decision: CHATWRIGHT.md manifests and a federated central index

**Status:** Approved
**Date:** 2026-07-23
**Owner:** alex
**Tags:** federation, community, formats, repositories, discovery
**Source Idea:** executable-knowledge-platform
**Supersedes:** —
**Superseded By:** —

## Context

The knowledge platform must reach beyond a monorepo: every bot lives in its
own repository, community implementations must be discoverable, and
repositories should gain visibility while promoting Chatwright. Prior art
is instructive: Obsidian's community-plugin index (thin pointer rows, the
real manifest in each plugin's repo), Terraform's registry (publishing is a
naming-and-tagging convention), Go's module proxy (an immutable cache
survives origin death), and the well-known decay mode of awesome-lists
(rot without automated liveness checks). "Open in Colab/StackBlitz" badges
spread because the URL alone is a complete, stateless recipe requiring no
prior registration.

## Decision

### CHATWRIGHT.md — the repository manifest

Every indexed repository carries a `CHATWRIGHT.md`, linked prominently from
its `README.md`. It is readable Markdown with structured YAML front matter;
the architecture also permits later parsing of Markdown sections by heading
convention. The front matter declares: the manifest format URL, a globally
unique `id` (**the identity — never the repository name**, which is
squattable and transferable), name, authors, platforms, bots (each with
`transport: iframe | http`, its URL, and capability keys per decision
[0011](0011-executable-knowledge-graph.md)), the Implementations/Recipes/
Jobs the repository provides, demos (bot + scenario pairs), and trade-off
summaries. The human sections describe the same things in prose with
examples and screenshots.

The manifest format is published as
`https://chatwright.dev/formats/chatwright-md/v1` (spec and front-matter
JSON Schema under `formats/chatwright-md/v1/` in this repository — the
canonical source, hand-authored until generation tooling exists).

Versioning follows the Terraform protocol: a manifest's `version` must
match a git tag, so "bot X at version Y" resolves deterministically with no
per-release registration step.

### The central index: `chatwright/recipes`

One curated repository (founder decision 2026-07-23) holds both:

- **First-party content** — `jobs/`, `recipes/`, `capabilities/` (prose)
  and `data/capabilities/` (compatibility data files), the content the
  website renders.
- **The registry** — thin pointer rows (`id`, repository URL, category,
  capability keys) for federated repositories, plus a **cached snapshot of
  each manifest** (content mirror, never code): the Go-proxy lesson, so a
  deleted upstream repository does not silently break every embedded badge
  and demo across the web. The cache is explicitly labelled as a cache; the
  in-repo manifest stays the source of truth.

Registry hygiene, designed in from day one:

- PR-time validation by automation: `id` uniqueness plus a live fetch and
  schema check of the linked repository's manifest.
- Scheduled liveness checks per row (manifest parses, declared demo
  endpoints respond) producing visible staleness labels — the antidote to
  awesome-list rot; never manual re-review.
- The GitHub topic `chatwright-bot` is promoted as a zero-friction
  discovery layer, additive to — never a substitute for — the curated
  index.

### The badge: no registration required

`Try in Chatwright` links follow
`https://chatwright.dev/try/github/{owner}/{repo}[/{path}][?ref={branch|tag|sha}]`
— path segments, hand-editable, pointing straight at the repository (or a
subdirectory holding `CHATWRIGHT.md`). The badge works the moment a
repository adds a manifest, with no index entry needed; the index is the
optional discovery and caching layer above it. Runtime configuration is
read from the manifest, keeping badge URLs short and stable as the format
evolves.

### Future federation

Repositories may later register themselves directly on Chatwright (an
authenticated API). The architecture already supports this: registration is
just a different ingestion path for the same manifest into the same
registry, with the same validation and liveness machinery.

## Rationale

- **Manifest-in-repo, thin central index** is the federation shape with the
  best survival record (Obsidian community plugins): ownership, versioning
  and content stay with contributors; the index stays reviewable and small.
- **Tagging is releasing** (Terraform's protocol) removes a whole class of
  registration friction and stale-version bugs.
- **A manifest cache in the index** applies the Go-module-proxy lesson:
  origin death must not break every downstream embed.
- **Automated liveness checking** is designed in because the failure mode
  of curated lists is known and certain (awesome-list rot); manual
  re-review never happens.
- **Registration-free badges** are what made "Open in Colab/StackBlitz"
  spread: the URL alone is a complete, stateless recipe, and it doubles as
  distribution — every badge on a third-party README advertises
  Chatwright.
- Repository names are transferable and squattable; a manifest-declared
  unique `id` keeps identity stable across renames and forks.

## Declined Alternatives

### A registry-only awesome-list

Rejected (founder choice): first-party content and the registry share one
contribution surface and one star magnet; splitting halves both.

### An index that mirrors nothing (pure pointers)

Rejected: upstream deletion or force-push then breaks demos and badges
platform-wide; the manifest cache is cheap insurance.

### An index that hosts implementations (a monorepo of bots)

Rejected: kills federation, repository ownership and per-repository
visibility — the ecosystem must accumulate stars for contributors, not
only for Chatwright.

### Opaque badge URLs (`/try?b=<uuid>`)

Rejected: registration-first badges would not spread; legible URLs that
work instantly are what made the pattern succeed elsewhere.

## Consequences at Decision Time

- `chatwright/recipes` is created now with the content skeleton, registry
  format and contribution guide; the standard repository gains
  `formats/chatwright-md/v1/`.
- The Studio worker gains a `/try/github/...` route (resolution, manifest
  fetch, player/runtime hand-off) — specified in a follow-up session; the
  route contract is fixed by this decision.
- A standard README badge asset and snippet are published so repositories
  can adopt `CHATWRIGHT.md` + badge in one copy-paste.
- Index automation (PR validation, liveness sweeps) is a `recipes`
  repository CI concern, not a hosted service, until federation demands
  more.

## Observed Consequences

None yet — recorded on the day the decision was made.

## Affected Features

- [`marketplace`](../features/chatwright/marketplace/README.md)
- [`developer-tooling`](../features/chatwright/developer-tooling/README.md)

## Open Questions

- The authenticated self-registration API and its trust model are backlog
  item I-74; the capability compatibility data pipeline is I-75
  ([research: knowledge platform](../research/knowledge-platform.md)).

*This document follows the https://specscore.md/decision-specification*
