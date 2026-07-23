"use client";

import { useTranslation } from "react-i18next";

import {
  Step,
  StepLabel,
  StepLine,
  StepList,
  StepNumber,
  StepperNav,
} from "./stepper.styles";
import { CheckIcon } from "../ui/icons";
import type { DonationStep } from "./donation-step";

export function Stepper({ currentStep }: { currentStep: DonationStep }) {
  const { t } = useTranslation();
  const steps: ReadonlyArray<{ number: DonationStep; label: string }> = [
    { number: 1, label: t("steps.selection") },
    { number: 2, label: t("steps.details") },
    { number: 3, label: t("steps.review") },
  ];

  return (
    <StepperNav aria-label={t("steps.progress")}>
      <StepList aria-label={t("steps.progress")}>
        {steps.map((step) => {
          const isCurrent = step.number === currentStep;
          const isComplete = step.number < currentStep;

          return (
            <Step
              aria-current={isCurrent ? "step" : undefined}
              data-complete={isComplete || undefined}
              data-current={isCurrent || undefined}
              key={step.number}
            >
              <StepNumber aria-hidden="true">
                {isComplete ? (
                  <CheckIcon data-motion="step-check" />
                ) : (
                  step.number
                )}
              </StepNumber>
              <StepLabel>{step.label}</StepLabel>
              {step.number < 3 ? <StepLine aria-hidden="true" /> : null}
            </Step>
          );
        })}
      </StepList>
    </StepperNav>
  );
}
