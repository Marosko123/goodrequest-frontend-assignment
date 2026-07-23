import type { Metadata } from "next";

import { ContentShell } from "@/components/layout/content-shell";
import { AboutContent } from "@/features/about/about-content";
import { createTranslator } from "@/i18n/instance";
import { createPageMetadata } from "@/lib/site";

const t = createTranslator("cz");

export const metadata: Metadata = createPageMetadata({
  locale: "cz",
  title: t("seo.aboutTitle"),
  description: t("seo.aboutDescription"),
  path: "about/",
});

export default function CzechAboutPage() {
  return (
    <ContentShell>
      <AboutContent />
    </ContentShell>
  );
}
