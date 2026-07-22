import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { server } from "@/test/server";

import { ResultsStats } from "./results-stats";

const resultsUrl =
  "https://frontend-assignment-api.goodrequest.dev/api/v1/shelters/results";

function renderStats(children: ReactNode = <ResultsStats />) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retryDelay: 0 } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
  );
}

describe("ResultsStats", () => {
  it("renders live contribution and contributor totals", async () => {
    server.use(
      http.get(resultsUrl, () =>
        HttpResponse.json({ contributors: 1_028, contribution: 12_200 }),
      ),
    );

    renderStats();

    expect(await screen.findByText("12 200,00 €")).toBeVisible();
    expect(screen.getByText("1 028")).toBeVisible();
    expect(screen.getByText("Celková vyzbieraná hodnota")).toBeVisible();
  });

  it("shows a recoverable error instead of hardcoded live values", async () => {
    let succeeds = false;
    server.use(
      http.get(resultsUrl, () =>
        succeeds
          ? HttpResponse.json({ contributors: 8, contribution: 75 })
          : HttpResponse.json({}, { status: 400 }),
      ),
    );
    renderStats();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Štatistiky sa nepodarilo načítať",
    );
    succeeds = true;
    await userEvent.click(screen.getByRole("button", { name: "Skúsiť znova" }));

    expect(await screen.findByText("75,00 €")).toBeVisible();
    expect(screen.getByText("8")).toBeVisible();
  });
});
