import { I18nextProvider, useTranslation } from "react-i18next";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createI18nInstance } from "@/i18n/instance";

import { LanguageSwitcher } from "./language-switcher";

const replace = vi.fn();
const prefetch = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/details/",
  useRouter: () => ({ replace, prefetch }),
}));

function TranslationProbe() {
  const { t } = useTranslation();
  return <span>{t("common.continue")}</span>;
}

describe("LanguageSwitcher", () => {
  beforeEach(() => {
    replace.mockReset();
    prefetch.mockReset();
    document.documentElement.lang = "sk";
  });

  it("changes visible translations immediately and then performs a soft locale navigation", async () => {
    const i18n = createI18nInstance("sk");
    const user = userEvent.setup();

    render(
      <I18nextProvider i18n={i18n}>
        <LanguageSwitcher />
        <TranslationProbe />
      </I18nextProvider>,
    );

    await user.click(
      screen.getByRole("button", { name: "Prepnúť do angličtiny" }),
    );

    await waitFor(() => expect(i18n.resolvedLanguage).toBe("en"));
    expect(screen.getByText("Continue")).toBeVisible();
    expect(document.documentElement).toHaveAttribute("lang", "en");
    expect(replace).toHaveBeenCalledWith("/en/details/", { scroll: false });
  });
});
