import type { Metadata } from "next";

import { DonationShell } from "@/components/layout/donation-shell";
import { SuccessContent } from "@/features/review/success-content";

export const metadata: Metadata = {
  title: "Ďakujeme | GoodBoy",
  description: "Príspevok bol úspešne prijatý.",
};

export default function ContributionSuccessPage() {
  return (
    <DonationShell currentStep={3}>
      <SuccessContent />
    </DonationShell>
  );
}
