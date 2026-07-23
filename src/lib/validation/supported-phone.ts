import { parsePhoneNumberFromString } from "libphonenumber-js/max";

import type { PhoneCountry } from "@/domain/donation";

export function isValidSupportedPhone(
  phoneE164: string,
  expectedCountry: PhoneCountry,
): boolean {
  if (phoneE164.length > 16 || !/^\+(?:420|421)\d+$/u.test(phoneE164)) {
    return false;
  }

  const phone = parsePhoneNumberFromString(phoneE164);

  return (
    phone?.isValid() === true &&
    phone.number === phoneE164 &&
    phone.country === expectedCountry &&
    (phone.country === "SK" || phone.country === "CZ")
  );
}
