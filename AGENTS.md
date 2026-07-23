# Chatwright — instructions for AI agents and humans

Read this before working in any Chatwright repository.

## Development principles

1. **Deliver end-to-end experiences, not features.** Implement a user journey;
   build the features that journey needs, in the order the journey needs them.
   A feature without a journey that exercises it is not done.
2. **Improve owned dependencies along the way.** When something we depend on
   and own needs improvement (`bots-go-framework`, DALgo, DTQL/DataTug,
   SpecScore, inGitDB, …), improve it upstream as part of the work — never
   build a local workaround for a gap in our own tool.
3. **Evidence over claims.** Behaviour counts as working only with verified run
   evidence — passing scenarios, transcripts, state assertions. A prose claim
   (human or AI) is never acceptance; AI judgement never overrides
   deterministic evidence.
4. **Fidelity is declared.** Every result names its endpoint profile, platform
   coverage and mechanism (decision 0008). Unsupported is reported as
   unsupported — never silently approximated, never overclaimed ("full",
   "faithful") in code, specs or marketing.
5. **Dogfood first.** Our own bots (Listus Bot, then Sneat Bot) are the first
   customer of every capability; a capability is proven when it has served one
   of them end to end.
6. **Each feature proves its existence.** A capability enters the product only
   with a working proof — an executable scenario, gate test or dogfooded run
   that demonstrates it. Specs without proofs stay ideas; code without proofs
   stays unmerged; features whose proofs disappear get retired.
7. **Runtimes ship in lockstep.** Every runtime feature ships in both the Go
   and TypeScript runtimes with identical semantics — one scenario file, two
   runtimes, same verdict; never in only one. Deviations exist only under
   technical limitation, each recorded in
   [docs/runtime-parity.md](docs/runtime-parity.md) with explanation and
   proof link (decision 0015; founder-directed 2026-07-23).

(Deliberately short — max 7; all seven taken. Propose changes to the founder;
don't edit unilaterally.)

## Working conventions

- Vocabulary is canonical in [`docs/glossary.md`](docs/glossary.md) — when
  other wording conflicts, the glossary wins; fix the other document.
- Specs live in [`spec/`](spec/README.md); run `specscore spec lint` before
  pushing spec changes (0 violations) — the linter is the authority on
  lintable conventions; this file states only what lint cannot check.
- Docs use British English; Go code/comments may use American English; never
  mixed within a file.
- JSON artefacts (run bundles, cassettes, reports) carry human-readable
  string constants, never integer enums; in Go, kind/direction/verdict types
  are string types.
- Go: `gofmt` clean, `go vet ./...`, `go test -race ./...` before pushing.
- Contributions: DCO sign-off — see [CONTRIBUTING.md](CONTRIBUTING.md).
