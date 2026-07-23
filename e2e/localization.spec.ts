import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import {
  getLocalizedPath,
  htmlLangByAppLocale,
  supportedLocales,
  type AppLocale,
} from "@/i18n/config";
import { formatCurrency } from "@/i18n/format";
import { createTranslator } from "@/i18n/instance";
import { siteUrl } from "@/lib/site";

import {
  deployedPath,
  localizedRoute,
  mockReadApi,
  waitForDonationFlowHydration,
} from "./helpers";

const sk = createTranslator("sk");
const cz = createTranslator("cz");
const en = createTranslator("en");

/** Absolute production URL for a localized route, mirroring createPageMetadata. */
function canonicalUrl(locale: AppLocale, path = "/") {
  return new URL(getLocalizedPath(locale, path).slice(1), siteUrl).toString();
}

/** Playwright normalizes whitespace, so the non-breaking space must go. */
function displayed(value: string) {
  return value.replace(/\u00a0/gu, " ");
}

test.beforeEach(async ({ page }) => {
  await mockReadApi(page);
});

test("switches SK, CZ and EN in the same document while preserving a partial step", async ({
  page,
}) => {
  await page.goto(deployedPath("/"));
  await waitForDonationFlowHydration(page);
  await page
    .getByRole("textbox", { name: sk("selection.customAmount") })
    .fill("24.50");
  await page.evaluate(() => {
    Object.assign(window, { __localeSwitchSentinel: "same-document" });
  });

  await page.getByRole("combobox", { name: sk("language.openMenu") }).click();
  const languageListbox = page.getByRole("listbox", {
    name: sk("language.label"),
  });
  await expect(languageListbox).toHaveCSS("scrollbar-gutter", "auto");

  const selectedLanguage = page.getByRole("option", {
    name: sk("language.switchToSk"),
  });
  await expect(selectedLanguage).toHaveCSS(
    "background-color",
    "rgb(224, 231, 255)",
  );
  await expect(selectedLanguage).toHaveCSS("color", "rgb(55, 48, 163)");

  const czechLanguage = page.getByRole("option", {
    name: sk("language.switchToCz"),
  });
  expect(
    await czechLanguage.evaluate((element) => {
      const style = getComputedStyle(element);
      return style.paddingLeft === style.paddingRight;
    }),
  ).toBe(true);
  await czechLanguage.hover();
  await expect(czechLanguage).toHaveCSS(
    "background-color",
    "rgb(229, 231, 235)",
  );
  await expect(czechLanguage).toHaveCSS("color", "rgb(67, 56, 202)");
  await page.mouse.down();
  await expect(czechLanguage).toHaveCSS("background-color", "rgb(55, 48, 163)");
  await expect(czechLanguage).toHaveCSS("color", "rgb(250, 250, 250)");
  await page.mouse.up();
  await page.waitForURL(`**${deployedPath(localizedRoute("cz", "/"))}`);

  await expect(
    page.getByRole("heading", { name: cz("selection.title") }),
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: cz("selection.customAmount") }),
  ).toHaveValue("24,50");
  await expect(page.locator("html")).toHaveAttribute(
    "lang",
    htmlLangByAppLocale.cz,
  );
  expect(
    await page.evaluate(
      () =>
        (window as typeof window & { __localeSwitchSentinel?: string })
          .__localeSwitchSentinel,
    ),
  ).toBe("same-document");

  await page.getByRole("button", { name: cz("common.continue") }).click();
  await page.waitForURL(`**${deployedPath(localizedRoute("cz", "/details/"))}`);
  await page
    .getByRole("textbox", { name: cz("details.lastName") })
    .fill("Novak");
  await page
    .getByRole("textbox", { name: cz("details.email") })
    .fill("partial@example.com");

  await page.getByRole("combobox", { name: cz("language.openMenu") }).click();
  await page.getByRole("option", { name: cz("language.switchToEn") }).click();
  await page.waitForURL(`**${deployedPath(localizedRoute("en", "/details/"))}`);
  await expect(
    page.getByRole("textbox", { name: en("details.lastName") }),
  ).toHaveValue("Novak");
  await expect(
    page.getByRole("textbox", { name: en("details.email") }),
  ).toHaveValue("partial@example.com");
});

test("restores a selection and donor draft after refresh on an equivalent localized route", async ({
  page,
}) => {
  await page.goto(deployedPath(localizedRoute("en", "/")));
  await waitForDonationFlowHydration(page);
  await page.getByRole("button", { name: "50 €" }).click();
  await page.getByRole("button", { name: en("common.continue") }).click();
  await page.waitForURL(`**${deployedPath(localizedRoute("en", "/details/"))}`);
  await page
    .getByRole("textbox", { name: en("details.firstName") })
    .fill("Jane");
  await page.getByRole("textbox", { name: en("details.lastName") }).fill("Doe");
  await page
    .getByRole("textbox", { name: en("details.email") })
    .fill("jane@goodrequest.sk");
  await page
    .getByRole("textbox", { name: en("details.phoneDialCode") })
    .fill("420");
  await page
    .getByRole("textbox", { name: en("details.phone"), exact: true })
    .fill("777123456");

  await page.getByRole("combobox", { name: en("language.openMenu") }).click();
  await page.getByRole("option", { name: en("language.switchToCz") }).click();
  await page.waitForURL(`**${deployedPath(localizedRoute("cz", "/details/"))}`);

  await page.reload();

  await expect(page).toHaveURL(
    (url) => url.pathname === deployedPath(localizedRoute("cz", "/details/")),
  );
  await expect(page.locator("html")).toHaveAttribute(
    "lang",
    htmlLangByAppLocale.cz,
  );
  await expect(
    page.getByRole("textbox", { name: cz("details.firstName") }),
  ).toHaveValue("Jane");
  await expect(
    page.getByRole("textbox", { name: cz("details.lastName") }),
  ).toHaveValue("Doe");
  await expect(
    page.getByRole("textbox", { name: cz("details.email") }),
  ).toHaveValue("jane@goodrequest.sk");
  await expect(
    page.getByRole("textbox", { name: cz("details.phoneDialCode") }),
  ).toHaveValue("420");
  await expect(
    page.getByRole("textbox", { name: cz("details.phone"), exact: true }),
  ).toHaveValue("777 123 456");
  expect(
    await page.evaluate(() => localStorage.getItem("goodboy-donation-flow:v1")),
  ).toBeNull();
  expect(
    await page.evaluate(() => {
      const stored = JSON.parse(
        sessionStorage.getItem("goodboy-donation-flow:v1") ?? "{}",
      ) as { data?: Record<string, unknown> };
      return {
        consent: stored.data?.consent,
        donorDraftEmail: (stored.data?.donorDraft as { email?: string })?.email,
        donorDraftPhoneDialCode: (
          stored.data?.donorDraft as { phoneDialCode?: string }
        )?.phoneDialCode,
        selectionAmountCents: (
          stored.data?.selection as { amountCents?: number }
        )?.amountCents,
      };
    }),
  ).toEqual({
    consent: undefined,
    donorDraftEmail: "jane@goodrequest.sk",
    donorDraftPhoneDialCode: "420",
    selectionAmountCents: 5000,
  });

  await page.getByRole("button", { name: cz("common.continue") }).click();
  await page.waitForURL(`**${deployedPath(localizedRoute("cz", "/review/"))}`);
  await expect(
    page.getByRole("checkbox", { name: cz("review.consent") }),
  ).not.toBeChecked();
});

test("completes the English flow, never retains consent, and guards a success refresh", async ({
  page,
}) => {
  await page.route("**/api/v1/shelters/contribute", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        messages: [{ message: "Contribution accepted", type: "SUCCESS" }],
      }),
    });
  });

  await page.goto(deployedPath(localizedRoute("en", "/")));
  await page.getByRole("button", { name: "20 €" }).click();
  await page.getByRole("button", { name: en("common.continue") }).click();
  await page
    .getByRole("textbox", { name: en("details.firstName") })
    .fill("Jane");
  await page.getByRole("textbox", { name: en("details.lastName") }).fill("Doe");
  await page
    .getByRole("textbox", { name: en("details.email") })
    .fill("jane@goodrequest.sk");
  await page
    .getByRole("textbox", { name: en("details.phone"), exact: true })
    .fill("901234567");
  await page.getByRole("button", { name: en("common.continue") }).click();
  await page.waitForURL(`**${deployedPath(localizedRoute("en", "/review/"))}`);
  await expect(page.getByText("20 €")).toBeVisible();

  const consent = page.getByRole("checkbox", { name: en("review.consent") });
  await consent.check();
  await page.getByRole("button", { name: en("review.submit") }).click();
  await page.waitForURL(`**${deployedPath(localizedRoute("en", "/success/"))}`);
  await expect(
    page.getByRole("heading", { name: en("success.title") }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Facebook" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Instagram" })).toBeVisible();

  await page.setViewportSize({ width: 280, height: 844 });
  const expectLocalizedSuccessLayout = async (locale: AppLocale) => {
    const successHeading = page.getByRole("heading", {
      name: createTranslator(locale)("success.title"),
    });
    await expect(successHeading).toBeVisible();
    await expect(successHeading).toHaveCSS("text-wrap", "balance");
    expect(
      await page.evaluate(() => ({
        horizontalOverflow:
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
        mediaTop: document.querySelector("aside")?.getBoundingClientRect().top,
      })),
    ).toEqual({ horizontalOverflow: false, mediaTop: 0 });
  };

  await expectLocalizedSuccessLayout("en");
  await page.getByRole("combobox", { name: en("language.openMenu") }).click();
  await page.getByRole("option", { name: en("language.switchToCz") }).click();
  await page.waitForURL(`**${deployedPath(localizedRoute("cz", "/success/"))}`);
  await expectLocalizedSuccessLayout("cz");

  await page.getByRole("combobox", { name: cz("language.openMenu") }).click();
  await page.getByRole("option", { name: cz("language.switchToSk") }).click();
  await page.waitForURL(`**${deployedPath(localizedRoute("sk", "/success/"))}`);
  await expectLocalizedSuccessLayout("sk");

  await page.getByRole("combobox", { name: sk("language.openMenu") }).click();
  await page.getByRole("option", { name: sk("language.switchToEn") }).click();
  await page.waitForURL(`**${deployedPath(localizedRoute("en", "/success/"))}`);
  await expectLocalizedSuccessLayout("en");

  expect(
    await page.evaluate(() =>
      sessionStorage.getItem("goodboy-donation-flow:v1"),
    ),
  ).toBeNull();

  await page.reload();
  await expect(page).toHaveURL(
    (url) => url.pathname === deployedPath(localizedRoute("en", "/")),
  );
  await expect(
    page.getByRole("heading", { name: en("selection.title") }),
  ).toBeVisible();
});

// Every locale is a separately exported static route, so metadata, reflow and
// accessibility are verified per locale instead of only for English.
for (const locale of supportedLocales) {
  test(`serves ${locale} metadata, discovery links, 320px reflow and accessible UI`, async ({
    page,
  }) => {
    const t = createTranslator(locale);

    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(deployedPath(localizedRoute(locale, "/")));

    await expect(page).toHaveTitle(`${t("seo.homeTitle")} | GoodBoy`);
    await expect(page.locator("html")).toHaveAttribute(
      "lang",
      htmlLangByAppLocale[locale],
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      canonicalUrl(locale),
    );
    await expect(
      page.locator('link[rel="alternate"][hreflang="sk-SK"]'),
    ).toHaveAttribute("href", canonicalUrl("sk"));
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true);

    const axe = await new AxeBuilder({ page }).analyze();
    expect(
      axe.violations.filter((violation) =>
        ["serious", "critical"].includes(violation.impact ?? ""),
      ),
    ).toEqual([]);

    await page.goto(deployedPath(localizedRoute(locale, "/about/")));
    await expect(
      page.getByText(displayed(formatCurrency(12_200, locale))),
    ).toBeVisible();
  });
}

test("lists every localized route in the sitemap and hides review steps from robots", async ({
  request,
}) => {
  const sitemap = await (
    await request.get(deployedPath("/sitemap.xml"))
  ).text();
  const robots = await (await request.get(deployedPath("/robots.txt"))).text();

  for (const locale of supportedLocales) {
    expect(sitemap).toContain(canonicalUrl(locale, "/about/"));
    expect(robots).toContain(
      `Disallow: /goodrequest-frontend-assignment${localizedRoute(locale, "/review/")}`,
    );
  }
});
