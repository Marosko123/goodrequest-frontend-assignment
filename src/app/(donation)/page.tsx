import type { Metadata } from "next";

import { SelectionPage } from "@/features/selection/selection-page";
import { createTranslator } from "@/i18n/instance";
import { createPageMetadata } from "@/lib/site";

const t = createTranslator("sk");

export const metadata: Metadata = createPageMetadata({
  locale: "sk",
  title: t("seo.homeTitle"),
  description: t("seo.homeDescription"),
  path: "./",
});

export default function HomePage() {
  return <SelectionPage />;
}
