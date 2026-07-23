export type DonationStep = 1 | 2 | 3;

export function getDonationStep(pathname: string): DonationStep {
  const normalizedPath =
    pathname.split(/[?#]/, 1)[0]?.replace(/\/+$/, "") ?? "";
  const route = normalizedPath.split("/").filter(Boolean).at(-1);

  if (route === "details") {
    return 2;
  }

  if (route === "review" || route === "success") {
    return 3;
  }

  return 1;
}
