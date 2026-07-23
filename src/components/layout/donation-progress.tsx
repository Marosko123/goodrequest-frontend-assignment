"use client";

import { usePathname } from "next/navigation";

import { AppFooter } from "./app-footer";
import { getDonationStep } from "./donation-step";
import { Stepper } from "./stepper";

export function DonationProgress() {
  return <Stepper currentStep={getDonationStep(usePathname())} />;
}

export function DonationFooter() {
  const currentStep = getDonationStep(usePathname());

  return <AppFooter showSocials={currentStep < 3} />;
}
