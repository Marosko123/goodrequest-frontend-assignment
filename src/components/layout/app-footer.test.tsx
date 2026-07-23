import { render, screen } from "@testing-library/react";
import type { ComponentPropsWithoutRef } from "react";
import { describe, expect, it, vi } from "vitest";

import { AppFooter } from "./app-footer";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    prefetch,
    ...props
  }: ComponentPropsWithoutRef<"a"> & { prefetch?: boolean }) => (
    <a data-prefetch={String(prefetch)} {...props}>
      {children}
    </a>
  ),
}));

describe("AppFooter", () => {
  it("disables automatic Next.js prefetch for supplementary links", () => {
    render(<AppFooter />);

    expect(
      screen.getByRole("link", { name: "Good Boy – domov" }),
    ).toHaveAttribute("data-prefetch", "false");
    expect(screen.getByRole("link", { name: "Kontakt" })).toHaveAttribute(
      "data-prefetch",
      "false",
    );
    expect(screen.getByRole("link", { name: "O projekte" })).toHaveAttribute(
      "data-prefetch",
      "false",
    );
  });
});
