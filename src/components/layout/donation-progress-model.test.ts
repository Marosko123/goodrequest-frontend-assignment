import { describe, expect, it } from "vitest";

import {
  createDonationStepperItems,
  type DonationStepperLabels,
} from "./donation-progress-model";

const labels: DonationStepperLabels = {
  selection: "Shelter selection",
  details: "Personal details",
  review: "Confirmation",
};

describe("createDonationStepperItems", () => {
  it.each([
    ["sk", "/", "/details/"],
    ["en", "/en/", "/en/details/"],
    ["cz", "/cz/", "/cz/details/"],
  ] as const)(
    "creates localized backward targets for %s",
    (locale, selectionHref, detailsHref) => {
      const items = createDonationStepperItems({
        activeStatus: "current",
        confirmed: { selection: true, details: true },
        currentStep: 3,
        isSuccess: false,
        labels,
        locale,
      });

      expect(items.map((item) => item.status)).toEqual([
        "finished",
        "finished",
        "current",
      ]);
      expect(items[0]?.href).toBe(selectionHref);
      expect(items[1]?.href).toBe(detailsHref);
      expect(items[2]?.href).toBeUndefined();
    },
  );

  it("keeps unconfirmed previous steps waiting and non-interactive", () => {
    const items = createDonationStepperItems({
      activeStatus: "current",
      confirmed: { selection: false, details: false },
      currentStep: 2,
      isSuccess: false,
      labels,
      locale: "sk",
    });

    expect(items.map((item) => item.status)).toEqual([
      "wait",
      "current",
      "wait",
    ]);
    expect(items.every((item) => item.href === undefined)).toBe(true);
  });

  it("locks navigation while submission is in progress", () => {
    const items = createDonationStepperItems({
      activeStatus: "in-progress",
      confirmed: { selection: true, details: true },
      currentStep: 3,
      isSuccess: false,
      labels,
      locale: "sk",
    });

    expect(items.map((item) => item.status)).toEqual([
      "finished",
      "finished",
      "in-progress",
    ]);
    expect(items.every((item) => item.href === undefined)).toBe(true);
  });

  it("renders a successful flow as fully finished and non-interactive", () => {
    const items = createDonationStepperItems({
      activeStatus: "current",
      confirmed: { selection: false, details: false },
      currentStep: 3,
      isSuccess: true,
      labels,
      locale: "en",
    });

    expect(items.map((item) => item.status)).toEqual([
      "finished",
      "finished",
      "finished",
    ]);
    expect(items.every((item) => item.href === undefined)).toBe(true);
  });
});
