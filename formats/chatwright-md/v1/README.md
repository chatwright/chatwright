# CHATWRIGHT.md — repository manifest format v1

**Format id:** `https://chatwright.dev/formats/chatwright-md/v1`
**Status:** Draft (scaffolded 2026-07-23; the front-matter schema is the
normative machine contract, this page is the normative prose)
**Decided by:** [decision 0013](../../../spec/decisions/0013-chatwright-md-federation.md)

## What it is

`CHATWRIGHT.md` is the file a repository adds to join the Chatwright
ecosystem: a readable Markdown document with structured YAML front matter.
Humans read the Markdown; Chatwright (the website, the `Try in Chatwright`
badge resolver, the central index) reads the front matter. Markdown section
headings follow a convention so tooling may later parse the prose too.

Place it at the repository root (or a subdirectory for monorepos — the
badge URL then carries the path), and link it prominently from `README.md`.

## Front matter

```yaml
---
format: https://chatwright.dev/formats/chatwright-md/v1
id: acme-rsvp-bot            # globally unique, kebab-case — the identity;
                             # never derived from the repository name
name: Acme RSVP Bot
version: 1.2.0               # must match a git tag (v1.2.0 or 1.2.0)
authors:
  - github: acme-dev         # GitHub login anchors identity
platforms: [telegram]        # platform ids
bots:
  - id: rsvp                 # unique within this manifest
    platform: telegram
    transport: iframe        # iframe | http
    url: https://acme.dev/chatwright-bot/   # iframe src, or HTTPS endpoint
    capabilities:            # capability keys the bot exercises
      - messaging.buttons.inline
      - messaging.message.edit
implements:                  # knowledge-graph references (ids in
  - recipe: collect-rsvp     # chatwright/recipes)
    platform: telegram
    tier: community          # official | alternative | community
jobs: [collect-rsvp-for-event]
demos:
  - bot: rsvp                # bot id above
    title: RSVP happy path
    scenario: scenarios/rsvp-happy-path.chatwright.json  # optional today
tags: [rsvp, events]
---
```

Required: `format`, `id`, `name`, `version`, `authors`, `platforms`,
`bots`. Everything else is optional. Unknown keys are ignored (forward
compatibility). The machine-readable contract is
[`schema.json`](schema.json) — the canonical copy lives in this repository
until generation tooling exists, at which point the run-bundle drift-check
pattern applies.

## Markdown sections (convention)

After the front matter, use these `##` headings where applicable so future
tooling can lift them: `About`, `Jobs`, `Recipes`, `Capabilities`,
`Demo`, `Running locally`, `Trade-offs`, `Examples`.

## Versioning

`version` must match a git tag of the repository (Terraform-style
publishing: tagging **is** releasing). Consumers resolve `id@version`
through the tag; the central index caches manifest snapshots per version.

## The badge

```markdown
[![Try in Chatwright](https://chatwright.dev/badge.svg)](https://chatwright.dev/try/github/OWNER/REPO)
```

`https://chatwright.dev/try/github/{owner}/{repo}[/{path}][?ref={branch|tag|sha}]`
works the moment `CHATWRIGHT.md` exists — no registration. Listing in the
[central index](https://github.com/chatwright/recipes) is the optional
discovery layer on top. Add the GitHub topic `chatwright-bot` for
zero-friction discovery.
