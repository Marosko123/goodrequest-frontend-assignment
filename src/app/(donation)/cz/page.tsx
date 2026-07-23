import type { Metadata } from "next";

import { SelectionPage } from "@/features/selection/selection-page";
import { createTranslator } from "@/i18n/instance";
import { createPageMetadata } from "@/lib/site";

const t = createTranslator("cz");

export const metadata: Metadata = createPageMetadata({
  locale: "cz",
  title: t("seo.homeTitle"),
  description: t("seo.homeDescription"),
  path: "./",
});

export default function CzechHomePage() {
  return <SelectionPage />;
}
