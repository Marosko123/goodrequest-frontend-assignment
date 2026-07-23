"use client";

import { usePathname, useRouter } from "next/navigation";
import { startTransition, useEffect } from "react";
import { useTranslation } from "react-i18next";

import {
  type AppLocale,
  getLocaleFromPathname,
  getLocalizedPath,
} from "@/i18n/config";

import { LocaleOption, Switcher } from "./language-switcher.styles";

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const { i18n, t } = useTranslation();
  const pathLocale = getLocaleFromPathname(pathname);
  const activeLocale: AppLocale =
    i18n.resolvedLanguage === "en" ? "en" : pathLocale;
  const targetLocale: AppLocale = activeLocale === "sk" ? "en" : "sk";
  const targetPath = getLocalizedPath(targetLocale, pathname);

  useEffect(() => {
    router.prefetch(targetPath);
  }, [router, targetPath]);

  function switchLocale(locale: AppLocale) {
    if (locale === activeLocale) {
      return;
    }

    document.documentElement.setAttribute("lang", locale);
    void i18n.changeLanguage(locale);
    startTransition(() => {
      router.replace(getLocalizedPath(locale, pathname), { scroll: false });
    });
  }

  return (
    <Switcher aria-label={t("language.label")}>
      {(["sk", "en"] as const).map((locale) => (
        <LocaleOption
          aria-current={locale === activeLocale ? "page" : undefined}
          aria-label={
            locale === "sk"
              ? t("language.switchToSk")
              : t("language.switchToEn")
          }
          data-active={locale === activeLocale || undefined}
          key={locale}
          onClick={() => switchLocale(locale)}
          type="button"
        >
          {t(`language.${locale}`)}
        </LocaleOption>
      ))}
    </Switcher>
  );
}
