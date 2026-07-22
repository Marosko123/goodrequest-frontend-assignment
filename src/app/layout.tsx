import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@fontsource-variable/inter";
import "@mantine/core/styles.css";
import "./globals.scss";

import { siteUrl } from "@/lib/site";

import { AppProviders } from "./providers";

const productionContentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "img-src 'self' data:",
  "connect-src 'self' https://frontend-assignment-api.goodrequest.dev",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GoodBoy – Pomoc útulkom",
    template: "%s | GoodBoy",
  },
  description: "Podporte nadáciu GoodBoy alebo konkrétny slovenský útulok.",
  applicationName: "GoodBoy",
  authors: [{ name: "GoodBoy" }],
  openGraph: {
    type: "website",
    locale: "sk_SK",
    siteName: "GoodBoy",
    title: "GoodBoy – Pomoc útulkom",
    description: "Podporte nadáciu GoodBoy alebo konkrétny slovenský útulok.",
    url: "./",
    images: [
      {
        url: "og-image.png",
        width: 1200,
        height: 630,
        alt: "GoodBoy – pomoc psom a útulkom",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GoodBoy – Pomoc útulkom",
    description: "Podporte nadáciu GoodBoy alebo konkrétny slovenský útulok.",
    images: ["og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html data-scroll-behavior="smooth" lang="sk">
      {process.env.NODE_ENV === "production" ? (
        <head>
          <meta
            content={productionContentSecurityPolicy}
            httpEquiv="Content-Security-Policy"
          />
        </head>
      ) : null}
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
