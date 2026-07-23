import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { mockReadApi } from "./helpers";

test.beforeEach(async ({ page }) => {
  await mockReadApi(page);
});

test("switches SK and EN in the same document while preserving a partial step", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("textbox", { name: "Vlastná suma" }).fill("24.50");
  await page.evaluate(() => {
    Object.assign(window, { __localeSwitchSentinel: "same-document" });
  });

  await page.getByRole("button", { name: "Prepnúť do angličtiny" }).click();
  await page.waitForURL("**/en/");

  await expect(
    page.getByRole("heading", { name: "Choose how you would like to help" }),
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Custom amount" }),
  ).toHaveValue("24.50");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  expect(
    await page.evaluate(
      () =>
        (window as typeof window & { __localeSwitchSentinel?: string })
          .__localeSwitchSentinel,
    ),
  ).toBe("same-document");

  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForURL("**/en/details/");
  await page.getByRole("textbox", { name: "Last name" }).fill("Novak");
  await page
    .getByRole("textbox", { name: "Email address" })
    .fill("partial@example.com");

  await page.getByRole("button", { name: "Switch to Slovak" }).click();
  await page.waitForURL("**/details/");
  await expect(page.getByRole("textbox", { name: "Priezvisko" })).toHaveValue(
    "Novak",
  );
  await expect(
    page.getByRole("textbox", { name: "E-mailová adresa" }),
  ).toHaveValue("partial@example.com");
});

test("keeps personal details only in memory and guards the step after refresh", async ({
  page,
}) => {
  await page.goto("/en/");
  await page.getByRole("button", { name: "€50" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForURL("**/en/details/");
  await page.getByRole("textbox", { name: "First name" }).fill("Jane");
  await page.getByRole("textbox", { name: "Last name" }).fill("Doe");
  await page
    .getByRole("textbox", { name: "Email address" })
    .fill("jane@example.com");

  await page.reload();

  await expect(page).toHaveURL(/\/en\/$/u);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(
    page.getByRole("textbox", { name: "Custom amount" }),
  ).toHaveValue("");
  expect(
    await page.evaluate(() => localStorage.getItem("goodboy-donation-flow:v1")),
  ).toBeNull();
  expect(
    await page.evaluate(() =>
      sessionStorage.getItem("goodboy-donation-flow:v1"),
    ),
  ).toBeNull();
});

test("completes the English flow, never retains consent, and guards a success refresh", async ({
  page,
}) => {
  await page.route("**/api/v1/shelters/contribute", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        messages: [{ message: "Contribution accepted", type: "SUCCESS" }],
      }),
    });
  });

  await page.goto("/en/");
  await page.getByRole("button", { name: "€20" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("textbox", { name: "First name" }).fill("Jane");
  await page.getByRole("textbox", { name: "Last name" }).fill("Doe");
  await page
    .getByRole("textbox", { name: "Email address" })
    .fill("jane@example.com");
  await page.getByRole("textbox", { name: "Phone number" }).fill("901234567");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForURL("**/en/review/");

  const consent = page.getByRole("checkbox", {
    name: "I consent to the processing of my personal data",
  });
  await consent.check();
  await page.getByRole("button", { name: "Submit form" }).click();
  await page.waitForURL("**/en/success/");
  await expect(
    page.getByRole("heading", { name: "Thank you for your contribution" }),
  ).toBeVisible();
  expect(
    await page.evaluate(() =>
      sessionStorage.getItem("goodboy-donation-flow:v1"),
    ),
  ).toBeNull();

  await page.reload();
  await expect(page).toHaveURL(/\/en\/$/u);
  await expect(
    page.getByRole("heading", { name: "Choose how you would like to help" }),
  ).toBeVisible();
});

test("serves English metadata, discovery links, 320px reflow, and accessible UI", async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/en/");

  await expect(page).toHaveTitle("Choose how to help | GoodBoy");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://marosko123.github.io/goodrequest-frontend-assignment/en/",
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="sk-SK"]'),
  ).toHaveAttribute(
    "href",
    "https://marosko123.github.io/goodrequest-frontend-assignment/",
  );
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);

  const axe = await new AxeBuilder({ page }).analyze();
  expect(
    axe.violations.filter((violation) =>
      ["serious", "critical"].includes(violation.impact ?? ""),
    ),
  ).toEqual([]);

  const sitemap = await request.get("/sitemap.xml");
  expect(await sitemap.text()).toContain(
    "https://marosko123.github.io/goodrequest-frontend-assignment/en/about/",
  );
  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain(
    "Disallow: /goodrequest-frontend-assignment/en/review/",
  );
});
