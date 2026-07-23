import { render } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";

import { DropdownError } from "@/components/ui/dropdown.styles";
import { ErrorMessage as TextFieldError } from "@/components/ui/text-field.styles";
import { ErrorMessage as PhoneError } from "@/features/details/details-form.styles";
import { ErrorMessage as ConsentError } from "@/features/review/review-form.styles";
import { theme } from "@/styles/theme";

describe("inline validation messages", () => {
  it("renders every inline validation message in one identical red", () => {
    // The phone field once drifted to `danger` while the text fields next to
    // it used `dangerHover`, so one screen showed two different reds. Four
    // components own an error message and nothing else forces them to agree.
    for (const Message of [
      TextFieldError,
      PhoneError,
      ConsentError,
      DropdownError,
    ]) {
      const { container } = render(createElement(Message));
      const element = container.firstElementChild as HTMLElement;

      expect(element).toHaveStyleRule("color", theme.colors.dangerHover);
      expect(element).toHaveStyleRule("font", theme.typography.textSmRegular);
    }
  });
});
