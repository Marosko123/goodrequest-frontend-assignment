import type { Metadata } from "next";
import type { ReactNode } from "react";

import { createTranslator } from "@/i18n/instance";
import { getSocialImageUrl, siteUrl } from "@/lib/site";
import { interFontFaceCss } from "@/styles/inter-font";
import { GlobalStyles } from "@/styles/global-styles";

import { AppProviders } from "./providers";
import { StyledComponentsRegistry } from "./styled-components-registry";

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

const t = createTranslator("sk");
const defaultSocialImageUrl = getSocialImageUrl("sk");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: t("seo.siteTitle"),
    template: "%s | GoodBoy",
  },
  description: t("seo.siteDescription"),
  applicationName: "GoodBoy",
  authors: [{ name: "GoodBoy" }],
  openGraph: {
    type: "website",
    locale: "sk_SK",
    siteName: "GoodBoy",
    title: t("seo.siteTitle"),
    description: t("seo.siteDescription"),
    url: "./",
    images: [
      {
        url: defaultSocialImageUrl,
        width: 1200,
        height: 630,
        type: "image/png",
        alt: t("seo.imageAlt"),
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: t("seo.siteTitle"),
    description: t("seo.siteDescription"),
    images: [defaultSocialImageUrl],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html data-scroll-behavior="smooth" lang="sk" suppressHydrationWarning>
      <head>
        <style
          dangerouslySetInnerHTML={{ __html: interFontFaceCss }}
          id="inter-font-face"
        />
        {process.env.NODE_ENV === "production" ? (
          <meta
            content={productionContentSecurityPolicy}
            httpEquiv="Content-Security-Policy"
          />
        ) : null}
        <script
          dangerouslySetInnerHTML={{
            __html:
              'document.documentElement.lang=/(?:^|\\/)cz(?:\\/|$)/.test(location.pathname)?"cs":/(?:^|\\/)en(?:\\/|$)/.test(location.pathname)?"en":"sk";',
          }}
          id="document-locale"
        />
      </head>
      <body>
        <GlobalStyles />
        <StyledComponentsRegistry>
          <AppProviders>{children}</AppProviders>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
