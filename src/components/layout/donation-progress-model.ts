import type { DonationStep } from "./donation-step";
import type { StepperItem, StepperStatus } from "./stepper";
import { getLocalizedPath, type AppLocale } from "@/i18n/config";

export type ActiveStepperStatus = Extract<
  StepperStatus,
  "current" | "in-progress" | "error"
>;

export type DonationStepperLabels = {
  selection: string;
  details: string;
  review: string;
};

type DonationStepperOptions = {
  activeStatus: ActiveStepperStatus;
  confirmed: {
    selection: boolean;
    details: boolean;
  };
  currentStep: DonationStep;
  isSuccess: boolean;
  labels: DonationStepperLabels;
  locale: AppLocale;
};

const stepPaths: Record<DonationStep, string> = {
  1: "/",
  2: "/details/",
  3: "/review/",
};

export function createDonationStepperItems({
  activeStatus,
  confirmed,
  currentStep,
  isSuccess,
  labels,
  locale,
}: DonationStepperOptions): StepperItem[] {
  const steps: ReadonlyArray<{
    number: DonationStep;
    label: string;
    isConfirmed: boolean;
  }> = [
    { number: 1, label: labels.selection, isConfirmed: confirmed.selection },
    { number: 2, label: labels.details, isConfirmed: confirmed.details },
    { number: 3, label: labels.review, isConfirmed: false },
  ];
  const navigationLocked = isSuccess || activeStatus === "in-progress";

  return steps.map(({ isConfirmed, label, number }) => {
    const status: StepperStatus = isSuccess
      ? "finished"
      : number === currentStep
        ? activeStatus
        : number < currentStep && isConfirmed
          ? "finished"
          : "wait";
    const href =
      status === "finished" && !navigationLocked
        ? getLocalizedPath(locale, stepPaths[number])
        : undefined;

    return { number, label, status, ...(href ? { href } : {}) };
  });
}
