"use client";

import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";

import { getLocaleFromPathname, htmlLangByAppLocale } from "./config";
import { getI18nInstance } from "./instance";

export function AppI18nProvider({ children }: { children: ReactNode }) {
  const locale = getLocaleFromPathname(usePathname());

  useEffect(() => {
    document.documentElement.lang = htmlLangByAppLocale[locale];
  }, [locale]);

  return (
    <I18nextProvider i18n={getI18nInstance(locale)}>{children}</I18nextProvider>
  );
}
