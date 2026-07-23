import type { ReactNode } from "react";

import { QueryProvider } from "@/app/query-provider";

export default function EnglishAboutLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <QueryProvider>{children}</QueryProvider>;
}
