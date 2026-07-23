"use client";

import type { ReactNode } from "react";
import { preload } from "react-dom";
import { useTranslation } from "react-i18next";

import donationDogDesktop from "@/assets/donation-dog-desktop.webp";
import donationDogMobile from "@/assets/donation-dog-mobile.webp";

import { DonationFooter, DonationProgress } from "./donation-progress";
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
  preload(donationDogMobile.src, {
    as: "image",
    fetchPriority: "high",
    media: "(max-width: 56rem)",
    type: "image/webp",
  });
  preload(donationDogDesktop.src, {
    as: "image",
    fetchPriority: "high",
    media: "(min-width: 56.001rem)",
    type: "image/webp",
  });

  return (
    <Shell>
      <ContentColumn>
        <Header>
          <DonationProgress />
        </Header>
        <Content>{children}</Content>
        <DonationFooter />
      </ContentColumn>
      <Media aria-label={t("media.dogPanel")}>
        <picture>
          <source
            media="(min-width: 56.001rem)"
            srcSet={donationDogDesktop.src}
            type="image/webp"
          />
          <MediaImage
            alt={t("media.donationDog")}
            decoding="sync"
            fetchPriority="high"
            height={donationDogMobile.height}
            loading="eager"
            src={donationDogMobile.src}
            width={donationDogMobile.width}
          />
        </picture>
      </Media>
    </Shell>
  );
}
