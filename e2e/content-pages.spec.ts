import { expect, test } from "@playwright/test";

import { mockReadApi } from "./helpers";

test.beforeEach(async ({ page }) => {
  await mockReadApi(page);
});

test("contact and project pages expose real content and live totals", async ({
  page,
}) => {
  await page.goto("/contact/");
  await expect(
    page.getByRole("link", { name: "hello@goodrequest.com" }),
  ).toHaveAttribute("href", "mailto:hello@goodrequest.com");
  await expect(
    page.getByRole("link", { name: "+421 911 750 750" }),
  ).toHaveAttribute("href", "tel:+421911750750");

  await page.getByRole("link", { name: "O projekte" }).click();
  await expect(page.getByText("12 200 €")).toBeVisible();
  await expect(page.getByText("1 028")).toBeVisible();
});

test("SEO routes and canonical metadata target the Pages deployment", async ({
  page,
  request,
}) => {
  await page.goto("/");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://marosko123.github.io/goodrequest-frontend-assignment/",
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /og-image\.png$/,
  );

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  expect(await sitemap.text()).toContain(
    "https://marosko123.github.io/goodrequest-frontend-assignment/contact/",
  );

  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain("Sitemap:");
});

test("core public routes reflow without horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });

  for (const path of ["/", "/contact/", "/about/"]) {
    await page.goto(path);
    const overflows = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(overflows, `${path} should not overflow at 320px`).toBe(false);
  }
});
