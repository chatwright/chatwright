# Chatwright Studio connected prototype

A local zoneless Angular 22 + PrimeNG 22 prototype for discussing Chatwright's
long-term Studio workflow. It uses Angular Signals, static sample data and no
backend.

## Run

```bash
pnpm install
cp .env.example .env.local
# Add PRIMEUI_LICENSE to .env.local.
pnpm start
```

Open [http://localhost:4200](http://localhost:4200). Production compilation:

```bash
pnpm build
```

## Connected mock-ups

| View | Route | Primary question |
|---|---|---|
| Workspace | `/workspace` | Can users understand hierarchy, coverage and the next useful action? |
| Live emulator | `/emulator` | Can several actor/chat contexts stay legible while all actions use one run? |
| Scenario | `/scenario` | Can conversational intent and executable assertions read as one specification? |
| Run inspector | `/run` | Can a failure or edit be explained from transcript, trace and metrics without a debugger? |

All views refer to the same workspace, `greetbot/language-choice` scenario and
`run-1842`. Links between them preserve that mental context.

## Dynamic interaction

In the live emulator, change the language selector inside Greeter's reply. The
reply text changes in place, its version increments, an “edited” marker appears,
and a matching `editMessageText` event is added to the trace rail. Reset returns
the run to the English v1 state.

## Design intent

- PrimeNG 22 provides buttons, tags, avatars, select controls, progress bars, trees,
  tables and tooltips; layout/brand CSS remains prototype-specific.
- The shell is dark, dense and evidence-first: a developer tool rather than a
  consumer messenger clone.
- The UI deliberately shows fidelity (`HTTP`, `Telegram`, `faithful`) and marks
  AI authoring as future rather than implying it exists today.
- Responsive rules collapse the sidebars before shrinking the message canvas.

The app bootstrap configures PrimeUI from `PRIMEUI_LICENSE` or the ignored
`.env.local` file. The generated TypeScript config and the local licence both stay
out of Git; builds without a key still compile but PrimeUI displays its licence
notice.
See the [PrimeNG configuration guide](https://primeng.dev/configuration) and
[Select component](https://primeng.dev/select) used by the language edit.
