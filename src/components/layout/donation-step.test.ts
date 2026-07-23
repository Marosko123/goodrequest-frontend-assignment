import { describe, expect, it } from "vitest";

import { getDonationStep } from "./donation-step";

describe("getDonationStep", () => {
  it.each([
    ["/", 1],
    ["/details", 2],
    ["/details/", 2],
    ["/en/details/", 2],
    ["/review/", 3],
    ["/en/review/", 3],
    ["/success/", 3],
    ["/en/success/", 3],
    ["/goodrequest-frontend-assignment", 1],
    ["/goodrequest-frontend-assignment/details/", 2],
    ["/goodrequest-frontend-assignment/en/details/", 2],
    ["/goodrequest-frontend-assignment/review/", 3],
    ["/goodrequest-frontend-assignment/success/", 3],
  ])("maps %s to donation step %i", (pathname, expectedStep) => {
    expect(getDonationStep(pathname)).toBe(expectedStep);
  });
});
