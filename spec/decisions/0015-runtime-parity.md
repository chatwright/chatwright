---
format: https://specscore.md/decision-specification
status: Approved
---

# Decision: Runtime parity — every runtime feature ships in both runtimes

**Status:** Approved
**Date:** 2026-07-23
**Owner:** alex
**Tags:** runtime, parity, conformance, architecture
**Source Idea:** executable-knowledge-platform
**Supersedes:** —
**Superseded By:** —

## Context

Chatwright has two runtime implementations: runtime-go (the CLI/CI engine)
and runtime-ts (the browser engine behind the Playground, decision
[0012](0012-black-box-bot-protocol.md)). Two implementations of one
concept invite silent divergence: features that exist only where they were
convenient to build, and behaviour that drifts until the same scenario
means different things in different places. The founder's rule
(2026-07-23): the runtimes should match as much as possible; any deviation
must be a documented technical limitation, and runtime features are never
shipped in only one runtime.

## Decision

- **Feature parity is the shipping rule.** A runtime feature ships in both
  runtime-go and runtime-ts with identical semantics — the same scenario
  produces the same verdict (research item I-71's "one scenario file, two
  runtimes, same verdict"). Shipping a runtime feature in only one runtime
  is not done.
- **Deviations exist only under technical limitation**, never convenience,
  and every one is recorded in the **parity register**
  ([docs/runtime-parity.md](../../docs/runtime-parity.md)) with an
  explanation and a proof link (issue, test or spec) — the same honesty
  rule as declared fidelity (decision 0008, principle 4).
- **Catch-up gaps are visible, not silent.** While runtime-ts catches up
  to the Go baseline, every gap appears in the register as
  "catch-up (tracked)" with its tracking link. A catch-up row is a debt,
  not a deviation; it never becomes permanent without being reclassified
  as a documented technical limitation.
- **Conformance is proven by shared fixtures** (research item I-67), not
  by claims: the same scenarios and golden bundles execute against both
  runtimes in CI once the portable scenario format (I-71) lands.

## Rationale

- Divergent runtimes would fork the product's meaning: a recipe that
  passes in the browser and fails in CI (or vice versa) destroys the
  evidence-over-claims foundation (principle 3).
- The dual-execution rule doubles as the cheapest conformance harness we
  will ever get — any semantic drift surfaces as one scenario file with
  two verdicts.
- A public register converts "the TS runtime is behind" from a vague
  impression into an honest, finite, reviewable list.

## Declined Alternatives

### Ship where convenient, reconcile later

Rejected: reconciliation never happens; the register would become an
archaeology project instead of a shipping gate.

### Browser-only or CLI-only features

Rejected as a category: a runtime feature that cannot exist in the other
runtime must prove the technical limitation in the register — otherwise it
waits until both are ready.

### Treat runtime-ts as a permanent subset

Rejected: the Playground is a first-class execution surface (decision
0012); a permanent subset would make browser evidence second-class.

## Consequences at Decision Time

- [docs/runtime-parity.md](../../docs/runtime-parity.md) is created as the
  living register; both runtime READMEs link it prominently.
- AGENTS.md gains development principle 7 (founder-directed), making
  parity a review criterion for every runtime PR in either repository.
- Runtime PRs that add a feature to one runtime must link the twin
  implementation or the tracking issue for it.
- Shared conformance fixtures become a required deliverable of the
  emulation-fidelity session (I-67).

## Observed Consequences

None yet — recorded on the day the decision was made.

## Affected Features

- [`conversation-runtime`](../features/chatwright/conversation-runtime/README.md)
- [`platform-emulators`](../features/chatwright/platform-emulators/README.md)
- [`playground`](../features/chatwright/playground/README.md)

## Open Questions

- The conformance harness mechanics (fixture format, CI wiring across two
  repositories) are research item I-67.

*This document follows the https://specscore.md/decision-specification*
