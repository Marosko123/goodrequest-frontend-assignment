import { cp, mkdtemp, readFile, readdir, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { extname, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";

import * as chromeLauncher from "chrome-launcher";
import lighthouse from "lighthouse";
import desktopConfig from "lighthouse/core/config/desktop-config.js";

const host = "127.0.0.1";
export const performancePort = 4175;
export const categories = [
  "performance",
  "accessibility",
  "best-practices",
  "seo",
];
const routes = [
  { name: "sk", path: "/" },
  { name: "en", path: "/en/" },
  { name: "cz", path: "/cz/" },
];
export const mobileConfig = undefined;

// Accessibility, best practices and SEO are deterministic audits: the artifact
// scores 100 on every run, so anything less is a real regression.
//
// Performance is not deterministic. Mobile Lighthouse simulates a 4x CPU
// slowdown on slow 4G, and the score moves a few points between runs on
// identical bytes. Demanding 100 there gates on hardware noise rather than on
// the application, so each profile carries the floor it can actually hold, plus
// the two field metrics the score can mask.
export const perfectScoreCategories = [
  "accessibility",
  "best-practices",
  "seo",
];
export const maxCumulativeLayoutShift = 0.1;

const profiles = [
  {
    name: "mobile",
    runs: 5,
    config: mobileConfig,
    minPerformance: 0.9,
    maxLcpMs: 3500,
  },
  {
    name: "desktop",
    runs: 3,
    config: desktopConfig,
    minPerformance: 0.98,
    maxLcpMs: 1500,
  },
];
export const chromeFlags = [
  "--headless=new",
  "--no-sandbox",
  "--disable-gpu",
  "--disable-extensions",
  "--disable-background-networking",
  "--disable-component-update",
  "--disable-default-apps",
  "--no-first-run",
  "--no-default-browser-check",
];

export const mimeTypes = {
  ".avif": "image/avif",
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
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

export const lighthouseMatrix = routes.flatMap((route) =>
  profiles.flatMap((profile) =>
    Array.from({ length: profile.runs }, (_, index) => ({
      route: route.name,
      profile: profile.name,
      run: index + 1,
    })),
  ),
);

export function reportFileName({ route, profile, run }) {
  return `${route}-${profile}-${run}.json`;
}

export async function snapshotStaticExport(source, destination) {
  await cp(resolve(source), resolve(destination), {
    recursive: true,
    errorOnExist: true,
  });
}

async function listStaticFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) => {
        const path = resolve(directory, entry.name);
        return entry.isDirectory() ? listStaticFiles(path) : [path];
      }),
    )
  ).flat();
}

export async function prepareStaticAssets(outputDirectory) {
  const files = await listStaticFiles(outputDirectory);
  return new Map(
    await Promise.all(
      files.map(async (filePath) => {
        const contents = await readFile(filePath);
        return [
          filePath,
          {
            contents,
            gzip: compressibleExtensions.has(extname(filePath))
              ? gzipSync(contents)
              : undefined,
          },
        ];
      }),
    ),
  );
}

function median(values) {
  const ordered = [...values].sort((left, right) => left - right);
  return ordered[Math.floor(ordered.length / 2)];
}

function getExportBasePath(html) {
  return /(?:href|src)="([^"']*?)\/_next\//u.exec(html)?.[1] ?? "";
}

export function resolveExportPathname(pathname, exportBasePath) {
  if (!exportBasePath) {
    return pathname;
  }
  if (pathname === exportBasePath) {
    return "/";
  }
  if (pathname.startsWith(`${exportBasePath}/`)) {
    return pathname.slice(exportBasePath.length);
  }
  return null;
}

export function createStaticServer({
  outputDirectory,
  exportBasePath,
  preparedAssets = new Map(),
}) {
  return createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url ?? "/", `http://${host}`);
      const requestedPathname = decodeURIComponent(requestUrl.pathname);
      const exportPathname = resolveExportPathname(
        requestedPathname,
        exportBasePath,
      );
      if (exportPathname === null) {
        response.writeHead(404).end("Not found");
        return;
      }
      let pathname = exportPathname;
      if (pathname.endsWith("/")) pathname += "index.html";
      // Pages redirects an extensionless path to its directory index; mirror it
      // so the suite does not fail on a URL the real host would resolve.
      else if (!extname(pathname)) pathname += "/index.html";

      const filePath = resolve(outputDirectory, `.${pathname}`);
      if (!filePath.startsWith(`${outputDirectory}${sep}`)) {
        response.writeHead(400).end("Bad request");
        return;
      }

      let prepared = preparedAssets.get(filePath);
      if (!prepared) {
        const contents = await readFile(filePath);
        prepared = {
          contents,
          gzip: compressibleExtensions.has(extname(filePath))
            ? gzipSync(contents)
            : undefined,
        };
        preparedAssets.set(filePath, prepared);
      }
      const extension = extname(filePath);
      const shouldCompress =
        compressibleExtensions.has(extension) &&
        request.headers["accept-encoding"]?.includes("gzip");
      const body =
        shouldCompress && prepared.gzip ? prepared.gzip : prepared.contents;
      response.writeHead(200, {
        "cache-control": pathname.startsWith("/_next/static/")
          ? "public, max-age=31536000, immutable"
          : "no-cache",
        "content-length": body.byteLength,
        "content-type": mimeTypes[extension] ?? "application/octet-stream",
        ...(shouldCompress
          ? { "content-encoding": "gzip", vary: "Accept-Encoding" }
          : {}),
      });
      response.end(request.method === "HEAD" ? undefined : body);
    } catch {
      // Pages serves 404.html for unknown routes, so the browser suite sees the
      // real localized not-found page instead of a bare status line.
      const notFound = await readFile(
        resolve(outputDirectory, "404.html"),
      ).catch(() => null);
      response.writeHead(404, {
        "content-type": notFound
          ? mimeTypes[".html"]
          : "text/plain; charset=utf-8",
      });
      response.end(
        request.method === "HEAD" ? undefined : (notFound ?? "Not found"),
      );
    }
  });
}

function getMetrics(result) {
  const { lhr } = result;
  return {
    performance: lhr.categories.performance.score ?? 0,
    accessibility: lhr.categories.accessibility.score ?? 0,
    "best-practices": lhr.categories["best-practices"].score ?? 0,
    seo: lhr.categories.seo.score ?? 0,
    lcp: lhr.audits["largest-contentful-paint"].numericValue ?? Infinity,
    tbt: lhr.audits["total-blocking-time"].numericValue ?? Infinity,
    cls: lhr.audits["cumulative-layout-shift"].numericValue ?? Infinity,
  };
}

export function assertPerformanceBudgets(route, profile, metrics) {
  const score = (value) => Math.round(value * 100);
  const failures = [
    ...perfectScoreCategories
      .filter((category) => metrics[category] !== 1)
      .map(
        (category) => `${category}=${score(metrics[category])}, expected 100`,
      ),
  ];

  if (metrics.performance < profile.minPerformance) {
    failures.push(
      `performance=${score(metrics.performance)}, floor ${score(profile.minPerformance)}`,
    );
  }

  if (metrics.lcp > profile.maxLcpMs) {
    failures.push(
      `LCP=${Math.round(metrics.lcp)}ms, budget ${profile.maxLcpMs}ms`,
    );
  }

  if (metrics.cls > maxCumulativeLayoutShift) {
    failures.push(
      `CLS=${metrics.cls.toFixed(3)}, budget ${maxCumulativeLayoutShift.toFixed(3)}`,
    );
  }

  if (failures.length > 0) {
    throw new Error(
      `${route.name} ${profile.name} median: ${failures.join("; ")}`,
    );
  }
}

export function assertLocalResourcesLoaded(result) {
  const failedRequests =
    result.lhr.audits["network-requests"].details?.items?.filter(
      (item) => typeof item.statusCode === "number" && item.statusCode >= 400,
    ) ?? [];

  if (failedRequests.length > 0) {
    throw new Error(
      `Local production resources failed: ${failedRequests
        .map((item) => `${item.statusCode} ${item.url}`)
        .join(", ")}`,
    );
  }
}

export async function runPerformanceCheck({
  outputDirectory = resolve("out"),
} = {}) {
  const reportDirectory = await mkdtemp(
    resolve(tmpdir(), "goodrequest-lighthouse-"),
  );
  const snapshotDirectory = resolve(reportDirectory, "export");
  await snapshotStaticExport(outputDirectory, snapshotDirectory);
  const exportHtml = await readFile(
    resolve(snapshotDirectory, "index.html"),
    "utf8",
  );
  const exportBasePath = getExportBasePath(exportHtml);
  const preparedAssets = await prepareStaticAssets(snapshotDirectory);
  const server = createStaticServer({
    outputDirectory: snapshotDirectory,
    exportBasePath,
    preparedAssets,
  });
  await new Promise((resolvePromise, reject) => {
    const handleError = (error) => reject(error);
    server.once("error", handleError);
    server.listen(performancePort, host, () => {
      server.off("error", handleError);
      resolvePromise();
    });
  });
  const auditOrigin = `http://${host}:${performancePort}`;

  const failures = [];
  try {
    console.log(`Lighthouse reports: ${reportDirectory}`);

    for (const route of routes) {
      for (const profile of profiles) {
        const runs = [];
        let chrome;
        try {
          chrome = await chromeLauncher.launch({
            chromeFlags,
          });
          for (let run = 0; run < profile.runs; run += 1) {
            try {
              const result = await lighthouse(
                `${auditOrigin}${exportBasePath}${route.path}`,
                {
                  logLevel: "error",
                  onlyCategories: categories,
                  output: "json",
                  port: chrome.port,
                },
                profile.config,
              );
              if (!result) {
                throw new Error("Lighthouse returned no result.");
              }
              if (result.lhr.runtimeError) {
                throw new Error(
                  `Lighthouse runtime error: ${result.lhr.runtimeError.message}`,
                );
              }

              assertLocalResourcesLoaded(result);
              if (typeof result.report === "string") {
                await writeFile(
                  resolve(
                    reportDirectory,
                    reportFileName({
                      route: route.name,
                      profile: profile.name,
                      run: run + 1,
                    }),
                  ),
                  result.report,
                );
              }

              const runMetrics = getMetrics(result);
              runs.push(runMetrics);
              console.log(
                `${route.name} ${profile.name} run ${run + 1}: ` +
                  `performance=${Math.round(runMetrics.performance * 100)}, ` +
                  `accessibility=${Math.round(runMetrics.accessibility * 100)}, ` +
                  `best-practices=${Math.round(runMetrics["best-practices"] * 100)}, ` +
                  `seo=${Math.round(runMetrics.seo * 100)}, ` +
                  `LCP=${Math.round(runMetrics.lcp)}ms`,
              );
            } catch (error) {
              const message =
                error instanceof Error ? error.message : String(error);
              failures.push(
                `${route.name} ${profile.name} run ${run + 1}: ${message}`,
              );
              console.error(
                `${route.name} ${profile.name} run ${run + 1}: failed (${message})`,
              );
            }
          }
        } finally {
          if (chrome) await chrome.kill();
        }

        if (runs.length !== profile.runs) {
          failures.push(
            `${route.name} ${profile.name}: completed ${runs.length}/${profile.runs} runs`,
          );
          continue;
        }

        const metrics = Object.fromEntries(
          Object.keys(runs[0]).map((key) => [
            key,
            median(runs.map((run) => run[key])),
          ]),
        );
        console.log(
          `${route.name} ${profile.name} median: ` +
            `performance=${Math.round(metrics.performance * 100)}, ` +
            `accessibility=${Math.round(metrics.accessibility * 100)}, ` +
            `best-practices=${Math.round(metrics["best-practices"] * 100)}, ` +
            `seo=${Math.round(metrics.seo * 100)}, ` +
            `LCP=${Math.round(metrics.lcp)}ms, ` +
            `TBT=${Math.round(metrics.tbt)}ms, CLS=${metrics.cls.toFixed(3)}`,
        );
        try {
          assertPerformanceBudgets(route, profile, metrics);
        } catch (error) {
          failures.push(error instanceof Error ? error.message : String(error));
        }
      }
    }

    if (failures.length > 0) {
      throw new Error(
        `Lighthouse matrix failed:\n${failures
          .map((failure) => `- ${failure}`)
          .join("\n")}`,
      );
    }
  } finally {
    await new Promise((resolvePromise, reject) =>
      server.close((error) => (error ? reject(error) : resolvePromise())),
    );
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await runPerformanceCheck();
}
