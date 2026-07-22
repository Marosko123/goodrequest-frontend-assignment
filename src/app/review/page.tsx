import type { Metadata } from "next";

import { DonationShell } from "@/components/layout/donation-shell";
import { ReviewPage } from "@/features/review/review-page";

export const metadata: Metadata = {
  title: "Potvrdenie príspevku | GoodBoy",
  description: "Skontrolujte údaje a odošlite svoj príspevok.",
};

export default function ContributionReviewPage() {
  return (
    <DonationShell currentStep={3}>
      <ReviewPage />
    </DonationShell>
  );
}
