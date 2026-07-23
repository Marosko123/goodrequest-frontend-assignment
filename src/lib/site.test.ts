import { describe, expect, it } from "vitest";

import { createPageMetadata } from "./site";

describe("createPageMetadata", () => {
  it("keeps page metadata consistent across HTML, Open Graph and Twitter", () => {
    const metadata = createPageMetadata({
      locale: "sk",
      title: "Osobné údaje",
      description: "Doplňte údaje potrebné na odoslanie príspevku.",
      path: "details/",
      robots: { index: false, follow: false },
    });

    expect(metadata).toMatchObject({
      title: { absolute: "Osobné údaje | GoodBoy" },
      description: "Doplňte údaje potrebné na odoslanie príspevku.",
      alternates: {
        canonical:
          "https://marosko123.github.io/goodrequest-frontend-assignment/details/",
        languages: {
          "sk-SK":
            "https://marosko123.github.io/goodrequest-frontend-assignment/details/",
          en: "https://marosko123.github.io/goodrequest-frontend-assignment/en/details/",
          "x-default":
            "https://marosko123.github.io/goodrequest-frontend-assignment/details/",
        },
      },
      robots: { index: false, follow: false },
      openGraph: {
        title: "Osobné údaje | GoodBoy",
        description: "Doplňte údaje potrebné na odoslanie príspevku.",
        url: "https://marosko123.github.io/goodrequest-frontend-assignment/details/",
        images: [
          {
            url: "https://marosko123.github.io/goodrequest-frontend-assignment/social/goodboy-og-sk.png",
            width: 1200,
            height: 630,
            type: "image/png",
            alt: "Logo GoodBoy a zlatý retriever na pláži.",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: "Osobné údaje | GoodBoy",
        description: "Doplňte údaje potrebné na odoslanie príspevku.",
        images: [
          "https://marosko123.github.io/goodrequest-frontend-assignment/social/goodboy-og-sk.png",
        ],
      },
    });
  });

  it("builds English canonical, hreflang and social metadata", () => {
    const metadata = createPageMetadata({
      locale: "en",
      title: "Personal details",
      description: "Enter the details required to submit your contribution.",
      path: "details/",
    });

    expect(metadata).toMatchObject({
      title: { absolute: "Personal details | GoodBoy" },
      alternates: {
        canonical:
          "https://marosko123.github.io/goodrequest-frontend-assignment/en/details/",
        languages: {
          "sk-SK":
            "https://marosko123.github.io/goodrequest-frontend-assignment/details/",
          en: "https://marosko123.github.io/goodrequest-frontend-assignment/en/details/",
          "x-default":
            "https://marosko123.github.io/goodrequest-frontend-assignment/details/",
        },
      },
      openGraph: {
        locale: "en_GB",
        url: "https://marosko123.github.io/goodrequest-frontend-assignment/en/details/",
        images: [
          {
            url: "https://marosko123.github.io/goodrequest-frontend-assignment/social/goodboy-og-en.png",
            width: 1200,
            height: 630,
            type: "image/png",
            alt: "GoodBoy logo and a golden retriever on a beach.",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        images: [
          "https://marosko123.github.io/goodrequest-frontend-assignment/social/goodboy-og-en.png",
        ],
      },
    });
  });

  it("builds Czech canonical, hreflang and social metadata", () => {
    const metadata = createPageMetadata({
      locale: "cz",
      title: "Osobní údaje",
      description: "Doplňte údaje potřebné k odeslání příspěvku.",
      path: "details/",
    });

    expect(metadata).toMatchObject({
      title: { absolute: "Osobní údaje | GoodBoy" },
      alternates: {
        canonical:
          "https://marosko123.github.io/goodrequest-frontend-assignment/cz/details/",
        languages: {
          "sk-SK":
            "https://marosko123.github.io/goodrequest-frontend-assignment/details/",
          en: "https://marosko123.github.io/goodrequest-frontend-assignment/en/details/",
          "cs-CZ":
            "https://marosko123.github.io/goodrequest-frontend-assignment/cz/details/",
          "x-default":
            "https://marosko123.github.io/goodrequest-frontend-assignment/details/",
        },
      },
      openGraph: {
        locale: "cs_CZ",
        alternateLocale: ["sk_SK", "en_GB"],
        url: "https://marosko123.github.io/goodrequest-frontend-assignment/cz/details/",
        images: [
          {
            url: "https://marosko123.github.io/goodrequest-frontend-assignment/social/goodboy-og-cz.png",
            width: 1200,
            height: 630,
            type: "image/png",
            alt: "Logo GoodBoy a zlatý retrívr na pláži.",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        images: [
          "https://marosko123.github.io/goodrequest-frontend-assignment/social/goodboy-og-cz.png",
        ],
      },
    });
  });
});
