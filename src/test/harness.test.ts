import { describe, expect, it } from "vitest";

describe("test harness", () => {
  it("runs with the browser-like environment", () => {
    expect(document.documentElement).toBeInstanceOf(HTMLHtmlElement);
  });
});
