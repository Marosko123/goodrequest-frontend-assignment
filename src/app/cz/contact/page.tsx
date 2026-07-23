import type { Metadata } from "next";

import { ContentShell } from "@/components/layout/content-shell";
import { ContactContent } from "@/features/contact/contact-content";
import { createTranslator } from "@/i18n/instance";
import { createPageMetadata } from "@/lib/site";

const t = createTranslator("cz");

export const metadata: Metadata = createPageMetadata({
  locale: "cz",
  title: t("seo.contactTitle"),
  description: t("seo.contactDescription"),
  path: "contact/",
});

export default function CzechContactPage() {
  return (
    <ContentShell>
      <ContactContent />
    </ContentShell>
  );
}
