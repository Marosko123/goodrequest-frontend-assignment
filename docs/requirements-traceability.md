# Requirements traceability

| Requirement                                      | Planned proof                                                         |
| ------------------------------------------------ | --------------------------------------------------------------------- |
| Foundation or shelter contribution               | Selection integration tests and both E2E journeys                     |
| Conditional shelter selection                    | Schema, component and keyboard tests                                  |
| Preset or custom positive amount                 | Parser unit tests and selection integration tests                     |
| Optional first name, required surname and e-mail | Boundary schema tests and details journey                             |
| Optional valid SK/CZ phone with flag             | Phone normalization tests and SK/CZ E2E cases                         |
| Required privacy consent                         | Review schema and submission test                                     |
| Validated POST with understandable errors        | MSW component tests and submission E2E cases                          |
| Contact page                                     | Route and link tests                                                  |
| Live contribution and contributor count          | Results query states and About route test                             |
| Next.js + TypeScript                             | Strict typecheck and static production build                          |
| TanStack Query                                   | Shelters, results and mutation integration                            |
| Client state management                          | Pure reducer tests and route guards                                   |
| Form management                                  | One React Hook Form instance per flow step                            |
| Responsive and accessible UI                     | 320/375/768/1440 browser checks, axe and keyboard pass                |
| SEO                                              | Route metadata, canonical, Open Graph, sitemap and robots assertions  |
| GitHub Pages                                     | `out/index.html`, base-path asset checks and deployed HTTP smoke test |
