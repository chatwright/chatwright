---
format: https://specscore.md/idea-specification
status: Specifying
---

# Idea: Conversation builder — author conversations by performing them

**Status:** Specifying
**Date:** 2026-07-24
**Owner:** alex
**Promotes To:** —
**Supersedes:** —
**Related Ideas:** extends:executable-knowledge-platform, extends:typing-indicator-fidelity

## Problem Statement

The north star promises learn, design, test and compare — and design has
no surface. There is no way to author a conversation: perform both sides
of a dialogue, craft a multi-actor group chat, tune the timing until it
reads right, and export it as a replayable artifact for a recipe, a demo,
a design review or a test scenario.

## Context

The run bundle already models multi-actor conversations (actors roster,
per-entry attribution; the debt sample has three actors in two chats).
The Player already animates compose-and-send typing — but it synthesises
the typing from final text and a tempo curve, because recordings carry
only sent messages, not how they were composed. The Studio direction is
one conversation surface with capability-flagged entry points
(studio-ui-surfaces idea in chatwright/studio): watch (Player) and try
(Playground). The founder's feature (2026-07-24) adds the third: build.

## Recommended Direction

### The builder is the third door of the one surface

**Player = watch. Playground = try. Builder = perform.** One chat pane;
underneath it, **one composer per actor** — two for a private chat, more
for a group chat, laid out in a single row when space allows (2–3
actors), stacked otherwise. **TAB / SHIFT+TAB cycles the focused
composer** (mouse works too); the author acts out each side in turn.

Two performance modes, freely mixed per actor:

- **Performed actors** — the author types their messages (the design and
  fake-chat-content case: perform both sides).
- **Live actors** — a real bot answers via the runtime (the demo and
  test-authoring case: perform the human, let the bot be real).

### The recording gains a composition track

Today's journal records *what was sent*. The builder records *how it was
composed*: an optional, additive **composition track** per outbound
entry — an ordered list of composer events with timing (founder's
sketch, refined):

```yaml
composition:
  - type: text        # characters typed
    text: "I am thinking"
    perCharSeconds: 0.01
  - type: pause
    seconds: 3
  - type: backspace
    count: 8
  - type: clear
  - type: text
    text: "Let me check…"
  - type: send
```

Replay then types the message into **the respective actor's composer**
with the recorded rhythm — real hesitation, real corrections — instead
of the Player's synthesised animation. Bundles without a composition
track keep today's synthesised behaviour; the field is optional and
additive (a v1-compatible extension via the sdk-go wire model + schema
drift flow, not a v2).

### Recordings become tweakable — with provenance honesty

The builder doubles as the **recording editor**: load any bundle, adjust
texts, timings, pauses; re-export. This is powerful and dangerous — an
edited recording must never masquerade as test evidence (principle 3,
decision 0006). Therefore the bundle metadata gains a **provenance**
marker: `recorded` (produced by a runtime run, untouched), `performed`
(authored in the builder), `edited` (derived from a recording and
modified). Verification-bearing surfaces (reports, arena, CI gates)
accept only `recorded`; the Player displays the provenance badge always.
Provenance is the non-negotiable core of this idea.

### What it unlocks

- Recipe conversations authored in minutes, replayable in the Player and
  exportable to the planned GIF/video pipeline (marketing and the
  fake-chat content genre).
- Scenario authoring by demonstration: perform the human side against a
  live bot, keep the recording as a golden conversation, promote it to a
  test (record → golden → replay).
- Conversation UX design reviews: timing and hesitation are part of the
  design, and the composition track makes them first-class.

## Alternatives Considered

- **A timeline/keyframe editor** (edit bubbles on a track, like video
  editors). Rejected as the primary model: performing is faster and more
  natural for dialogue; a timeline can come later as a *view* over the
  same composition track.
- **Synthesised typing only (no composition track).** Rejected: authored
  rhythm is the design signal; synthesis flattens exactly what the
  builder exists to craft.
- **A separate authoring app.** Rejected: one conversation surface,
  three doors — the builder shares the pane, the journal and the
  recording format.

## MVP Scope

1. This spec agreed; composition-track wire sketch reviewed against the
   sdk-go model (additive optional field + provenance in metadata).
2. Builder slice 1 in the Studio: two performed actors, one private
   chat, per-actor composers with TAB cycling, live typing capture
   (text/pause/backspace/clear/send), export with
   `provenance: performed`.
3. Player consumes the composition track for typed-in replay in the
   respective composer (falls back to synthesis when absent).

## Not Doing (and Why)

- **Group chats and live-actor mixing in slice 1** — the format supports
  them; the UI earns them after the two-actor loop is proven.
- **Editing existing recordings in slice 1** — provenance rules must
  ship first; editor follows.
- **Runtime execution of composition tracks** — replay is a Player
  concern; runtimes continue to execute scenarios, not performances.

## Key Assumptions to Validate

| Tier | Assumption | How to validate |
|---|---|---|
| Must-be-true | The composition track is expressible as an additive optional field without breaking v1 readers | sdk-go wire sketch + schema drift check on a branch; old Player builds ignore it cleanly |
| Must-be-true | Provenance gating keeps edited artifacts out of evidence paths | Report/arena assemblers reject non-`recorded` bundles in tests |
| Should-be-true | Performing with TAB-cycled composers is faster than any form-based authoring | Author one recipe conversation both ways; time it |
| Might-be-true | Authored conversations become shareable content beyond documentation | First performed bundles shared outside the team |

## SpecScore Integration

- **Existing Features affected:**
  [`playground`](../features/chatwright/playground/README.md),
  [`scenario-authoring`](../features/chatwright/scenario-authoring/README.md),
  [`observability`](../features/chatwright/observability/README.md); the
  Studio-side surface model lives in chatwright/studio's
  studio-ui-surfaces idea.

## Open Questions

- Does the composition track attach to journal entries or live as a
  parallel per-actor performance lane referencing entries (multi-chat
  group performances may need the latter)?
- Is `provenance` per-bundle or per-run (a bundle's runs[] could mix a
  recorded run with a performed intro)?
- Do live-actor (bot) messages in a performed session keep
  `provenance: performed` for the whole bundle, or per-entry attribution?

*This document follows the https://specscore.md/idea-specification*
