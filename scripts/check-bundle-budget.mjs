import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, relative, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";

// This is deliberately zero: snapshots are frozen after the final optimized
// export, while route-specific caps protect the routes being optimized now.
export const bundleGrowthAllowanceBytes = 0;
export const mobileCriticalTransferBudgetBytes = 310_000;

const locales = ["", "/en", "/cz"];
const localeRoutes = (suffix, budget) =>
  Object.fromEntries(
    locales.map((locale) => [`${locale}${suffix}` || "/", budget]),
  );

export const absoluteRouteGzipBudgets = {
  "/": 260_000,
  "/en": 260_000,
  "/cz": 260_000,
  ...localeRoutes("/details", 300_000),
  // Review dropped below the details tier once it stopped importing
  // libphonenumber metadata to insert three spaces into a validated E.164
  // number. The cap is tightened so the saving cannot be silently given back.
  ...localeRoutes("/review", 260_000),
  ...localeRoutes("/contact", 240_000),
  "/404": 220_000,
  "/_not-found": 220_000,
};

export const mobileCriticalRoutes = ["/", "/en", "/cz"];
const imageExtensions = new Set([
  ".avif",
  ".ico",
  ".jpeg",
  ".jpg",
  ".png",
  ".svg",
  ".webp",
]);
const compressibleAssetExtensions = new Set([".css", ".js", ".svg"]);

function stripQueryAndHash(source) {
  return source.split(/[?#]/u, 1)[0];
}

function readAttribute(tag, attribute) {
  const match = new RegExp(`\\b${attribute}\\s*=\\s*(["'])(.*?)\\1`, "iu").exec(
    tag,
  );
  return match?.[2];
}

function unique(sources) {
  return [...new Set(sources)];
}

function readRequiredAsset(source, readAsset, type) {
  const asset = readAsset(source);
  if (!asset) {
    throw new Error(`Missing exported ${type}: ${source}`);
  }
  return asset;
}

export function assetPathFromSource(source) {
  const assetSource = stripQueryAndHash(source);
  const nextAssetIndex = assetSource.indexOf("/_next/");
  if (nextAssetIndex !== -1) {
    return decodeURI(assetSource.slice(nextAssetIndex + 1));
  }

  const publicFontIndex = assetSource.indexOf("/fonts/");
  if (publicFontIndex !== -1) {
    return decodeURI(assetSource.slice(publicFontIndex + 1));
  }

  throw new Error(`Unsupported exported asset URL: ${source}`);
}

export function extractScriptSources(html) {
  return unique(
    [...html.matchAll(/<script\b[^>]*>/giu)]
      .filter((tag) => !/\bnomodule(?:\s|=|>|\/)/iu.test(tag[0]))
      .map((tag) => readAttribute(tag[0], "src"))
      .filter(
        (source) =>
          source?.includes("/_next/") &&
          stripQueryAndHash(source).endsWith(".js"),
      ),
  );
}

export function extractStylesheetSources(html) {
  return unique(
    [...html.matchAll(/<link\b[^>]*>/giu)]
      .filter((tag) =>
        readAttribute(tag[0], "rel")?.split(/\s+/u).includes("stylesheet"),
      )
      .map((tag) => readAttribute(tag[0], "href"))
      .filter(
        (source) =>
          source?.includes("/_next/") &&
          stripQueryAndHash(source).endsWith(".css"),
      ),
  );
}

/**
 * Matches an upper-bound viewport query in either the legacy `max-width:` form
 * or the Media Queries Level 4 range form the stylesheets use. Range operators
 * arrive HTML-escaped (`&lt;=`) because they live in a `media` attribute.
 */
function isNarrowViewportQuery(media) {
  const decoded = (media ?? "")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");

  return /\(\s*(?:max-width\s*:|width\s*<=?[^=])/iu.test(decoded);
}

export function extractMobileLcpAvifSource(html) {
  const tag = [...html.matchAll(/<link\b[^>]*>/giu)].find((match) => {
    const link = match[0];
    return (
      readAttribute(link, "rel")?.split(/\s+/u).includes("preload") &&
      readAttribute(link, "as") === "image" &&
      readAttribute(link, "type") === "image/avif" &&
      readAttribute(link, "fetchpriority") === "high" &&
      isNarrowViewportQuery(readAttribute(link, "media"))
    );
  });
  return tag ? readAttribute(tag[0], "href") : undefined;
}

export function extractEagerImageSources(html) {
  const hasMobileLcpPreload = Boolean(extractMobileLcpAvifSource(html));
  return unique(
    [...html.matchAll(/<img\b[^>]*>/giu)]
      .filter((tag) => readAttribute(tag[0], "loading") !== "lazy")
      .filter(
        (tag) =>
          !(
            hasMobileLcpPreload &&
            readAttribute(tag[0], "fetchpriority") === "high"
          ),
      )
      .map((tag) => readAttribute(tag[0], "src"))
      .filter((source) => source?.includes("/_next/")),
  );
}

export function extractStylesheetFontSources(stylesheetSource, stylesheet) {
  const stylesheetUrl = new URL(stylesheetSource, "https://bundle.local");
  return unique(
    [...stylesheet.matchAll(/url\(\s*(?:(["'])(.*?)\1|([^)"'\s]+))\s*\)/giu)]
      .map((match) => match[2] ?? match[3])
      .filter((source) => stripQueryAndHash(source ?? "").endsWith(".woff2"))
      .map((source) => new URL(source, stylesheetUrl).pathname),
  );
}

export function extractInlineFontSources(html) {
  return unique(
    [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/giu)].flatMap(
      (match) => extractStylesheetFontSources("/", match[1] ?? ""),
    ),
  );
}

function assetTransferBytes(source, asset) {
  return compressibleAssetExtensions.has(
    extname(stripQueryAndHash(source)).toLowerCase(),
  )
    ? gzipSync(asset).length
    : asset.byteLength;
}

export function calculateRouteGzipBytes(html, readChunk) {
  return extractScriptSources(html).reduce((total, source) => {
    const chunk = readRequiredAsset(source, readChunk, "JavaScript chunk");
    return total + gzipSync(chunk).length;
  }, 0);
}

// Mobile transfer before the idle prefetch is gzip HTML/CSS/JS plus every
// stylesheet font, the selected LCP AVIF, and any other eager HTML image.
// Low-priority script preloads are excluded because they are the idle-prefetch
// mechanism this budget intentionally stops before.
export function calculateMobileCriticalTransfer(html, readAsset) {
  const stylesheets = extractStylesheetSources(html).map((source) => ({
    source,
    contents: readRequiredAsset(source, readAsset, "CSS asset"),
  }));
  const css = stylesheets.reduce(
    (total, { contents }) => total + gzipSync(contents).length,
    0,
  );
  const js = calculateRouteGzipBytes(html, readAsset);
  const fonts = unique([
    ...stylesheets.flatMap(({ source, contents }) =>
      extractStylesheetFontSources(source, contents.toString("utf8")),
    ),
    ...extractInlineFontSources(html),
  ]).reduce(
    (total, source) =>
      total +
      assetTransferBytes(
        source,
        readRequiredAsset(source, readAsset, "font asset"),
      ),
    0,
  );
  const eagerImages = extractEagerImageSources(html).reduce(
    (total, source) =>
      total +
      assetTransferBytes(
        source,
        readRequiredAsset(source, readAsset, "eager image asset"),
      ),
    0,
  );
  const lcpAvifSource = extractMobileLcpAvifSource(html);
  if (!lcpAvifSource) {
    throw new Error("Missing high-priority mobile LCP AVIF preload");
  }
  const lcpAvif = readRequiredAsset(
    lcpAvifSource,
    readAsset,
    "mobile LCP AVIF asset",
  ).byteLength;
  const htmlBytes = gzipSync(html).length;

  return {
    html: htmlBytes,
    css,
    js,
    fonts,
    eagerImages,
    lcpAvif,
    total: htmlBytes + css + js + fonts + eagerImages + lcpAvif,
  };
}

export function assertBundleBudgets(
  actual,
  baseline,
  allowance = bundleGrowthAllowanceBytes,
) {
  const failures = [];

  for (const [route, cap] of Object.entries(absoluteRouteGzipBudgets)) {
    const actualBytes = actual[route];
    if (actualBytes === undefined) {
      failures.push(`${route}: route is missing from the static export`);
    } else if (actualBytes > cap) {
      failures.push(
        `${route}: ${actualBytes.toLocaleString("en-US")} bytes exceeds the ${cap.toLocaleString("en-US")} byte cap`,
      );
    }
  }

  for (const [route, baselineBytes] of Object.entries(baseline)) {
    if (absoluteRouteGzipBudgets[route] !== undefined) continue;
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

  for (const route of Object.keys(actual)) {
    if (
      absoluteRouteGzipBudgets[route] === undefined &&
      baseline[route] === undefined
    ) {
      failures.push(`${route}: route has no frozen baseline`);
    }
  }

  if (failures.length > 0) {
    throw new Error(`Route bundle budget exceeded:\n${failures.join("\n")}`);
  }
}

export function assertImageBudgets(actual, baseline) {
  const failures = [];
  for (const [path, actualBytes] of Object.entries(actual)) {
    const baselineBytes = baseline[path];
    if (baselineBytes === undefined) {
      failures.push(`${path}: image has no frozen baseline`);
      continue;
    }
    const growth = actualBytes - baselineBytes;
    if (growth > bundleGrowthAllowanceBytes) {
      failures.push(
        `${path}: grew by ${growth.toLocaleString("en-US")} bytes ` +
          `(limit ${bundleGrowthAllowanceBytes.toLocaleString("en-US")})`,
      );
    }
  }
  if (failures.length > 0) {
    throw new Error(`Image budget exceeded:\n${failures.join("\n")}`);
  }
}

export function assertMobileTransferBudgets(actual) {
  const failures = [];
  for (const route of mobileCriticalRoutes) {
    const measurement = actual[route];
    if (!measurement) {
      failures.push(`${route}: route is missing from the static export`);
    } else if (measurement.total > mobileCriticalTransferBudgetBytes) {
      failures.push(
        `${route}: ${measurement.total.toLocaleString("en-US")} bytes exceeds the ${mobileCriticalTransferBudgetBytes.toLocaleString("en-US")} byte cap`,
      );
    }
  }
  if (failures.length > 0) {
    throw new Error(
      `Mobile critical transfer budget exceeded:\n${failures.join("\n")}`,
    );
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

function listImageFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return listImageFiles(path);
    return imageExtensions.has(extname(entry.name).toLowerCase()) ? [path] : [];
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
      const chunkPath = join(outputDirectory, assetPathFromSource(source));
      return existsSync(chunkPath) ? readFileSync(chunkPath) : undefined;
    });
  }

  return Object.fromEntries(
    Object.entries(sizes).sort(([left], [right]) => left.localeCompare(right)),
  );
}

export function collectRouteMobileTransferSizes(outputDirectory) {
  const sizes = {};
  for (const htmlPath of listHtmlFiles(outputDirectory)) {
    const route = routeFromHtmlPath(outputDirectory, htmlPath);
    if (!mobileCriticalRoutes.includes(route)) continue;

    const html = readFileSync(htmlPath, "utf8");
    sizes[route] = calculateMobileCriticalTransfer(html, (source) => {
      const assetPath = assetPathFromSource(source);
      const assetPathOnDisk = join(outputDirectory, assetPath);
      return existsSync(assetPathOnDisk)
        ? readFileSync(assetPathOnDisk)
        : undefined;
    });
  }
  return sizes;
}

export function collectImageAssetSizes(projectDirectory) {
  const paths = ["public", "src/app", "src/assets"].flatMap((root) =>
    listImageFiles(join(projectDirectory, root)),
  );
  return Object.fromEntries(
    paths
      .map((path) => [
        relative(projectDirectory, path).split(sep).join("/"),
        statSync(path).size,
      ])
      .sort(([left], [right]) => left.localeCompare(right)),
  );
}

function run() {
  const scriptDirectory = dirname(fileURLToPath(import.meta.url));
  const projectDirectory = dirname(scriptDirectory);
  const outputDirectory = join(projectDirectory, "out");
  const baseline = JSON.parse(
    readFileSync(join(scriptDirectory, "route-bundle-baseline.json"), "utf8"),
  );
  const imageBaseline = JSON.parse(
    readFileSync(join(scriptDirectory, "image-asset-baseline.json"), "utf8"),
  );
  const actual = collectRouteBundleSizes(outputDirectory);
  const mobileTransfer = collectRouteMobileTransferSizes(outputDirectory);
  const images = collectImageAssetSizes(projectDirectory);

  assertBundleBudgets(actual, baseline);
  assertMobileTransferBudgets(mobileTransfer);
  assertImageBudgets(images, imageBaseline);
  for (const [route, bytes] of Object.entries(actual)) {
    const growth = bytes - (baseline[route] ?? bytes);
    console.log(`${route}\t${bytes}\t${growth >= 0 ? "+" : ""}${growth}`);
  }
  console.log(
    `Bundle budget passed (absolute caps plus ${bundleGrowthAllowanceBytes.toLocaleString("en-US")} byte baseline allowance).`,
  );
  for (const [route, measurement] of Object.entries(mobileTransfer)) {
    console.log(
      `${route}\tmobile-critical=${measurement.total}\thtml=${measurement.html}\tcss=${measurement.css}\tjs=${measurement.js}\tfonts=${measurement.fonts}\teager-images=${measurement.eagerImages}\tlcp-avif=${measurement.lcpAvif}`,
    );
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  run();
}
