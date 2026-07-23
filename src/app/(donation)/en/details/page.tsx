import type { Metadata } from "next";

import { DetailsPage } from "@/features/details/details-page";
import { createTranslator } from "@/i18n/instance";
import { createPageMetadata } from "@/lib/site";

const t = createTranslator("en");

export const metadata: Metadata = createPageMetadata({
  locale: "en",
  title: t("seo.detailsTitle"),
  description: t("seo.detailsDescription"),
  path: "details/",
  robots: { index: false, follow: false },
});

export default function EnglishDonorDetailsPage() {
  return <DetailsPage />;
}
