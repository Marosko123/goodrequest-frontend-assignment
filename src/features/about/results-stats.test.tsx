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
  const view = render(
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
  );
  return { ...view, queryClient };
}

describe("ResultsStats", () => {
  it("renders live contribution and contributor totals", async () => {
    server.use(
      http.get(resultsUrl, () =>
        HttpResponse.json({ contributors: 1_028, contribution: 12_200 }),
      ),
    );

    renderStats();

    expect(await screen.findByText("12 200 €")).toBeVisible();
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

    expect(await screen.findByText("75 €")).toBeVisible();
    expect(screen.getByText("8")).toBeVisible();
  });

  it("keeps the last successful values when a background refresh fails", async () => {
    let response: "initial" | "error" | "updated" = "initial";
    server.use(
      http.get(resultsUrl, () => {
        if (response === "error") {
          return HttpResponse.json({}, { status: 400 });
        }

        return HttpResponse.json(
          response === "updated"
            ? { contributors: 9, contribution: 80 }
            : { contributors: 8, contribution: 75 },
        );
      }),
    );
    const { queryClient } = renderStats();

    expect(await screen.findByText("75 €")).toBeVisible();
    response = "error";
    await queryClient.refetchQueries({ queryKey: ["results"] });

    expect(screen.getByText("75 €")).toBeVisible();
    expect(screen.getByText("8")).toBeVisible();
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Štatistiky sa nepodarilo aktualizovať",
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Zobrazujeme posledné úspešne načítané hodnoty.",
    );

    response = "updated";
    await userEvent.click(screen.getByRole("button", { name: "Skúsiť znova" }));

    expect(await screen.findByText("80 €")).toBeVisible();
    expect(screen.getByText("9")).toBeVisible();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
