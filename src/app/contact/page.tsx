import type { Metadata } from "next";

import { ContentShell } from "@/components/layout/content-shell";
import { ContactContent } from "@/features/contact/contact-content";
import { createPageMetadata } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "Kontakt",
  description: "Kontaktné údaje tímu GoodRequest v Žiline.",
  path: "contact/",
});

export default function ContactPage() {
  return (
    <ContentShell>
      <ContactContent />
    </ContentShell>
  );
}
