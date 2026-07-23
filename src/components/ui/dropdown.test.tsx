import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

import { Dropdown } from "./dropdown";

const shelterOptions = [
  { value: "4", label: "Žilinský útulok" },
  { value: "7", label: "Útulok Tuláčik" },
] as const;

describe("Dropdown", () => {
  it("opens from the trigger and emits a newly clicked value once", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Dropdown
        ariaLabel="Útulok"
        id="shelter"
        onValueChange={onValueChange}
        options={shelterOptions}
        placeholder="Vyberte útulok"
        value={null}
      />,
    );

    const trigger = screen.getByRole("combobox", { name: "Útulok" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await user.click(screen.getByRole("option", { name: "Žilinský útulok" }));

    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith("4");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("navigates enabled options from the trigger and selects with Enter", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Dropdown
        ariaLabel="Útulok"
        id="shelter"
        onValueChange={onValueChange}
        options={[
          shelterOptions[0],
          { value: "6", label: "Nedostupný útulok", disabled: true },
          shelterOptions[1],
        ]}
        placeholder="Vyberte útulok"
        value="4"
      />,
    );

    const trigger = screen.getByRole("combobox", { name: "Útulok" });
    trigger.focus();
    await user.keyboard("{ArrowDown}");

    const selected = screen.getByRole("option", {
      name: "Žilinský útulok",
    });
    expect(trigger).toHaveAttribute("aria-activedescendant", selected.id);

    await user.keyboard("{ArrowDown}");
    const next = screen.getByRole("option", { name: "Útulok Tuláčik" });
    expect(trigger).toHaveAttribute("aria-activedescendant", next.id);

    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("7");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("uses accent-insensitive typeahead to activate a matching option", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Dropdown
        ariaLabel="Útulok"
        id="shelter"
        onValueChange={onValueChange}
        options={[shelterOptions[1], shelterOptions[0]]}
        placeholder="Vyberte útulok"
        value={null}
      />,
    );

    const trigger = screen.getByRole("combobox", { name: "Útulok" });
    await user.click(trigger);
    await user.keyboard("z");

    const match = screen.getByRole("option", { name: "Žilinský útulok" });
    expect(trigger).toHaveAttribute("aria-activedescendant", match.id);

    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("4");
  });

  it("supports Home, End and wrapped ArrowUp navigation", async () => {
    const user = userEvent.setup();
    render(
      <Dropdown
        ariaLabel="Útulok"
        id="shelter"
        onValueChange={() => undefined}
        options={[
          shelterOptions[0],
          { value: "6", label: "Nedostupný útulok", disabled: true },
          shelterOptions[1],
        ]}
        placeholder="Vyberte útulok"
        value={null}
      />,
    );

    const trigger = screen.getByRole("combobox", { name: "Útulok" });
    await user.click(trigger);
    const first = screen.getByRole("option", { name: "Žilinský útulok" });
    const last = screen.getByRole("option", { name: "Útulok Tuláčik" });

    await user.keyboard("{End}");
    expect(trigger).toHaveAttribute("aria-activedescendant", last.id);
    await user.keyboard("{Home}");
    expect(trigger).toHaveAttribute("aria-activedescendant", first.id);
    await user.keyboard("{ArrowUp}");
    expect(trigger).toHaveAttribute("aria-activedescendant", last.id);
  });

  it("closes the current selection without emitting a duplicate change", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Dropdown
        ariaLabel="Útulok"
        id="shelter"
        onValueChange={onValueChange}
        options={shelterOptions}
        value="4"
      />,
    );

    const trigger = screen.getByRole("combobox", { name: "Útulok" });
    await user.click(trigger);
    await user.click(screen.getByRole("option", { name: "Žilinský útulok" }));

    expect(onValueChange).not.toHaveBeenCalled();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("opens and selects the active option with Space", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Dropdown
        ariaLabel="Útulok"
        id="shelter"
        onValueChange={onValueChange}
        options={shelterOptions}
        value={null}
      />,
    );

    const trigger = screen.getByRole("combobox", { name: "Útulok" });
    trigger.focus();
    await user.keyboard(" ");
    await user.keyboard(" ");

    expect(onValueChange).toHaveBeenCalledWith("4");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("closes on Tab and moves focus to the next control", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Dropdown
          ariaLabel="Útulok"
          id="shelter"
          onValueChange={() => undefined}
          options={shelterOptions}
          value="4"
        />
        <button type="button">Ďalej</button>
      </>,
    );

    const trigger = screen.getByRole("combobox", { name: "Útulok" });
    await user.click(trigger);
    await user.tab();

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: "Ďalej" })).toHaveFocus();
  });

  it("closes without changing the value when the user clicks outside", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();

    render(
      <>
        <Dropdown
          ariaLabel="Útulok"
          id="shelter"
          onValueChange={onValueChange}
          options={shelterOptions}
          placeholder="Vyberte útulok"
          value="4"
        />
        <button type="button">Mimo dropdownu</button>
      </>,
    );

    const trigger = screen.getByRole("combobox", { name: "Útulok" });
    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "Mimo dropdownu" }));

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("connects its visible label, error and form state to the trigger", () => {
    const ref = createRef<HTMLButtonElement>();
    const { container } = render(
      <Dropdown
        disabled
        error="Vyberte útulok zo zoznamu."
        id="shelter"
        label="Útulok"
        name="shelterId"
        onValueChange={() => undefined}
        options={shelterOptions}
        placeholder="Vyberte útulok"
        ref={ref}
        required
        value={null}
      />,
    );

    const trigger = screen.getByRole("combobox", { name: "Útulok" });
    expect(trigger).toBeDisabled();
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger).toHaveAttribute("aria-required", "true");
    expect(trigger).toHaveAccessibleDescription("Vyberte útulok zo zoznamu.");
    expect(ref.current).toBe(trigger);
    expect(container.querySelector('input[name="shelterId"]')).toHaveValue("");
  });

  it("keeps the closed listbox mounted but hidden and inert for exit motion", async () => {
    const user = userEvent.setup();
    render(
      <Dropdown
        ariaLabel="Útulok"
        id="shelter"
        onValueChange={() => undefined}
        options={shelterOptions}
        placeholder="Vyberte útulok"
        value={null}
      />,
    );

    const trigger = screen.getByRole("combobox", { name: "Útulok" });
    const listbox = screen.getByRole("listbox", { hidden: true });
    expect(listbox).toHaveAttribute("aria-hidden", "true");
    expect(listbox).toHaveAttribute("inert");
    expect(listbox).toHaveAttribute("data-state", "closed");

    await user.click(trigger);
    expect(listbox).not.toHaveAttribute("aria-hidden");
    expect(listbox).not.toHaveAttribute("inert");
    expect(listbox).toHaveAttribute("data-state", "open");

    await user.keyboard("{Escape}");
    expect(listbox).toHaveAttribute("data-state", "closed");
    expect(trigger).toHaveFocus();
  });

  it("closes an open menu when the control becomes disabled", async () => {
    const user = userEvent.setup();
    const props = {
      ariaLabel: "Útulok",
      id: "shelter",
      onValueChange: () => undefined,
      options: shelterOptions,
      placeholder: "Vyberte útulok",
      value: "4" as const,
    };
    const { rerender } = render(<Dropdown {...props} />);

    const trigger = screen.getByRole("combobox", { name: "Útulok" });
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    rerender(<Dropdown {...props} disabled />);

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toBeDisabled();
  });

  it("closes and reports blur when focus leaves the dropdown", async () => {
    const onBlur = vi.fn();
    const user = userEvent.setup();

    render(
      <>
        <Dropdown
          ariaLabel="Útulok"
          id="shelter"
          onBlur={onBlur}
          onValueChange={() => undefined}
          options={shelterOptions}
          placeholder="Vyberte útulok"
          value="4"
        />
        <button type="button">Ďalší prvok</button>
      </>,
    );

    const trigger = screen.getByRole("combobox", { name: "Útulok" });
    const next = screen.getByRole("button", { name: "Ďalší prvok" });
    await user.click(trigger);
    fireEvent.blur(trigger, { relatedTarget: next });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("exposes a grey surface tone for embedded compact controls", () => {
    render(
      <Dropdown
        ariaLabel="Krajina telefónneho čísla"
        id="phone-country"
        onValueChange={() => undefined}
        options={[{ value: "SK", label: "Slovensko +421" }]}
        tone="surface"
        value="SK"
        variant="compact"
      />,
    );

    expect(
      screen.getByRole("combobox", {
        name: "Krajina telefónneho čísla",
      }),
    ).toHaveAttribute("data-tone", "surface");
  });
});
