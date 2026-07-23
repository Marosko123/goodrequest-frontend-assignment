import {
  createInstance,
  type i18n,
  type InitOptions,
  type TFunction,
} from "i18next";

import { defaultLocale, defaultNamespace, type AppLocale } from "./config";
import { resources } from "./resources";

export function getI18nOptions(locale: AppLocale): InitOptions {
  return {
    defaultNS: defaultNamespace,
    fallbackLng: defaultLocale,
    initAsync: false,
    interpolation: { escapeValue: false },
    lng: locale,
    ns: [defaultNamespace],
    resources,
    supportedLngs: ["sk", "en"],
  };
}

export function createI18nInstance(locale: AppLocale): i18n {
  const instance = createInstance();
  void instance.init(getI18nOptions(locale));
  return instance;
}

export function createTranslator(
  locale: AppLocale,
): TFunction<typeof defaultNamespace> {
  return createI18nInstance(locale).getFixedT(locale, defaultNamespace);
}
