import Link from "next/link";
import type { ReactNode } from "react";

import { ArrowLeftIcon } from "@/components/ui/icons";

import { AppFooter } from "./app-footer";
import styles from "./content-shell.module.scss";

export function ContentShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <header>
        <Link className={styles.back} href="/" prefetch={false}>
          <ArrowLeftIcon /> Späť
        </Link>
      </header>
      <main>{children}</main>
      <AppFooter showSocials={false} />
    </div>
  );
}
