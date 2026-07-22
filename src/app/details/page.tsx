import type { Metadata } from "next";

import { DonationShell } from "@/components/layout/donation-shell";
import { DetailsPage } from "@/features/details/details-page";

export const metadata: Metadata = {
  title: "Osobné údaje | GoodBoy",
  description: "Doplňte údaje potrebné na odoslanie príspevku.",
};

export default function DonorDetailsPage() {
  return (
    <DonationShell currentStep={2}>
      <DetailsPage />
    </DonationShell>
  );
}
