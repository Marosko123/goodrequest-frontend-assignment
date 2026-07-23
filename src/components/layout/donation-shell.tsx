"use client";

import type { ReactNode } from "react";
import { preload } from "react-dom";
import { useTranslation } from "react-i18next";

import donationDogDesktop from "@/assets/donation-dog-desktop.webp";
import donationDogDesktopAvif from "@/assets/donation-dog-desktop.avif";
import donationDogMobile from "@/assets/donation-dog-mobile.webp";
import donationDogMobileAvif from "@/assets/donation-dog-mobile.avif";

import { AppFooter } from "./app-footer";
import { DonationProgress } from "./donation-progress";
import { DonationProgressProvider } from "./donation-progress-context";
import { mainContentId } from "./skip-link";
import {
  Content,
  ContentColumn,
  Header,
  Media,
  MediaImage,
  Shell,
} from "./donation-shell.styles";

export function DonationShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  preload(donationDogMobileAvif.src, {
    as: "image",
    fetchPriority: "high",
    media: "(width <= 56rem)",
    type: "image/avif",
  });
  preload(donationDogDesktopAvif.src, {
    as: "image",
    fetchPriority: "high",
    media: "(width > 56rem)",
    type: "image/avif",
  });

  return (
    <DonationProgressProvider>
      <Shell>
        <ContentColumn>
          <Header>
            <DonationProgress />
          </Header>
          <Content id={mainContentId} tabIndex={-1}>
            {children}
          </Content>
          <AppFooter />
        </ContentColumn>
        <Media aria-label={t("media.dogPanel")}>
          <picture>
            <source
              media="(width > 56rem)"
              srcSet={donationDogDesktopAvif.src}
              type="image/avif"
            />
            <source
              media="(width > 56rem)"
              srcSet={donationDogDesktop.src}
              type="image/webp"
            />
            <source
              media="(width <= 56rem)"
              srcSet={donationDogMobileAvif.src}
              type="image/avif"
            />
            <MediaImage
              alt={t("media.donationDog")}
              decoding="sync"
              draggable={false}
              fetchPriority="high"
              height={donationDogMobile.height}
              loading="eager"
              src={donationDogMobile.src}
              style={{
                "--media-blur-desktop": `url(${donationDogDesktop.blurDataURL})`,
                "--media-blur-mobile": `url(${donationDogMobile.blurDataURL})`,
              }}
              width={donationDogMobile.width}
            />
          </picture>
        </Media>
      </Shell>
    </DonationProgressProvider>
  );
}
