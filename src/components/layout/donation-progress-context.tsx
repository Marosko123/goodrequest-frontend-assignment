"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { DonationStep } from "./donation-step";
import type { ActiveStepperStatus } from "./donation-progress-model";

type ActiveStep = {
  number: DonationStep;
  status: ActiveStepperStatus;
};

type DonationProgressContextValue = {
  activeStep: ActiveStep | null;
  setActiveStep: React.Dispatch<React.SetStateAction<ActiveStep | null>>;
};

const DonationProgressContext =
  createContext<DonationProgressContextValue | null>(null);

export function DonationProgressProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [activeStep, setActiveStep] = useState<ActiveStep | null>(null);
  const value = useMemo(() => ({ activeStep, setActiveStep }), [activeStep]);

  return (
    <DonationProgressContext value={value}>{children}</DonationProgressContext>
  );
}

export function useDonationProgressState(): DonationProgressContextValue {
  const context = useContext(DonationProgressContext);

  if (!context) {
    throw new Error(
      "useDonationProgressState must be used inside DonationProgressProvider.",
    );
  }

  return context;
}

export function useDonationStepStatus(
  number: DonationStep,
  status: ActiveStepperStatus,
) {
  const context = useContext(DonationProgressContext);
  const setActiveStep = context?.setActiveStep;

  useEffect(() => {
    if (!setActiveStep) {
      return;
    }

    setActiveStep({ number, status });

    return () => {
      setActiveStep((activeStep) =>
        activeStep?.number === number ? null : activeStep,
      );
    };
  }, [number, setActiveStep, status]);
}
