import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Stepper, type StepperItem, type StepperStatus } from "./stepper";

const labels = ["Výber útulku", "Osobné údaje", "Potvrdenie"] as const;

function itemsWithStatus(status: StepperStatus): StepperItem[] {
  return labels.map((label, index) => ({
    number: (index + 1) as StepperItem["number"],
    label,
    status: index === 1 ? status : index === 0 ? "finished" : "wait",
    ...(index === 0 ? { href: "/" } : {}),
  }));
}

describe("Stepper", () => {
  it.each<{
    status: StepperStatus;
    icon: string | null;
    current: boolean;
    busy: boolean;
  }>([
    { status: "current", icon: null, current: true, busy: false },
    { status: "finished", icon: "step-check", current: false, busy: false },
    {
      status: "in-progress",
      icon: "step-progress",
      current: true,
      busy: true,
    },
    { status: "wait", icon: null, current: false, busy: false },
    { status: "error", icon: "step-error", current: true, busy: false },
  ])(
    "renders the $status status with correct semantics",
    ({ status, icon, current, busy }) => {
      render(<Stepper items={itemsWithStatus(status)} />);

      const step = screen.getByText("Osobné údaje").closest("li");
      expect(step).not.toBeNull();
      expect(step).toHaveAttribute("data-status", status);
      if (current) {
        expect(step).toHaveAttribute("aria-current", "step");
      } else {
        expect(step).not.toHaveAttribute("aria-current");
      }
      if (busy) {
        expect(step).toHaveAttribute("aria-busy", "true");
      } else {
        expect(step).not.toHaveAttribute("aria-busy");
      }
      if (status === "wait") {
        expect(step).toHaveAttribute("aria-disabled", "true");
        expect(
          within(step!).getByRole("button", { name: "Osobné údaje" }),
        ).toBeDisabled();
      } else {
        expect(step).not.toHaveAttribute("aria-disabled");
      }

      if (icon) {
        expect(within(step!).getByTestId(icon)).toBeInTheDocument();
      } else {
        expect(within(step!).getByText("2")).toBeInTheDocument();
      }
    },
  );

  it("uses the exact supplied Figma vectors for finished, progress and error", () => {
    const items: StepperItem[] = [
      {
        number: 1,
        label: labels[0],
        status: "finished",
      },
      {
        number: 2,
        label: labels[1],
        status: "in-progress",
      },
      {
        number: 3,
        label: labels[2],
        status: "error",
      },
    ];

    render(<Stepper items={items} />);

    expect(
      screen.getByTestId("step-check").querySelector("path"),
    ).toHaveAttribute(
      "d",
      "M15.144 2.25H13.895C13.72 2.25 13.554 2.33 13.447 2.468L6.085 11.795L2.554 7.321C2.501 7.254 2.433 7.199 2.355 7.161C2.278 7.123 2.193 7.104 2.106 7.104H0.858C0.738 7.104 0.672 7.241 0.745 7.334L5.637 13.53C5.865 13.82 6.304 13.82 6.535 13.53L15.256 2.479C15.329 2.388 15.263 2.25 15.144 2.25Z",
    );
    expect(
      screen
        .getByTestId("step-progress")
        .querySelector('[data-vector="progress"]'),
    ).toHaveAttribute(
      "d",
      "M8.832 35.371C11.258 37.134 14.066 38.297 17.028 38.766C19.989 39.235 23.02 38.997 25.871 38.07C28.723 37.144 31.315 35.555 33.435 33.435C35.555 31.315 37.144 28.723 38.07 25.871C38.997 23.02 39.235 19.989 38.766 17.028C38.297 14.066 37.134 11.258 35.371 8.832C33.609 6.406 31.297 4.432 28.626 3.071C25.954 1.71 22.998 1 20 1",
    );
    expect(
      screen.getByTestId("step-error").querySelector("path"),
    ).toHaveAttribute(
      "d",
      "M8.925 7.999L13.612 2.412C13.691 2.319 13.625 2.178 13.503 2.178H12.078C11.994 2.178 11.914 2.215 11.859 2.28L7.993 6.888L4.127 2.28C4.073 2.215 3.993 2.178 3.907 2.178H2.482C2.36 2.178 2.294 2.319 2.373 2.412L7.06 7.999L2.373 13.587C2.355 13.607 2.344 13.633 2.34 13.66C2.337 13.687 2.341 13.714 2.352 13.739C2.364 13.763 2.382 13.784 2.405 13.799C2.428 13.813 2.455 13.821 2.482 13.821H3.907C3.991 13.821 4.071 13.783 4.127 13.719L7.993 9.11L11.859 13.719C11.912 13.783 11.993 13.821 12.078 13.821H13.503C13.625 13.821 13.691 13.68 13.612 13.587L8.925 7.999Z",
    );
  });

  it("only renders explicitly completed previous steps as links", () => {
    render(<Stepper items={itemsWithStatus("current")} />);

    expect(screen.getByRole("link", { name: "Výber útulku" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(
      screen.queryByRole("link", { name: "Osobné údaje" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Potvrdenie" }),
    ).not.toBeInTheDocument();
  });

  it("announces the active status and exposes the localized progress label", () => {
    render(<Stepper items={itemsWithStatus("error")} />);

    expect(
      screen.getByRole("navigation", { name: "Priebeh príspevku" }),
    ).not.toHaveAttribute("aria-busy");
    expect(screen.getByRole("status")).toHaveTextContent("Osobné údaje: Chyba");
  });
});
