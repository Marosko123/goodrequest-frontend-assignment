"use client";

import { usePathname, useRouter } from "next/navigation";
import { startTransition, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";

import { Dropdown, type DropdownOption } from "@/components/ui/dropdown";
import {
  type AppLocale,
  getAppLocale,
  getLocaleFromPathname,
  getLocalizedPath,
  supportedLocales,
} from "@/i18n/config";

import { Switcher } from "./language-switcher.styles";

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const { i18n, t } = useTranslation();
  const prefetchedPathsRef = useRef(new Set<string>());
  const pathLocale = getLocaleFromPathname(pathname);
  const activeLocale = getAppLocale(i18n.resolvedLanguage, pathLocale);

  const prefetchInactiveLocales = useCallback(() => {
    supportedLocales
      .filter((locale) => locale !== activeLocale)
      .forEach((locale) => {
        const localizedPath = getLocalizedPath(locale, pathname);
        if (!prefetchedPathsRef.current.has(localizedPath)) {
          prefetchedPathsRef.current.add(localizedPath);
          router.prefetch(localizedPath);
        }
      });
  }, [activeLocale, pathname, router]);

  function switchLocale(locale: AppLocale) {
    if (locale === activeLocale) {
      return;
    }

    // AppI18nProvider owns the document language; it reacts to the new path.
    startTransition(() => {
      router.replace(getLocalizedPath(locale, pathname), { scroll: false });
    });
  }

  const options: readonly DropdownOption<AppLocale>[] = supportedLocales.map(
    (locale) => ({
      value: locale,
      label: t(`language.${locale}`),
      accessibleLabel: t(
        locale === "sk"
          ? "language.switchToSk"
          : locale === "en"
            ? "language.switchToEn"
            : "language.switchToCz",
      ),
    }),
  );

  return (
    <Switcher
      aria-label={t("language.label")}
      onFocusCapture={prefetchInactiveLocales}
      onPointerEnter={prefetchInactiveLocales}
    >
      <Dropdown
        align="end"
        ariaLabel={t("language.openMenu")}
        id="language-switcher"
        listboxLabel={t("language.label")}
        onOpen={prefetchInactiveLocales}
        onValueChange={switchLocale}
        options={options}
        value={activeLocale}
        variant="compact"
      />
    </Switcher>
  );
}
