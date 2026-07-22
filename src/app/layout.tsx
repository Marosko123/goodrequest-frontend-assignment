import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@mantine/core/styles.css";
import "./globals.scss";

export const metadata: Metadata = {
  title: "GoodBoy – Pomoc útulkom",
  description: "Podporte nadáciu GoodBoy alebo konkrétny slovenský útulok.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="sk">
      <body>{children}</body>
    </html>
  );
}
