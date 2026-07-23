# Chatwright product strategy

- **Updated:** 2026-07-23
- **Vision:** the best place to learn, design, test and compare conversational
  UX across messaging platforms — an executable knowledge platform on an open
  local development stack with a managed intelligence layer

## Product thesis

Chatwright can define a broader category than bot testing. One portable
conversation model should support designing a flow, exercising a real bot,
understanding evidence, exploring quality with AI and turning discoveries into
reviewed regression tests and implementation work.

The 2026-07-23 repositioning (idea: executable-knowledge-platform, decisions
0011–0014) frames the category as an **executable knowledge platform**: a
connected graph of Jobs, Recipes, Capabilities, Platforms and Implementations
whose pages run — live demos in the browser, black-box bots over
platform-native payloads, recordings as run bundles, and a federated
repository ecosystem indexed through `CHATWRIGHT.md` manifests. Testing
remains the launch wedge and the strongest proof of the substrate; learning,
designing and comparing are the paths that widen the funnel.

The platform has four product areas:

1. **Open local development:** Runtime, CLI, Platform Emulators, Playground and
   Studio provide a complete account-free workflow.
2. **Cloud Run:** managed execution, CI infrastructure, queues, history,
   reports, workspaces and organisations.
3. **Cloud Intelligence:** managed actors, evaluators, model comparison,
   exploration, swarm testing and evidence-driven improvement.
4. **Marketplace:** reusable open-source, community and commercial assets.

## Open-source boundary

Everything required for local development is open source under Apache-2.0. A
developer can clone Chatwright, run locally, develop and test bots, emulate
platforms, inspect transcripts, record scenarios and use deterministic testing
without a cloud account.

| Layer | Direction | Product promise |
|---|---|---|
| Runtime, CLI and Platform Emulators | Apache-2.0 | Portable local and CI execution |
| Playground and Studio | Apache-2.0 | Offline interaction, recording, authoring and inspection |
| Cloud Run | Operated commercial service; implementation may be closed | Managed infrastructure and collaboration |
| Cloud Intelligence | Operated commercial service; implementation may be closed | Orchestration, evaluation and intelligence at scale |
| Marketplace assets | Open-source, community or commercial per asset | Reuse with visible licence and provenance |

The commercial boundary is the service operation and accumulated intelligence,
not a crippled local Studio. Open formats, approved regressions and exported
evidence must remain usable without the service.

## Adoption strategy

Do not require an account for local usage. Earn voluntary sign-in with additive
value: sync, a personal workspace, hosted reports, web Studio, limited managed
execution and AI, public projects and community assets. A generous free tier is
an adoption mechanism; its exact limits follow cost and usage evidence.

Paid capability can grow around scale, retention, organisations, governance,
private libraries, advanced analytics and high-cost intelligence. No pricing or
SKU decision is made at this stage.

## Category-defining workflow

```text
design conversation → generate/review scenarios → generate implementation prompt
→ coding agent implements → run Chatwright → analyse failures
→ generate/review improvements → repeat
```

Chatwright's durable advantage is the evidence loop: deterministic execution,
human and AI exploration, managed evaluation and coding-agent work all share
scenario identity, platform semantics and traceable results.

## MVP discipline

The broader vision does not expand the current MVP. First make one Telegram
Platform Emulator profile and its deterministic local workflow dependable.
Playground/Studio follows as the offline visual workflow. Portable scenarios,
AI testing, Cloud and Marketplace advance only through the roadmap's user-value
gates.

## Sneat relationship

Chatwright remains an independent open-source project and product. Hosted
services may use Sneat accounts, integrate with Sneat Work or become part of the
Sneat Developer Platform, but standalone Chatwright identity, URLs and workflows
remain first-class.

## Strategic open questions

- Which repeat local workflow creates the strongest natural pull into Cloud?
- Which Cloud Intelligence result is valuable and trustworthy enough to pay for
  before large-scale swarm testing?
- Which Marketplace asset type can prove ecosystem reuse with the least platform
  and supply-chain machinery?
