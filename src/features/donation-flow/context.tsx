"use client";

import {
  createContext,
  type Dispatch,
  type ReactNode,
  useContext,
  useMemo,
  useReducer,
} from "react";

import {
  donationFlowReducer,
  initialDonationFlowState,
  type DonationFlowAction,
  type DonationFlowState,
} from "./state";

type DonationFlowContextValue = {
  state: DonationFlowState;
  dispatch: Dispatch<DonationFlowAction>;
};

const DonationFlowContext = createContext<DonationFlowContextValue | null>(
  null,
);

export function DonationFlowProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    donationFlowReducer,
    initialDonationFlowState,
  );
  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <DonationFlowContext value={value}>{children}</DonationFlowContext>;
}

export function useDonationFlow(): DonationFlowContextValue {
  const context = useContext(DonationFlowContext);

  if (!context) {
    throw new Error(
      "useDonationFlow must be used inside DonationFlowProvider.",
    );
  }

  return context;
}
