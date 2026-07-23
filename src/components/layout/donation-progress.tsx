"use client";

import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

import { useDonationFlow } from "@/features/donation-flow/context";
import { getLocaleFromPathname, getUnlocalizedPath } from "@/i18n/config";

import { getDonationStep } from "./donation-step";
import { useDonationProgressState } from "./donation-progress-context";
import { createDonationStepperItems } from "./donation-progress-model";
import { Stepper } from "./stepper";

export function DonationProgress() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { state } = useDonationFlow();
  const { activeStep } = useDonationProgressState();
  const currentStep = getDonationStep(pathname);
  const normalizedPath =
    getUnlocalizedPath(pathname).replace(/\/+$/, "") || "/";
  const isSuccess = normalizedPath === "/success" && state.submissionAccepted;
  const activeStatus =
    activeStep?.number === currentStep ? activeStep.status : "current";
  const items = createDonationStepperItems({
    activeStatus,
    confirmed: {
      selection: Boolean(state.selection),
      details: Boolean(state.donor),
    },
    currentStep,
    isSuccess,
    labels: {
      selection: t("steps.selection"),
      details: t("steps.details"),
      review: t("steps.review"),
    },
    locale: getLocaleFromPathname(pathname),
  });

  return <Stepper items={items} />;
}
