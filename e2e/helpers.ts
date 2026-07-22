import type { Page } from "@playwright/test";

const apiPattern = "**/api/v1/shelters/**";

export async function mockReadApi(page: Page) {
  await page.route(apiPattern, async (route) => {
    const url = new URL(route.request().url());

    if (url.pathname.endsWith("/shelters/")) {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          shelters: [
            { id: 4, name: "Žilinský útulok" },
            { id: 7, name: "Útulok Trenčín" },
          ],
        }),
      });
      return;
    }

    if (url.pathname.endsWith("/shelters/results")) {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ contributors: 1_028, contribution: 12_200 }),
      });
      return;
    }

    await route.fallback();
  });
}

export async function reachDetails(page: Page, amount = "50 €") {
  await page.goto("/");
  await page.getByRole("button", { name: amount }).click();
  await page.getByRole("button", { name: "Pokračovať" }).click();
  await page.waitForURL("**/details/");
}

export async function reachReview(page: Page) {
  await reachDetails(page);
  await page.getByRole("textbox", { name: "Meno" }).fill("Jana");
  await page.getByRole("textbox", { name: "Priezvisko" }).fill("Nováková");
  await page
    .getByRole("textbox", { name: "E-mailová adresa" })
    .fill("jana@example.sk");
  await page
    .getByRole("textbox", { name: "Telefónne číslo" })
    .fill("+420 777 123 456");
  await page.getByRole("button", { name: "Pokračovať" }).click();
  await page.waitForURL("**/review/");
}
