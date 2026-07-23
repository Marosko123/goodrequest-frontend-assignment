"use client";

import {
  createContext,
  type Dispatch,
  type ReactNode,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";

import {
  donationFlowReducer,
  initialDonationFlowState,
  type DonationFlowAction,
  type DonationFlowState,
  type PersistedDonationFlowState,
} from "./state";
import { storageKey } from "./storage-key";

type DonationFlowContextValue = {
  state: DonationFlowState;
  dispatch: Dispatch<DonationFlowAction>;
};

const DonationFlowContext = createContext<DonationFlowContextValue | null>(
  null,
);

const emptyPersistedFlow: PersistedDonationFlowState = {
  selection: null,
  donor: null,
  selectionDraft: null,
  donorDraft: null,
};

function hasStoredDonationFlow() {
  try {
    return window.sessionStorage.getItem(storageKey) !== null;
  } catch {
    return false;
  }
}

export function DonationFlowProvider({ children }: { children: ReactNode }) {
  const [state, reducerDispatch] = useReducer(
    donationFlowReducer,
    initialDonationFlowState,
  );
  const storageResetRequested = useRef(false);
  const dispatch = useCallback<Dispatch<DonationFlowAction>>((action) => {
    storageResetRequested.current = action.type === "flowReset";
    reducerDispatch(action);
  }, []);

  useEffect(() => {
    let active = true;

    if (!hasStoredDonationFlow()) {
      reducerDispatch({
        type: "flowHydrated",
        payload: emptyPersistedFlow,
      });
      return;
    }

    void import("./storage")
      .then(({ loadDonationFlowStorage }) => {
        if (active) {
          reducerDispatch({
            type: "flowHydrated",
            payload: loadDonationFlowStorage(),
          });
        }
      })
      .catch(() => {
        if (active) {
          reducerDispatch({
            type: "flowHydrated",
            payload: emptyPersistedFlow,
          });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!state.hydrated) {
      return;
    }

    let active = true;
    const { selection, donor, selectionDraft, donorDraft } = state;
    const isEmpty =
      selection === null &&
      donor === null &&
      selectionDraft === null &&
      donorDraft === null;

    if (
      isEmpty &&
      !state.submissionAccepted &&
      !storageResetRequested.current
    ) {
      return;
    }

    void import("./storage")
      .then(({ clearDonationFlowStorage, saveDonationFlowStorage }) => {
        if (!active) {
          return;
        }

        if (state.submissionAccepted || storageResetRequested.current) {
          clearDonationFlowStorage();
          return;
        }

        saveDonationFlowStorage({
          selection,
          donor,
          selectionDraft,
          donorDraft,
        });
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [dispatch, state]);

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
