import Link from "next/link";

import { Logo } from "./logo";
import styles from "./app-footer.module.scss";

export function AppFooter() {
  return (
    <footer className={styles.footer}>
      <Link
        aria-label="Good boy – domov"
        className={styles.home}
        href="/"
        prefetch={false}
      >
        <Logo />
      </Link>
      <nav aria-label="Doplnkové stránky" className={styles.navigation}>
        <Link href="/contact" prefetch={false}>
          Kontakt
        </Link>
        <Link href="/about" prefetch={false}>
          O projekte
        </Link>
      </nav>
    </footer>
  );
}
