import type { ReactNode } from "react";

import { Transition } from "./donation-template.styles";

export default function DonationTemplate({
  children,
}: {
  children: ReactNode;
}) {
  return <Transition data-motion="step-enter">{children}</Transition>;
}
