import { expect, test } from "@playwright/test";

const locales = [
  {
    path: "/stratena-stranka/",
    lang: "sk",
    title: "Túto stopu sme nenašli.",
    description:
      "Stránka sa asi zatúlala. Vráťte sa na úvod a pokračujte po známej trase.",
    home: "Späť domov",
    homeHref: "/",
  },
  {
    path: "/en/lost-page/",
    lang: "en",
    title: "We couldn't find this trail.",
    description:
      "This page seems to have wandered off. Head home and continue on familiar ground.",
    home: "Back home",
    homeHref: "/en/",
  },
  {
    path: "/cz/ztracena-stranka/",
    lang: "cs",
    title: "Tuhle stopu jsme nenašli.",
    description:
      "Stránka se asi zatoulala. Vraťte se na úvod a pokračujte po známé trase.",
    home: "Zpět domů",
    homeHref: "/cz/",
  },
] as const;

test.describe("custom not-found page", () => {
  for (const locale of locales) {
    test(`renders the ${locale.lang} 404 with a localized route home`, async ({
      page,
    }) => {
      const response = await page.goto(locale.path);

      expect(response?.status()).toBe(404);
      await expect(page.locator("html")).toHaveAttribute("lang", locale.lang);
      await expect(
        page.getByRole("heading", { name: locale.title }),
      ).toBeVisible();
      await expect(page.getByText(locale.description)).toBeVisible();
      await expect(
        page.locator(
          `header a[data-locale="${locale.lang === "cs" ? "cz" : locale.lang}"]`,
        ),
      ).toHaveAttribute("href", locale.homeHref);
      await expect(
        page.getByRole("link", { name: locale.home }),
      ).toHaveAttribute("href", locale.homeHref);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        "content",
        /noindex/u,
      );
      await expect(page.locator('main img[alt=""]')).toBeVisible();
      await expect(page.locator('main img[alt=""]')).toHaveAttribute(
        "draggable",
        "false",
      );
      await expect(page.getByRole("link", { name: "Facebook" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Instagram" })).toBeVisible();
      expect(
        await page.evaluate(
          () =>
            document
              .getAnimations()
              .filter(
                (animation) =>
                  animation.effect?.getTiming().iterations === Infinity,
              ).length,
        ),
      ).toBe(2);
    });
  }

  test("stays centered and overflow-free at the supported widths", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });

    for (const width of [280, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: width < 768 ? 844 : 1024 });
      await page.goto("/stratena-stranka/");

      const layout = await page.evaluate(() => {
        const image = document
          .querySelector("main img")
          ?.getBoundingClientRect();
        const main = document.querySelector("main")?.getBoundingClientRect();

        return {
          imageBottom: image?.bottom ?? Number.POSITIVE_INFINITY,
          imageLeft: image?.left ?? -1,
          imageRight: image?.right ?? Number.POSITIVE_INFINITY,
          mainCenter: main ? main.left + main.width / 2 : -1,
          pageCenter: document.documentElement.clientWidth / 2,
          scrollWidth: document.documentElement.scrollWidth,
          viewportWidth: document.documentElement.clientWidth,
        };
      });

      expect(layout.scrollWidth).toBeLessThanOrEqual(layout.viewportWidth);
      expect(layout.imageLeft).toBeGreaterThanOrEqual(0);
      expect(layout.imageRight).toBeLessThanOrEqual(layout.viewportWidth);
      expect(Math.abs(layout.mainCenter - layout.pageCenter)).toBeLessThan(1);
      expect(Number.isFinite(layout.imageBottom)).toBe(true);
    }
  });

  test("switches the missing route without showing the wrong locale", async ({
    page,
  }) => {
    await page.goto("/stratena-stranka/");
    await page.getByRole("combobox", { name: "Vybrať jazyk" }).click();
    await page.getByRole("option", { name: "Prepnúť do angličtiny" }).click();

    // The switcher emits a trailing slash, but the App Router drops it on a
    // route it cannot match against the route tree. Pages serves 404.html for
    // either form, so the locale below is the contract, not the exact spelling.
    await expect(page).toHaveURL(/\/en\/stratena-stranka\/?$/u);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(
      page.getByRole("heading", {
        name: "We couldn't find this trail.",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Túto stopu sme nenašli.",
      }),
    ).toBeHidden();
  });
});
