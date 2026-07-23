import { expect, test, type Page } from "@playwright/test";

import { mockReadApi, reachDetails, settleLayout } from "./helpers";

const publicRoutes = [
  "/",
  "/en/",
  "/cz/",
  "/contact/",
  "/en/contact/",
  "/cz/contact/",
  "/about/",
  "/en/about/",
  "/cz/about/",
  "/stratena-stranka/",
  "/en/lost-page/",
  "/cz/ztracena-stranka/",
] as const;

async function openInteractionReview(page: Page) {
  await page.goto("/");
  await page.evaluate(() => {
    sessionStorage.setItem(
      "goodboy-donation-flow:v1",
      JSON.stringify({
        version: 1,
        data: {
          selection: { target: "foundation", amountCents: 5_000 },
          donor: {
            firstName: "Jana",
            lastName: "Nováková",
            email: "jana@example.sk",
            phoneCountry: "SK",
            phoneE164: "+421901234567",
          },
          selectionDraft: {
            target: "foundation",
            shelterId: null,
            amount: "50",
          },
          donorDraft: {
            firstName: "Jana",
            lastName: "Nováková",
            email: "jana@example.sk",
            phoneDialCode: "421",
            phone: "901 234 567",
            phoneCountry: "SK",
          },
        },
      }),
    );
  });
  await page.goto("/review/");
  await expect(
    page.getByRole("heading", { name: "Skontrolujte si zadané údaje" }),
  ).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await mockReadApi(page);
});

test("applies the shared media and selection policy across every locale", async ({
  page,
}) => {
  for (const path of publicRoutes) {
    await page.goto(path);

    const heading = page.locator("main h1:visible").first();
    await expect(heading).toHaveCSS("user-select", "auto");

    const navigation = page.locator("nav").first();
    await expect(navigation).toHaveCSS("user-select", "none");

    const passiveIcon = page.locator('svg[aria-hidden="true"]').first();
    await expect(passiveIcon).toHaveCSS("pointer-events", "none");
    await expect(passiveIcon).toHaveCSS("user-select", "none");

    for (const image of await page.locator("img").all()) {
      await expect(image).toHaveAttribute("draggable", "false");
      await expect(image).toHaveCSS("pointer-events", "none");
      await expect(image).toHaveCSS("user-select", "none");
      expect(
        await image.evaluate((element) =>
          getComputedStyle(element).getPropertyValue("-webkit-user-drag"),
        ),
      ).toBe("none");
    }
  }
});

test("prevents media drags and control selection while preserving content and inputs", async ({
  page,
}) => {
  await page.goto("/");

  const photo = page.locator("aside img");
  const photoBox = await photo.boundingBox();
  expect(photoBox).not.toBeNull();
  await page.evaluate(() => {
    Object.defineProperty(window, "__dragStartCount", {
      configurable: true,
      value: 0,
      writable: true,
    });
    document.addEventListener(
      "dragstart",
      () => {
        (
          window as typeof window & { __dragStartCount: number }
        ).__dragStartCount += 1;
      },
      { capture: true },
    );
  });
  await page.mouse.move(
    photoBox!.x + photoBox!.width / 2,
    photoBox!.y + photoBox!.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    photoBox!.x + photoBox!.width / 2 + 80,
    photoBox!.y + photoBox!.height / 2 + 40,
    { steps: 6 },
  );
  await page.mouse.up();
  expect(
    await page.evaluate(
      () =>
        (window as typeof window & { __dragStartCount: number })
          .__dragStartCount,
    ),
  ).toBe(0);

  const preset = page.getByRole("button", { name: "50 €" });
  await expect(preset).toHaveCSS("user-select", "none");
  await preset.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  await expect(preset).toBeFocused();
  await expect(preset).toHaveCSS("outline-style", "solid");

  const amount = page.getByRole("textbox", { name: "Vlastná suma" });
  await expect(amount).toHaveCSS("user-select", "text");
  await amount.fill("1234");
  await amount.selectText();
  expect(
    await amount.evaluate((element) => {
      const input = element as HTMLInputElement;
      return [input.selectionStart, input.selectionEnd];
    }),
  ).toEqual([0, 4]);

  await reachDetails(page);
  const flag = page.locator('img[data-country="SK"]').first();
  await expect(flag).toHaveAttribute("draggable", "false");
  await expect(flag).toHaveCSS("user-select", "none");

  await openInteractionReview(page);
  const summary = page.locator("dl").first();
  await expect(summary).toHaveCSS("user-select", "auto");
  const summaryValue = summary.locator("dd").first();
  await summaryValue.dblclick();
  expect(
    await page.evaluate(() => window.getSelection()?.toString().trim() ?? ""),
  ).not.toBe("");
  await expect(page.locator('label:has(input[type="checkbox"])')).toHaveCSS(
    "user-select",
    "none",
  );
});

test("keeps hover desktop-only and avoids sticky hover on touch", async ({
  browser,
  page,
}) => {
  await page.goto("/");
  expect(
    await page.evaluate(
      () => matchMedia("(hover: hover) and (pointer: fine)").matches,
    ),
  ).toBe(true);

  await settleLayout(page);

  const preset = page.getByRole("button", { name: "50 €" });
  const hoverBackground = await page.evaluate(() => {
    const probe = document.createElement("span");
    probe.style.backgroundColor = "var(--color-surface-hover)";
    document.body.append(probe);
    const color = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return color;
  });
  await preset.hover();
  await expect(preset).toHaveCSS("background-color", hoverBackground);

  const touchContext = await browser.newContext({
    baseURL: new URL(page.url()).origin,
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });
  const touchPage = await touchContext.newPage();
  await mockReadApi(touchPage);
  await touchPage.goto("/contact/");
  expect(
    await touchPage.evaluate(
      () => matchMedia("(hover: hover) and (pointer: fine)").matches,
    ),
  ).toBe(false);

  const copyButton = touchPage.getByRole("button", {
    name: "hello@goodrequest.com",
  });
  await expect(copyButton).toHaveCSS("text-decoration-line", "none");
  await copyButton.tap();
  await touchPage.getByRole("heading", { name: "Kontakt" }).tap();
  await expect(copyButton).toHaveCSS("text-decoration-line", "none");

  await touchContext.close();
});
