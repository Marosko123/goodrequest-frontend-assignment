import { expect, test, type Page } from "@playwright/test";

import { mockReadApi, reachDetails, reachReview } from "./helpers";

const deploymentUrl =
  "https://marosko123.github.io/goodrequest-frontend-assignment/";
const socialImageUrl = `${deploymentUrl}og-image.png`;

async function expectPageMetadata(
  page: Page,
  {
    description,
    indexable,
    path,
    title,
  }: {
    description: string;
    indexable: boolean;
    path: string;
    title: string;
  },
) {
  const fullTitle = `${title} | GoodBoy`;

  await expect(page).toHaveTitle(fullTitle);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    description,
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    `${deploymentUrl}${path}`,
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    fullTitle,
  );
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
    "content",
    description,
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    socialImageUrl,
  );
  await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute(
    "content",
    "GoodBoy – pomoc psom a útulkom",
  );
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute(
    "content",
    fullTitle,
  );
  await expect(
    page.locator('meta[name="twitter:description"]'),
  ).toHaveAttribute("content", description);
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
    "content",
    socialImageUrl,
  );

  const robots = page.locator('meta[name="robots"]');
  if (indexable) {
    await expect(robots).toHaveCount(0);
  } else {
    await expect(robots).toHaveAttribute("content", "noindex, nofollow");
  }
}

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

test("form steps expose distinct and consistent social metadata", async ({
  page,
}) => {
  await page.route("**/api/v1/shelters/contribute", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        messages: [{ message: "Príspevok prijatý", type: "SUCCESS" }],
      }),
    });
  });
  await page.goto("/");
  await expectPageMetadata(page, {
    title: "Vyberte formu pomoci",
    description:
      "Podporte celú nadáciu GoodBoy alebo vybraný slovenský útulok.",
    path: "",
    indexable: true,
  });

  await reachDetails(page);
  await expectPageMetadata(page, {
    title: "Osobné údaje",
    description: "Doplňte údaje potrebné na odoslanie príspevku.",
    path: "details/",
    indexable: false,
  });

  await reachReview(page);
  await expectPageMetadata(page, {
    title: "Potvrdenie príspevku",
    description: "Skontrolujte údaje a odošlite svoj príspevok.",
    path: "review/",
    indexable: false,
  });

  await page.getByRole("checkbox", { name: /súhlasím/i }).check();
  await page.getByRole("button", { name: "Odoslať formulár" }).click();
  await page.waitForURL("**/success/");
  await expectPageMetadata(page, {
    title: "Ďakujeme",
    description: "Príspevok bol úspešne prijatý.",
    path: "success/",
    indexable: false,
  });
});

test("SEO discovery files target the Pages deployment", async ({ request }) => {
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
