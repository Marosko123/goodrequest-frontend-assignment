import Link from "next/link";
import type { ReactNode } from "react";

import { AppFooter } from "./app-footer";
import styles from "./content-shell.module.scss";

export function ContentShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <header>
        <Link className={styles.back} href="/" prefetch={false}>
          <span aria-hidden="true">←</span> Späť
        </Link>
      </header>
      <main>{children}</main>
      <AppFooter />
    </div>
  );
}
