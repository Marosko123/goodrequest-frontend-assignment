import type { ReactNode } from "react";
import { preload } from "react-dom";

import donationDogDesktop from "@/assets/donation-dog-desktop.webp";
import donationDogMobile from "@/assets/donation-dog-mobile.webp";

import { AppFooter } from "./app-footer";
import { Stepper } from "./stepper";
import styles from "./donation-shell.module.scss";

export function DonationShell({
  children,
  currentStep,
}: {
  children: ReactNode;
  currentStep: 1 | 2 | 3;
}) {
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
    <div className={styles.shell}>
      <div className={styles.contentColumn}>
        <header className={styles.header}>
          <Stepper currentStep={currentStep} />
        </header>
        <main className={styles.content}>{children}</main>
        <AppFooter showSocials={currentStep === 1} />
      </div>
      <aside aria-label="Fotografia podporovaného psa" className={styles.media}>
        <picture>
          <source
            media="(min-width: 56.001rem)"
            srcSet={donationDogDesktop.src}
            type="image/webp"
          />
          <img
            alt="Mladý pes na pláži"
            className={styles.image}
            decoding="sync"
            fetchPriority="high"
            height={donationDogMobile.height}
            loading="eager"
            src={donationDogMobile.src}
            width={donationDogMobile.width}
          />
        </picture>
      </aside>
    </div>
  );
}
