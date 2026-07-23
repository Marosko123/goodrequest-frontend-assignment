import type { ReactNode } from "react";

import { QueryProvider } from "@/app/query-provider";

export default function AboutLayout({ children }: { children: ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}
