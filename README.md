# GoodBoy donation flow

A localized, accessible three-step donation flow built for the GoodRequest
frontend assignment. Static Next.js export, no server runtime, deployed to
GitHub Pages.

**Live:** <https://marosko123.github.io/goodrequest-frontend-assignment/>

|                 |                                                 |
| --------------- | ----------------------------------------------- |
| Framework       | Next.js 16 (App Router, `output: "export"`)     |
| Language        | TypeScript 5.9, strict                          |
| Server state    | TanStack Query 5                                |
| Client state    | Context + reducer                               |
| Forms           | React Hook Form + Zod                           |
| Styling         | styled-components 6 (SWC transform, RSC-native) |
| Localization    | i18next / react-i18next — `sk`, `en`, `cz`      |
| Package manager | pnpm 11.15.1, Node.js 24                        |
| Hosting         | GitHub Pages, deployed by GitHub Actions        |

## Quick start

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Open <http://127.0.0.1:4173/>.

## Documentation

| Document                                                         | Contents                                                                 |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------ |
| [Local development](./docs/local-development.md)                 | Project layout, state ownership, how to run the suites.                  |
| [Design decisions](./docs/design-decisions.md)                   | Why the architecture looks like this, and what was measured and refused. |
| [API contract](./docs/api-contract.md)                           | The three supplied endpoints, response shapes, runtime error policy.     |
| [Requirements traceability](./docs/requirements-traceability.md) | Each requirement mapped to the test that proves it.                      |
| [Assignment brief](./docs/assignment-brief.md)                   | Verbatim source brief from GoodRequest. Authoritative on scope.          |
| [ZADANIE.md](./ZADANIE.md)                                       | Interpreted requirements and acceptance criteria (Slovak).               |
| [`docs/openapi.json`](./docs/openapi.json)                       | Verified API snapshot. Source for generated types.                       |

## Deployment

Pushes to `main` run the quality, browser and performance gates, then publish
`out/` to GitHub Pages. The project URL lives under a subpath, so the production
build needs the base path:

```bash
NEXT_PUBLIC_BASE_PATH=/goodrequest-frontend-assignment pnpm build
```

## What the application does

Three steps, each its own route, each committing only validated data forward:

1. **Selection** — foundation or a specific shelter, plus a preset or custom amount.
2. **Details** — donor name, surname, e-mail and a Slovak or Czech phone number.
3. **Review** — summary, mandatory privacy consent, submission.

Plus a contact page, an about page showing the live contributed total and
contributor count, a localized 404, and full keyboard and screen-reader support.

## Project structure

```
src/
  app/            App Router routes; one segment per locale (sk at root, /en, /cz)
  features/       Feature slices: selection, details, review, about, contact
  components/     Shared UI (ui/) and layout chrome (layout/)
  domain/         Framework-free donation types and rules
  lib/            api/ (client, contracts, queries), validation/, navigation/, site.ts
  i18n/           i18next instances, config and per-locale resources
  styles/         Design tokens, global styles, contrast and drift guards
  assets/         Brand logo, flags, optimized imagery
e2e/              Playwright suites, run against the built out/ artifact in CI
scripts/          Bundle-budget and Lighthouse gates, static server for both
docs/             The reference documents linked above
```

Every module is co-located with its `*.test.ts(x)` and, where it has styles, its
`*.styles.ts`.

## Scripts

| Command              | What it does                                                                |
| -------------------- | --------------------------------------------------------------------------- |
| `pnpm dev`           | Dev server on <http://127.0.0.1:4173/>                                      |
| `pnpm build`         | Static export to `out/`                                                     |
| `pnpm check`         | format → lint → stylelint → typecheck → unit tests → build → bundle budgets |
| `pnpm test`          | Vitest unit and integration suites                                          |
| `pnpm test:watch`    | Vitest in watch mode                                                        |
| `pnpm test:coverage` | Vitest with V8 coverage                                                     |
| `pnpm test:e2e`      | Playwright (dev server locally, `out/` in CI)                               |
| `pnpm lint`          | ESLint, zero warnings tolerated                                             |
| `pnpm lint:styles`   | Stylelint over styled-components template literals                          |
| `pnpm typecheck`     | `next typegen` then `tsc --noEmit`                                          |
| `pnpm format:check`  | Prettier verification                                                       |
| `pnpm bundle:check`  | Per-route gzip budgets against the frozen baseline                          |
| `pnpm performance`   | Lighthouse matrix over `out/`                                               |
| `pnpm deadcode`      | Knip unused files, exports and dependencies                                 |
| `pnpm api:types`     | Regenerate API types from `docs/openapi.json`                               |

`pnpm bundle:check` and `pnpm performance` read `out/`; run `pnpm build` first.

## Attribution

Assignment and design assets by [GoodRequest](https://www.goodrequest.com/).
Figma source: [Frontend Assignment 2.0](https://www.figma.com/design/fOYdJW8UqfZjT8o2WYigty/Frontend-Assignment-2.0).
API documentation: <https://frontend-assignment-api.goodrequest.dev/apidoc/>.

Brand assets in this repository: the supplied logo export lives at
`src/assets/brand/goodboy-logo.svg`, localized Open Graph images at
`public/social/`, and the GitHub social preview at
`.github/assets/goodboy-social-preview.png`. `public/og-image.png` mirrors the
Slovak preview so previously shared links keep resolving.
