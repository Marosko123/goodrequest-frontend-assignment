import {
  createInstance,
  type i18n,
  type InitOptions,
  type TFunction,
} from "i18next";

import {
  defaultLocale,
  defaultNamespace,
  supportedLocales,
  type AppLocale,
} from "./config";
import { resources } from "./resources";

export function getI18nOptions(locale: AppLocale): InitOptions {
  return {
    defaultNS: defaultNamespace,
    fallbackLng: defaultLocale,
    // Bundled resources plus initAsync: false keep init synchronous, so
    // useTranslation reports ready on the first render and never suspends
    // during the static export prerender.
    initAsync: false,
    interpolation: { escapeValue: false },
    lng: locale,
    ns: [defaultNamespace],
    resources,
    supportedLngs: [...supportedLocales],
  };
}

const instances = new Map<AppLocale, i18n>();

/**
 * One instance per locale, cached at module scope. Switching locales swaps the
 * instance passed to I18nextProvider during render instead of calling the
 * asynchronous changeLanguage, which would repaint the previous locale first.
 */
export function getI18nInstance(locale: AppLocale): i18n {
  const cached = instances.get(locale);
  if (cached) {
    return cached;
  }

  const instance = createInstance();
  void instance.init(getI18nOptions(locale));
  instances.set(locale, instance);
  return instance;
}

export function createTranslator(
  locale: AppLocale,
): TFunction<typeof defaultNamespace> {
  return getI18nInstance(locale).getFixedT(locale, defaultNamespace);
}
