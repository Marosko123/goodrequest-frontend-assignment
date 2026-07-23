import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

import { createTranslator } from "@/i18n/instance";

import { localizedRoute, mockReadApi, reachReview } from "./helpers";

/**
 * Every severity counts, not just serious and critical. The measured baseline is
 * zero violations on every route, so a `moderate` finding is a regression rather
 * than accepted debt and there is nothing to gain from filtering it out.
 *
 * Entry animations are awaited first: mid-fade elements legitimately fail the
 * contrast check against the background they are dissolving out of, and WCAG
 * judges the settled state.
 */
async function expectNoAxeFindings(page: Page) {
  await page.evaluate(async () => {
    const finiteAnimations = document.getAnimations().filter((animation) => {
      const iterations = animation.effect?.getTiming().iterations;
      return iterations !== Infinity;
    });

    await Promise.all(
      finiteAnimations.map((animation) =>
        animation.finished.catch(() => undefined),
      ),
    );
  });

  const results = await new AxeBuilder({ page }).analyze();
  expect(
    results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      nodes: violation.nodes.length,
    })),
  ).toEqual([]);
}

test.beforeEach(async ({ page }) => {
  await mockReadApi(page);
});

test("public and donation routes have no automated findings at any severity", async ({
  page,
}) => {
  await page.goto("/");
  await expectNoAxeFindings(page);

  await reachReview(page);
  await expectNoAxeFindings(page);

  await page.goto("/contact/");
  await expectNoAxeFindings(page);

  await page.goto("/about/");
  await expect(page.getByText("12 200 €")).toBeVisible();
  await expectNoAxeFindings(page);
});

test("the skip link is the first tab stop and moves focus into main", async ({
  page,
}) => {
  for (const locale of ["sk", "en", "cz"] as const) {
    const t = createTranslator(locale);
    await page.goto(localizedRoute(locale, "/"));

    const skipLink = page.getByRole("link", {
      name: t("common.skipToContent"),
    });
    await expect(skipLink).not.toBeInViewport();

    await page.keyboard.press("Tab");
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeInViewport();

    await page.keyboard.press("Enter");
    await expect(page.locator("main#main-content")).toBeFocused();
  }
});

test("the skip link reaches main on the content and error routes too", async ({
  page,
}) => {
  for (const path of ["/contact/", "/about/", "/this-route-does-not-exist/"]) {
    await page.goto(path);
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await expect(page.locator("main#main-content")).toBeFocused();
  }
});

test("submission feedback remains accessible while connectivity changes", async ({
  context,
  page,
}) => {
  test.setTimeout(60_000);

  let releaseSubmission: (() => void) | undefined;
  const submissionGate = new Promise<void>((resolve) => {
    releaseSubmission = resolve;
  });
  await page.route("**/api/v1/shelters/contribute", async (route) => {
    await submissionGate;
    await route.abort("timedout");
  });

  await reachReview(page);
  await page.getByRole("checkbox", { name: /súhlasím/i }).check();
  await context.setOffline(true);
  await expect(page.getByRole("status", { name: "Ste offline" })).toBeVisible();
  await expectNoAxeFindings(page);

  await context.setOffline(false);
  await expect(
    page.getByRole("status", { name: "Pripojenie je obnovené" }),
  ).toBeVisible();
  await expectNoAxeFindings(page);

  await page.getByRole("button", { name: "Skúsiť znova" }).click();
  await expect(
    page.getByRole("status", { name: "Čakáme na potvrdenie" }),
  ).toBeVisible();
  await expectNoAxeFindings(page);

  releaseSubmission?.();
  await expect(
    page.getByRole("status", {
      name: "Výsledok odoslania nepoznáme",
    }),
  ).toBeVisible();
  await expectNoAxeFindings(page);
});
