export function parseAmountToCents(rawValue: string): number | null {
  const normalized = rawValue
    .trim()
    .replace(/[\s\u00a0€]/g, "")
    .replace(",", ".");

  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
    return null;
  }

  const [whole = "", fraction = ""] = normalized.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));

  return Number.isSafeInteger(cents) && cents > 0 ? cents : null;
}

export function formatAmountInput(amountCents: number): string {
  return Number.isSafeInteger(amountCents) && amountCents > 0
    ? (amountCents / 100).toString()
    : "";
}
