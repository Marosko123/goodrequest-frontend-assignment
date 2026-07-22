import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import { gzipSync } from "node:zlib";

import * as chromeLauncher from "chrome-launcher";
import lighthouse from "lighthouse";
import desktopConfig from "lighthouse/core/config/desktop-config.js";

const host = "127.0.0.1";
const port = 4175;
const outputDirectory = resolve("out");
const categories = ["performance", "accessibility", "best-practices", "seo"];
const profiles = [
  { name: "mobile", performance: 0.9, runs: 5, config: undefined },
  { name: "desktop", performance: 0.95, runs: 3, config: desktopConfig },
];
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8",
};
const compressibleExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".svg",
  ".txt",
  ".xml",
]);

function median(values) {
  const ordered = [...values].sort((left, right) => left - right);
  return ordered[Math.floor(ordered.length / 2)];
}

function createStaticServer() {
  return createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url ?? "/", `http://${host}:${port}`);
      let pathname = decodeURIComponent(requestUrl.pathname);
      if (pathname.endsWith("/")) pathname += "index.html";

      const filePath = resolve(outputDirectory, `.${pathname}`);
      if (!filePath.startsWith(`${outputDirectory}${sep}`)) {
        response.writeHead(400).end("Bad request");
        return;
      }

      const contents = await readFile(filePath);
      const extension = extname(filePath);
      const shouldCompress =
        compressibleExtensions.has(extension) &&
        request.headers["accept-encoding"]?.includes("gzip");
      const body = shouldCompress ? gzipSync(contents) : contents;
      const headers = {
        "cache-control": pathname.startsWith("/_next/static/")
          ? "public, max-age=31536000, immutable"
          : "no-cache",
        "content-length": body.byteLength,
        "content-type": mimeTypes[extension] ?? "application/octet-stream",
        ...(shouldCompress
          ? { "content-encoding": "gzip", vary: "Accept-Encoding" }
          : {}),
      };
      response.writeHead(200, headers);
      response.end(request.method === "HEAD" ? undefined : body);
    } catch {
      response.writeHead(404).end("Not found");
    }
  });
}

function getMetrics(result) {
  const { lhr } = result;
  return {
    performance: lhr.categories.performance.score ?? 0,
    accessibility: lhr.categories.accessibility.score ?? 0,
    bestPractices: lhr.categories["best-practices"].score ?? 0,
    seo: lhr.categories.seo.score ?? 0,
    lcp: lhr.audits["largest-contentful-paint"].numericValue ?? Infinity,
    tbt: lhr.audits["total-blocking-time"].numericValue ?? Infinity,
    cls: lhr.audits["cumulative-layout-shift"].numericValue ?? Infinity,
  };
}

function assertBudget(profile, metrics) {
  const failures = [];
  if (metrics.performance < profile.performance) {
    failures.push(
      `performance ${metrics.performance} < ${profile.performance}`,
    );
  }
  if (metrics.accessibility < 1) failures.push("accessibility < 1");
  if (metrics.bestPractices < 0.95) failures.push("best-practices < 0.95");
  if (metrics.seo < 1) failures.push("seo < 1");
  if (metrics.lcp > 2_500) failures.push(`LCP ${metrics.lcp}ms > 2500ms`);
  if (metrics.tbt > 200) failures.push(`TBT ${metrics.tbt}ms > 200ms`);
  if (metrics.cls > 0.1) failures.push(`CLS ${metrics.cls} > 0.1`);

  if (failures.length > 0) {
    throw new Error(`${profile.name} budget failed: ${failures.join(", ")}`);
  }
}

const server = createStaticServer();
await new Promise((resolvePromise) =>
  server.listen(port, host, resolvePromise),
);
const chrome = await chromeLauncher.launch({
  chromeFlags: ["--headless=new", "--no-sandbox", "--disable-gpu"],
});

try {
  for (const profile of profiles) {
    const runs = [];
    for (let run = 0; run < profile.runs; run += 1) {
      const result = await lighthouse(
        `http://${host}:${port}/`,
        {
          logLevel: "error",
          onlyCategories: categories,
          output: "json",
          port: chrome.port,
        },
        profile.config,
      );
      if (!result)
        throw new Error(`Lighthouse did not return ${profile.name} results.`);
      if (result.lhr.runtimeError) {
        throw new Error(
          `${profile.name} Lighthouse runtime error: ${result.lhr.runtimeError.message}`,
        );
      }
      const runMetrics = getMetrics(result);
      runs.push(runMetrics);
      console.log(
        `${profile.name} run ${run + 1}: performance=${Math.round(runMetrics.performance * 100)}, ` +
          `LCP=${Math.round(runMetrics.lcp)}ms`,
      );
    }

    const metrics = Object.fromEntries(
      Object.keys(runs[0]).map((key) => [
        key,
        median(runs.map((run) => run[key])),
      ]),
    );
    console.log(
      `${profile.name}: performance=${Math.round(metrics.performance * 100)}, ` +
        `accessibility=${Math.round(metrics.accessibility * 100)}, ` +
        `best-practices=${Math.round(metrics.bestPractices * 100)}, ` +
        `seo=${Math.round(metrics.seo * 100)}, LCP=${Math.round(metrics.lcp)}ms, ` +
        `TBT=${Math.round(metrics.tbt)}ms, CLS=${metrics.cls.toFixed(3)}`,
    );
    assertBudget(profile, metrics);
  }
} finally {
  await chrome.kill();
  await new Promise((resolvePromise, reject) =>
    server.close((error) => (error ? reject(error) : resolvePromise())),
  );
}
