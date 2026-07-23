# Local development

Setup and the script list are in the [README](../README.md). Rationale for the
architecture is in [design-decisions.md](./design-decisions.md). This file covers
what neither of those owns: how the code is laid out, and the two invariants that
are easy to break by accident.

## Where code lives

```
src/
  app/            Routes. One file per locale per route; see design-decisions.md
                  for why a dynamic segment is not possible here.
  features/       One directory per step or page. Each holds its component,
                  its schema.ts, its *.styles.ts and its tests.
  components/ui/  Shared controls. No feature knowledge.
  components/layout/  Shells, stepper, footer, language switcher.
  domain/         Donation types and rules. Imports nothing.
  lib/api/        The only place fetch is called.
  lib/validation/ Shared Zod pieces and the React Hook Form bridge.
  i18n/           i18next instances and per-locale resources.
  styles/         Tokens, global styles, and the drift guards described below.
```

A feature slice owns everything about one step. Nothing outside it imports its
internals.

## Choosing where state goes

Picking the wrong owner is the most common source of bugs in a multi-step form.

| The value is…                              | Owner             | Where                     |
| ------------------------------------------ | ----------------- | ------------------------- |
| Which step the person is on                | The URL           | Route segment             |
| Being typed right now, and its errors      | React Hook Form   | Step component            |
| Validated and committed by a finished step | Context + reducer | `features/donation-flow/` |
| Owned by the server                        | TanStack Query    | `lib/api/queries.ts`      |
| Purely visual — open, focused, hovered     | `useState`        | The component             |

## Two invariants

**Only validated, normalized data moves forward.** A step commits to the reducer
after its Zod schema passes, and it commits domain values — integer cents, an
E.164 phone string — not raw input. Money never touches floating point; the API
boundary is the only place it is divided by 100.

**Personal data has exactly one sink.** The in-progress contribution is mirrored
to `sessionStorage` under one versioned key, re-validated through Zod on load,
and wiped on accepted submission and on flow reset. It reaches nothing else: no
`localStorage`, cookies, URLs, query keys, logs, analytics or error telemetry.
The privacy-consent checkbox is narrower still — step-local form state that gates
submission and never leaves the component.

## The API boundary

Three endpoints, no key, no proxy, called straight from the browser. Response
shapes are in [api-contract.md](./api-contract.md).

Everything crosses the same way: **fetch → parse JSON → validate with Zod → map
to domain**. A non-2xx, malformed JSON, an HTML error page or schema drift all
become a typed `ApiError`. Feature code never sees an unvalidated response.

The retry policy is asymmetric on purpose. Reads retry once, for network, timeout
and 5xx failures. **The contribution POST never retries automatically** — a
synchronous in-flight lock prevents duplicates, and a timeout or dropped
connection is reported as an unknown outcome, because the server may already have
accepted the donation. Do not "improve" this by adding a retry.

After an API change, update `docs/openapi.json` from the published spec and run
`pnpm api:types`. Never hand-edit `src/lib/api/generated.ts`.

## Tests

Unit tests are co-located. Vitest runs two projects: pure-logic suites in `node`,
everything else in `jsdom`. The split is a speed optimization and is fail-safe —
a suite missing from the `node` list just runs slower.

Playwright suites live in `e2e/` and assert behaviour, not implementation.
Locally they run against the dev server; `PLAYWRIGHT_TARGET=export` and CI run
them against the built `out/` artifact, which is what actually ships.

One rule decides whether a layout or style assertion earns its place: **assert
relationships, never absolute values.** `celebration is centred within 1px` and
`the page never scrolls horizontally at 280px` stay true when a spacing token
changes. `main is at x=80, width=658` does not — it fails on every intentional
design change, and the only possible fix is to rewrite the expected number. The
second kind proves nothing and was removed.

Three suites in `src/styles/` are drift guards rather than ordinary tests:
`contrast.test.ts` computes real WCAG ratios from the palette,
`token-discipline.test.ts` fails on a raw colour that bypassed the tokens, and
`breakpoints.test.ts` fails on an undocumented media query. Each exists because
it caught a real regression.
