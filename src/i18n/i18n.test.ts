import { describe, expect, it } from "vitest";

import {
  defaultLocale,
  getAppLocale,
  getLocaleFromPathname,
  getLocalizedPath,
  intlLocaleByAppLocale,
  supportedLocales,
} from "./config";
import { createTranslator, getI18nInstance } from "./instance";
import { formatCurrency, formatNumber } from "./format";
import { cz, en, sk } from "./resources";

function leafKeys(value: object, prefix = ""): string[] {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof child === "string" ? [path] : leafKeys(child as object, path);
  });
}

function leafEntries(
  value: object,
  prefix = "",
): Array<[key: string, value: string]> {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof child === "string"
      ? [[path, child]]
      : leafEntries(child as object, path);
  });
}

describe("localization contract", () => {
  it("keeps every bundled locale complete and type-compatible", () => {
    expect(supportedLocales).toEqual(["sk", "en", "cz"]);
    expect(defaultLocale).toBe("sk");
    expect(leafKeys(en)).toEqual(leafKeys(sk));
    expect(leafKeys(cz)).toEqual(leafKeys(sk));
  });

  it("uses capitalized courtesy pronouns in Slovak and Czech copy", () => {
    const lowercaseCourtesyPronoun =
      /(?<!\p{L})(?:vy|vás|vám|vami|vámi|váš|vaša|vaše|vaši|vášho|vašej|vášmu|vašim|vašich|vašom|vaším|vašu|vašou|vašimi|vašeho|vaší|vašemu|vašem)(?!\p{L})/gu;
    const violations = Object.entries({ sk, cz }).flatMap(
      ([locale, resource]) =>
        leafEntries(resource).flatMap(([key, value]) =>
          (value.match(lowercaseCourtesyPronoun) ?? []).map(
            (pronoun) => `${locale}.${key}: ${pronoun}`,
          ),
        ),
    );

    expect(violations).toEqual([]);
  });

  it("derives the locale from localized public and donation paths", () => {
    expect(getLocaleFromPathname("/")).toBe("sk");
    expect(getLocaleFromPathname("/details/")).toBe("sk");
    expect(getLocaleFromPathname("/en/")).toBe("en");
    expect(getLocaleFromPathname("/en/review/")).toBe("en");
    expect(getLocaleFromPathname("/cz/")).toBe("cz");
    expect(getLocaleFromPathname("/cz/review/")).toBe("cz");
    expect(getAppLocale("cz")).toBe("cz");
    expect(getAppLocale("en-US")).toBe("sk");
    expect(getAppLocale(undefined)).toBe("sk");
  });

  it("maps the same route between all locales without stacking prefixes", () => {
    expect(getLocalizedPath("en", "/details/")).toBe("/en/details/");
    expect(getLocalizedPath("cz", "/en/details/")).toBe("/cz/details/");
    expect(getLocalizedPath("sk", "/en/details/")).toBe("/details/");
    expect(getLocalizedPath("en", "/cz/details/")).toBe("/en/details/");
    expect(getLocalizedPath("sk", "/cz/details/")).toBe("/details/");
    expect(getLocalizedPath("en", "/")).toBe("/en/");
    expect(getLocalizedPath("cz", "/")).toBe("/cz/");
    expect(getLocalizedPath("sk", "/en/")).toBe("/");
    expect(getLocalizedPath("en", "/details/?source=footer#form")).toBe(
      "/en/details/?source=footer#form",
    );
    // A statically served 404 keeps the bare pathname the router never
    // normalized, so the switcher must add the trailing slash itself.
    expect(getLocalizedPath("en", "/stratena-stranka")).toBe(
      "/en/stratena-stranka/",
    );
    expect(getLocalizedPath("sk", "/en/stratena-stranka")).toBe(
      "/stratena-stranka/",
    );
    expect(getLocalizedPath("cz", "/about")).toBe("/cz/about/");
    expect(
      getLocalizedPath(
        "en",
        "/goodrequest-frontend-assignment/",
        "/goodrequest-frontend-assignment",
      ),
    ).toBe("/en/");
    expect(
      getLocalizedPath(
        "sk",
        "/goodrequest-frontend-assignment/en/details/",
        "/goodrequest-frontend-assignment",
      ),
    ).toBe("/details/");
    expect(
      getLocaleFromPathname(
        "/goodrequest-frontend-assignment/en/review/",
        "/goodrequest-frontend-assignment",
      ),
    ).toBe("en");
    expect(
      getLocaleFromPathname(
        "/goodrequest-frontend-assignment/cz/review/",
        "/goodrequest-frontend-assignment",
      ),
    ).toBe("cz");
    expect(
      getLocalizedPath(
        "cz",
        "/goodrequest-frontend-assignment/en/details/",
        "/goodrequest-frontend-assignment",
      ),
    ).toBe("/cz/details/");
  });

  it("translates with the requested language and exposes matching Intl locales", () => {
    expect(createTranslator("sk")("common.continue")).toBe("Pokračovať");
    expect(createTranslator("en")("common.continue")).toBe("Continue");
    expect(createTranslator("cz")("common.continue")).toBe("Pokračovat");
    expect(intlLocaleByAppLocale).toEqual({
      sk: "sk-SK",
      en: "en-SK",
      cz: "cs-CZ",
    });
  });

  it("initializes one synchronously ready i18next instance per locale", () => {
    for (const locale of supportedLocales) {
      const instance = getI18nInstance(locale);

      // A pending instance would make useTranslation suspend during the
      // static export prerender, so readiness must hold on first access.
      expect(instance.isInitialized).toBe(true);
      expect(instance.resolvedLanguage).toBe(locale);
      expect(instance.hasLoadedNamespace("translation")).toBe(true);
      expect(getI18nInstance(locale)).toBe(instance);
    }

    expect(getI18nInstance("en")).not.toBe(getI18nInstance("cz"));
  });

  it("keeps every stepper state localized", () => {
    expect(sk.steps.status).toEqual({
      current: "Aktuálny krok",
      finished: "Dokončené",
      inProgress: "Spracováva sa",
      wait: "Čaká",
      error: "Chyba",
    });
    expect(en.steps.status).toEqual({
      current: "Current step",
      finished: "Completed",
      inProgress: "Processing",
      wait: "Waiting",
      error: "Error",
    });
    expect(cz.steps.status).toEqual({
      current: "Aktuální krok",
      finished: "Dokončeno",
      inProgress: "Zpracovává se",
      wait: "Čeká",
      error: "Chyba",
    });
  });

  it("keeps every submission state localized", () => {
    expect(sk.review.status).toMatchObject({
      submittingTitle: "Čakáme na potvrdenie",
      submittingMessage:
        "Príspevok odosielame. Počkajte, kým dostaneme potvrdenie.",
      restoredTitle: "Pripojenie je obnovené",
      restoredMessage:
        "Príspevok sme automaticky neodoslali. Keď budete pripravení, skúste to znova.",
    });
    expect(en.review.status).toMatchObject({
      submittingTitle: "Waiting for confirmation",
      submittingMessage:
        "We are submitting the contribution. Wait until we receive confirmation.",
      restoredTitle: "Connection restored",
      restoredMessage:
        "We did not submit the contribution automatically. Try again when you are ready.",
    });
    expect(cz.review.status).toMatchObject({
      submittingTitle: "Čekáme na potvrzení",
      submittingMessage:
        "Příspěvek odesíláme. Počkejte, dokud nedostaneme potvrzení.",
      restoredTitle: "Připojení je obnoveno",
      restoredMessage:
        "Příspěvek jsme automaticky neodeslali. Až budete připraveni, zkuste to znovu.",
    });
  });

  it("keeps the approved localized SEO copy", () => {
    expect(sk.seo).toMatchObject({
      homeTitle: "Pomôžte psom a útulkom",
      siteDescription:
        "Prispejte nadácii GoodBoy alebo konkrétnemu slovenskému útulku. Jednoducho si vyberte, komu a akou sumou pomôžete.",
      aboutTitle: "Ako GoodBoy pomáha",
      detailsTitle: "Vaše údaje",
      reviewTitle: "Skontrolujte príspevok",
      successTitle: "Ďakujeme za pomoc",
    });
    expect(en.seo).toMatchObject({
      homeTitle: "Help dogs and shelters",
      siteDescription:
        "Support the GoodBoy Foundation or a specific Slovak shelter. Choose who to help and how much to contribute.",
      aboutTitle: "How GoodBoy helps",
      detailsTitle: "Your details",
      reviewTitle: "Review your contribution",
      successTitle: "Thank you for helping",
    });
    expect(cz.seo).toMatchObject({
      homeTitle: "Pomozte psům a útulkům",
      siteDescription:
        "Přispějte nadaci GoodBoy nebo konkrétnímu slovenskému útulku. Vyberte si, komu a jakou částkou pomůžete.",
      aboutTitle: "Jak GoodBoy pomáhá",
      detailsTitle: "Osobní údaje",
      reviewTitle: "Zkontrolujte příspěvek",
      successTitle: "Děkujeme za pomoc",
    });
  });

  it("keeps the approved localized not-found copy", () => {
    expect(sk.notFound).toEqual({
      title: "Túto stopu sme nenašli.",
      description:
        "Stránka sa asi zatúlala. Vráťte sa na úvod a pokračujte po známej trase.",
      home: "Späť domov",
    });
    expect(en.notFound).toEqual({
      title: "We couldn't find this trail.",
      description:
        "This page seems to have wandered off. Head home and continue on familiar ground.",
      home: "Back home",
    });
    expect(cz.notFound).toEqual({
      title: "Tuhle stopu jsme nenašli.",
      description:
        "Stránka se asi zatoulala. Vraťte se na úvod a pokračujte po známé trase.",
      home: "Zpět domů",
    });
  });

  it("formats EUR and numbers with the active locale", () => {
    expect(formatCurrency(20.5, "sk")).toBe("20,5\u00a0€");
    expect(formatCurrency(123_323, "en")).toBe("123,323\u00a0€");
    expect(formatCurrency(20.5, "cz")).toBe("20,5\u00a0€");
    expect(formatNumber(1234.5, "sk")).toBe(
      new Intl.NumberFormat("sk-SK").format(1234.5),
    );
    expect(formatNumber(1234.5, "en")).toBe(
      new Intl.NumberFormat("en-SK").format(1234.5),
    );
    expect(formatNumber(1234.5, "cz")).toBe(
      new Intl.NumberFormat("cs-CZ").format(1234.5),
    );
  });
});
