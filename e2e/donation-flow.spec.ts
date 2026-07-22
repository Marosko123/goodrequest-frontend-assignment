import { expect, test } from "@playwright/test";

import { mockReadApi, reachDetails, reachReview } from "./helpers";

test.beforeEach(async ({ page }) => {
  await mockReadApi(page);
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
  await page.getByRole("button", { name: "Pokračovať" }).click();

  await expect(page.getByText("Žilinský útulok")).toBeVisible();
  await expect(page.getByText("20,00 €")).toBeVisible();
  await expect(page.getByText("Celá nadácia GoodBoy")).toHaveCount(0);
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
  await page.getByRole("button", { name: "Pokračovať" }).click();
  await page.getByRole("button", { name: "Odoslať príspevok" }).click();
  await expect(page.getByRole("checkbox", { name: /súhlasím/i })).toBeFocused();
  await page.getByRole("checkbox", { name: /súhlasím/i }).check();
  await page.getByRole("button", { name: "Odoslať príspevok" }).click();

  await expect(page.getByText(/výsledok odoslania nepoznáme/i)).toBeVisible();
  expect(submitCount).toBe(1);
  await page.waitForTimeout(250);
  expect(submitCount).toBe(1);

  await page.getByRole("button", { name: "Skúsiť znova" }).click();
  await page.waitForURL("**/success/");
  expect(submitCount).toBe(2);
});
