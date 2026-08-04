# CLAUDE.md — GoodBoy donation flow

Localized, accessible three-step donation flow. **Static Next.js export, no server runtime**,
deployed to GitHub Pages. Built as the GoodRequest frontend assignment.

## The constraint that shapes everything

There is **no server at runtime**. `next build` is followed by
`scripts/finalize-static-export.mjs`, and the output is plain files on GitHub Pages. So: no API
routes, no middleware, no server actions, no ISR, no runtime env vars. Anything dynamic must be
client-side. If a change needs a server, it is out of scope for this architecture — say so rather
than adding one.

## Commands

pnpm only (`packageManager: pnpm@11.15.1`, Node `>=24 <25`).

```bash
pnpm dev            # 127.0.0.1:4173 (not the default 3000)
pnpm typecheck      # runs `next typegen` FIRST, then tsc --noEmit — plain tsc will fail
pnpm build          # next build + finalize-static-export.mjs
pnpm check          # the full gate: format + lint + styles + typecheck + test + build + bundle
pnpm test           # vitest
pnpm test:e2e       # playwright
pnpm api:types      # regenerate src/lib/api/generated.ts from docs/openapi.json
pnpm deadcode       # knip
pnpm bundle:check   # bundle budget — build must run first
```

`pnpm check` is what CI runs. Prefer it before handoff; it is also the only thing that catches the
bundle budget and the static-export step.

## Things that will surprise you

- **Styling is `styled-components`** (css-in-js) — there are no `.css` files in `src/`. That is why
  `pnpm lint:styles` runs stylelint over `.ts`/`.tsx` via `stylelint.config.mjs`.
- **`src/lib/api/generated.ts` is generated**, not hand-written. Edit `docs/openapi.json` and run
  `pnpm api:types`. Hand edits get overwritten.
- **`pnpm lint` runs with `--max-warnings 0`** — a warning fails the build.
- **`basePath`/`assetPrefix` come from `NEXT_PUBLIC_BASE_PATH`** (`next.config.ts`) because the site
  is served from a GitHub Pages subpath. Never hardcode absolute `/` asset paths.
- The bundle budget (`scripts/check-bundle-budget.mjs`) and performance check
  (`scripts/check-performance.mjs`) are real gates, not advisory.

## Reference docs

`PRIRUCKA.md` is a 93 KB manual — **read the section you need, never the whole file.** The focused
docs are usually better:

| Doc                                 | Purpose                                 |
| ----------------------------------- | --------------------------------------- |
| `docs/api-contract.md`              | API shape and expectations              |
| `docs/design-decisions.md`          | Why the architecture is the way it is   |
| `docs/requirements-traceability.md` | Assignment requirement → implementation |
| `docs/local-development.md`         | Setup and dev loop                      |
| `ZADANIE.md`                        | The original assignment (Slovak)        |

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
