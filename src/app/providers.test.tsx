import { render, screen } from "@testing-library/react";
import { useQueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import DonationLayout from "@/app/(donation)/layout";
import { useDonationFlow } from "@/features/donation-flow/context";

import AboutLayout from "./about/layout";
import { AppProviders } from "./providers";

vi.mock("@/components/layout/language-switcher", () => ({
  LanguageSwitcher: () => null,
}));

vi.mock("@/components/layout/donation-shell", () => ({
  DonationShell: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/details/",
  useRouter: () => ({ prefetch: vi.fn(), replace: vi.fn() }),
}));

function QueryClientProbe() {
  useQueryClient();
  return <span>query client is available</span>;
}

function DonationFlowProbe() {
  useDonationFlow();
  return <span>donation flow is available</span>;
}

describe("AppProviders", () => {
  it("renders the skip link ahead of everything else it mounts", () => {
    const { container } = render(
      <AppProviders>
        <main id="main-content" tabIndex={-1} />
      </AppProviders>,
    );

    const skipLink = screen.getByRole("link", {
      name: "Preskočiť na hlavný obsah",
    });

    expect(skipLink).toHaveAttribute("href", "#main-content");
    expect(container.firstElementChild).toBe(skipLink);
    expect(document.getElementById("main-content")).toHaveAttribute(
      "tabindex",
      "-1",
    );
  });

  it("does not initialize a QueryClient for static routes", () => {
    expect(() =>
      render(
        <AppProviders>
          <QueryClientProbe />
        </AppProviders>,
      ),
    ).toThrow("No QueryClient set");
  });

  it("scopes donation state without loading QueryClient on every donation route", () => {
    render(
      <AppProviders>
        <DonationLayout>
          <DonationFlowProbe />
        </DonationLayout>
      </AppProviders>,
    );

    expect(screen.getByText("donation flow is available")).toBeVisible();
    expect(() =>
      render(
        <AppProviders>
          <DonationLayout>
            <QueryClientProbe />
          </DonationLayout>
        </AppProviders>,
      ),
    ).toThrow("No QueryClient set");
  });

  it("lets the about route scope provide QueryClient for result statistics", () => {
    render(
      <AppProviders>
        <AboutLayout>
          <QueryClientProbe />
        </AboutLayout>
      </AppProviders>,
    );

    expect(screen.getByText("query client is available")).toBeVisible();
  });
});
