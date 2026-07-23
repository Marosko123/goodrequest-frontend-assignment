import { describe, expect, it } from "vitest";

import { resolveExportPathname } from "./check-performance.mjs";

describe("resolveExportPathname", () => {
  it("serves only URLs inside a configured export base path", () => {
    expect(
      resolveExportPathname(
        "/goodrequest-frontend-assignment",
        "/goodrequest-frontend-assignment",
      ),
    ).toBe("/");
    expect(
      resolveExportPathname(
        "/goodrequest-frontend-assignment/en/",
        "/goodrequest-frontend-assignment",
      ),
    ).toBe("/en/");
    expect(
      resolveExportPathname(
        "/_next/static/chunk.js",
        "/goodrequest-frontend-assignment",
      ),
    ).toBeNull();
    expect(
      resolveExportPathname("/", "/goodrequest-frontend-assignment"),
    ).toBeNull();
  });

  it("keeps root exports available without a base path", () => {
    expect(resolveExportPathname("/en/", "")).toBe("/en/");
  });
});
