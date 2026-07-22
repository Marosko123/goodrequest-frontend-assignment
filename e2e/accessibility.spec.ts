import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

import { mockReadApi, reachReview } from "./helpers";

async function expectNoSeriousAxeFindings(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  const blocking = results.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact ?? ""),
  );
  expect(blocking).toEqual([]);
}

test.beforeEach(async ({ page }) => {
  await mockReadApi(page);
});

test("public and donation routes have no serious automated findings", async ({
  page,
}) => {
  await page.goto("/");
  await expectNoSeriousAxeFindings(page);

  await reachReview(page);
  await expectNoSeriousAxeFindings(page);

  await page.goto("/contact/");
  await expectNoSeriousAxeFindings(page);

  await page.goto("/about/");
  await expect(page.getByText("12 200,00 €")).toBeVisible();
  await expectNoSeriousAxeFindings(page);
});
