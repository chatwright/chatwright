---
format: https://specscore.md/feature-specification
status: Draft
---

# Feature: Visible Conversation

> [SpecScore.**Studio**](https://specscore.studio): | [Explore](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/observation-model/visible-conversation?op=explore) | [Edit](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/observation-model/visible-conversation?op=edit) | [Ask question](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/observation-model/visible-conversation?op=ask) | [Request change](https://specscore.studio/app/github.com/chatwright/chatwright/spec/features/chatwright/observation-model/visible-conversation?op=request-change) |

**Status:** Draft
**Source Ideas:** observation-model

## Summary

Project the conversation as a chronological sequence of user-visible logical
messages with stable identity, revisions and normalised Markdown. Preserve the
semantics actors need while keeping messenger markup, transport IDs and API
payloads outside the model.

## Message Contract

The minimum working fields are:

| Field | Meaning |
|---|---|
| `id` | Stable synthetic Chatwright identity for one logical visible message and its authoritative emulator mapping |
| `revision` | Monotonic version of that logical message |
| `actor` | Identity of the actor that produced the message |
| `type` | Semantic message/content category |
| `text` | Normalised Markdown where textual content exists |
| `actions` | Currently visible generic interactions associated with the message |

The same synthetic message ID is retained by the observation and visual view
model/rendered node. Selecting that visible object can therefore resolve through
Chatwright to authoritative Platform Emulator state and raw trace evidence. The
exact type taxonomy, media envelope, deletion tombstone and reply reference are
investigations. A platform-native message ID may remain in raw trace evidence
and internal resolver state and may be displayed by a developer inspector, but
is not an actor-facing identity.

## Formatting

Markdown is the default representation for formatted text. The normaliser aims
to preserve headings, bold, italic, labelled and visible links, inline/fenced
code, lists, quotes, spoilers and emoji. It must neither leak raw Telegram HTML
or MarkdownV2 nor imply formatting a source platform cannot represent.

Studio may render safe HTML from Markdown. Rendering is not part of the
observation contract, and actors should not need a browser DOM to understand
content or discover actions.

## Ordering and Edits

- Messages are ordered chronologically, oldest to newest.
- Windowing preserves complete conversational turns and complete bot responses.
- Every currently visible action remains discoverable.
- An edit advances the existing logical message revision.
- The message keeps its conversational position; the change feed records when
  the edit happened.
- Deleted messages, quoted replies and simultaneous edits need explicit
  semantics rather than platform-specific inference.

## Links and Rich Content

Inline Markdown links preserve their destination for actor inspection. Research
must distinguish links embedded in text, button-like link actions, external
navigation, Web Apps and deep links. External navigation may need a resulting
observable event rather than being treated as an invisible side effect.

Deterministic URL Verification (not yet a public feature)
can target the synthetic identity of a visible Markdown link or link action,
resolve its authoritative destination and check parsed structure, run-bound
information and configured reachability without using an AI judge.

Media should expose user-perceivable type, caption/alternative text, metadata
needed for interaction and an opaque attachment reference. Raw file handles,
platform file IDs and signed provider URLs should not become portable actor
identities.

## Acceptance Criteria

### AC: platform-markup-is-normalised

Scenario: Telegram renders formatted service instructions
Given source content uses Telegram-specific markup
When Chatwright projects the visible message
Then actors receive semantically equivalent Markdown
And no Telegram HTML or MarkdownV2 syntax is required to interpret it

### AC: message-edit-keeps-identity

Scenario: Available times are refreshed in place
Given one logical message at revision 2
When the bot edits its text and actions
Then the observation retains the message ID at revision 3
And current content replaces revision 2 in chronological position

### AC: rendered-message-keeps-synthetic-id

Scenario: A message is rendered in Studio
Given the observation identifies the message as `msg7`
When Studio renders and selects that message
Then its visual representation retains `msg7`
And Chatwright can resolve `msg7` to authoritative emulator state

### AC: window-does-not-split-response

Scenario: A bot response contains several visible messages
Given a size-constrained observation
When the response falls on the boundary
Then the complete response is included or represented by an explicit summary
And current actions remain available

## Open Questions

- How is Markdown normalised when platform formatting capabilities differ?
- How are media, edits, deletions and quoted replies represented?
- How do edit time and conversational order coexist?
- What are the semantics of visible URLs, labelled links, Web Apps and deep
  links?
- Which link destinations are available to actor observations versus only to
  deterministic assertions and developer inspection?

---
*This document follows the https://specscore.md/feature-specification*
