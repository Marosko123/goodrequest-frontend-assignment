"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

import { getLocaleFromPathname, getLocalizedPath } from "@/i18n/config";

import { Logo } from "./logo";
import {
  Footer,
  FooterLinks,
  HomeLink,
  Navigation,
  Socials,
} from "./app-footer.styles";
import { FacebookIcon, InstagramIcon } from "../ui/icons";

export function AppFooter({ showSocials = true }: { showSocials?: boolean }) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const locale = getLocaleFromPathname(pathname);

  return (
    <Footer>
      <HomeLink
        aria-label={t("navigation.home")}
        href={getLocalizedPath(locale, "/")}
      >
        <Logo />
      </HomeLink>
      <FooterLinks>
        {showSocials ? (
          <Socials aria-label={t("navigation.socials")}>
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
          </Socials>
        ) : null}
        <Navigation aria-label={t("navigation.supplementary")}>
          <Link href={getLocalizedPath(locale, "/contact/")}>
            {t("common.contact")}
          </Link>
          <Link href={getLocalizedPath(locale, "/about/")}>
            {t("common.about")}
          </Link>
        </Navigation>
      </FooterLinks>
    </Footer>
  );
}
