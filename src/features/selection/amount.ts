import type { TFunction } from "i18next";

import { MAX_DONATION_CENTS } from "@/domain/donation";

export { MAX_DONATION_CENTS };

export type AmountErrorCode =
  "empty" | "format" | "nonPositive" | "precision" | "tooLarge";

export type AmountParseResult =
  { ok: true; cents: number } | { ok: false; code: AmountErrorCode };

export type AmountEditResult =
  | { accepted: true; value: string }
  | { accepted: false; code: AmountErrorCode };

export type AmountLocale = "sk" | "en" | "cz";

export function getAmountErrorMessage(
  code: AmountErrorCode,
  t: TFunction,
): string {
  switch (code) {
    case "empty":
      return t("selection.amountErrorEmpty");
    case "nonPositive":
      return t("selection.amountErrorNonPositive");
    case "precision":
      return t("selection.amountErrorPrecision");
    case "tooLarge":
      return t("selection.amountErrorTooLarge");
    case "format":
      return t("selection.amountErrorFormat");
  }
}

type AmountParts = {
  whole: string;
  fraction: string;
  hasSeparator: boolean;
};

function compactAmount(
  rawValue: string,
): { ok: true; value: string } | { ok: false; code: "empty" | "format" } {
  const trimmed = rawValue.trim();

  if (!trimmed) {
    return { ok: false, code: "empty" };
  }

  const withoutCurrency = trimmed.endsWith("€")
    ? trimmed.slice(0, -1).trimEnd()
    : trimmed;

  if (!withoutCurrency || withoutCurrency.includes("€")) {
    return { ok: false, code: "format" };
  }

  const separatorIndex = withoutCurrency.search(/[.,]/u);
  const integerPart =
    separatorIndex === -1
      ? withoutCurrency
      : withoutCurrency.slice(0, separatorIndex);
  const fractionalPart =
    separatorIndex === -1 ? "" : withoutCurrency.slice(separatorIndex + 1);
  const hasGroupingSpace = /[ \u00a0\u202f]/u.test(withoutCurrency);

  if (
    hasGroupingSpace &&
    (!/^\d{1,3}(?:[ \u00a0\u202f]\d{3})+$/u.test(integerPart) ||
      /[ \u00a0\u202f]/u.test(fractionalPart))
  ) {
    return { ok: false, code: "format" };
  }

  return {
    ok: true,
    value: withoutCurrency.replace(/[ \u00a0\u202f]/g, ""),
  };
}

function splitAmount(
  value: string,
):
  | { ok: true; parts: AmountParts }
  | { ok: false; code: "format" | "precision" } {
  const match = /^(\d+)(?:([.,])(\d*))?$/.exec(value);

  if (!match) {
    return { ok: false, code: "format" };
  }

  const whole = match[1] ?? "";
  const fraction = match[3] ?? "";

  if (fraction.length > 2) {
    return { ok: false, code: "precision" };
  }

  return {
    ok: true,
    parts: {
      whole,
      fraction,
      hasSeparator: Boolean(match[2]),
    },
  };
}

function amountPartsToCents(parts: AmountParts): number {
  return Number(parts.whole) * 100 + Number(parts.fraction.padEnd(2, "0"));
}

export function parseDonationAmount(rawValue: string): AmountParseResult {
  const compacted = compactAmount(rawValue);

  if (!compacted.ok) {
    return compacted;
  }

  const split = splitAmount(compacted.value);

  if (!split.ok) {
    return split;
  }

  const cents = amountPartsToCents(split.parts);

  if (!Number.isSafeInteger(cents) || cents > MAX_DONATION_CENTS) {
    return { ok: false, code: "tooLarge" };
  }

  if (cents <= 0) {
    return { ok: false, code: "nonPositive" };
  }

  return { ok: true, cents };
}

export function parseAmountToCents(rawValue: string): number | null {
  const result = parseDonationAmount(rawValue);
  return result.ok ? result.cents : null;
}

export function normalizeAmountEdit(
  rawValue: string,
  locale: AmountLocale,
): AmountEditResult {
  if (!rawValue.trim()) {
    return { accepted: true, value: "" };
  }

  const compacted = compactAmount(rawValue);

  if (!compacted.ok) {
    return { accepted: false, code: compacted.code };
  }

  const split = splitAmount(compacted.value);

  if (!split.ok) {
    return { accepted: false, code: split.code };
  }

  const cents = amountPartsToCents(split.parts);

  if (!Number.isSafeInteger(cents) || cents > MAX_DONATION_CENTS) {
    return { accepted: false, code: "tooLarge" };
  }

  const separator = locale === "en" ? "." : ",";
  const value = split.parts.hasSeparator
    ? `${split.parts.whole}${separator}${split.parts.fraction}`
    : split.parts.whole;

  return { accepted: true, value };
}

export function normalizeAmountOnBlur(
  rawValue: string,
  locale: AmountLocale,
): string {
  const normalized = normalizeAmountEdit(rawValue, locale);

  if (!normalized.accepted || !normalized.value) {
    return normalized.accepted ? normalized.value : rawValue;
  }

  const separator = locale === "en" ? "." : ",";
  const [rawWhole = "", fraction] = normalized.value.split(separator);
  const whole = rawWhole.replace(/^0+(?=\d)/, "") || "0";

  return fraction ? `${whole}${separator}${fraction}` : whole;
}

export function formatAmountInput(amountCents: number): string {
  return Number.isSafeInteger(amountCents) &&
    amountCents > 0 &&
    amountCents <= MAX_DONATION_CENTS
    ? (amountCents / 100).toString()
    : "";
}
