import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";
import tseslint from "typescript-eslint";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // react-hook-form returns a promise from handleSubmit by design and settles
      // it internally; upstream documents `attributes: false` for this pattern.
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
    },
  },
  {
    // Vitest asymmetric matchers (expect.stringContaining and friends) are typed
    // as `any` upstream, so these two rules only ever fire on the matcher itself.
    files: ["**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
    },
  },
  {
    // Node build scripts stay outside the TypeScript program.
    files: ["**/*.mjs"],
    extends: [tseslint.configs.disableTypeChecked],
  },
  globalIgnores([
    ".next/**",
    ".worktrees/**",
    "out/**",
    "coverage/**",
    "playwright-report/**",
  ]),
]);
