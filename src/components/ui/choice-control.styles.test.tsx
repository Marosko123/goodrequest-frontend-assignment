import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ChoiceInput } from "./choice-control.styles";

describe("ChoiceInput motion", () => {
  it("lifts only for a precise pointer and stays still for reduced motion", () => {
    const { container } = render(<ChoiceInput type="checkbox" />);
    const choice = container.firstElementChild as HTMLElement;

    expect(choice).toHaveStyleRule("transform", "translateY(-1px)", {
      media: "(hover: hover) and (pointer: fine)",
      modifier: "&:hover:not(:disabled)",
    });
    expect(choice).toHaveStyleRule("transform", "none", {
      media: "(prefers-reduced-motion: reduce)",
      modifier: "&:hover:not(:disabled)",
    });
  });
});
