import type { Page } from "@playwright/test";

import { getLocalizedPath, type AppLocale } from "@/i18n/config";
import { createTranslator } from "@/i18n/instance";

const apiPattern = "**/api/v1/shelters/**";

/**
 * Flow helpers read the same i18next resources the application ships, so a copy
 * change can never silently break navigation. Exact wording per locale stays
 * pinned in src/i18n/i18n.test.ts, where drift is the point of the assertion.
 */
type FlowOptions = { locale?: AppLocale; amount?: string };

export function localizedRoute(locale: AppLocale, path: string) {
  return getLocalizedPath(locale, path);
}

export async function waitForDonationFlowHydration(page: Page) {
  await page.locator('[data-flow-hydrated="true"]').waitFor();
}

type Rect = { x: number; y: number; width: number; height: number };

/**
 * Read the copied-value control, its description and the copy notice in one
 * atomic pass.
 *
 * The notice clears itself 1.5s after the copy, so measuring the three boxes
 * with three separate round trips leaves a window in which the notice can
 * vanish mid-measurement. Reading them together inside the page closes it.
 */
export async function measureCopyFeedback(
  page: Page,
  contact: "email" | "phone",
): Promise<{ value: Rect; description: Rect; notice: Rect }> {
  return page.evaluate((kind) => {
    const section = document.querySelector(`[data-contact="${kind}"]`);
    const value = section?.querySelector("button");
    const description = section?.querySelector("p");
    const notice = section?.querySelector('[role="status"]');

    if (!value || !description || !notice) {
      throw new Error(`Copy feedback for ${kind} was not on screen`);
    }

    const rect = (element: Element) => {
      const { x, y, width, height } = element.getBoundingClientRect();
      return { x, y, width, height };
    };

    return {
      value: rect(value),
      description: rect(description),
      notice: rect(notice),
    };
  }, contact);
}

/**
 * Wait until nothing is still moving: images decoded and every finite animation
 * finished.
 *
 * Required before any assertion tied to a pointer position or a bounding box.
 * `hover()` aims at the coordinates a control occupies at that instant, so a
 * route entered mid `pageEnter` transition slides the target out from under the
 * cursor and the hover state never lands. Auto-retrying matchers do not rescue
 * this: the pointer stays where it was put, so the state never arrives however
 * long the matcher waits.
 *
 * Infinite animations are skipped on purpose — the logo chase never settles.
 */
export async function settleLayout(page: Page) {
  await page.waitForFunction(() =>
    [...document.images].every((image) => image.complete),
  );
  await page.evaluate(async () => {
    const finiteAnimations = document
      .getAnimations()
      .filter(
        (animation) => animation.effect?.getTiming().iterations !== Infinity,
      );

    await Promise.all(
      finiteAnimations.map((animation) =>
        animation.finished.catch(() => undefined),
      ),
    );
  });
}

export async function mockReadApi(page: Page) {
  await page.route(apiPattern, async (route) => {
    const url = new URL(route.request().url());

    if (url.pathname.endsWith("/shelters/")) {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          shelters: [
            { id: 4, name: "Žilinský útulok" },
            { id: 7, name: "Útulok Trenčín" },
            {
              id: 9,
              name: "Útulok a záchranná stanica pre opustené psy s veľmi dlhým názvom",
            },
          ],
        }),
      });
      return;
    }

    if (url.pathname.endsWith("/shelters/results")) {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ contributors: 1_028, contribution: 12_200 }),
      });
      return;
    }

    await route.fallback();
  });
}

export async function reachDetails(
  page: Page,
  { locale = "sk", amount = "50 €" }: FlowOptions = {},
) {
  const t = createTranslator(locale);

  await page.goto(localizedRoute(locale, "/"));
  await waitForDonationFlowHydration(page);
  await page.getByRole("button", { name: amount }).click();
  await page.getByRole("button", { name: t("common.continue") }).click();
  await page.waitForURL(`**${localizedRoute(locale, "/details/")}`);
}

export async function reachReview(
  page: Page,
  { locale = "sk", amount = "50 €" }: FlowOptions = {},
) {
  const t = createTranslator(locale);

  await reachDetails(page, { locale, amount });
  await page
    .getByRole("textbox", { name: t("details.firstName") })
    .fill("Jana");
  await page
    .getByRole("textbox", { name: t("details.lastName") })
    .fill("Nováková");
  await page
    .getByRole("textbox", { name: t("details.email") })
    .fill("jana@example.sk");
  await page
    .getByRole("textbox", { name: t("details.phone"), exact: true })
    .fill("+420 777 123 456");
  await page.getByRole("button", { name: t("common.continue") }).click();
  await page.waitForURL(`**${localizedRoute(locale, "/review/")}`);
}
