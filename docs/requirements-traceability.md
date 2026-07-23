# Requirements traceability

| Requirement                                      | Implemented proof                                                                                                                               |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Foundation or shelter contribution               | Selection integration tests and both Playwright journeys                                                                                        |
| Conditional shelter selection                    | Zod schema tests, the accessible listbox combobox and the shelter E2E journey                                                                   |
| Preset or custom positive amount                 | Parser unit tests and selection integration tests                                                                                               |
| Optional first name, required surname and e-mail | Boundary schema tests and complete details journey                                                                                              |
| Required valid SK/CZ phone with flag             | Phone normalization tests and SK/CZ component coverage                                                                                          |
| Required privacy consent                         | Unchecked review state, focus/error tests, storage isolation and exact POST body                                                                |
| Validated POST with understandable errors        | Unit and browser tests for loading, offline, manual retry, uncertain outcomes and duplicate prevention                                          |
| Contact page                                     | Content, responsive and route tests                                                                                                             |
| Live contribution and contributor count          | Query-state tests and mocked About route verification                                                                                           |
| Next.js + TypeScript                             | Strict typecheck and static production build                                                                                                    |
| TanStack Query                                   | Tested shelter, results and zero-retry submission integration                                                                                   |
| Client state management                          | Pure reducer tests and route guards                                                                                                             |
| Form management                                  | One React Hook Form instance per flow step                                                                                                      |
| Localization library for strings                 | i18next resources drive Server Component metadata and every react-i18next call site, covered by provider, switcher and per-locale browser tests |
| Responsive and accessible UI                     | 280–1440 px reflow, skip link, keyboard flows and axe without serious findings                                                                  |
| SEO                                              | Canonical, Open Graph, sitemap and robots browser assertions                                                                                    |
| Performance                                      | Median Lighthouse budgets for mobile and desktop production artifacts                                                                           |
| GitHub Pages                                     | Base-path build, artifact smoke test and deployed HTTP verification                                                                             |
