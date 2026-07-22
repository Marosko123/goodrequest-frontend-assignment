import type { Metadata } from "next";

import { DonationShell } from "@/components/layout/donation-shell";
import { DetailsPage } from "@/features/details/details-page";
import { createPageMetadata } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "Osobné údaje",
  description: "Doplňte údaje potrebné na odoslanie príspevku.",
  path: "details/",
  robots: { index: false, follow: false },
});

export default function DonorDetailsPage() {
  return (
    <DonationShell currentStep={2}>
      <DetailsPage />
    </DonationShell>
  );
}
