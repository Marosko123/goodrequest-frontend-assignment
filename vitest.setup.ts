import "@testing-library/jest-dom/vitest";
import "jest-styled-components/vitest";

import i18next from "i18next";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";
import { initReactI18next } from "react-i18next";

import { getI18nOptions } from "@/i18n/instance";
import { server } from "@/test/server";

i18next.use(initReactI18next);
void i18next.init(getI18nOptions("sk"));

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  }),
});

class ResizeObserverStub implements ResizeObserver {
  disconnect() {}
  observe() {}
  unobserve() {}
}

globalThis.ResizeObserver = ResizeObserverStub;
Element.prototype.scrollIntoView = () => undefined;

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
  sessionStorage.clear();
  void i18next.changeLanguage("sk");
});
afterAll(() => server.close());
