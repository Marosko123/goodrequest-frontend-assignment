import type { Metadata } from "next";

import { DetailsPage } from "@/features/details/details-page";
import { createTranslator } from "@/i18n/instance";
import { createPageMetadata } from "@/lib/site";

const t = createTranslator("sk");

export const metadata: Metadata = createPageMetadata({
  locale: "sk",
  title: t("seo.detailsTitle"),
  description: t("seo.detailsDescription"),
  path: "details/",
  robots: { index: false, follow: false },
});

export default function DonorDetailsPage() {
  return <DetailsPage />;
}
