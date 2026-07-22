import type { Metadata } from "next";

import { DonationShell } from "@/components/layout/donation-shell";
import { ReviewPage } from "@/features/review/review-page";
import { createPageMetadata } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "Potvrdenie príspevku",
  description: "Skontrolujte údaje a odošlite svoj príspevok.",
  path: "review/",
  robots: { index: false, follow: false },
});

export default function ContributionReviewPage() {
  return (
    <DonationShell currentStep={3}>
      <ReviewPage />
    </DonationShell>
  );
}
