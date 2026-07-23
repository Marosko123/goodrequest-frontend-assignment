import type { Metadata } from "next";

import type { AppLocale } from "@/i18n/config";
import { createTranslator } from "@/i18n/instance";

export const sitePath = "/goodrequest-frontend-assignment/";
export const siteUrl = `https://marosko123.github.io${sitePath}`;

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
  const slovakPath =
    path === "" || path === "./" ? "./" : path.replace(/^en\//u, "");
  const englishPath = slovakPath === "./" ? "en/" : `en/${slovakPath}`;
  const slovakUrl = new URL(slovakPath, siteUrl).toString();
  const englishUrl = new URL(englishPath, siteUrl).toString();
  const localizedUrl = locale === "en" ? englishUrl : slovakUrl;

  return {
    title: { absolute: brandedTitle },
    description,
    alternates: {
      canonical: localizedUrl,
      languages: {
        "sk-SK": slovakUrl,
        en: englishUrl,
        "x-default": slovakUrl,
      },
    },
    openGraph: {
      title: brandedTitle,
      description,
      type: "website",
      locale: locale === "sk" ? "sk_SK" : "en_GB",
      alternateLocale: locale === "sk" ? ["en_GB"] : ["sk_SK"],
      siteName: "GoodBoy",
      url: localizedUrl,
      images: [
        {
          url: "og-image.png",
          width: 1200,
          height: 630,
          alt: t("seo.imageAlt"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: brandedTitle,
      description,
      images: ["og-image.png"],
    },
    ...(robots ? { robots } : {}),
  };
}
