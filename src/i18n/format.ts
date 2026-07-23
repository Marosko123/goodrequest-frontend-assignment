import { intlLocaleByAppLocale, type AppLocale } from "./config";

export function formatCurrency(value: number, locale: AppLocale): string {
  const formatter = new Intl.NumberFormat(intlLocaleByAppLocale[locale], {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  const formattedValue = formatter
    .formatToParts(value)
    .filter(({ type }) => type !== "currency")
    .map(({ value: partValue }) => partValue)
    .join("")
    .trimEnd();

  return `${formattedValue}\u00a0€`;
}

export function formatNumber(value: number, locale: AppLocale): string {
  return new Intl.NumberFormat(intlLocaleByAppLocale[locale]).format(value);
}
