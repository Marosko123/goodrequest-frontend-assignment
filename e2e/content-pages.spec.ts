import { expect, test, type Page } from "@playwright/test";

import {
  measureCopyFeedback,
  mockReadApi,
  reachDetails,
  reachReview,
  settleLayout,
} from "./helpers";

const deploymentUrl =
  "https://marosko123.github.io/goodrequest-frontend-assignment/";
const socialImageUrl = `${deploymentUrl}social/goodboy-og-sk.png`;

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
    "Logo GoodBoy a zlatý retriever na pláži.",
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
    page.getByRole("button", { name: "hello@goodrequest.com" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "+421 911 750 750" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "O projekte" }).click();
  await page.waitForURL("**/about/");
  await expect(page.getByText("12 200 €")).toBeVisible();
  await expect(page.getByText("1 028")).toBeVisible();
});

test("contact office address is centered on a phone viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/contact/");

  const metrics = await page
    .locator('[data-contact="office"]')
    .evaluate((section) => {
      const link = section.querySelector("a");
      if (!link) {
        throw new Error("Office address link is missing");
      }

      const sectionBox = section.getBoundingClientRect();
      const textRange = document.createRange();
      textRange.selectNodeContents(link);
      const textBox = textRange.getBoundingClientRect();

      return {
        centerDelta:
          textBox.left +
          textBox.width / 2 -
          (sectionBox.left + sectionBox.width / 2),
        textAlign: getComputedStyle(link).textAlign,
      };
    });

  expect(metrics.textAlign).toBe("center");
  expect(Math.abs(metrics.centerDelta)).toBeLessThan(1);
});

test("contact values copy with localized feedback centered above the clicked value", async ({
  page,
}) => {
  const stubClipboard = () =>
    page.evaluate(() => {
      const copied: string[] = [];
      Object.defineProperty(window, "__contactCopiedValues", {
        configurable: true,
        value: copied,
      });
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: (value: string) => {
            copied.push(value);
            return Promise.resolve();
          },
        },
      });
    });

  for (const [path, label] of [
    ["/contact/", "Skopírované do schránky"],
    ["/en/contact/", "Copied to clipboard"],
    ["/cz/contact/", "Zkopírováno do schránky"],
  ] as const) {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(path);
    await stubClipboard();
    // The assertions below compare bounding boxes, so the page has to stop
    // moving before the first one is measured.
    await settleLayout(page);
    const email = page.getByRole("button", { name: "hello@goodrequest.com" });
    await email.click();
    await expect(page.getByRole("status")).toHaveText(label);
    const { value, description, notice } = await measureCopyFeedback(
      page,
      "email",
    );

    expect(
      Math.abs(value.x + value.width / 2 - (notice.x + notice.width / 2)),
    ).toBeLessThan(1);
    expect(value.y - (notice.y + notice.height)).toBeCloseTo(8, 0);
    expect(
      notice.y - (description.y + description.height),
    ).toBeGreaterThanOrEqual(4);
    await expect
      .poll(() =>
        page.evaluate(() =>
          (
            window as typeof window & { __contactCopiedValues: string[] }
          ).__contactCopiedValues.at(-1),
        ),
      )
      .toBe("hello@goodrequest.com");
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/contact/");
  await stubClipboard();
  const phone = page.getByRole("button", { name: "+421 911 750 750" });
  await phone.click();
  await expect(page.getByRole("status")).toHaveText("Skopírované do schránky");
  const { value, description, notice } = await measureCopyFeedback(
    page,
    "phone",
  );

  expect(
    Math.abs(value.x + value.width / 2 - (notice.x + notice.width / 2)),
  ).toBeLessThan(1);
  expect(value.y - (notice.y + notice.height)).toBeCloseTo(8, 0);
  expect(
    notice.y - (description.y + description.height),
  ).toBeGreaterThanOrEqual(4);
  expect(notice.x).toBeGreaterThanOrEqual(0);
  expect(notice.x + notice.width).toBeLessThanOrEqual(390);
  await expect
    .poll(() =>
      page.evaluate(() =>
        (
          window as typeof window & { __contactCopiedValues: string[] }
        ).__contactCopiedValues.at(-1),
      ),
    )
    .toBe("+421 911 750 750");
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
    title: "Pomôžte psom a útulkom",
    description:
      "Prispejte nadácii GoodBoy alebo konkrétnemu slovenskému útulku. Jednoducho si vyberte, komu a akou sumou pomôžete.",
    path: "",
    indexable: true,
  });

  await reachDetails(page);
  await expectPageMetadata(page, {
    title: "Vaše údaje",
    description: "Doplňte údaje potrebné na odoslanie príspevku.",
    path: "details/",
    indexable: false,
  });

  await reachReview(page);
  await expectPageMetadata(page, {
    title: "Skontrolujte príspevok",
    description: "Skontrolujte údaje a odošlite svoj príspevok.",
    path: "review/",
    indexable: false,
  });

  await page.getByRole("checkbox", { name: /súhlasím/i }).check();
  await page.getByRole("button", { name: "Odoslať formulár" }).click();
  await page.waitForURL("**/success/");
  await expectPageMetadata(page, {
    title: "Ďakujeme za pomoc",
    description: "Váš príspevok sme úspešne prijali.",
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
