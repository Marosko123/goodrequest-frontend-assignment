import type { Metadata } from "next";

import { ContentShell } from "@/components/layout/content-shell";
import { AboutContent } from "@/features/about/about-content";
import { createPageMetadata } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "O projekte",
  description: "Poslanie nadácie Good Boy a jej aktuálne výsledky.",
  path: "about/",
});

export default function AboutPage() {
  return (
    <ContentShell>
      <AboutContent />
    </ContentShell>
  );
}
