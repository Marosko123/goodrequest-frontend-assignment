import Link from "next/link";

import { Logo } from "./logo";
import styles from "./app-footer.module.scss";
import { FacebookIcon, InstagramIcon } from "../ui/icons";

export function AppFooter({ showSocials = true }: { showSocials?: boolean }) {
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
      <div className={styles.footerLinks}>
        {showSocials ? (
          <nav aria-label="Sociálne siete" className={styles.socials}>
            <a
              aria-label="Facebook"
              href="https://www.facebook.com/goodrequest"
              rel="noreferrer"
              target="_blank"
            >
              <FacebookIcon />
            </a>
            <a
              aria-label="Instagram"
              href="https://www.instagram.com/goodrequest"
              rel="noreferrer"
              target="_blank"
            >
              <InstagramIcon />
            </a>
          </nav>
        ) : null}
        <nav aria-label="Doplnkové stránky" className={styles.navigation}>
          <Link href="/contact" prefetch={false}>
            Kontakt
          </Link>
          <Link href="/about" prefetch={false}>
            O projekte
          </Link>
        </nav>
      </div>
    </footer>
  );
}
