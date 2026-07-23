import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useTranslation } from "react-i18next";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppI18nProvider } from "@/i18n/provider";

import { LanguageSwitcher } from "./language-switcher";

let pathname = "/details/";
const replace = vi.fn((next: string) => {
  pathname = next;
});
const prefetch = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useRouter: () => ({ replace, prefetch }),
}));

function TranslationProbe() {
  const { t } = useTranslation();
  return <span>{t("common.continue")}</span>;
}

function Harness() {
  return (
    <AppI18nProvider>
      <LanguageSwitcher />
      <TranslationProbe />
    </AppI18nProvider>
  );
}

describe("LanguageSwitcher", () => {
  beforeEach(() => {
    pathname = "/details/";
    replace.mockClear();
    prefetch.mockReset();
    document.documentElement.lang = "sk";
  });

  it("does not prefetch locale routes until the compact language menu is interacted with", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Harness />);

    const trigger = screen.getByRole("combobox", { name: "Vybrať jazyk" });
    expect(trigger).toHaveTextContent("SK");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(prefetch).not.toHaveBeenCalled();

    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("listbox", { name: "Jazyk stránky" }),
    ).toBeVisible();
    expect(screen.getAllByRole("option")).toHaveLength(3);
    expect(
      screen.getByRole("option", { name: "Prepnúť do slovenčiny" }),
    ).toHaveAttribute("aria-selected", "true");

    await user.click(
      screen.getByRole("option", { name: "Prepnúť do češtiny" }),
    );

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith("/cz/details/", { scroll: false }),
    );
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(prefetch).toHaveBeenCalledWith("/en/details/");
    expect(prefetch).toHaveBeenCalledWith("/cz/details/");

    // The router owns the locale. Once it lands on the Czech route the provider
    // swaps the i18next instance and the document language follows.
    rerender(<Harness />);

    expect(screen.getByText("Pokračovat")).toBeVisible();
    expect(
      screen.getByRole("combobox", { name: "Vybrat jazyk" }),
    ).toHaveTextContent("CZ");
    expect(document.documentElement.lang).toBe("cs");
  });

  it("supports arrow navigation and returns focus to the trigger on Escape", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const trigger = screen.getByRole("combobox", { name: "Vybrať jazyk" });
    await user.click(trigger);

    const slovak = screen.getByRole("option", {
      name: "Prepnúť do slovenčiny",
    });
    const english = screen.getByRole("option", {
      name: "Prepnúť do angličtiny",
    });
    const czech = screen.getByRole("option", {
      name: "Prepnúť do češtiny",
    });

    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute("aria-activedescendant", slovak.id);
    await user.keyboard("{ArrowDown}");
    expect(trigger).toHaveAttribute("aria-activedescendant", english.id);
    await user.keyboard("{End}");
    expect(trigger).toHaveAttribute("aria-activedescendant", czech.id);
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
