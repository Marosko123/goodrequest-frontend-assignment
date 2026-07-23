# Design decisions

The supplied PDF exports are the visual source of truth until node-level Figma inspection is available. Functional requirements and the verified API contract take priority over contradictory sample data.

## State ownership

| State                                   | Owner             |
| --------------------------------------- | ----------------- |
| Current step                            | URL route         |
| Values and errors of the current step   | React Hook Form   |
| Validated completed steps               | Context + reducer |
| Shelters, statistics, submission status | TanStack Query    |
| Open control and focus state            | Local React state |

The reducer stores validated `selection` and `donor` snapshots, current step drafts and an explicit accepted-submission flag.

A refresh mid-flow restores the in-progress contribution from `sessionStorage`, so a reload does not discard typed answers. That snapshot includes the donor fields — name, surname, e-mail and the E.164 phone number — because losing them on reload is the failure the assignment calls out by name. The scope is deliberately narrow: `sessionStorage` rather than `localStorage`, so the entry dies with the tab; a single versioned key; every field re-validated through a Zod schema on load, so tampered or stale data is discarded rather than trusted; and an explicit wipe on both accepted submission and flow reset. The accepted-submission flag is never persisted, so the success screen cannot be restored by a reload. Personal data reaches no other sink — no `localStorage`, cookies, URLs, logs, analytics or error telemetry.

## Submission feedback

The review form models submission as explicit idle, submitting, offline, connection-restored, unknown-outcome, rate-limited, invalid and service-unavailable states. `navigator.onLine` and browser connectivity events are treated only as signals: offline prevents the POST, while restored connectivity asks the person to retry manually.

A dispatched POST is never retried automatically. The synchronous in-flight lock prevents duplicate requests, and timeout, network failure, malformed responses and 5xx responses retain an unknown-outcome warning because the server may already have processed the contribution. Feedback uses text, icon and tone together, with stable live-region semantics and a reduced-motion-safe loading indicator.

## Localization

The assignment asks for a localization library for strings, so `i18next` and `react-i18next` serve every string in both render environments. Server Components build metadata through `createTranslator`, and Client Components read `useTranslation` from `react-i18next`.

Each locale owns a module-cached i18next instance and `AppI18nProvider` hands the matching one to `I18nextProvider` during render. Switching locales is a client-side navigation inside the same document, so an instance swap resolves synchronously, while the asynchronous `changeLanguage` would repaint the previous locale first. `AppI18nProvider` is also the single owner of `document.documentElement.lang`.

All three locales are bundled rather than fetched on demand. The static export prerenders Client Components at build time, so an unresolved namespace during hydration would either suspend or mismatch the prerendered markup. Bundled resources plus `initAsync: false` keep `useTranslation` ready on the first render. The measured cost is 15.5 kB gzip per route, and the frozen route baseline was raised by exactly that amount.

Static HTML still carries `lang="sk"` on every route because the root layout is shared and no `[lng]` segment exists; an inline script corrects the attribute before paint. Moving Slovak from `/` to `/sk/` would change the canonical, sitemap and hreflang contract, so the script stays.

## Privacy consent boundary

The source assignment requires an affirmative, unchecked privacy-consent checkbox before submission. That checkbox is step-local React Hook Form state: it gates the POST action, but it never enters the donation-flow reducer, drafts, browser storage, query state, API payload, URLs, logs, analytics or error telemetry.

The supplied API version `1.0.6` has no consent, notice-version or acceptance-time field, and the static GitHub Pages frontend has no trusted server on which to create an auditable receipt. The checkbox therefore satisfies the assignment's client-side submission requirement; it is not presented as a production consent-management system.

A production implementation must first have an approved privacy notice and a controller-approved legal basis. If that basis requires consent evidence, the backend contract must create the record with a server timestamp, notice version, specific purpose, contribution linkage and a withdrawal process. The frontend must not invent those claims, persist a receipt locally or add a privacy link without a real approved destination.

## Static deployment

GitHub Pages is the only deployment target. Next.js uses static export with the production base path `/goodrequest-frontend-assignment`. No SSR, Route Handlers, server actions, image optimization server, cookies, or secret runtime values are allowed.

GitHub Pages does not expose per-repository response-header configuration. The production HTML therefore carries an early, restrictive meta CSP. Next.js static hydration requires the documented `script-src 'unsafe-inline'` exception; script and connection origins remain allowlisted. Meta CSP cannot enforce `frame-ancestors`, so clickjacking headers remain a hosting-platform limitation rather than an application claim.

The lockfile temporarily overrides Next.js optional `sharp`, build-time `postcss` and Redocly's build-time `js-yaml` transitive versions to audited patched releases. The overrides are verified by the static production build and can be removed when their direct parents adopt equivalent or newer versions.

## Figma discrepancies

- The review sample combines a foundation contribution with a named shelter. The implementation shows a shelter only for the shelter variant.
- The details sample combines `+420` with a Slovak flag. Prefix, country and flag remain synchronized.
- The shelter label says optional even for a shelter contribution. It becomes required conditionally.
- The review screen labels the final step as step 2. The implementation labels it step 3.
- Desktop artwork is adapted into a single-column mobile layout because no complete mobile frame was supplied.

## Localized route files

Each locale gets its own route file — eighteen page and layout modules across
`sk`, `en` and `cz`. They hold no duplicated logic: every one is a thin binding
of a locale to `createPageMetadata` and a shared page component, and the
behaviour lives in `src/features`.

Collapsing them into a single `[[...locale]]` optional catch-all was attempted
and is not possible here. Next.js rejects the route tree outright:

```
Error: Optional catch-all must be the last part of the URL in route "/[[...locale]]/details".
```

An optional catch-all cannot have static children, so `/details`, `/review` and
`/success` cannot sit beneath it. The alternative, a required `[locale]`
segment, would move Slovak from `/` to `/sk/` and change the canonical,
hreflang and sitemap contract that the browser suite pins. The explicit files
are therefore what the framework allows, not a stylistic preference.

## Performance budgets

`pnpm performance` runs Lighthouse over the built export — three locales, mobile
and desktop, five and three runs each — and gates the medians.

Accessibility, best practices and SEO must be exactly 100. Those audits are
deterministic and the artifact reaches 100 on every run, so anything lower is a
real regression.

Performance is gated by a floor rather than by a perfect score: 90 on mobile, 98
on desktop. Mobile Lighthouse simulates a 4x CPU slowdown on slow 4G and the
score moves several points between runs on byte-identical input, so demanding
100 there would gate on hardware noise instead of on the application. Measured
medians are 97–99 on mobile and 100 on desktop.

The composite score can hide a field-metric regression, so LCP and CLS are
budgeted directly: 3500 ms and 1500 ms of LCP for mobile and desktop, and 0.1 of
CLS everywhere. Measured values are 2.3–2.9 s, ~0.5 s and 0.000.

## Build warnings

`next build` reports two AVIF warnings. Turbopack cannot re-encode AVIF and
emits the files unchanged, which is the intent: the artwork is already
optimized and its byte size is frozen in `scripts/image-asset-baseline.json`.
The warnings are expected and need no action.

## Phone metadata

`libphonenumber-js/max` is the largest single dependency on the details route at
roughly 40 kB gzip of metadata. Two cheaper options were measured rather than
assumed:

- `libphonenumber-js/min` saves about 21 kB but drops the national number
  patterns. Across 200 generated SK and CZ prefixes it accepted 25.5 % of the
  numbers `max` correctly rejects — `+421 300 123 456` among them. The
  assignment asks for a valid Slovak or Czech number, so that trade was refused.
- Custom `--extended` metadata for SK and CZ alone would keep the precision and
  save most of the weight, but it adds a generator dependency, a committed
  generated artifact and a silent-drift risk on every library upgrade. The
  details route currently fits its cap, so the complexity is not yet earned.

The review route needed none of this: it only formatted an already validated
E.164 number, which `formatPhoneForDisplay` now does in `domain/`, worth 50 kB
gzip on that route. Its output is pinned against `formatInternational()` in
`donation.test.ts`, so the shortcut cannot drift from the library it replaced.

## Deliberate constraints

- Context + reducer is sufficient for the bounded three-step workflow; Zustand or Redux would duplicate form state.
- Native controls are preferred. A measured audit removed the single Mantine select because its client and CSS cost was disproportionate to a short shelter list.
- Styling uses `styled-components@6.4.4` with the Next.js SWC transform and native React Server Component support. Static typed tokens emit the existing CSS custom-property contract without a runtime `ThemeProvider`; finite variants use `data-*` selectors and user-derived values stay in CSS custom properties.
- Server Components emit their styles through the native v6.4 RSC path. The interactive form tree uses the minimal Next.js SSR sheet collector so its Client Component rules are present in the static HTML before hydration and when JavaScript is unavailable.
- Styled declarations and keyframes live at module scope in co-located `*.styles.ts` files. The static export is protected by a per-route gzip gate that allows at most 25,600 bytes of JavaScript growth from the pre-migration baseline.
- Multiple donors, Storybook, analytics, persistence and decorative animation libraries remain outside the core scope. Slovak and English localization are part of the implemented flow.
