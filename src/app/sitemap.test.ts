import { describe, expect, it } from "vitest";

import robots from "./robots";
import sitemap from "./sitemap";

describe("localized discovery metadata", () => {
  it("publishes every locale URL with reciprocal language alternates", () => {
    const entries = sitemap();
    expect(entries).toHaveLength(9);
    expect(entries.map((entry) => entry.url)).toEqual(
      expect.arrayContaining([
        "https://marosko123.github.io/goodrequest-frontend-assignment/",
        "https://marosko123.github.io/goodrequest-frontend-assignment/en/",
        "https://marosko123.github.io/goodrequest-frontend-assignment/cz/",
        "https://marosko123.github.io/goodrequest-frontend-assignment/about/",
        "https://marosko123.github.io/goodrequest-frontend-assignment/en/about/",
        "https://marosko123.github.io/goodrequest-frontend-assignment/cz/about/",
      ]),
    );
    expect(entries[0]?.alternates?.languages).toMatchObject({
      "sk-SK": "https://marosko123.github.io/goodrequest-frontend-assignment/",
      en: "https://marosko123.github.io/goodrequest-frontend-assignment/en/",
      "cs-CZ":
        "https://marosko123.github.io/goodrequest-frontend-assignment/cz/",
    });
  });

  it("keeps every localized form-only route out of indexing", () => {
    expect(robots().rules).toMatchObject({
      disallow: expect.arrayContaining([
        "/goodrequest-frontend-assignment/details/",
        "/goodrequest-frontend-assignment/en/details/",
        "/goodrequest-frontend-assignment/en/review/",
        "/goodrequest-frontend-assignment/en/success/",
        "/goodrequest-frontend-assignment/cz/details/",
        "/goodrequest-frontend-assignment/cz/review/",
        "/goodrequest-frontend-assignment/cz/success/",
      ]),
    });
  });
});
