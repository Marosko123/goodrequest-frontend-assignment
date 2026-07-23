import { AsYouType, parsePhoneNumberFromString } from "libphonenumber-js/max";

import type { PhoneCountry } from "@/domain/donation";

export type PhoneErrorCode =
  "empty" | "characters" | "unsupportedCountry" | "tooLong" | "invalid";

export type PhoneParseResult =
  | {
      ok: true;
      phoneE164: string;
      phoneCountry: PhoneCountry;
    }
  | { ok: false; code: PhoneErrorCode };

export type PhoneEditResult =
  | { accepted: true; value: string; country: PhoneCountry }
  | {
      accepted: false;
      code: Exclude<PhoneErrorCode, "empty" | "invalid">;
    };

const dialCodes: Record<PhoneCountry, string> = {
  SK: "+421",
  CZ: "+420",
};
const supportedPrefixes = ["+420", "+421", "00420", "00421"] as const;
const allowedCharacters = /^[\d\s()+.-]*$/u;

function compactPhone(rawValue: string): string {
  return rawValue.trim().replace(/[\s().-]/g, "");
}

function isPartialSupportedPrefix(value: string): boolean {
  return supportedPrefixes.some((prefix) => prefix.startsWith(value));
}

function getNationalDigits(compact: string, country: PhoneCountry): string {
  const detectedCountry = detectPhoneCountry(compact);
  let digits = compact.replace(/\D/g, "");

  if (detectedCountry) {
    digits = digits.slice(compact.startsWith("00") ? 5 : 3);
  } else if (country === "SK" && digits.length > 1 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  return digits;
}

function formatNationalDigits(digits: string, country: PhoneCountry): string {
  if (!digits) {
    return "";
  }

  const dialCode = dialCodes[country];
  const formatted = new AsYouType().input(`${dialCode}${digits}`);
  return formatted.slice(dialCode.length).trimStart();
}

export function detectPhoneCountry(rawValue: string): PhoneCountry | null {
  const compact = compactPhone(rawValue);

  if (compact.startsWith("+420") || compact.startsWith("00420")) {
    return "CZ";
  }
  if (compact.startsWith("+421") || compact.startsWith("00421")) {
    return "SK";
  }
  return null;
}

export function formatPhoneInput(
  rawValue: string,
  selectedCountry: PhoneCountry,
): PhoneEditResult {
  if (!rawValue.trim()) {
    return { accepted: true, value: "", country: selectedCountry };
  }

  if (!allowedCharacters.test(rawValue)) {
    return { accepted: false, code: "characters" };
  }

  const compact = compactPhone(rawValue);
  if (!/^(?:\+\d*|\d+)$/.test(compact)) {
    return { accepted: false, code: "characters" };
  }

  const detectedCountry = detectPhoneCountry(compact);
  const hasInternationalPrefix =
    compact.startsWith("+") || compact.startsWith("00");

  if (
    hasInternationalPrefix &&
    !detectedCountry &&
    !isPartialSupportedPrefix(compact)
  ) {
    return { accepted: false, code: "unsupportedCountry" };
  }

  if (hasInternationalPrefix && !detectedCountry) {
    return { accepted: true, value: compact, country: selectedCountry };
  }

  const country = detectedCountry ?? selectedCountry;
  const digits = getNationalDigits(compact, country);
  if (digits.length > 9) {
    return { accepted: false, code: "tooLong" };
  }

  return {
    accepted: true,
    value: formatNationalDigits(digits, country),
    country,
  };
}

export function parsePhone(
  rawValue: string,
  selectedCountry: PhoneCountry,
): PhoneParseResult {
  if (!rawValue.trim()) {
    return { ok: false, code: "empty" };
  }

  if (!allowedCharacters.test(rawValue)) {
    return { ok: false, code: "characters" };
  }

  const compact = compactPhone(rawValue);
  if (!/^(?:\+\d+|\d+)$/.test(compact)) {
    return { ok: false, code: "characters" };
  }

  const detectedCountry = detectPhoneCountry(compact);
  if (
    (compact.startsWith("+") || compact.startsWith("00")) &&
    !detectedCountry
  ) {
    return { ok: false, code: "unsupportedCountry" };
  }

  const nationalDigits = getNationalDigits(
    compact,
    detectedCountry ?? selectedCountry,
  );
  if (nationalDigits.length > 9 || compact.replace(/\D/g, "").length > 15) {
    return { ok: false, code: "tooLong" };
  }

  const normalizedPrefix = compact.replace(/^00/, "+");
  const phone = parsePhoneNumberFromString(normalizedPrefix, selectedCountry);

  if (!phone?.isValid()) {
    return { ok: false, code: "invalid" };
  }

  if (phone.country !== "SK" && phone.country !== "CZ") {
    return { ok: false, code: "unsupportedCountry" };
  }

  return {
    ok: true,
    phoneE164: phone.number,
    phoneCountry: phone.country,
  };
}

export function normalizePhone(
  rawValue: string,
  selectedCountry: PhoneCountry,
): { phoneE164: string; phoneCountry: PhoneCountry } | null {
  const result = parsePhone(rawValue, selectedCountry);
  return result.ok
    ? {
        phoneE164: result.phoneE164,
        phoneCountry: result.phoneCountry,
      }
    : null;
}
