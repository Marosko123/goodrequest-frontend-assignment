import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DonationFlowProvider, useDonationFlow } from "./context";

const storageKey = "goodboy-donation-flow:v1";

function FlowProbe() {
  const { state, dispatch } = useDonationFlow();

  return (
    <div>
      <output aria-label="amount">
        {state.selectionDraft?.amount ?? "empty"}
      </output>
      <output aria-label="accepted">
        {state.submissionAccepted ? "accepted" : "pending"}
      </output>
      <output aria-label="hydrated">{state.hydrated ? "yes" : "no"}</output>
      <button
        onClick={() =>
          dispatch({
            type: "selectionDraftChanged",
            payload: {
              target: "foundation",
              shelterId: null,
              amount: "99",
            },
          })
        }
        type="button"
      >
        update
      </button>
      <button
        onClick={() => dispatch({ type: "submissionAccepted" })}
        type="button"
      >
        accept
      </button>
      <button onClick={() => dispatch({ type: "flowReset" })} type="button">
        reset
      </button>
    </div>
  );
}

describe("DonationFlowProvider", () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it("hydrates an empty session without storing an empty snapshot", async () => {
    render(
      <DonationFlowProvider>
        <FlowProbe />
      </DonationFlowProvider>,
    );

    await waitFor(() =>
      expect(screen.getByLabelText("hydrated")).toHaveTextContent("yes"),
    );
    expect(sessionStorage.getItem(storageKey)).toBeNull();
  });

  it("does not load the validation chunk for an empty session", async () => {
    const loadDonationFlowStorage = vi.fn();
    vi.resetModules();
    vi.doMock("./storage", () => ({
      loadDonationFlowStorage,
      clearDonationFlowStorage: vi.fn(),
      saveDonationFlowStorage: vi.fn(),
    }));
    const {
      DonationFlowProvider: EmptyStorageProvider,
      useDonationFlow: useEmptyStorageFlow,
    } = await import("./context");

    function EmptyStorageProbe() {
      const { state } = useEmptyStorageFlow();
      return (
        <output aria-label="empty-storage-hydrated">
          {state.hydrated ? "yes" : "no"}
        </output>
      );
    }

    render(
      <EmptyStorageProvider>
        <EmptyStorageProbe />
      </EmptyStorageProvider>,
    );

    await waitFor(() =>
      expect(screen.getByLabelText("empty-storage-hydrated")).toHaveTextContent(
        "yes",
      ),
    );
    expect(loadDonationFlowStorage).not.toHaveBeenCalled();
    vi.doUnmock("./storage");
  });

  it("restores and persists an in-progress session draft without consent", async () => {
    sessionStorage.setItem(
      storageKey,
      JSON.stringify({
        version: 1,
        data: {
          selection: null,
          donor: null,
          selectionDraft: {
            target: "foundation",
            shelterId: null,
            amount: "25",
          },
          donorDraft: null,
          consent: true,
        },
      }),
    );

    render(
      <DonationFlowProvider>
        <FlowProbe />
      </DonationFlowProvider>,
    );

    await waitFor(() =>
      expect(screen.getByLabelText("hydrated")).toHaveTextContent("yes"),
    );
    expect(screen.getByLabelText("amount")).toHaveTextContent("25");

    fireEvent.click(screen.getByRole("button", { name: "update" }));
    await waitFor(() =>
      expect(JSON.parse(sessionStorage.getItem(storageKey) ?? "{}")).toEqual({
        version: 1,
        data: {
          selection: null,
          donor: null,
          selectionDraft: {
            target: "foundation",
            shelterId: null,
            amount: "99",
          },
          donorDraft: null,
        },
      }),
    );
    expect(localStorage.getItem(storageKey)).toBeNull();
  });

  it("clears persisted data after an accepted submission", async () => {
    render(
      <DonationFlowProvider>
        <FlowProbe />
      </DonationFlowProvider>,
    );

    await waitFor(() =>
      expect(screen.getByLabelText("hydrated")).toHaveTextContent("yes"),
    );
    fireEvent.click(screen.getByRole("button", { name: "update" }));
    await waitFor(() =>
      expect(sessionStorage.getItem(storageKey)).not.toBeNull(),
    );
    fireEvent.click(screen.getByRole("button", { name: "accept" }));
    expect(screen.getByLabelText("amount")).toHaveTextContent("empty");
    expect(screen.getByLabelText("accepted")).toHaveTextContent("accepted");
    await waitFor(() => expect(sessionStorage.getItem(storageKey)).toBeNull());
  });

  it("clears persisted data after an explicit flow reset", async () => {
    render(
      <DonationFlowProvider>
        <FlowProbe />
      </DonationFlowProvider>,
    );

    await waitFor(() =>
      expect(screen.getByLabelText("hydrated")).toHaveTextContent("yes"),
    );
    fireEvent.click(screen.getByRole("button", { name: "update" }));
    await waitFor(() =>
      expect(sessionStorage.getItem(storageKey)).not.toBeNull(),
    );

    fireEvent.click(screen.getByRole("button", { name: "reset" }));

    await waitFor(() => expect(sessionStorage.getItem(storageKey)).toBeNull());
  });

  it("marks the flow hydrated when dynamic storage loading fails", async () => {
    sessionStorage.setItem(storageKey, "existing snapshot");
    vi.resetModules();
    vi.doMock("./storage", () => ({
      loadDonationFlowStorage: () => {
        throw new Error("storage chunk unavailable");
      },
      clearDonationFlowStorage: vi.fn(),
      saveDonationFlowStorage: vi.fn(),
    }));
    const {
      DonationFlowProvider: FailingStorageProvider,
      useDonationFlow: useFailingStorageFlow,
    } = await import("./context");

    function FailingStorageProbe() {
      const { state } = useFailingStorageFlow();
      return (
        <output aria-label="failed-storage-hydrated">
          {state.hydrated ? "yes" : "no"}
        </output>
      );
    }

    render(
      <FailingStorageProvider>
        <FailingStorageProbe />
      </FailingStorageProvider>,
    );

    await waitFor(() =>
      expect(
        screen.getByLabelText("failed-storage-hydrated"),
      ).toHaveTextContent("yes"),
    );
  });

  it("absorbs a rejected dynamic storage write after hydration", async () => {
    vi.resetModules();
    vi.doMock("./storage", () => ({
      loadDonationFlowStorage: () => ({
        selection: null,
        donor: null,
        selectionDraft: null,
        donorDraft: null,
      }),
      clearDonationFlowStorage: vi.fn(),
      saveDonationFlowStorage: () => {
        throw new Error("storage write chunk unavailable");
      },
    }));
    const {
      DonationFlowProvider: WriteFailureProvider,
      useDonationFlow: useWriteFailureFlow,
    } = await import("./context");

    function WriteFailureProbe() {
      const { state, dispatch } = useWriteFailureFlow();
      return (
        <>
          <output aria-label="write-failure-hydrated">
            {state.hydrated ? "yes" : "no"}
          </output>
          <button
            onClick={() =>
              dispatch({
                type: "selectionDraftChanged",
                payload: {
                  target: "foundation",
                  shelterId: null,
                  amount: "10",
                },
              })
            }
            type="button"
          >
            write
          </button>
        </>
      );
    }

    render(
      <WriteFailureProvider>
        <WriteFailureProbe />
      </WriteFailureProvider>,
    );

    await waitFor(() =>
      expect(screen.getByLabelText("write-failure-hydrated")).toHaveTextContent(
        "yes",
      ),
    );
    expect(() =>
      fireEvent.click(screen.getByRole("button", { name: "write" })),
    ).not.toThrow();
  });
});
