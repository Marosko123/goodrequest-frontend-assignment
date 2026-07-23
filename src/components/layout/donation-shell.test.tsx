import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DonationFlowProvider } from "@/features/donation-flow/context";

import { DonationShell } from "./donation-shell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/details/",
  useRouter: () => ({
    prefetch: vi.fn(),
    replace: vi.fn(),
  }),
}));

describe("DonationShell", () => {
  it("provides the shared stepper, artwork and footer navigation", () => {
    render(
      <DonationFlowProvider>
        <DonationShell>
          <h1>Obsah kroku</h1>
        </DonationShell>
      </DonationFlowProvider>,
    );

    expect(
      screen.getByRole("heading", { name: "Obsah kroku" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Mladý pes na pláži" }),
    ).toHaveAttribute("draggable", "false");
    expect(screen.getByText("Osobné údaje").closest("li")).toHaveAttribute(
      "aria-current",
      "step",
    );
    expect(screen.getByRole("link", { name: "Kontakt" })).toHaveAttribute(
      "href",
      "/contact",
    );
    expect(screen.getByRole("link", { name: "O projekte" })).toHaveAttribute(
      "href",
      "/about",
    );
    expect(screen.getByRole("link", { name: "Facebook" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Instagram" })).toBeVisible();
  });
});
