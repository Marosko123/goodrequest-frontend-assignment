import { intlLocaleByAppLocale, type AppLocale } from "./config";

export function formatCurrency(value: number, locale: AppLocale): string {
  return new Intl.NumberFormat(intlLocaleByAppLocale[locale], {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number, locale: AppLocale): string {
  return new Intl.NumberFormat(intlLocaleByAppLocale[locale]).format(value);
}
