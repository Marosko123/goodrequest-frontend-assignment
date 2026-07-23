import type { Metadata } from "next";

import { ContentShell } from "@/components/layout/content-shell";
import { ContactContent } from "@/features/contact/contact-content";
import { createTranslator } from "@/i18n/instance";
import { createPageMetadata } from "@/lib/site";

const t = createTranslator("sk");

export const metadata: Metadata = createPageMetadata({
  locale: "sk",
  title: t("seo.contactTitle"),
  description: t("seo.contactDescription"),
  path: "contact/",
});

export default function ContactPage() {
  return (
    <ContentShell>
      <ContactContent />
    </ContentShell>
  );
}
