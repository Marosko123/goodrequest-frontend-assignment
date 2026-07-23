import type { Metadata } from "next";

import { ReviewPage } from "@/features/review/review-page";
import { createTranslator } from "@/i18n/instance";
import { createPageMetadata } from "@/lib/site";

const t = createTranslator("sk");

export const metadata: Metadata = createPageMetadata({
  locale: "sk",
  title: t("seo.reviewTitle"),
  description: t("seo.reviewDescription"),
  path: "review/",
  robots: { index: false, follow: false },
});

export default function ContributionReviewPage() {
  return <ReviewPage />;
}
