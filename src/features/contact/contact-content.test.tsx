import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ContactContent } from "./contact-content";

function createDeferredPromise<T>() {
  let resolve: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return { promise, resolve: resolve! };
}

describe("ContactContent", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("copies the email and shows feedback above the active value until it expires", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<ContactContent />);

    const email = screen.getByRole("button", { name: "hello@goodrequest.com" });
    email.focus();
    fireEvent.click(email);

    await act(() => Promise.resolve());
    expect(writeText).toHaveBeenCalledWith("hello@goodrequest.com");
    expect(email).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Skopírované do schránky",
    );

    await act(() => vi.advanceTimersByTime(1_500));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("switches the active feedback to the phone and resets its timer", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<ContactContent />);

    const email = screen.getByRole("button", { name: "hello@goodrequest.com" });
    email.focus();
    fireEvent.click(email);
    await act(() => Promise.resolve());
    await act(() => vi.advanceTimersByTime(1_000));

    const phone = screen.getByRole("button", { name: "+421 911 750 750" });
    phone.focus();
    fireEvent.click(phone);
    await act(() => Promise.resolve());

    expect(writeText).toHaveBeenLastCalledWith("+421 911 750 750");
    expect(phone).toHaveFocus();
    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Skopírované do schránky",
    );

    await act(() => vi.advanceTimersByTime(1_000));
    expect(screen.getByRole("status")).toBeInTheDocument();
    await act(() => vi.advanceTimersByTime(500));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("does not show success feedback when the clipboard rejects the copy", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("Clipboard denied"));
    Object.assign(navigator, { clipboard: { writeText } });

    render(<ContactContent />);
    fireEvent.click(
      screen.getByRole("button", { name: "hello@goodrequest.com" }),
    );

    await act(() => Promise.resolve());
    expect(writeText).toHaveBeenCalledWith("hello@goodrequest.com");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("does not schedule copied feedback when an in-flight copy resolves after unmount", async () => {
    vi.useFakeTimers();
    const write = createDeferredPromise<void>();
    const writeText = vi.fn().mockReturnValue(write.promise);
    Object.assign(navigator, { clipboard: { writeText } });

    const { unmount } = render(<ContactContent />);
    fireEvent.click(
      screen.getByRole("button", { name: "hello@goodrequest.com" }),
    );
    expect(writeText).toHaveBeenCalledWith("hello@goodrequest.com");

    unmount();
    await act(async () => {
      write.resolve();
      await write.promise;
    });

    expect(vi.getTimerCount()).toBe(0);
  });

  it("clears prior feedback when a newer copy is rejected", async () => {
    const writeText = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("Clipboard denied"));
    Object.assign(navigator, { clipboard: { writeText } });

    render(<ContactContent />);
    fireEvent.click(
      screen.getByRole("button", { name: "hello@goodrequest.com" }),
    );
    await act(() => Promise.resolve());
    expect(screen.getByRole("status")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "+421 911 750 750" }));
    await act(() => Promise.resolve());
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("keeps the address as a Google Maps link", () => {
    render(<ContactContent />);

    expect(
      screen.getByRole("link", {
        name: "Obchodná 3D, 010 08 Žilina, Slovensko",
      }),
    ).toHaveAttribute("href", expect.stringContaining("google.com/maps"));
    expect(
      screen.getByRole("img", { name: /zlatý retriever/i }),
    ).toHaveAttribute("draggable", "false");
    expect(document.querySelector('[data-icon="mail"]')).toBeInTheDocument();
    expect(document.querySelector('[data-icon="marker"]')).toBeInTheDocument();
    expect(document.querySelector('[data-icon="phone"]')).toBeInTheDocument();
  });
});
