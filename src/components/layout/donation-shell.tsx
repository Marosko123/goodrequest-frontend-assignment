import Image from "next/image";
import type { ReactNode } from "react";

import donationDog from "@/assets/donation-dog.jpg";

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
  return (
    <div className={styles.shell}>
      <div className={styles.contentColumn}>
        <header className={styles.header}>
          <Stepper currentStep={currentStep} />
        </header>
        <main className={styles.content}>{children}</main>
        <AppFooter />
      </div>
      <aside aria-label="Fotografia podporovaného psa" className={styles.media}>
        <Image
          alt="Mladý pes na pláži"
          className={styles.image}
          height={2048}
          priority={currentStep === 1}
          sizes="(max-width: 900px) 100vw, 42vw"
          src={donationDog}
          width={1365}
        />
      </aside>
    </div>
  );
}
