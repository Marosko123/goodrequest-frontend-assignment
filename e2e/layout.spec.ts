import { expect, type Locator, type Page, test } from "@playwright/test";

import { mockReadApi, reachDetails, reachReview } from "./helpers";

type ExpectedBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

async function expectBox(locator: Locator, expected: Partial<ExpectedBox>) {
  await expect(locator).toBeVisible();
  expect(await locator.boundingBox()).toEqual(
    expect.objectContaining(expected),
  );
}

async function expectDonationShell(page: Page) {
  await expectBox(page.getByRole("navigation", { name: "Priebeh príspevku" }), {
    x: 80,
    y: 60,
    width: 658,
    height: 32,
  });
  await expectBox(page.locator("main"), {
    x: 80,
    y: 132,
    width: 658,
  });
  await expectBox(page.locator("aside"), {
    x: 818,
    y: 20,
    width: 602,
    height: 984,
  });
  await expectBox(page.locator("footer"), {
    x: 80,
    y: 908,
    width: 658,
    height: 56,
  });
  await page.mouse.move(0, 0);
}

async function expectPublicShell(page: Page) {
  await expectBox(page.locator("main"), {
    x: 80,
    y: 104,
    width: 1280,
    height: 804,
  });
  await expectBox(page.locator("footer"), {
    x: 80,
    y: 908,
    width: 1280,
    height: 56,
  });
  await page.mouse.move(0, 0);
}

async function expectNoHorizontalOverflow(page: Page, label: string) {
  const routeTransition = page.locator('[data-motion="step-enter"]').last();
  if (await routeTransition.count()) {
    await routeTransition.evaluate(async (element) => {
      await Promise.all(
        element.getAnimations().map((animation) => animation.finished),
      );
    });
  }

  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    overflowers: Array.from(document.querySelectorAll("body *"))
      .map((element) => {
        const box = element.getBoundingClientRect();
        return {
          className: String(element.className),
          clientWidth: element.clientWidth,
          left: box.left,
          right: box.right,
          scrollWidth: element.scrollWidth,
          tagName: element.tagName,
        };
      })
      .filter(
        (element) =>
          element.right > document.documentElement.clientWidth + 0.5 ||
          element.left < -0.5 ||
          element.scrollWidth > element.clientWidth + 0.5,
      )
      .slice(0, 12),
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(
    dimensions.scrollWidth,
    `${label} must not overflow: ${JSON.stringify(dimensions.overflowers)}`,
  ).toBeLessThanOrEqual(dimensions.clientWidth);
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1024 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await mockReadApi(page);
});

test("selection and details keep the shared Figma shell", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "50 €" }).click();
  await expectDonationShell(page);

  await page.getByRole("button", { name: "20 €" }).click();
  await page.getByRole("button", { name: "Pokračovať" }).click();
  await page.waitForURL("**/details/");
  await expectDonationShell(page);
});

test("review and success keep the shared Figma shell", async ({ page }) => {
  await page.route("**/api/v1/shelters/contribute", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        messages: [{ message: "Príspevok prijatý", type: "SUCCESS" }],
      }),
    });
  });
  await reachReview(page);
  await expectDonationShell(page);

  await page.getByRole("checkbox", { name: /súhlasím/i }).check();
  await page.getByRole("button", { name: "Odoslať formulár" }).click();
  await page.waitForURL("**/success/");
  await expectDonationShell(page);
});

test("contact and about use the exact public-page geometry", async ({
  page,
}) => {
  await page.goto("/contact/");
  await expectPublicShell(page);
  await expectBox(page.locator("article > div"), {
    x: 160,
    y: 228,
    width: 1120,
    height: 224,
  });
  await expectBox(page.locator("main img"), {
    x: 160,
    y: 492,
    width: 1120,
    height: 376,
  });

  await page.goto("/about/");
  await expect(page.getByText("12 200 €")).toBeVisible();
  await expectPublicShell(page);
  await expectBox(page.locator("article"), {
    x: 80,
    y: 104,
    width: 1280,
    height: 656,
  });
  await expectBox(page.getByRole("region", { name: "Aktuálne výsledky" }), {
    x: 80,
    y: 340,
    width: 1280,
    height: 236,
  });
});

test("all assignment screens reflow at the target widths", async ({ page }) => {
  test.setTimeout(60_000);

  for (const width of [280, 320, 375, 390, 720, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1024 });

    await page.goto("/");
    await expectNoHorizontalOverflow(page, `selection at ${width}px`);
    if (width === 320) {
      const back = await page
        .getByRole("button", { name: "Späť" })
        .boundingBox();
      const next = await page
        .getByRole("button", { name: "Pokračovať" })
        .boundingBox();
      expect(back?.y).toBeLessThan(next?.y ?? 0);
    }

    await reachDetails(page);
    await expectNoHorizontalOverflow(page, `details at ${width}px`);

    await reachReview(page);
    await expectNoHorizontalOverflow(page, `review at ${width}px`);

    for (const path of ["/contact/", "/about/"]) {
      await page.goto(path);
      await expectNoHorizontalOverflow(page, `${path} at ${width}px`);
    }
  }
});

test("long English content reflows on narrow screens and at a 200% zoom equivalent", async ({
  page,
}) => {
  for (const width of [280, 320, 720]) {
    await page.setViewportSize({ width, height: 1024 });
    await page.goto("/en/");
    await page
      .getByRole("radio", { name: "Contribute to a specific shelter" })
      .check();
    await page.getByRole("combobox", { name: "Shelter" }).selectOption("9");
    await page.getByRole("textbox", { name: "Custom amount" }).fill("1000000");
    await expectNoHorizontalOverflow(page, `English selection at ${width}px`);

    await page.getByRole("button", { name: "Continue" }).click();
    await page.waitForURL("**/en/details/");
    await page.getByRole("textbox", { name: "First name" }).fill("Mária-Lujza");
    await page
      .getByRole("textbox", { name: "Last name" })
      .fill("O’Connor de la Cruz-Smith");
    await page
      .getByRole("textbox", { name: "Email address" })
      .fill("a-very-long-local-part-for-layout@example-domain-name.sk");
    const phone = page.getByRole("textbox", { name: "Phone number" });
    await phone.fill("901234567");
    await expect(phone).toHaveCSS("outline-style", "none");
    await expectNoHorizontalOverflow(page, `English details at ${width}px`);

    await page.getByRole("button", { name: "Continue" }).click();
    await page.waitForURL("**/en/review/");
    await expectNoHorizontalOverflow(page, `English review at ${width}px`);
  }
});
