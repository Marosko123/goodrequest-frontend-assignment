import type { Metadata } from "next";

import { DonationShell } from "@/components/layout/donation-shell";
import { SuccessContent } from "@/features/review/success-content";
import { createPageMetadata } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "Ďakujeme",
  description: "Príspevok bol úspešne prijatý.",
  path: "success/",
  robots: { index: false, follow: false },
});

export default function ContributionSuccessPage() {
  return (
    <DonationShell currentStep={3}>
      <SuccessContent />
    </DonationShell>
  );
}
