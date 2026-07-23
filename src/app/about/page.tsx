import type { Metadata } from "next";

import { ContentShell } from "@/components/layout/content-shell";
import { AboutContent } from "@/features/about/about-content";
import { createTranslator } from "@/i18n/instance";
import { createPageMetadata } from "@/lib/site";

const t = createTranslator("sk");

export const metadata: Metadata = createPageMetadata({
  locale: "sk",
  title: t("seo.aboutTitle"),
  description: t("seo.aboutDescription"),
  path: "about/",
});

export default function AboutPage() {
  return (
    <ContentShell>
      <AboutContent />
    </ContentShell>
  );
}
