import type { ReactNode } from "react";

import { DonationShell } from "@/components/layout/donation-shell";
import { DonationFlowProvider } from "@/features/donation-flow/context";

export default function DonationLayout({ children }: { children: ReactNode }) {
  return (
    <DonationFlowProvider>
      <DonationShell>{children}</DonationShell>
    </DonationFlowProvider>
  );
}
