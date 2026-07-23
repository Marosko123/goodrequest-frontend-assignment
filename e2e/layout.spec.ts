import AxeBuilder from "@axe-core/playwright";
import { expect, type Locator, type Page, test } from "@playwright/test";

import {
  mockReadApi,
  reachDetails,
  reachReview,
  waitForDonationFlowHydration,
} from "./helpers";

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

async function expectOverlayInsideViewport(locator: Locator) {
  await expect(locator).toBeVisible();
  const result = await locator.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const probe = document.elementFromPoint(
      box.left + box.width / 2,
      box.bottom - 2,
    );

    return {
      insideViewport:
        box.left >= 0 &&
        box.top >= 0 &&
        box.right <= document.documentElement.clientWidth &&
        box.bottom <= window.innerHeight,
      receivesPointer:
        probe === element || (probe instanceof Node && element.contains(probe)),
    };
  });

  expect(result).toEqual({
    insideViewport: true,
    receivesPointer: true,
  });
}

async function expectOpenDropdownAccessible(page: Page, listbox: Locator) {
  await listbox.evaluate(async (element) => {
    await Promise.all(
      element
        .getAnimations({ subtree: true })
        .map((animation) => animation.finished),
    );
  });

  const axe = await new AxeBuilder({ page }).analyze();
  expect(
    axe.violations.filter((violation) =>
      ["serious", "critical"].includes(violation.impact ?? ""),
    ),
  ).toEqual([]);
}

async function expectResponsiveStepper(page: Page, width: number) {
  const progress = page.getByRole("navigation", {
    name: /(?:Priebeh príspevku|Donation progress|Průběh příspěvku)/,
  });
  const metrics = await progress
    .locator("[data-step-label]")
    .evaluateAll((labels) =>
      labels.map((label) => {
        const marker = label.parentElement?.querySelector("[data-step-marker]");
        const labelBox = label.getBoundingClientRect();
        const markerBox = marker?.getBoundingClientRect();
        const style = getComputedStyle(label);

        return {
          labelCenter: labelBox.top + labelBox.height / 2,
          markerBottom: markerBox?.bottom ?? 0,
          markerCenter: markerBox
            ? markerBox.top + markerBox.height / 2
            : Number.NaN,
          overflow: label.scrollWidth > label.clientWidth + 0.5,
          textOverflow: style.textOverflow,
          whiteSpace: style.whiteSpace,
        };
      }),
    );

  expect(metrics).toHaveLength(3);
  for (const metric of metrics) {
    expect(metric.overflow).toBe(false);
    expect(metric.textOverflow).not.toBe("ellipsis");
    if (width < 480) {
      expect(metric.whiteSpace).toBe("normal");
      expect(metric.labelCenter).toBeGreaterThan(metric.markerBottom);
    } else {
      expect(metric.whiteSpace).toBe("nowrap");
      expect(Math.abs(metric.labelCenter - metric.markerCenter)).toBeLessThan(
        1,
      );
    }
  }
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1024 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await mockReadApi(page);
});

test("mobile donation shell starts at the top and fills a tall viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 414, height: 1548 });
  await page.route("**/api/v1/shelters/contribute", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        messages: [{ message: "Príspevok prijatý", type: "SUCCESS" }],
      }),
    });
  });

  const expectTallMobileShell = async () => {
    const media = page.locator("aside");
    const contentColumn = page.locator("main").locator("..");
    const footer = page.locator("footer");
    const [mediaBox, contentColumnBox, footerBox, dimensions] =
      await Promise.all([
        media.boundingBox(),
        contentColumn.boundingBox(),
        footer.boundingBox(),
        page.evaluate(() => ({
          clientWidth: document.documentElement.clientWidth,
          scrollHeight: document.documentElement.scrollHeight,
          scrollWidth: document.documentElement.scrollWidth,
          viewportHeight: window.innerHeight,
        })),
      ]);

    expect(mediaBox).not.toBeNull();
    expect(contentColumnBox).not.toBeNull();
    expect(footerBox).not.toBeNull();
    expect(mediaBox!.y).toBe(0);
    expect(contentColumnBox!.y).toBe(mediaBox!.y + mediaBox!.height);
    expect(contentColumnBox!.y + contentColumnBox!.height).toBe(
      dimensions.viewportHeight,
    );
    expect(dimensions.viewportHeight - (footerBox!.y + footerBox!.height)).toBe(
      32,
    );
    expect(dimensions.scrollHeight).toBe(dimensions.viewportHeight);
    expect(dimensions.scrollWidth).toBe(dimensions.clientWidth);
  };

  await page.goto("/");
  await expectTallMobileShell();

  await reachDetails(page);
  await expectTallMobileShell();

  await reachReview(page);
  await expectTallMobileShell();

  await page.getByRole("checkbox", { name: /súhlasím/i }).check();
  await page.getByRole("button", { name: "Odoslať formulár" }).click();
  await page.waitForURL("**/success/");
  await expectTallMobileShell();
});

test("all assignment screens reflow at the target widths", async ({ page }) => {
  test.setTimeout(60_000);

  for (const viewport of [
    { width: 280, height: 844 },
    { width: 320, height: 568 },
    { width: 390, height: 844 },
    { width: 414, height: 1548 },
    { width: 480, height: 1024 },
    { width: 512, height: 844 },
    { width: 699, height: 1024 },
    { width: 768, height: 1024 },
    { width: 1024, height: 1024 },
    { width: 1440, height: 900 },
  ]) {
    const { height, width } = viewport;
    const viewportLabel = `${width}×${height}px`;
    await page.setViewportSize(viewport);

    await page.goto("/");
    await expectNoHorizontalOverflow(page, `selection at ${viewportLabel}`);
    await expectResponsiveStepper(page, width);
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
    await expectNoHorizontalOverflow(page, `details at ${viewportLabel}`);
    await expectResponsiveStepper(page, width);

    await reachReview(page);
    await expectNoHorizontalOverflow(page, `review at ${viewportLabel}`);
    await expectResponsiveStepper(page, width);

    for (const path of ["/contact/", "/about/"]) {
      await page.goto(path);
      await expectNoHorizontalOverflow(page, `${path} at ${viewportLabel}`);
    }
  }
});

test("long English content reflows on narrow screens and at a 200% zoom equivalent", async ({
  page,
}) => {
  for (const width of [280, 320, 390, 480, 699]) {
    await page.setViewportSize({ width, height: 1024 });
    await page.goto("/en/");
    await waitForDonationFlowHydration(page);
    await expectResponsiveStepper(page, width);
    await page
      .getByRole("radio", { name: "Contribute to a specific shelter" })
      .check();
    const shelter = page.getByRole("combobox", { name: "Shelter" });
    await expect(shelter).toBeEnabled();
    await shelter.click();
    await page
      .getByRole("option", {
        name: "Útulok a záchranná stanica pre opustené psy s veľmi dlhým názvom",
      })
      .click();
    await page.getByRole("textbox", { name: "Custom amount" }).fill("999999");
    await expectNoHorizontalOverflow(page, `English selection at ${width}px`);

    await page.getByRole("button", { name: "Continue" }).click();
    await page.waitForURL("**/en/details/");
    await expectResponsiveStepper(page, width);
    await page.getByRole("textbox", { name: "First name" }).fill("Mária-Lujza");
    await page
      .getByRole("textbox", { name: "Last name" })
      .fill("O’Connor de la Cruz-Smith");
    await page
      .getByRole("textbox", { name: "Email address" })
      .fill("a-very-long-local-part-for-layout@example-domain-name.sk");
    const phone = page.getByRole("textbox", {
      name: "Phone number",
      exact: true,
    });
    await phone.fill("901234567");
    await expect(phone).toHaveCSS("outline-style", "none");
    await expectNoHorizontalOverflow(page, `English details at ${width}px`);

    await page.getByRole("button", { name: "Continue" }).click();
    await page.waitForURL("**/en/review/");
    await expectNoHorizontalOverflow(page, `English review at ${width}px`);
    await expectResponsiveStepper(page, width);
  }
});

test("custom dropdowns stay visible and interactive on a phone viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/");
  await waitForDonationFlowHydration(page);
  await page
    .getByRole("radio", { name: "Prispieť konkrétnemu útulku" })
    .check();

  const shelter = page.getByRole("combobox", { name: "Útulok" });
  await expect(shelter).toBeEnabled();
  await shelter.click();
  const shelterListbox = page.getByRole("listbox", { name: "Útulok" });
  await expectOverlayInsideViewport(shelterListbox);
  await expectOpenDropdownAccessible(page, shelterListbox);
  await page.getByRole("option", { name: "Žilinský útulok" }).click();
  await page.getByRole("button", { name: "20 €" }).click();
  await page.getByRole("button", { name: "Pokračovať" }).click();
  await page.waitForURL("**/details/");

  const country = page.getByRole("combobox", {
    name: "Krajina telefónneho čísla",
  });
  await expect(country).toHaveCSS("background-color", "rgb(243, 244, 246)");
  await country.click();
  const countryListbox = page.getByRole("listbox", {
    name: "Krajina telefónneho čísla",
  });
  await expectOverlayInsideViewport(countryListbox);
  await expectOpenDropdownAccessible(page, countryListbox);
  await expect(page.getByRole("option", { name: "Česko +420" })).toBeVisible();
  await expectNoHorizontalOverflow(page, "open country dropdown at 320px");
});

test("Czech step names stay complete at both sides of the mobile breakpoint", async ({
  page,
}) => {
  for (const width of [390, 480, 699]) {
    await page.setViewportSize({ width, height: 1024 });
    await page.goto("/cz/");
    await expectResponsiveStepper(page, width);
    await expectNoHorizontalOverflow(page, `Czech stepper at ${width}px`);
  }
});
