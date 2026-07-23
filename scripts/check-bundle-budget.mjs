import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";

export const bundleGrowthAllowanceBytes = 25_600;

export function extractScriptSources(html) {
  return [
    ...new Set(
      [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/giu)]
        .map((match) => match[1])
        .filter(
          (source) => source?.includes("/_next/") && source.endsWith(".js"),
        ),
    ),
  ];
}

export function calculateRouteGzipBytes(html, readChunk) {
  return extractScriptSources(html).reduce((total, source) => {
    const chunk = readChunk(source);
    if (!chunk) {
      throw new Error(`Missing exported JavaScript chunk: ${source}`);
    }
    return total + gzipSync(chunk).length;
  }, 0);
}

export function assertBundleBudgets(
  actual,
  baseline,
  allowance = bundleGrowthAllowanceBytes,
) {
  const failures = [];

  for (const [route, baselineBytes] of Object.entries(baseline)) {
    const actualBytes = actual[route];
    if (actualBytes === undefined) {
      failures.push(`${route}: route is missing from the static export`);
      continue;
    }

    const growth = actualBytes - baselineBytes;
    if (growth > allowance) {
      failures.push(
        `${route}: grew by ${growth.toLocaleString("en-US")} bytes ` +
          `(limit ${allowance.toLocaleString("en-US")})`,
      );
    }
  }

  if (failures.length > 0) {
    throw new Error(`Route bundle budget exceeded:\n${failures.join("\n")}`);
  }
}

function listHtmlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory()
      ? listHtmlFiles(path)
      : entry.name.endsWith(".html")
        ? [path]
        : [];
  });
}

function routeFromHtmlPath(outputDirectory, htmlPath) {
  const outputRelativePath = relative(outputDirectory, htmlPath)
    .split(sep)
    .join("/");
  if (outputRelativePath === "index.html") {
    return "/";
  }
  if (outputRelativePath.endsWith("/index.html")) {
    return `/${outputRelativePath.slice(0, -"/index.html".length)}`;
  }
  return `/${outputRelativePath.slice(0, -".html".length)}`;
}

export function collectRouteBundleSizes(outputDirectory) {
  const sizes = {};

  for (const htmlPath of listHtmlFiles(outputDirectory)) {
    const route = routeFromHtmlPath(outputDirectory, htmlPath);
    if (sizes[route] !== undefined) {
      continue;
    }

    const html = readFileSync(htmlPath, "utf8");
    sizes[route] = calculateRouteGzipBytes(html, (source) => {
      const nextAssetIndex = source.indexOf("/_next/");
      if (nextAssetIndex === -1) {
        return undefined;
      }
      const assetPath = decodeURI(
        source.slice(nextAssetIndex + 1).split(/[?#]/u, 1)[0],
      );
      const chunkPath = join(outputDirectory, assetPath);
      return existsSync(chunkPath) ? readFileSync(chunkPath) : undefined;
    });
  }

  return Object.fromEntries(
    Object.entries(sizes).sort(([left], [right]) => left.localeCompare(right)),
  );
}

function run() {
  const scriptDirectory = dirname(fileURLToPath(import.meta.url));
  const projectDirectory = dirname(scriptDirectory);
  const outputDirectory = join(projectDirectory, "out");
  const baseline = JSON.parse(
    readFileSync(join(scriptDirectory, "route-bundle-baseline.json"), "utf8"),
  );
  const actual = collectRouteBundleSizes(outputDirectory);

  assertBundleBudgets(actual, baseline);
  for (const [route, bytes] of Object.entries(actual)) {
    const growth = bytes - (baseline[route] ?? bytes);
    console.log(`${route}\t${bytes}\t${growth >= 0 ? "+" : ""}${growth}`);
  }
  console.log(
    `Bundle budget passed (${bundleGrowthAllowanceBytes.toLocaleString("en-US")} byte allowance per route).`,
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  run();
}
