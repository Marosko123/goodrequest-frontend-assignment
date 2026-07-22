import type { Metadata } from "next";

import { DonationShell } from "@/components/layout/donation-shell";
import { SelectionPage } from "@/features/selection/selection-page";

export const metadata: Metadata = {
  title: "Vyberte formu pomoci | GoodBoy",
  description: "Podporte celú nadáciu GoodBoy alebo vybraný slovenský útulok.",
};

export default function HomePage() {
  return (
    <DonationShell currentStep={1}>
      <SelectionPage />
    </DonationShell>
  );
}
