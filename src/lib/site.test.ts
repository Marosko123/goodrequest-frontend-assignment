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
            url: "og-image.png",
            width: 1200,
            height: 630,
            alt: "GoodBoy – pomoc psom a útulkom",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: "Osobné údaje | GoodBoy",
        description: "Doplňte údaje potrebné na odoslanie príspevku.",
        images: ["og-image.png"],
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
        images: [{ alt: "GoodBoy – helping dogs and shelters" }],
      },
    });
  });
});
