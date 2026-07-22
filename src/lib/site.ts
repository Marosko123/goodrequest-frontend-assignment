import type { Metadata } from "next";

export const sitePath = "/goodrequest-frontend-assignment/";
export const siteUrl = `https://marosko123.github.io${sitePath}`;

export function createPageMetadata({
  description,
  path,
  robots,
  title,
}: {
  description: string;
  path: string;
  robots?: Metadata["robots"];
  title: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | GoodBoy`,
      description,
      type: "website",
      locale: "sk_SK",
      siteName: "GoodBoy",
      url: path,
      images: [
        {
          url: "og-image.png",
          width: 1200,
          height: 630,
          alt: "GoodBoy – pomoc psom a útulkom",
        },
      ],
    },
    ...(robots ? { robots } : {}),
  };
}
