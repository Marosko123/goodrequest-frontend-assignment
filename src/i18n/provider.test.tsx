import { render, screen } from "@testing-library/react";
import { useTranslation } from "react-i18next";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getI18nInstance } from "./instance";
import { AppI18nProvider } from "./provider";

let pathname = "/";

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
}));

function Probe() {
  const { i18n, t } = useTranslation();
  return (
    <>
      <span data-testid="copy">{t("common.continue")}</span>
      <span data-testid="language">{i18n.resolvedLanguage}</span>
    </>
  );
}

function renderAt(path: string) {
  pathname = path;
  return render(
    <AppI18nProvider>
      <Probe />
    </AppI18nProvider>,
  );
}

afterEach(() => {
  pathname = "/";
});

describe("AppI18nProvider", () => {
  it("serves each localized route from its own i18next instance", () => {
    const { rerender } = renderAt("/details/");

    expect(screen.getByTestId("copy")).toHaveTextContent("Pokračovať");
    expect(screen.getByTestId("language")).toHaveTextContent("sk");
    expect(document.documentElement.lang).toBe("sk");

    pathname = "/cz/details/";
    rerender(
      <AppI18nProvider>
        <Probe />
      </AppI18nProvider>,
    );

    expect(screen.getByTestId("copy")).toHaveTextContent("Pokračovat");
    expect(screen.getByTestId("language")).toHaveTextContent("cz");
    expect(document.documentElement.lang).toBe("cs");

    pathname = "/en/details/";
    rerender(
      <AppI18nProvider>
        <Probe />
      </AppI18nProvider>,
    );

    expect(screen.getByTestId("copy")).toHaveTextContent("Continue");
    expect(document.documentElement.lang).toBe("en");
  });

  it("resolves the instance from context rather than the global default", () => {
    // The Vitest setup registers a Slovak default instance. English copy here
    // can only come from the instance that AppI18nProvider put on the context.
    renderAt("/en/");

    expect(screen.getByTestId("copy")).toHaveTextContent("Continue");
  });

  it("exposes real i18next behaviour, not a plain key lookup", () => {
    // Default values, interpolation and CLDR plural categories are the reason
    // the assignment asks for a localization library. Slovak needs one/few/other.
    const instance = getI18nInstance("sk");
    instance.addResource(
      "sk",
      "translation",
      "test.donors_one",
      "{{count}} darca",
    );
    instance.addResource(
      "sk",
      "translation",
      "test.donors_few",
      "{{count}} darcovia",
    );
    instance.addResource(
      "sk",
      "translation",
      "test.donors_other",
      "{{count}} darcov",
    );

    // The generated key union deliberately excludes these probe keys, so this
    // assertion talks to the runtime translator rather than the typed surface.
    const t = instance.getFixedT("sk", "translation") as unknown as (
      key: string,
      options?: string | Record<string, unknown>,
    ) => string;

    expect(t("test.missingKey", "fallback copy")).toBe("fallback copy");
    expect(t("test.donors", { count: 1 })).toBe("1 darca");
    expect(t("test.donors", { count: 3 })).toBe("3 darcovia");
    expect(t("test.donors", { count: 12 })).toBe("12 darcov");
  });
});
