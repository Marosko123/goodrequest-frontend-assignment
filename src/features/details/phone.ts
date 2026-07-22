import { parsePhoneNumberFromString } from "libphonenumber-js/max";

import type { PhoneCountry } from "@/domain/donation";

export function detectPhoneCountry(rawValue: string): PhoneCountry | null {
  const compact = rawValue.trim().replace(/[\s()-]/g, "");

  if (compact.startsWith("+420") || compact.startsWith("00420")) {
    return "CZ";
  }
  if (compact.startsWith("+421") || compact.startsWith("00421")) {
    return "SK";
  }
  return null;
}

export function normalizePhone(
  rawValue: string,
  selectedCountry: PhoneCountry,
): { phoneE164: string | null; phoneCountry: PhoneCountry | null } | null {
  const trimmed = rawValue.trim();
  if (!trimmed) {
    return { phoneE164: null, phoneCountry: null };
  }

  const normalizedPrefix = trimmed.replace(/^00/, "+");
  const phone = parsePhoneNumberFromString(normalizedPrefix, selectedCountry);

  if (!phone?.isValid() || (phone.country !== "SK" && phone.country !== "CZ")) {
    return null;
  }

  return {
    phoneE164: phone.number,
    phoneCountry: phone.country,
  };
}
