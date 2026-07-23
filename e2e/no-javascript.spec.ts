import { expect, test } from "@playwright/test";

import { htmlLangByAppLocale, supportedLocales } from "@/i18n/config";

import { deployedPath, isExportTarget, localizedRoute } from "./helpers";

test.use({ javaScriptEnabled: false });

test("static shell retains component styles without JavaScript", async ({
  page,
}) => {
  await page.goto(deployedPath("/"));

  const continueButton = page.getByRole("button", { name: "Pokračovať" });

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Vyberte si možnosť, ako chcete pomôcť",
    }),
  ).toBeVisible();
  await expect(continueButton).toHaveCSS(
    "background-color",
    "rgb(79, 70, 229)",
  );
  await expect(continueButton).toHaveCSS("min-height", "56px");
  await expect(page.locator("style[data-styled]")).not.toHaveCount(0);
});

test("localized static documents declare their language without JavaScript", async ({
  page,
}) => {
  test.skip(!isExportTarget, "Static document metadata is finalized on build.");

  for (const locale of supportedLocales) {
    await page.goto(deployedPath(localizedRoute(locale, "/")));
    await expect(page.locator("html")).toHaveAttribute(
      "lang",
      htmlLangByAppLocale[locale],
    );
  }
});
