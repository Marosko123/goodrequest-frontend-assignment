import type { Metadata } from "next";

import { ContentShell } from "@/components/layout/content-shell";
import { AboutContent } from "@/features/about/about-content";

export const metadata: Metadata = {
  title: "O projekte | GoodBoy",
  description: "Poslanie nadácie Good Boy a jej aktuálne výsledky.",
};

export default function AboutPage() {
  return (
    <ContentShell>
      <AboutContent />
    </ContentShell>
  );
}
