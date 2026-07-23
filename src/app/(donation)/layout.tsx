import type { ReactNode } from "react";

import { DonationShell } from "@/components/layout/donation-shell";

export default function DonationLayout({ children }: { children: ReactNode }) {
  return <DonationShell>{children}</DonationShell>;
}
