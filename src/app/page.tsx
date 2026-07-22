import type { Metadata } from "next";

import { DonationShell } from "@/components/layout/donation-shell";
import { SelectionPage } from "@/features/selection/selection-page";
import { createPageMetadata } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "Vyberte formu pomoci",
  description: "Podporte celú nadáciu GoodBoy alebo vybraný slovenský útulok.",
  path: "./",
});

export default function HomePage() {
  return (
    <DonationShell currentStep={1}>
      <SelectionPage />
    </DonationShell>
  );
}
