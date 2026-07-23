import type { Metadata } from "next";

import { FlowGuard } from "@/features/donation-flow/flow-guard";
import { SuccessContent } from "@/features/review/success-content";
import { createTranslator } from "@/i18n/instance";
import { createPageMetadata } from "@/lib/site";

const t = createTranslator("cz");

export const metadata: Metadata = createPageMetadata({
  locale: "cz",
  title: t("seo.successTitle"),
  description: t("seo.successDescription"),
  path: "success/",
  robots: { index: false, follow: false },
});

export default function CzechContributionSuccessPage() {
  return (
    <FlowGuard>
      <SuccessContent />
    </FlowGuard>
  );
}
