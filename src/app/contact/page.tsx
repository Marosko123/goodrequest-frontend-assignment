import type { Metadata } from "next";

import { ContentShell } from "@/components/layout/content-shell";
import { ContactContent } from "@/features/contact/contact-content";

export const metadata: Metadata = {
  title: "Kontakt | GoodBoy",
  description: "Kontaktné údaje tímu GoodRequest v Žiline.",
};

export default function ContactPage() {
  return (
    <ContentShell>
      <ContactContent />
    </ContentShell>
  );
}
