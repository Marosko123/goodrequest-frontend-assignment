import { gzipSync } from "node:zlib";

import { describe, expect, it } from "vitest";

import {
  assertBundleBudgets,
  calculateRouteGzipBytes,
  extractScriptSources,
} from "./check-bundle-budget.mjs";

describe("route bundle budget", () => {
  it("counts each referenced JavaScript chunk only once", () => {
    const html = [
      '<script src="/_next/static/chunks/a.js"></script>',
      '<script src="/_next/static/chunks/a.js"></script>',
      '<script src="/_next/static/chunks/b.js"></script>',
    ].join("");
    const chunks = new Map([
      ["/_next/static/chunks/a.js", Buffer.from("alpha")],
      ["/_next/static/chunks/b.js", Buffer.from("beta")],
    ]);

    expect(extractScriptSources(html)).toEqual([
      "/_next/static/chunks/a.js",
      "/_next/static/chunks/b.js",
    ]);
    expect(calculateRouteGzipBytes(html, (source) => chunks.get(source))).toBe(
      gzipSync("alpha").length + gzipSync("beta").length,
    );
  });

  it("rejects only route growth above the 25,600 byte allowance", () => {
    expect(() =>
      assertBundleBudgets({ "/": 125_600 }, { "/": 100_000 }),
    ).not.toThrow();
    expect(() =>
      assertBundleBudgets({ "/": 125_601 }, { "/": 100_000 }),
    ).toThrow(/\/.*25,601 bytes/u);
  });
});
