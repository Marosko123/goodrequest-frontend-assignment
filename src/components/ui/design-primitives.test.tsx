import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";

import { ChoiceControl } from "./choice-control";
import { SelectField } from "./select-field";

describe("design primitives", () => {
  it("renders the exported select chevron and xl geometry", () => {
    const { container } = render(
      <SelectField
        data={[{ label: "Útulok", value: "1" }]}
        id="shelter"
        label="Útulok"
        onChange={() => undefined}
        placeholder="Vyberte útulok"
      />,
    );

    expect(screen.getByRole("combobox")).toHaveAttribute("data-size", "xl");
    expect(
      container.querySelector('svg[data-icon="chevron-down"]'),
    ).toBeInTheDocument();
  });

  it("supports exact checkbox and radio sizes", () => {
    render(
      <>
        <ChoiceControl aria-label="Súhlas" size="md" type="checkbox" />
        <ChoiceControl aria-label="Výber" size="sm" type="radio" />
      </>,
    );

    expect(screen.getByRole("checkbox")).toHaveAttribute("data-size", "md");
    expect(screen.getByRole("radio")).toHaveAttribute("data-size", "sm");
  });

  it("sets the native indeterminate state", () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <ChoiceControl
        aria-label="Čiastočný výber"
        indeterminate
        ref={ref}
        type="checkbox"
      />,
    );

    expect(ref.current?.indeterminate).toBe(true);
  });
});
