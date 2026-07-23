import { z } from "./zod";

const namePart = String.raw`\p{L}[\p{L}\p{M}]*`;
const personNamePattern = new RegExp(
  `^${namePart}(?:[\\p{Zs}'’ʼ\\-‐‑]${namePart})*$`,
  "u",
);
function characterCount(value: string): number {
  return [...value].length;
}

function normalizePersonName(value: string): string {
  return value.trim().normalize("NFC");
}

function normalizeEmailDomain(value: string): string {
  const separatorIndex = value.lastIndexOf("@");
  return `${value.slice(0, separatorIndex)}@${value
    .slice(separatorIndex + 1)
    .toLowerCase()}`;
}

function hasValidEmailSegmentLengths(value: string): boolean {
  const separatorIndex = value.lastIndexOf("@");
  if (separatorIndex <= 0 || separatorIndex === value.length - 1) {
    return false;
  }

  const localPart = value.slice(0, separatorIndex);
  const domain = value.slice(separatorIndex + 1);
  return (
    localPart.length <= 64 &&
    domain.split(".").every((label) => label.length <= 63)
  );
}

/**
 * Length bounds required by the assignment: first name 2-20, surname 2-30.
 * Declared once so the form, the storage guard and the outbound request guard
 * cannot drift apart.
 */
export const personNameLimits = {
  firstName: { minLength: 2, maxLength: 20 },
  lastName: { minLength: 2, maxLength: 30 },
} as const;

export function createPersonNameSchema({
  error,
  minLength,
  maxLength,
  optional = false,
}: {
  error: string;
  minLength: number;
  maxLength: number;
  optional?: boolean;
}) {
  return z
    .pipe(z.string(), z.transform(normalizePersonName))
    .check(
      z.refine(
        (value) =>
          (optional && value.length === 0) ||
          (characterCount(value) >= minLength &&
            characterCount(value) <= maxLength &&
            personNamePattern.test(value)),
        { message: error },
      ),
    );
}

// The assignment asks for a valid e-mail format and nothing more. RFC 2606
// reserved domains (example.com, *.test) are deliberately accepted: rejecting
// them is beyond the specification, the API is the authority on deliverability,
// and the rule can only ever produce false rejections during a demo.
export function createEmailSchema({
  invalid,
  tooLong,
}: {
  invalid: string;
  tooLong: string;
}) {
  const normalizedEmail = z
    .email(invalid)
    .check(z.refine(hasValidEmailSegmentLengths, { message: invalid }));

  return z.pipe(
    z.string().check(z.trim()).check(z.maxLength(254, tooLong)),
    z.pipe(normalizedEmail, z.transform(normalizeEmailDomain)),
  );
}
