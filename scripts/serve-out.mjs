// Serves the `out/` export for the browser suite using the same server the
// performance harness uses, so both gates exercise one implementation.
import { resolve } from "node:path";

import {
  createStaticServer,
  prepareStaticAssets,
} from "./check-performance.mjs";

const outputDirectory = resolve(process.argv[2] ?? "out");
const port = Number(process.env.PLAYWRIGHT_PORT ?? process.env.PORT ?? 4173);

const server = createStaticServer({
  outputDirectory,
  exportBasePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
  preparedAssets: await prepareStaticAssets(outputDirectory),
});

server.listen(port, "127.0.0.1", () => {
  process.stdout.write(
    `Serving ${outputDirectory} on http://127.0.0.1:${port}/\n`,
  );
});
