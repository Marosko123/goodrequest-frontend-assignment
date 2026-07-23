import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "contact/", "about/"].flatMap((path) => {
    const slovakUrl = new URL(path, siteUrl).toString();
    const englishUrl = new URL(`en/${path}`, siteUrl).toString();
    const shared = {
      changeFrequency: path ? ("monthly" as const) : ("weekly" as const),
      priority: path ? 0.7 : 1,
      alternates: {
        languages: {
          "sk-SK": slovakUrl,
          en: englishUrl,
          "x-default": slovakUrl,
        },
      },
    };

    return [
      { ...shared, url: slovakUrl },
      { ...shared, url: englishUrl },
    ];
  });
}
