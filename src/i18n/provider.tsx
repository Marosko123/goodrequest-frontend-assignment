"use client";

import { createInstance, type i18n } from "i18next";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { I18nextProvider, initReactI18next } from "react-i18next";

import { getLocaleFromPathname } from "./config";
import { getI18nOptions } from "./instance";

function createReactI18n(locale: "sk" | "en"): i18n {
  const instance = createInstance();
  instance.use(initReactI18next);
  void instance.init(getI18nOptions(locale));
  return instance;
}

export function AppI18nProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const [instance] = useState(() => createReactI18n(locale));

  useEffect(() => {
    document.documentElement.lang = locale;
    if (instance.resolvedLanguage !== locale) {
      void instance.changeLanguage(locale);
    }
  }, [instance, locale]);

  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
}
