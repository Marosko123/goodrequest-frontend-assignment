# Development

## Local setup

Requirements: Node.js 24 LTS and pnpm 11.15.1.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Open http://127.0.0.1:4173/.

## Quality checks

```bash
pnpm check
pnpm format:check
pnpm deadcode
pnpm test:e2e
pnpm performance
pnpm audit
```

`pnpm performance` expects an existing production export in `out/`; run `pnpm build` first after application changes.

The repeatable local HTTP/1.1 harness gates mobile Lighthouse Performance at 90 and guards LCP regressions above 3.5 s on shared CI hardware. The deployed HTTP/2 Pages site retains the production Core Web Vitals target of LCP at or below 2.5 s.

## Architecture

| State                               | Owner             |
| ----------------------------------- | ----------------- |
| Current step                        | URL route         |
| Current field values and errors     | React Hook Form   |
| Validated completed steps           | Context + reducer |
| Shelters, statistics and submission | TanStack Query    |
| Focus and local control state       | Component state   |

Each step commits only validated, normalized domain data. Personal data is not written to storage, analytics or logs. Submission has no automatic retry and uses a synchronous duplicate-request lock.

API types and runtime schemas follow the verified snapshot in `docs/openapi.json` and `docs/api-contract.md`. The browser calls the public API directly; no secrets are required.

## GitHub Pages

Build the same base-path artifact locally:

```bash
NEXT_PUBLIC_BASE_PATH=/goodrequest-frontend-assignment pnpm build
test -f out/index.html
```

Pushes to `main` run frozen installation, quality, browser and performance gates before deploying `out/` through the GitHub Pages artifact workflow.
