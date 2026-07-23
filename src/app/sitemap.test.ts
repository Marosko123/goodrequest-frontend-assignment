import { describe, expect, it } from "vitest";

import robots from "./robots";
import sitemap from "./sitemap";

describe("localized discovery metadata", () => {
  it("publishes both locale URLs with reciprocal language alternates", () => {
    const entries = sitemap();
    expect(entries).toHaveLength(6);
    expect(entries.map((entry) => entry.url)).toEqual(
      expect.arrayContaining([
        "https://marosko123.github.io/goodrequest-frontend-assignment/",
        "https://marosko123.github.io/goodrequest-frontend-assignment/en/",
        "https://marosko123.github.io/goodrequest-frontend-assignment/about/",
        "https://marosko123.github.io/goodrequest-frontend-assignment/en/about/",
      ]),
    );
    expect(entries[0]?.alternates?.languages).toMatchObject({
      "sk-SK": "https://marosko123.github.io/goodrequest-frontend-assignment/",
      en: "https://marosko123.github.io/goodrequest-frontend-assignment/en/",
    });
  });

  it("keeps every localized form-only route out of indexing", () => {
    expect(robots().rules).toMatchObject({
      disallow: expect.arrayContaining([
        "/goodrequest-frontend-assignment/details/",
        "/goodrequest-frontend-assignment/en/details/",
        "/goodrequest-frontend-assignment/en/review/",
        "/goodrequest-frontend-assignment/en/success/",
      ]),
    });
  });
});
