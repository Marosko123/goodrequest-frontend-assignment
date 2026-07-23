import type { MetadataRoute } from "next";

import { supportedLocales, type AppLocale } from "@/i18n/config";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

const prefixByLocale: Record<AppLocale, string> = {
  sk: "",
  en: "en/",
  cz: "cz/",
};

const hrefLangByLocale: Record<AppLocale, string> = {
  sk: "sk-SK",
  en: "en",
  cz: "cs-CZ",
};

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "contact/", "about/"].flatMap((path) => {
    const urlByLocale = Object.fromEntries(
      supportedLocales.map((locale) => [
        locale,
        new URL(`${prefixByLocale[locale]}${path}`, siteUrl).toString(),
      ]),
    ) as Record<AppLocale, string>;
    const shared = {
      changeFrequency: path ? ("monthly" as const) : ("weekly" as const),
      priority: path ? 0.7 : 1,
      alternates: {
        languages: {
          ...Object.fromEntries(
            supportedLocales.map((locale) => [
              hrefLangByLocale[locale],
              urlByLocale[locale],
            ]),
          ),
          "x-default": urlByLocale.sk,
        },
      },
    };

    return supportedLocales.map((locale) => ({
      ...shared,
      url: urlByLocale[locale],
    }));
  });
}
