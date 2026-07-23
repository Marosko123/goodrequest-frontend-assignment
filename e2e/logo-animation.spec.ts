import { expect, test } from "@playwright/test";

import { mockReadApi } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1024 });
  await mockReadApi(page);
});

test("logo chase cycle stays decorative, stable and motion-safe", async ({
  page,
}) => {
  await page.goto("/about/");

  const logo = page.locator("footer svg");
  const dog = logo.locator('[data-logo-part="dog"]');
  const ball = logo.locator('[data-logo-part="ball"]');
  const wordmark = logo.locator('[data-logo-part="wordmark"]');

  await expect(logo).toBeVisible();
  const restingBox = await logo.boundingBox();

  await expect(dog).toHaveCSS("animation-delay", "3s");
  await expect(dog).toHaveCSS("animation-duration", "9s");
  await expect(dog).toHaveCSS("transform", "none");
  await expect(ball).toHaveCSS("opacity", "0");
  await expect(wordmark).toHaveCSS("transform", "none");

  await logo.evaluate((element) => {
    const animations = element.getAnimations({ subtree: true });
    if (animations.length !== 3) {
      throw new Error(
        `Expected three logo animations, got ${animations.length}`,
      );
    }

    for (const animation of animations) {
      animation.pause();
      animation.currentTime = 4_800;
    }
  });

  await expect(dog).not.toHaveCSS("transform", "none");
  await expect(ball).toHaveCSS("opacity", "1");
  await expect(wordmark).not.toHaveCSS("transform", "none");

  const chaseState = await logo.evaluate((element) => {
    const dogTransform = getComputedStyle(
      element.querySelector('[data-logo-part="dog"]')!,
    ).transform;
    const ballTransform = getComputedStyle(
      element.querySelector('[data-logo-part="ball"]')!,
    ).transform;
    const wordmarkTransform = getComputedStyle(
      element.querySelector('[data-logo-part="wordmark"]')!,
    ).transform;

    return {
      ballX: new DOMMatrix(ballTransform).e,
      dogScaleX: new DOMMatrix(dogTransform).a,
      wordmarkX: new DOMMatrix(wordmarkTransform).e,
    };
  });

  expect(chaseState.ballX).toBeGreaterThan(20);
  expect(chaseState.dogScaleX).toBeLessThan(0);
  expect(chaseState.wordmarkX).toBe(18);
  expect(await logo.boundingBox()).toEqual(restingBox);

  await logo.evaluate((element) => {
    for (const animation of element.getAnimations({ subtree: true })) {
      animation.currentTime = 6_000;
    }
  });

  await expect(dog).toHaveCSS("transform", "none");
  await expect(ball).toHaveCSS("opacity", "0");
  await expect(wordmark).toHaveCSS("transform", "none");
  expect(await logo.boundingBox()).toEqual(restingBox);

  await page.setViewportSize({ width: 320, height: 800 });
  await logo.evaluate((element) => {
    for (const animation of element.getAnimations({ subtree: true })) {
      animation.currentTime = 4_800;
    }
  });
  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.clientWidth);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expect(dog).toHaveCSS("animation-name", "none");
  await expect(dog).toHaveCSS("transform", "none");
  await expect(ball).toHaveCSS("animation-name", "none");
  await expect(ball).toHaveCSS("opacity", "0");
  await expect(wordmark).toHaveCSS("animation-name", "none");
  await expect(wordmark).toHaveCSS("transform", "none");
});
