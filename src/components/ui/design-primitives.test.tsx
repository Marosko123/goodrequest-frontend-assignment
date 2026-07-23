import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";

import { ChoiceControl } from "./choice-control";
import { Dropdown } from "./dropdown";

describe("design primitives", () => {
  it("renders the exported select chevron and xl geometry", () => {
    const { container } = render(
      <Dropdown
        id="shelter"
        label="Útulok"
        onValueChange={() => undefined}
        options={[{ label: "Útulok", value: "1" }]}
        placeholder="Vyberte útulok"
        value={null}
      />,
    );

    expect(screen.getByRole("combobox")).toHaveAttribute(
      "data-variant",
      "field",
    );
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

  it("only exposes indeterminate state for checkboxes", () => {
    if (false) {
      // @ts-expect-error Radio controls cannot be indeterminate.
      <ChoiceControl indeterminate type="radio" />;
    }

    expect(true).toBe(true);
  });
});
