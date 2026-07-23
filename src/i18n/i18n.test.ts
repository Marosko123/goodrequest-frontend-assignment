import { describe, expect, it } from "vitest";

import {
  defaultLocale,
  getLocaleFromPathname,
  getLocalizedPath,
  intlLocaleByAppLocale,
  supportedLocales,
} from "./config";
import { createTranslator } from "./instance";
import { formatCurrency, formatNumber } from "./format";
import { en, sk } from "./resources";

function leafKeys(value: object, prefix = ""): string[] {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof child === "string" ? [path] : leafKeys(child as object, path);
  });
}

describe("localization contract", () => {
  it("keeps both bundled locales complete and type-compatible", () => {
    expect(supportedLocales).toEqual(["sk", "en"]);
    expect(defaultLocale).toBe("sk");
    expect(leafKeys(en)).toEqual(leafKeys(sk));
  });

  it("derives the locale from localized public and donation paths", () => {
    expect(getLocaleFromPathname("/")).toBe("sk");
    expect(getLocaleFromPathname("/details/")).toBe("sk");
    expect(getLocaleFromPathname("/en/")).toBe("en");
    expect(getLocaleFromPathname("/en/review/")).toBe("en");
  });

  it("maps the same route between Slovak and English without stacking prefixes", () => {
    expect(getLocalizedPath("en", "/details/")).toBe("/en/details/");
    expect(getLocalizedPath("sk", "/en/details/")).toBe("/details/");
    expect(getLocalizedPath("en", "/")).toBe("/en/");
    expect(getLocalizedPath("sk", "/en/")).toBe("/");
    expect(getLocalizedPath("en", "/details/?source=footer#form")).toBe(
      "/en/details/?source=footer#form",
    );
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
  });

  it("translates with the requested language and exposes matching Intl locales", () => {
    expect(createTranslator("sk")("common.continue")).toBe("Pokračovať");
    expect(createTranslator("en")("common.continue")).toBe("Continue");
    expect(intlLocaleByAppLocale).toEqual({ sk: "sk-SK", en: "en-SK" });
  });

  it("formats EUR and numbers with the active locale", () => {
    expect(formatCurrency(20.5, "sk")).toMatch(/20,50?\s€/u);
    expect(formatCurrency(20.5, "en")).toMatch(/€20\.50?/u);
    expect(formatNumber(1234.5, "sk")).toBe(
      new Intl.NumberFormat("sk-SK").format(1234.5),
    );
    expect(formatNumber(1234.5, "en")).toBe(
      new Intl.NumberFormat("en-SK").format(1234.5),
    );
  });
});
