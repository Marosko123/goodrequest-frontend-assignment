import type { MetadataRoute } from "next";

import { supportedLocales } from "@/i18n/config";
import { sitePath, siteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: sitePath,
      disallow: supportedLocales.flatMap((locale) => {
        const prefix = locale === "sk" ? "" : `${locale}/`;
        return ["details/", "review/", "success/"].map(
          (path) => `${sitePath}${prefix}${path}`,
        );
      }),
    },
    sitemap: new URL("sitemap.xml", siteUrl).toString(),
  };
}
