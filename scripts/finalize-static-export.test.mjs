import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import { finalizeStaticExport } from "./finalize-static-export.mjs";

const localizedRoutes = [
  "index.html",
  "about/index.html",
  "contact/index.html",
  "details/index.html",
  "review/index.html",
  "success/index.html",
];

let outputDirectory;

async function createExport() {
  await writeFile(
    join(outputDirectory, "index.html"),
    '<!doctype html><html lang="sk"></html>',
  );

  for (const locale of ["en", "cz"]) {
    for (const route of localizedRoutes) {
      const filePath = join(outputDirectory, locale, route);
      await mkdir(dirname(filePath), { recursive: true });
      await writeFile(filePath, '<!doctype html><html lang="sk"></html>');
    }
  }
}

beforeEach(async () => {
  outputDirectory = await mkdtemp(join(tmpdir(), "goodrequest-export-"));
  await createExport();
});

afterEach(async () => {
  await rm(outputDirectory, { recursive: true, force: true });
});

describe("finalizeStaticExport", () => {
  it("sets every localized document language", async () => {
    await finalizeStaticExport(outputDirectory);

    await expect(
      readFile(join(outputDirectory, "en/index.html"), "utf8"),
    ).resolves.toContain('<html lang="en">');
    await expect(
      readFile(join(outputDirectory, "cz/about/index.html"), "utf8"),
    ).resolves.toContain('<html lang="cs">');
  });

  it("fails when an expected localized document is missing", async () => {
    await rm(join(outputDirectory, "en/review/index.html"));

    await expect(finalizeStaticExport(outputDirectory)).rejects.toThrow(
      "missing review/index.html",
    );
  });

  it("fails when the localized export contains an unexpected document", async () => {
    const filePath = join(outputDirectory, "cz/unexpected/index.html");
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, '<!doctype html><html lang="sk"></html>');

    await expect(finalizeStaticExport(outputDirectory)).rejects.toThrow(
      "unexpected unexpected/index.html",
    );
    await expect(
      readFile(join(outputDirectory, "en/index.html"), "utf8"),
    ).resolves.toContain('<html lang="sk">');
  });
});
