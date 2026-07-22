import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./button";

describe("Button", () => {
  it("forwards an enabled click", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={onClick}>Pokračovať</Button>);
    const button = screen.getByRole("button", { name: "Pokračovať" });

    expect(button).toHaveAttribute("data-size", "xl");
    expect(button).toHaveAttribute("data-variant", "primary");
    await user.click(button);

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("announces loading and blocks another click", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Button loading onClick={onClick}>
        Odoslať formulár
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Odoslať formulár" });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
