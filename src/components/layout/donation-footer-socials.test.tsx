import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppFooter } from "./app-footer";
import { ContentShell } from "./content-shell";

let pathname = "/";

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
}));

const donationRoutes = [
  "/",
  "/details/",
  "/review/",
  "/success/",
  "/en/",
  "/en/details/",
  "/en/review/",
  "/en/success/",
  "/cz/",
  "/cz/details/",
  "/cz/review/",
  "/cz/success/",
  "/goodrequest-frontend-assignment/details/",
  "/goodrequest-frontend-assignment/review/",
  "/goodrequest-frontend-assignment/success/",
  "/goodrequest-frontend-assignment/en/details/",
  "/goodrequest-frontend-assignment/en/review/",
  "/goodrequest-frontend-assignment/en/success/",
  "/goodrequest-frontend-assignment/cz/details/",
  "/goodrequest-frontend-assignment/cz/review/",
  "/goodrequest-frontend-assignment/cz/success/",
];

describe("AppFooter social placement", () => {
  beforeEach(() => {
    pathname = "/";
  });

  it.each(donationRoutes)(
    "shows social links on donation route %s",
    (route) => {
      pathname = route;
      render(<AppFooter />);

      expect(screen.getByRole("link", { name: "Facebook" })).toBeVisible();
      expect(screen.getByRole("link", { name: "Instagram" })).toBeVisible();
    },
  );

  it.each(["/contact/", "/about/", "/en/contact/", "/cz/about/"])(
    "shows social links on content route %s",
    (route) => {
      pathname = route;
      render(<ContentShell>Content</ContentShell>);

      expect(screen.getByRole("link", { name: "Facebook" })).toBeVisible();
      expect(screen.getByRole("link", { name: "Instagram" })).toBeVisible();
    },
  );
});
