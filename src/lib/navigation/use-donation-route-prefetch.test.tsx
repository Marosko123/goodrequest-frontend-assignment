import { fireEvent, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useDonationRoutePrefetch } from "./use-donation-route-prefetch";

const prefetch = vi.fn();
let pathname = "/";

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useRouter: () => ({ prefetch }),
}));

function PrefetchButton() {
  const intent = useDonationRoutePrefetch();
  return <button {...intent}>Continue</button>;
}

describe("useDonationRoutePrefetch", () => {
  beforeEach(() => {
    pathname = "/";
    prefetch.mockReset();
  });

  it("waits for explicit intent and prefetches the next step only once", () => {
    const requestIdleCallback = vi.fn((callback: IdleRequestCallback) => {
      callback({ didTimeout: false, timeRemaining: () => 50 });
      return 1;
    });
    Object.defineProperty(window, "requestIdleCallback", {
      configurable: true,
      value: requestIdleCallback,
    });

    const { getByRole } = render(<PrefetchButton />);
    const button = getByRole("button", { name: "Continue" });

    expect(requestIdleCallback).not.toHaveBeenCalled();
    expect(prefetch).not.toHaveBeenCalled();
    fireEvent.pointerEnter(button);
    fireEvent.focus(button);
    fireEvent.touchStart(button);
    expect(prefetch).toHaveBeenCalledExactlyOnceWith("/details/");
  });

  it("prefetches the next localized step on focus intent", () => {
    pathname = "/en/details/";
    const { getByRole } = render(<PrefetchButton />);

    fireEvent.focus(getByRole("button", { name: "Continue" }));

    expect(prefetch).toHaveBeenCalledExactlyOnceWith("/en/review/");
  });

  it("does nothing when the current route has no next donation step", () => {
    pathname = "/cz/success/";
    const { getByRole } = render(<PrefetchButton />);

    fireEvent.pointerEnter(getByRole("button", { name: "Continue" }));

    expect(prefetch).not.toHaveBeenCalled();
  });
});
