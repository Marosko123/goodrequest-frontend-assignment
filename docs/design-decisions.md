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

The reducer stores only `selection` and `donor` snapshots. Refresh deliberately resets the flow; personal data is not persisted.

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

## Deliberate constraints

- Context + reducer is sufficient for the bounded three-step workflow; Zustand or Redux would duplicate form state.
- Native controls are preferred. A measured audit removed the single Mantine select because its client and CSS cost was disproportionate to a short shelter list.
- CSS Modules, SCSS and CSS custom properties replace styled-components for a smaller static client bundle.
- Localization, multiple donors, Storybook, analytics, persistence and decorative animation libraries remain outside the core scope.
