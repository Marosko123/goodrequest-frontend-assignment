import { expect, test } from "@playwright/test";

test.use({ javaScriptEnabled: false });

test("static shell retains component styles without JavaScript", async ({
  page,
}) => {
  await page.goto("/");

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
