import { fileURLToPath } from "node:url";

import { configDefaults, defineConfig } from "vitest/config";

const alias = {
  "@": fileURLToPath(new URL("./src", import.meta.url)),
};

const sharedExclude = [...configDefaults.exclude, ".worktrees/**", "e2e/**"];

/**
 * Opt-in fast lane: suites that assert pure logic and never touch the DOM, the
 * shared i18n instance or the MSW server. They skip the jsdom environment and
 * `vitest.setup.ts`, which together cost roughly 700ms per file.
 *
 * The list is fail-safe. Omitting a suite only leaves it in the jsdom project,
 * so a forgotten entry costs speed and never correctness.
 */
const pureLogicTests = [
  "scripts/check-performance.test.mjs",
  "scripts/finalize-static-export.test.mjs",
  "src/app/sitemap.test.ts",
  "src/components/layout/donation-progress-model.test.ts",
  "src/components/layout/donation-step.test.ts",
  "src/domain/donation.test.ts",
  "src/features/details/phone.test.ts",
  "src/features/details/schema.test.ts",
  "src/features/selection/amount.test.ts",
  "src/features/selection/schema.test.ts",
  "src/lib/site.test.ts",
  "src/lib/validation/supported-phone.test.ts",
  "src/styles/breakpoints.test.ts",
  "src/styles/contrast.test.ts",
  "src/styles/motion-system.test.ts",
  "src/styles/token-discipline.test.ts",
];

export default defineConfig({
  resolve: { alias },
  test: {
    projects: [
      {
        resolve: { alias },
        test: {
          name: "node",
          environment: "node",
          include: pureLogicTests,
          clearMocks: true,
          restoreMocks: true,
        },
      },
      {
        resolve: { alias },
        test: {
          name: "dom",
          environment: "jsdom",
          setupFiles: ["./vitest.setup.ts"],
          include: ["src/**/*.test.{ts,tsx}"],
          exclude: [...sharedExclude, ...pureLogicTests],
          clearMocks: true,
          restoreMocks: true,
        },
      },
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.d.ts", "src/test/**", "src/lib/api/generated.ts"],
    },
  },
});
