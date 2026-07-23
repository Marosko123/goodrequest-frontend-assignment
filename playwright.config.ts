import { defineConfig, devices } from "@playwright/test";

const testPort = process.env.PLAYWRIGHT_PORT ?? "4173";
const baseURL = `http://127.0.0.1:${testPort}`;

/**
 * CI runs against the `out/` artifact that actually ships to Pages, so route
 * export, trailing slashes and asset paths are covered. Local runs default to
 * the dev server because it needs no rebuild between edits; opt in with
 * PLAYWRIGHT_TARGET=export to reproduce the CI target.
 */
const target =
  process.env.PLAYWRIGHT_TARGET ?? (process.env.CI ? "export" : "dev");
const webServerCommand =
  target === "export"
    ? "node scripts/serve-out.mjs out"
    : `pnpm exec next dev --hostname 127.0.0.1 --port ${testPort}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: webServerCommand,
    env: { PLAYWRIGHT_PORT: testPort },
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
