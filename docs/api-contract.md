# API contract

Source: [GoodRequest Frontend Assignment API](https://frontend-assignment-api.goodrequest.dev/apidoc/), OpenAPI 3.1.0, API version `1.0.6`.

The browser calls `https://frontend-assignment-api.goodrequest.dev` directly. Both live GET operations return `Access-Control-Allow-Origin: *`; the application therefore does not add a proxy or a server runtime.

## Operations

### Shelters

`GET /api/v1/shelters/`

```ts
type SheltersResponse = {
  shelters?: Array<{ id: number; name: string }>;
};
```

The missing optional `shelters` property is normalized to an empty array. Invalid items or duplicate IDs are treated as contract errors rather than silently accepted.

### Results

`GET /api/v1/shelters/results`

```ts
type ResultsResponse = {
  contributors: number;
  contribution: number | null;
};
```

The API exposes a contributor count, not a donor list. The UI must not invent donor identities.

### Contribution

`POST /api/v1/shelters/contribute`

```ts
type ContributionRequest = {
  contributors: Array<{
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
  }>;
  shelterID?: number | null;
  value: number;
};

type ContributionResponse = {
  messages: Array<{
    message: string;
    type: "ERROR" | "WARNING" | "INFO" | "SUCCESS";
  }>;
};
```

The assignment makes first name optional, while the API requires the `firstName` key. An omitted first name is therefore mapped to an empty string. `shelterID` is omitted for a foundation contribution. The required Slovak or Czech phone is always sent in E.164 format. The local wire guard accepts exactly one contributor, integer shelter IDs and contribution values with at most cent precision up to €1,000,000.

## Runtime policy

- Every response is parsed as JSON and validated with Zod before reaching feature code.
- A non-2xx response, invalid JSON, HTML response, or schema drift becomes a typed application error.
- GET queries may retry once for network and 5xx failures. POST never retries automatically.
- Submission has a synchronous in-flight lock. Timeout or connection loss after dispatch is reported as an unknown outcome; the UI never claims success or retries silently.
- No personal data is written to storage, logs, query keys, URLs, analytics, or error telemetry.
