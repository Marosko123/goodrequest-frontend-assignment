import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { server } from "@/test/server";

import {
  ApiError,
  getResults,
  getShelters,
  submitContribution,
} from "./client";

const apiBase = "https://frontend-assignment-api.goodrequest.dev";

describe("assignment API client", () => {
  it("returns a validated shelter list", async () => {
    server.use(
      http.get(`${apiBase}/api/v1/shelters/`, () =>
        HttpResponse.json({
          shelters: [
            { id: 1, name: "Žilinský útulok o.z." },
            { id: 2, name: "Trenčiansky Útulok" },
          ],
        }),
      ),
    );

    await expect(getShelters()).resolves.toEqual([
      { id: 1, name: "Žilinský útulok o.z." },
      { id: 2, name: "Trenčiansky Útulok" },
    ]);
  });

  it("rejects duplicate shelter IDs as contract drift", async () => {
    server.use(
      http.get(`${apiBase}/api/v1/shelters/`, () =>
        HttpResponse.json({
          shelters: [
            { id: 1, name: "Prvý útulok" },
            { id: 1, name: "Druhý útulok" },
          ],
        }),
      ),
    );

    await expect(getShelters()).rejects.toMatchObject({
      kind: "contract",
    } satisfies Partial<ApiError>);
  });

  it("normalizes a nullable contribution to zero cents", async () => {
    server.use(
      http.get(`${apiBase}/api/v1/shelters/results`, () =>
        HttpResponse.json({ contributors: 7, contribution: null }),
      ),
    );

    await expect(getResults()).resolves.toEqual({
      contributors: 7,
      contributionCents: 0,
    });
  });

  it("sends and validates a contribution", async () => {
    let receivedBody: unknown;
    server.use(
      http.post(
        `${apiBase}/api/v1/shelters/contribute`,
        async ({ request }) => {
          receivedBody = await request.json();
          return HttpResponse.json({
            messages: [
              { message: "Príspevok bol úspešne zaznamenaný", type: "SUCCESS" },
            ],
          });
        },
      ),
    );

    const request = {
      contributors: [
        { firstName: "", lastName: "Nováková", email: "jana@example.sk" },
      ],
      value: 10,
    };

    await expect(submitContribution(request)).resolves.toEqual({
      messages: [
        { message: "Príspevok bol úspešne zaznamenaný", type: "SUCCESS" },
      ],
    });
    expect(receivedBody).toEqual(request);
  });

  it("preserves an HTTP status without exposing the response body", async () => {
    server.use(
      http.get(`${apiBase}/api/v1/shelters/results`, () =>
        HttpResponse.json({ internal: "do not expose" }, { status: 503 }),
      ),
    );

    await expect(getResults()).rejects.toMatchObject({
      kind: "http",
      status: 503,
    } satisfies Partial<ApiError>);
  });
});
