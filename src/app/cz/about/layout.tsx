import type { ReactNode } from "react";

import { QueryProvider } from "@/app/query-provider";

export default function CzechAboutLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <QueryProvider>{children}</QueryProvider>;
}
