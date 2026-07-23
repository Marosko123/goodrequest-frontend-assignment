import { readFile, readdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const localizedRoutes = [
  "index.html",
  "about/index.html",
  "contact/index.html",
  "details/index.html",
  "review/index.html",
  "success/index.html",
];
const locales = [
  { directory: "en", language: "en" },
  { directory: "cz", language: "cs" },
];

async function listHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = resolve(directory, entry.name);
      return entry.isDirectory()
        ? listHtmlFiles(path)
        : entry.isFile() && entry.name.endsWith(".html")
          ? [path]
          : [];
    }),
  );

  return files.flat().sort();
}

function setDocumentLanguage(html, language, filePath) {
  const openingTags = html.match(/<html\b[^>]*>/gu) ?? [];
  if (openingTags.length !== 1) {
    throw new Error(
      `${filePath} must contain exactly one opening html element.`,
    );
  }

  const openingTag = openingTags[0];
  const languageAttributes = openingTag.match(/\slang=(?:"[^"]*"|'[^']*')/gu);
  if (languageAttributes?.length !== 1) {
    throw new Error(
      `${filePath} must contain exactly one html lang attribute.`,
    );
  }

  const localizedTag = openingTag.replace(
    /\slang=(?:"[^"]*"|'[^']*')/u,
    ` lang="${language}"`,
  );
  return html.replace(openingTag, localizedTag);
}

export async function finalizeStaticExport(outputDirectory = resolve("out")) {
  const rootDocumentPath = resolve(outputDirectory, "index.html");
  const rootDocument = await readFile(rootDocumentPath, "utf8");
  if (!/<html\b[^>]*\slang=(?:"sk"|'sk')[^>]*>/u.test(rootDocument)) {
    throw new Error(`${rootDocumentPath} must be the Slovak root document.`);
  }

  const localizedDocuments = [];
  for (const { directory, language } of locales) {
    const localeDirectory = resolve(outputDirectory, directory);
    const htmlFiles = await listHtmlFiles(localeDirectory);
    const relativeFiles = new Set(
      htmlFiles.map((filePath) => filePath.slice(localeDirectory.length + 1)),
    );

    for (const route of localizedRoutes) {
      if (!relativeFiles.has(route)) {
        throw new Error(`${localeDirectory} is missing ${route}.`);
      }
    }
    for (const route of relativeFiles) {
      if (!localizedRoutes.includes(route)) {
        throw new Error(`${localeDirectory} has unexpected ${route}.`);
      }
    }

    for (const filePath of htmlFiles) {
      const html = await readFile(filePath, "utf8");
      localizedDocuments.push([
        filePath,
        setDocumentLanguage(html, language, filePath),
      ]);
    }
  }

  for (const [filePath, html] of localizedDocuments) {
    await writeFile(filePath, html);
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await finalizeStaticExport(resolve(process.argv[2] ?? "out"));
  process.stdout.write("Finalized localized static documents.\n");
}
