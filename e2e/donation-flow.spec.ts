import { expect, test } from "@playwright/test";

import { mockReadApi, reachDetails, reachReview } from "./helpers";

test.beforeEach(async ({ page }) => {
  await mockReadApi(page);
});

test("amount input rejects semantic changes and remains fully visible", async ({
  page,
}) => {
  await page.goto("/");
  const amount = page.getByRole("textbox", { name: "Vlastná suma" });

  await amount.fill("-151");
  await expect(amount).toHaveValue("");
  await expect(amount).toHaveAccessibleDescription(
    "Použite iba číslice a najviac jeden desatinný oddeľovač.",
  );

  await amount.fill("1 234,56 €");
  await expect(amount).toHaveValue("1234,56");
  await expect(amount).not.toHaveAttribute("aria-invalid");

  await amount.fill("1000000,01");
  await expect(amount).toHaveValue("1234,56");
  await expect(amount).toHaveAccessibleDescription(
    "Maximálna výška príspevku je 1 000 000 €.",
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

  await amount.fill("1000000");
  await expect(amount).toHaveValue("1000000");
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
  await page.goto("/");
  const media = page.locator(
    'aside[aria-label="Fotografia podporovaného psa"]',
  );
  await media.evaluate((element) => {
    element.setAttribute("data-shell-sentinel", "mounted");
  });

  await page.getByRole("button", { name: "50 €" }).click();
  await page.getByRole("button", { name: "Pokračovať" }).click();
  await page.waitForURL("**/details/");

  await expect(page.locator('[data-shell-sentinel="mounted"]')).toHaveCount(1);
  await expect(page.getByText("Osobné údaje").locator("..")).toHaveAttribute(
    "aria-current",
    "step",
  );

  await page.getByRole("button", { name: "Späť" }).click();
  await page.waitForURL((url) => url.pathname === "/");
  await expect(page.locator('[data-shell-sentinel="mounted"]')).toHaveCount(1);
  await expect(page.getByText("Výber útulku").locator("..")).toHaveAttribute(
    "aria-current",
    "step",
  );
});

test("editing an earlier step invalidates stale confirmation without losing its draft", async ({
  page,
}) => {
  await reachReview(page);
  await page.getByRole("button", { name: "Späť" }).click();
  await page.waitForURL("**/details/");

  const lastName = page.getByRole("textbox", { name: "Priezvisko" });
  await lastName.fill("Hraničná-Zmena");
  await page.goBack();
  await page.waitForURL("**/details/");

  await expect(lastName).toHaveValue("Hraničná-Zmena");
  await expect(
    page.getByRole("heading", { name: "Skontrolujte si zadané údaje" }),
  ).toHaveCount(0);

  await page.getByRole("button", { name: "Pokračovať" }).click();
  await page.waitForURL("**/review/");
  await expect(page.getByText("Jana Hraničná-Zmena")).toBeVisible();
});

test("reduced motion keeps the complete flow settled and focus-safe", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/api/v1/shelters/contribute", async (route) => {
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
  await consent.check();
  await page.getByRole("button", { name: "Odoslať formulár" }).click();

  await page.waitForURL("**/success/");
  await expect(page.getByRole("heading", { name: /ďakujeme/i })).toBeVisible();
  await expect(page.locator('[data-icon="success-check"] path')).toHaveCSS(
    "stroke-dashoffset",
    "0px",
  );
  await expect(page.locator('[data-icon="paw"]').first()).toHaveCSS(
    "animation-name",
    "none",
  );
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

  await page.waitForURL("**/success/");
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

  await page.goto("/review/");
  await page.waitForURL("**/");
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

  await page.goto("/about/");
  await expect(page.getByText("12 200 €")).toBeVisible();
  await page.getByRole("link", { name: "Späť" }).click();

  await page.getByRole("button", { name: "50 €" }).click();
  await page.getByRole("button", { name: "Pokračovať" }).click();
  await page.getByRole("textbox", { name: "Meno" }).fill("Jana");
  await page.getByRole("textbox", { name: "Priezvisko" }).fill("Nováková");
  await page
    .getByRole("textbox", { name: "E-mailová adresa" })
    .fill("jana@example.sk");
  await page
    .getByRole("textbox", { name: "Telefónne číslo" })
    .fill("905123456");
  await page.getByRole("button", { name: "Pokračovať" }).click();
  await page.getByRole("checkbox", { name: /súhlasím/i }).check();
  await page
    .getByRole("button", { name: /odoslať (?:príspevok|formulár)/i })
    .click();

  await page.waitForURL("**/success/");
  await page.getByRole("link", { name: "O projekte" }).click();
  await expect(page.getByText("12 250 €")).toBeVisible();
  await expect(page.getByText("1 029")).toBeVisible();
  expect(resultsRequests).toBe(2);
});

test("shelter selection remains consistent through review", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("radio", { name: "Prispieť konkrétnemu útulku" })
    .check();
  const shelter = page.getByRole("combobox", { name: "Útulok" });
  await shelter.selectOption({ label: "Žilinský útulok" });
  await page.getByRole("button", { name: "20 €" }).click();
  await page.getByRole("button", { name: "Pokračovať" }).click();
  await page.getByRole("textbox", { name: "Priezvisko" }).fill("Novák");
  await page
    .getByRole("textbox", { name: "E-mailová adresa" })
    .fill("jan@example.sk");
  await page
    .getByRole("textbox", { name: "Telefónne číslo" })
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
  await page.getByRole("textbox", { name: "Priezvisko" }).fill("Novák");
  await page
    .getByRole("textbox", { name: "E-mailová adresa" })
    .fill("jan@example.sk");
  await page
    .getByRole("textbox", { name: "Telefónne číslo" })
    .fill("0901 234 567");
  await page.getByRole("button", { name: "Pokračovať" }).click();
  await page.getByRole("button", { name: "Odoslať formulár" }).click();
  await expect(page.getByRole("checkbox", { name: /súhlasím/i })).toBeFocused();
  await page.getByRole("checkbox", { name: /súhlasím/i }).check();
  await page.getByRole("button", { name: "Odoslať formulár" }).click();

  await expect(page.getByText(/výsledok odoslania nepoznáme/i)).toBeVisible();
  expect(submitCount).toBe(1);
  await page.waitForTimeout(250);
  expect(submitCount).toBe(1);

  await page.getByRole("button", { name: "Odoslať znova" }).click();
  await page.waitForURL("**/success/");
  expect(submitCount).toBe(2);
});
