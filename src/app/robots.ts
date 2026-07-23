import type { MetadataRoute } from "next";

import { sitePath, siteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: sitePath,
      disallow: [
        `${sitePath}details/`,
        `${sitePath}review/`,
        `${sitePath}success/`,
        `${sitePath}en/details/`,
        `${sitePath}en/review/`,
        `${sitePath}en/success/`,
      ],
    },
    sitemap: new URL("sitemap.xml", siteUrl).toString(),
  };
}
