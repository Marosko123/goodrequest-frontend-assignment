import type { Metadata } from "next";

import { supportedLocales, type AppLocale } from "@/i18n/config";
import { createTranslator } from "@/i18n/instance";

export const sitePath = "/goodrequest-frontend-assignment/";
export const siteUrl = `https://marosko123.github.io${sitePath}`;

const routePrefixByLocale: Record<AppLocale, string> = {
  sk: "",
  en: "en/",
  cz: "cz/",
};

const hrefLangByLocale: Record<AppLocale, string> = {
  sk: "sk-SK",
  en: "en",
  cz: "cs-CZ",
};

const openGraphLocaleByAppLocale: Record<AppLocale, string> = {
  sk: "sk_SK",
  en: "en_GB",
  cz: "cs_CZ",
};

const socialImagePathByLocale: Record<AppLocale, string> = {
  sk: "social/goodboy-og-sk.png",
  en: "social/goodboy-og-en.png",
  cz: "social/goodboy-og-cz.png",
};

export function getSocialImageUrl(locale: AppLocale): string {
  return new URL(socialImagePathByLocale[locale], siteUrl).toString();
}

export function createPageMetadata({
  description,
  locale,
  path,
  robots,
  title,
}: {
  description: string;
  locale: AppLocale;
  path: string;
  robots?: Metadata["robots"];
  title: string;
}): Metadata {
  const brandedTitle = `${title} | GoodBoy`;
  const t = createTranslator(locale);
  const unlocalizedPath =
    path === "" || path === "./" ? "" : path.replace(/^(?:en|cz)\//u, "");
  const urlByLocale = Object.fromEntries(
    supportedLocales.map((candidate) => [
      candidate,
      new URL(
        `${routePrefixByLocale[candidate]}${unlocalizedPath}`,
        siteUrl,
      ).toString(),
    ]),
  ) as Record<AppLocale, string>;
  const slovakUrl = urlByLocale.sk;
  const localizedUrl = urlByLocale[locale];
  const languageAlternates = Object.fromEntries(
    supportedLocales.map((candidate) => [
      hrefLangByLocale[candidate],
      urlByLocale[candidate],
    ]),
  );
  const openGraphLocale = openGraphLocaleByAppLocale[locale];
  const socialImageUrl = getSocialImageUrl(locale);

  return {
    title: { absolute: brandedTitle },
    description,
    alternates: {
      canonical: localizedUrl,
      languages: {
        ...languageAlternates,
        "x-default": slovakUrl,
      },
    },
    openGraph: {
      title: brandedTitle,
      description,
      type: "website",
      locale: openGraphLocale,
      alternateLocale: supportedLocales
        .filter((candidate) => candidate !== locale)
        .map((candidate) => openGraphLocaleByAppLocale[candidate]),
      siteName: "GoodBoy",
      url: localizedUrl,
      images: [
        {
          url: socialImageUrl,
          width: 1200,
          height: 630,
          type: "image/png",
          alt: t("seo.imageAlt"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: brandedTitle,
      description,
      images: [socialImageUrl],
    },
    ...(robots ? { robots } : {}),
  };
}
