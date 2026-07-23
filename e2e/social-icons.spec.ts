import { expect, test } from "@playwright/test";

import { deployedPath, mockReadApi, reachReview } from "./helpers";

test.beforeEach(async ({ page }) => {
  await mockReadApi(page);
});

test("social links stay visible across donation and content pages", async ({
  page,
}) => {
  for (const root of ["/", "/en/", "/cz/"]) {
    await page.goto(deployedPath(root));
    await expect(page.getByRole("link", { name: "Facebook" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Instagram" })).toBeVisible();
  }

  await reachReview(page);
  await expect(page.getByRole("link", { name: "Facebook" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Instagram" })).toBeVisible();

  for (const path of [
    "/contact/",
    "/about/",
    "/en/contact/",
    "/en/about/",
    "/cz/contact/",
    "/cz/about/",
  ]) {
    await page.goto(deployedPath(path));
    await expect(page.getByRole("link", { name: "Facebook" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Instagram" })).toBeVisible();
  }
});

test("social links are keyboard reachable with a visible focus ring", async ({
  page,
}) => {
  await page.goto(deployedPath("/"));

  const instagram = page.getByRole("link", { name: "Instagram" });
  await page.getByRole("link", { name: "Facebook" }).focus();
  await page.keyboard.press("Tab");

  await expect(instagram).toBeFocused();
  await expect(instagram).toHaveCSS("outline-style", "solid");
});

// WCAG 2.5.8 asks for a 44px target on a coarse pointer, and the assignment
// asks for reduced motion to be respected. Both are requirements rather than
// styling, so they are asserted; the hover choreography around them is not.
test("mobile touch targets stay large and reduced motion stays stationary", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL: baseURL ?? "http://127.0.0.1:4173",
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
    viewport: { width: 320, height: 844 },
  });
  const page = await context.newPage();
  await mockReadApi(page);
  await page.goto(deployedPath("/"));

  const facebook = page.getByRole("link", { name: "Facebook" });

  await expect(facebook).toHaveCSS("width", "44px");
  await expect(facebook).toHaveCSS("height", "44px");
  await expect(facebook).toHaveCSS("transition-duration", "0s");
  await expect(facebook).toHaveCSS("transform", "none");

  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);

  await context.close();
});
