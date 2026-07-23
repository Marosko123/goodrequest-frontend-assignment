import { expect, test } from "@playwright/test";

import {
  deployedPath,
  mockReadApi,
  reachDetails,
  reachReview,
  waitForDonationFlowHydration,
} from "./helpers";

test.beforeEach(async ({ page }) => {
  await mockReadApi(page);
});

test("amount input rejects semantic changes and remains fully visible", async ({
  page,
}) => {
  await page.goto(deployedPath("/"));
  const amount = page.getByRole("textbox", { name: "Vlastná suma" });

  await amount.fill("-151");
  await expect(amount).toHaveValue("");
  await expect(amount).toHaveAccessibleDescription(
    "Použite iba číslice a najviac jeden desatinný oddeľovač.",
  );

  await amount.fill("1 234,56 €");
  await expect(amount).toHaveValue("1234,56");
  await expect(amount).not.toHaveAttribute("aria-invalid");

  await amount.fill("1000000");
  await expect(amount).toHaveValue("1234,56");
  await expect(amount).toHaveAccessibleDescription(
    "Maximálna výška príspevku je 999 999 €.",
  );

  await page.getByRole("button", { name: "20 €" }).click();
  await expect(amount).toHaveValue("20");
  const shortMetrics = await amount.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      fontSize: Number.parseFloat(style.fontSize),
      width: element.getBoundingClientRect().width,
    };
  });
  await amount.fill("1234");
  await amount.focus();
  await amount.evaluate((element) =>
    (element as HTMLInputElement).setSelectionRange(2, 2),
  );
  await page.keyboard.type("9");
  await expect(amount).toHaveValue("12934");
  expect(
    await amount.evaluate(
      (element) => (element as HTMLInputElement).selectionStart,
    ),
  ).toBe(3);

  await amount.fill("999999,00");
  await expect(amount).toHaveValue("999999,00");
  await expect(amount).toHaveCSS("border-top-width", "0px");
  await expect(amount).toHaveCSS("border-right-width", "0px");
  await expect(amount).toHaveCSS("border-bottom-width", "2px");
  await expect(amount).toHaveCSS("outline-style", "none");
  const longMetrics = await amount.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      fontSize: Number.parseFloat(style.fontSize),
      width: element.getBoundingClientRect().width,
    };
  });
  expect(longMetrics.fontSize).toBeLessThan(shortMetrics.fontSize);
  expect(longMetrics.width).toBeGreaterThan(shortMetrics.width);

  await page.setViewportSize({ width: 280, height: 800 });
  const visibility = await amount.evaluate((element) => {
    const input = element as HTMLInputElement;
    const style = getComputedStyle(input);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) {
      return { fits: false, overflow: true };
    }
    context.font = style.font;
    const available =
      input.clientWidth -
      Number.parseFloat(style.paddingLeft) -
      Number.parseFloat(style.paddingRight);
    return {
      fits: context.measureText(input.value).width <= available,
      overflow:
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    };
  });
  expect(visibility).toEqual({ fits: true, overflow: false });
});

test("keeps the donation shell mounted while the form step changes", async ({
  page,
}) => {
  await page.goto(deployedPath("/"));
  const media = page.locator(
    'aside[aria-label="Fotografia podporovaného psa"]',
  );
  await media.evaluate((element) => {
    element.setAttribute("data-shell-sentinel", "mounted");
  });

  await page.getByRole("button", { name: "50 €" }).click();
  await page.getByRole("button", { name: "Pokračovať" }).click();
  await page.waitForURL(`**${deployedPath("/details/")}`);

  await expect(page.locator('[data-shell-sentinel="mounted"]')).toHaveCount(1);
  const progress = page.getByRole("navigation", {
    name: "Priebeh príspevku",
  });
  await expect(
    progress.getByRole("listitem").filter({ hasText: "Osobné údaje" }),
  ).toHaveAttribute("aria-current", "step");

  await page.getByRole("button", { name: "Späť" }).click();
  await page.waitForURL((url) => url.pathname === deployedPath("/"));
  await expect(page.locator('[data-shell-sentinel="mounted"]')).toHaveCount(1);
  await expect(
    progress.getByRole("listitem").filter({ hasText: "Výber útulku" }),
  ).toHaveAttribute("aria-current", "step");
});

test("completed step links support keyboard return and preserve invalidated drafts", async ({
  page,
}) => {
  await reachReview(page);
  const progress = page.getByRole("navigation", {
    name: "Priebeh príspevku",
  });
  const detailsStep = progress.getByRole("link", { name: "Osobné údaje" });
  await expect(detailsStep).toHaveAttribute("href", deployedPath("/details/"));
  await page.getByRole("combobox", { name: "Vybrať jazyk" }).focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(detailsStep).toBeFocused();
  await expect(detailsStep).toHaveCSS("outline-style", "solid");
  await page.keyboard.press("Enter");
  await page.waitForURL(`**${deployedPath("/details/")}`);

  const lastName = page.getByRole("textbox", { name: "Priezvisko" });
  await expect(lastName).toHaveValue("Nováková");
  await expect(
    page.getByRole("textbox", { name: "E-mailová adresa" }),
  ).toHaveValue("jana@example.sk");
  await lastName.fill("Hraničná-Zmena");
  await page.goBack();
  await page.waitForURL(`**${deployedPath("/details/")}`);

  await expect(lastName).toHaveValue("Hraničná-Zmena");
  await expect(
    page.getByRole("heading", { name: "Skontrolujte si zadané údaje" }),
  ).toHaveCount(0);

  await page.getByRole("button", { name: "Pokračovať" }).click();
  await page.waitForURL(`**${deployedPath("/review/")}`);
  await expect(page.getByText("Jana Hraničná-Zmena")).toBeVisible();

  const selectionStep = progress.getByRole("link", {
    name: "Výber útulku",
  });
  await expect(selectionStep).toHaveAttribute("href", deployedPath("/"));
  await selectionStep.click();
  await page.waitForURL((url) => url.pathname === deployedPath("/"));
  await expect(page.getByRole("textbox", { name: "Vlastná suma" })).toHaveValue(
    "50",
  );

  await page.getByRole("button", { name: "20 €" }).click();
  await page.getByRole("button", { name: "Pokračovať" }).click();
  await page.waitForURL(`**${deployedPath("/details/")}`);
  await expect(lastName).toHaveValue("Hraničná-Zmena");
  await expect(
    page.getByRole("textbox", { name: "E-mailová adresa" }),
  ).toHaveValue("jana@example.sk");
  await expect(
    progress.getByRole("listitem").filter({ hasText: "Osobné údaje" }),
  ).toHaveAttribute("data-status", "current");
  await expect(progress.getByRole("link", { name: "Potvrdenie" })).toHaveCount(
    0,
  );
});

test("submission progress locks step links and success finishes every step", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 700 });
  let releaseSubmission: (() => void) | undefined;
  const submissionGate = new Promise<void>((resolve) => {
    releaseSubmission = resolve;
  });
  await page.route("**/api/v1/shelters/contribute", async (route) => {
    await submissionGate;
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        messages: [{ message: "Príspevok prijatý", type: "SUCCESS" }],
      }),
    });
  });

  await reachReview(page);
  await page.getByRole("checkbox", { name: /súhlasím/i }).check();
  await page.getByRole("button", { name: "Odoslať formulár" }).click();

  const form = page.getByRole("form", { name: "Potvrdenie príspevku" });
  const progress = page.getByRole("navigation", {
    name: "Priebeh príspevku",
  });
  const submitting = page.getByRole("status", {
    name: "Čakáme na potvrdenie",
  });
  const submitButton = page.getByRole("button", { name: "Odosielame…" });
  const spinner = submitButton.locator('[data-icon="loading-spinner"]');

  await expect(form).toHaveAttribute("aria-busy", "true");
  await expect(submitting).toHaveAttribute("data-tone", "info");
  await expect(submitting.locator('[data-icon="alert-circle"]')).toBeVisible();
  await expect(submitButton).toBeDisabled();
  await expect(spinner).toBeVisible();
  await expect(spinner).toHaveCSS("width", "20px");
  await expect(spinner).toHaveCSS("height", "20px");
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    ),
  ).toBe(false);
  await expect(progress).toHaveAttribute("aria-busy", "true");
  await expect(progress.locator('li[data-status="in-progress"]')).toHaveCount(
    1,
  );
  await expect(progress.locator('[data-testid="step-progress"]')).toBeVisible();
  await expect(progress.getByRole("link")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Späť" })).toBeDisabled();

  releaseSubmission?.();
  await page.waitForURL(`**${deployedPath("/success/")}`);
  await expect(progress).not.toHaveAttribute("aria-busy");
  await expect(progress.locator('li[data-status="finished"]')).toHaveCount(3);
  await expect(progress.getByRole("link")).toHaveCount(0);
});

test("offline recovery is visible and never submits automatically", async ({
  context,
  page,
}) => {
  let submitCount = 0;
  await page.route("**/api/v1/shelters/contribute", async (route) => {
    submitCount += 1;
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        messages: [{ message: "Príspevok prijatý", type: "SUCCESS" }],
      }),
    });
  });

  await reachReview(page);
  await page.getByRole("checkbox", { name: /súhlasím/i }).check();
  await context.setOffline(true);

  const offline = page.getByRole("status", { name: "Ste offline" });
  await expect(offline).toHaveAttribute("data-tone", "warning");
  await expect(
    page.getByRole("button", { name: "Skúsiť znova" }),
  ).toBeDisabled();
  expect(submitCount).toBe(0);

  await context.setOffline(false);
  const restored = page.getByRole("status", {
    name: "Pripojenie je obnovené",
  });
  await expect(restored).toHaveAttribute("data-tone", "success");
  expect(submitCount).toBe(0);

  await page.getByRole("button", { name: "Skúsiť znova" }).click();
  await page.waitForURL(`**${deployedPath("/success/")}`);
  expect(submitCount).toBe(1);
});

test("success layout centers its celebration across desktop and mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route("**/api/v1/shelters/contribute", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        messages: [{ message: "Príspevok prijatý", type: "SUCCESS" }],
      }),
    });
  });

  await reachReview(page);
  await page.getByRole("checkbox", { name: /súhlasím/i }).check();
  await page.getByRole("button", { name: "Odoslať formulár" }).click();
  await page.waitForURL(`**${deployedPath("/success/")}`);

  const content = page.locator('[data-ui="success-content"]');
  const celebration = page.locator('[data-ui="success-celebration"]');
  const successIcon = celebration.locator('[data-icon="success-check"]');
  const paws = celebration.locator('[data-icon="paw"]');

  const successHeading = page.getByRole("heading", {
    name: "Ďakujeme za Váš príspevok",
  });
  await expect(successHeading).toBeVisible();
  await expect(successHeading).toHaveCSS("text-wrap", "balance");
  await expect(content).toBeVisible();
  await expect(celebration).toBeVisible();
  await expect(successIcon).not.toHaveCSS("animation-name", "none");
  await expect(successIcon).toHaveCSS("animation-duration", "0.8s");
  await expect(successIcon).toHaveCSS("animation-delay", "0.14s");
  await expect(successIcon.locator("path")).not.toHaveCSS(
    "animation-name",
    "none",
  );
  await expect(successIcon.locator("path")).toHaveCSS(
    "animation-duration",
    "0.8s",
  );
  await expect(successIcon.locator("path")).toHaveCSS(
    "animation-delay",
    "0.22s",
  );
  expect(
    await celebration.evaluate((element) => {
      const style = getComputedStyle(element, "::before");
      return {
        delay: style.animationDelay,
        duration: style.animationDuration,
      };
    }),
  ).toEqual({ delay: "0.14s", duration: "0.8s" });
  await expect(paws).toHaveCount(2);
  await expect(paws.nth(0)).not.toHaveCSS("animation-name", "none");
  await expect(paws.nth(1)).not.toHaveCSS("animation-name", "none");
  await expect(paws.nth(0)).toHaveCSS("animation-duration", "0.8s");
  await expect(paws.nth(1)).toHaveCSS("animation-duration", "0.8s");
  await expect(paws.nth(0)).toHaveCSS("animation-delay", "0.36s");
  await expect(paws.nth(1)).toHaveCSS("animation-delay", "0.52s");

  async function expectCenteredSuccessLayout() {
    const metrics = await content.evaluate((section) => {
      const heading = section.querySelector("h1");
      const message = section.querySelector("p");
      const media = document.querySelector("aside");
      const celebrationElement = section.querySelector<HTMLElement>(
        '[data-ui="success-celebration"]',
      );
      const action = section.querySelector<HTMLElement>(
        '[data-ui="primary-action-link"]',
      );

      if (!heading || !message || !media || !celebrationElement || !action) {
        return null;
      }

      const sectionBox = section.getBoundingClientRect();
      const headingBox = heading.getBoundingClientRect();
      const messageBox = message.getBoundingClientRect();
      const mediaBox = media.getBoundingClientRect();
      const celebrationBox = celebrationElement.getBoundingClientRect();
      const actionBox = action.getBoundingClientRect();
      const freeSpaceCenter = (messageBox.bottom + actionBox.top) / 2;

      return {
        actionWidthDifference: Math.abs(sectionBox.width - actionBox.width),
        celebrationCenterOffset: Math.abs(
          sectionBox.left +
            sectionBox.width / 2 -
            (celebrationBox.left + celebrationBox.width / 2),
        ),
        celebrationFreeSpaceOffset: Math.abs(
          freeSpaceCenter - (celebrationBox.top + celebrationBox.height / 2),
        ),
        horizontalOverflow:
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
        mediaTop: mediaBox.top,
        order:
          headingBox.top < messageBox.top &&
          messageBox.bottom < celebrationBox.top &&
          celebrationBox.bottom < actionBox.top,
        viewportWidth: window.innerWidth,
      };
    });

    expect(metrics).not.toBeNull();
    expect(metrics?.actionWidthDifference).toBeLessThanOrEqual(1);
    expect(metrics?.celebrationCenterOffset).toBeLessThanOrEqual(1);
    expect(metrics?.celebrationFreeSpaceOffset).toBeLessThanOrEqual(1);
    expect(metrics?.horizontalOverflow).toBe(false);
    expect(metrics?.order).toBe(true);
    if (metrics && metrics.viewportWidth <= 896) {
      expect(metrics.mediaTop).toBe(0);
    }
  }

  await expectCenteredSuccessLayout();

  for (const viewport of [
    { width: 280, height: 844 },
    { width: 320, height: 568 },
    { width: 390, height: 844 },
    { width: 414, height: 1548 },
    { width: 512, height: 844 },
    { width: 699, height: 1024 },
  ]) {
    await page.setViewportSize(viewport);
    await expectCenteredSuccessLayout();
  }
});

test("reduced motion keeps the complete flow settled and focus-safe", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  let releaseSubmission: (() => void) | undefined;
  const submissionGate = new Promise<void>((resolve) => {
    releaseSubmission = resolve;
  });
  await page.route("**/api/v1/shelters/contribute", async (route) => {
    await submissionGate;
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        messages: [{ message: "Príspevok prijatý", type: "SUCCESS" }],
      }),
    });
  });

  await reachReview(page);
  await expect(page.locator('[data-motion="step-enter"]')).toHaveCSS(
    "animation-name",
    "none",
  );
  await expect(page.getByRole("region", { name: "Zhrnutie" })).toHaveCSS(
    "animation-name",
    "none",
  );

  await page.getByRole("button", { name: "Odoslať formulár" }).click();
  const consent = page.getByRole("checkbox", { name: /súhlasím/i });
  await expect(consent).toBeFocused();
  await expect(
    page
      .getByRole("navigation", { name: "Priebeh príspevku" })
      .locator('li[data-status="error"]'),
  ).toHaveCount(1);
  await consent.check();
  await page.getByRole("button", { name: "Odoslať formulár" }).click();

  const loadingButton = page.getByRole("button", { name: "Odosielame…" });
  await expect(
    loadingButton.locator('[data-icon="loading-spinner"]'),
  ).toHaveCSS("animation-name", "none");
  await expect(
    page.getByRole("status", { name: "Čakáme na potvrdenie" }),
  ).toBeVisible();
  releaseSubmission?.();
  await page.waitForURL(`**${deployedPath("/success/")}`);
  await expect(page.getByRole("heading", { name: /ďakujeme/i })).toBeVisible();
  await expect(page.locator('[data-icon="success-check"]')).toHaveCSS(
    "animation-name",
    "none",
  );
  await expect(page.locator('[data-icon="success-check"] path')).toHaveCSS(
    "stroke-dashoffset",
    "0px",
  );
  await expect(page.locator('[data-icon="paw"]').first()).toHaveCSS(
    "animation-name",
    "none",
  );
  await expect(page.locator('[data-icon="paw"]').first()).toHaveCSS(
    "opacity",
    "0.65",
  );
  expect(
    await page
      .locator('[data-ui="success-celebration"]')
      .evaluate((element) => {
        const style = getComputedStyle(element, "::before");
        return {
          animationName: style.animationName,
          opacity: style.opacity,
        };
      }),
  ).toEqual({ animationName: "none", opacity: "0" });
});

test("foundation contribution is normalized and submitted once", async ({
  page,
}) => {
  let submitCount = 0;
  let submittedBody: unknown;
  await page.route("**/api/v1/shelters/contribute", async (route) => {
    submitCount += 1;
    submittedBody = route.request().postDataJSON();
    await new Promise((resolve) => setTimeout(resolve, 150));
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        messages: [{ message: "Príspevok prijatý", type: "SUCCESS" }],
      }),
    });
  });

  await reachReview(page);
  await page.getByRole("checkbox", { name: /súhlasím/i }).check();
  await page
    .getByRole("form", { name: "Potvrdenie príspevku" })
    .evaluate((form) => {
      form.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
      form.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
    });

  await page.waitForURL(`**${deployedPath("/success/")}`);
  await expect(page.getByRole("heading", { name: /ďakujeme/i })).toBeVisible();
  expect(submitCount).toBe(1);
  expect(submittedBody).toEqual({
    contributors: [
      {
        firstName: "Jana",
        lastName: "Nováková",
        email: "jana@example.sk",
        phone: "+420777123456",
      },
    ],
    value: 50,
  });

  await page.goto(deployedPath("/review/"));
  await page.waitForURL((url) => url.pathname === deployedPath("/"));
});

test("phone dial code is editable across both keyboard boundaries", async ({
  page,
}) => {
  let submittedBody: unknown;
  await page.route("**/api/v1/shelters/contribute", async (route) => {
    submittedBody = route.request().postDataJSON();
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        messages: [{ message: "Príspevok prijatý", type: "SUCCESS" }],
      }),
    });
  });

  await page.goto(deployedPath("/"));
  await waitForDonationFlowHydration(page);
  await page.getByRole("button", { name: "50 €" }).focus();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Pokračovať" }).focus();
  await page.keyboard.press("Enter");
  await page.waitForURL(`**${deployedPath("/details/")}`);

  await page.getByRole("textbox", { name: "Meno" }).focus();
  await page.keyboard.type("Jana");
  await page.keyboard.press("Tab");
  await page.keyboard.type("Nováková");
  await page.keyboard.press("Tab");
  await page.keyboard.type("jana@example.sk");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");

  const dialCode = page.getByRole("textbox", {
    name: "Predvoľba telefónneho čísla",
  });
  const phone = page.getByRole("textbox", {
    name: "Telefónne číslo",
    exact: true,
  });
  await expect(dialCode).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Shift+ArrowLeft");
  await page.keyboard.type("0");
  await expect(dialCode).toHaveValue("420");
  await expect(phone).toBeFocused();

  await page.keyboard.type("901234567");
  await expect(phone).toHaveValue("901 234 567");
  await page.keyboard.press("Home");
  await page.keyboard.press("ArrowLeft");
  await expect(dialCode).toBeFocused();
  await page.keyboard.press("Shift+ArrowLeft");
  await page.keyboard.type("1");
  await expect(dialCode).toHaveValue("421");
  await expect(phone).toBeFocused();

  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await page.waitForURL(`**${deployedPath("/review/")}`);

  await page.getByRole("checkbox", { name: /súhlasím/i }).focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");

  await page.waitForURL(`**${deployedPath("/success/")}`);
  expect(submittedBody).toEqual({
    contributors: [
      {
        firstName: "Jana",
        lastName: "Nováková",
        email: "jana@example.sk",
        phone: "+421901234567",
      },
    ],
    value: 50,
  });
});

test("an accepted contribution refreshes previously cached results", async ({
  page,
}) => {
  let contributionAccepted = false;
  let resultsRequests = 0;
  await page.route("**/api/v1/shelters/results", async (route) => {
    resultsRequests += 1;
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(
        contributionAccepted
          ? { contributors: 1_029, contribution: 12_250 }
          : { contributors: 1_028, contribution: 12_200 },
      ),
    });
  });
  await page.route("**/api/v1/shelters/contribute", async (route) => {
    contributionAccepted = true;
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        messages: [{ message: "Príspevok prijatý", type: "SUCCESS" }],
      }),
    });
  });

  await page.goto(deployedPath("/about/"));
  await expect(page.getByText("12 200 €")).toBeVisible();
  await page.getByRole("link", { name: "Späť" }).click();
  await page.waitForURL((url) => url.pathname === deployedPath("/"));

  await page.getByRole("button", { name: "50 €" }).click();
  await page.getByRole("button", { name: "Pokračovať" }).click();
  await page.getByRole("textbox", { name: "Meno" }).fill("Jana");
  await page.getByRole("textbox", { name: "Priezvisko" }).fill("Nováková");
  await page
    .getByRole("textbox", { name: "E-mailová adresa" })
    .fill("jana@example.sk");
  await page
    .getByRole("textbox", { name: "Telefónne číslo", exact: true })
    .fill("905123456");
  await page.getByRole("button", { name: "Pokračovať" }).click();
  await page.getByRole("checkbox", { name: /súhlasím/i }).check();
  await page
    .getByRole("button", { name: /odoslať (?:príspevok|formulár)/i })
    .click();

  await page.waitForURL(`**${deployedPath("/success/")}`);
  await page.getByRole("link", { name: "O projekte" }).click();
  await page.waitForURL(`**${deployedPath("/about/")}`);
  await expect(page.getByText("12 250 €")).toBeVisible();
  await expect(page.getByText("1 029")).toBeVisible();
  expect(resultsRequests).toBe(2);
});

test("shelter selection remains consistent through review", async ({
  page,
}) => {
  await page.goto(deployedPath("/"));
  await waitForDonationFlowHydration(page);
  await page
    .getByRole("radio", { name: "Prispieť konkrétnemu útulku" })
    .check();
  const shelter = page.getByRole("combobox", { name: "Útulok" });
  await expect(shelter).toBeEnabled();
  await shelter.click();
  await page.getByRole("option", { name: "Žilinský útulok" }).click();
  await page.getByRole("button", { name: "20 €" }).click();
  await page.getByRole("button", { name: "Pokračovať" }).click();
  await page.getByRole("textbox", { name: "Priezvisko" }).fill("Novák");
  await page
    .getByRole("textbox", { name: "E-mailová adresa" })
    .fill("jan@example.sk");
  await page
    .getByRole("textbox", { name: "Telefónne číslo", exact: true })
    .fill("0901 234 567");
  await page.getByRole("button", { name: "Pokračovať" }).click();

  await expect(page.getByText("Žilinský útulok")).toBeVisible();
  await expect(page.getByText("20 €")).toBeVisible();
  await expect(page.getByText("Finančný príspevok celej nadácii")).toHaveCount(
    0,
  );
});

test("validation and ambiguous network failure preserve user control", async ({
  page,
}) => {
  let submitCount = 0;
  await page.route("**/api/v1/shelters/contribute", async (route) => {
    submitCount += 1;
    if (submitCount === 1) {
      await route.abort("timedout");
      return;
    }
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        messages: [{ message: "Príspevok prijatý", type: "SUCCESS" }],
      }),
    });
  });

  await reachDetails(page);
  await page.getByRole("button", { name: "Pokračovať" }).click();
  await expect(page.getByRole("textbox", { name: "Priezvisko" })).toBeFocused();
  await expect(
    page
      .getByRole("navigation", { name: "Priebeh príspevku" })
      .locator('li[data-status="error"]'),
  ).toHaveCount(1);
  await page.getByRole("textbox", { name: "Priezvisko" }).fill("Novák");
  await page
    .getByRole("textbox", { name: "E-mailová adresa" })
    .fill("jan@example.sk");
  await page
    .getByRole("textbox", { name: "Telefónne číslo", exact: true })
    .fill("0901 234 567");
  await page.getByRole("button", { name: "Pokračovať" }).click();
  await page.getByRole("button", { name: "Odoslať formulár" }).click();
  await expect(page.getByRole("checkbox", { name: /súhlasím/i })).toBeFocused();
  await page.getByRole("checkbox", { name: /súhlasím/i }).check();
  await page.getByRole("button", { name: "Odoslať formulár" }).click();

  await expect(page.getByText(/výsledok odoslania nepoznáme/i)).toBeVisible();
  await expect(
    page
      .getByRole("navigation", { name: "Priebeh príspevku" })
      .locator('li[data-status="error"]'),
  ).toHaveCount(1);
  // Settled means the action is back to a manual retry with nothing in flight.
  const resend = page.getByRole("button", { name: "Odoslať znova" });
  await expect(resend).toBeEnabled();
  expect(submitCount).toBe(1);
  // Asserting an absence has no web-first equivalent: hold a bounded window and
  // fail if a timer dispatches a second POST behind the settled UI.
  await page.waitForTimeout(250);
  expect(submitCount).toBe(1);

  await resend.click();
  await page.waitForURL(`**${deployedPath("/success/")}`);
  expect(submitCount).toBe(2);
});
