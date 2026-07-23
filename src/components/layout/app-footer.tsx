"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

import { SocialLink } from "@/components/ui/social-link";
import { getLocaleFromPathname, getLocalizedPath } from "@/i18n/config";

import { Logo } from "./logo";
import { Footer, HomeLink, Navigation, Socials } from "./app-footer.styles";

export function AppFooter() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const locale = getLocaleFromPathname(pathname);

  return (
    <Footer>
      <HomeLink
        aria-label={t("navigation.home")}
        href={getLocalizedPath(locale, "/")}
        prefetch={false}
      >
        <Logo />
      </HomeLink>
      <Socials aria-label={t("navigation.socials")}>
        <SocialLink
          href="https://www.facebook.com/goodrequest"
          platform="facebook"
          variant="gray"
        />
        <SocialLink
          href="https://www.instagram.com/goodrequest"
          platform="instagram"
          variant="gray"
        />
      </Socials>
      <Navigation aria-label={t("navigation.supplementary")}>
        <Link href={getLocalizedPath(locale, "/contact/")} prefetch={false}>
          {t("common.contact")}
        </Link>
        <Link href={getLocalizedPath(locale, "/about/")} prefetch={false}>
          {t("common.about")}
        </Link>
      </Navigation>
    </Footer>
  );
}
