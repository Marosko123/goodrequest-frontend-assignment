"use client";

import notFoundDog from "@/assets/not-found-dog.webp";
import { AppFooter } from "@/components/layout/app-footer";
import { Logo } from "@/components/layout/logo";
import { mainContentId } from "@/components/layout/skip-link";
import { PrimaryActionLink } from "@/components/ui/primary-action-link";
import { type AppLocale, getLocalizedPath } from "@/i18n/config";

import {
  ErrorCode,
  LocalizedBrandLink,
  LocalizedContent,
  NotFoundDescription,
  NotFoundHeader,
  NotFoundMain,
  NotFoundMascot,
  NotFoundPage,
  NotFoundTitle,
} from "./not-found-content.styles";

type LocalizedNotFoundContent = {
  locale: AppLocale;
  navigationHome: string;
  title: string;
  description: string;
  home: string;
};

export function NotFoundContent({
  localizedContent,
}: {
  localizedContent: readonly LocalizedNotFoundContent[];
}) {
  return (
    <NotFoundPage>
      <NotFoundHeader>
        {localizedContent.map(({ locale, navigationHome }) => (
          <LocalizedBrandLink
            aria-label={navigationHome}
            data-locale={locale}
            href={getLocalizedPath(locale, "/")}
            key={locale}
            prefetch={false}
          >
            <Logo motion="static" />
          </LocalizedBrandLink>
        ))}
      </NotFoundHeader>

      <NotFoundMain id={mainContentId} tabIndex={-1}>
        {localizedContent.map(({ locale, title, description, home }) => (
          <LocalizedContent data-locale={locale} key={locale}>
            <ErrorCode aria-hidden="true">404</ErrorCode>
            <NotFoundTitle>{title}</NotFoundTitle>
            <NotFoundDescription>{description}</NotFoundDescription>
            <PrimaryActionLink
              href={getLocalizedPath(locale, "/")}
              prefetch={false}
            >
              {home}
            </PrimaryActionLink>
          </LocalizedContent>
        ))}

        <NotFoundMascot
          alt=""
          draggable={false}
          height={notFoundDog.height}
          placeholder="blur"
          priority
          sizes="(max-width: 768px) 86vw, 480px"
          src={notFoundDog}
          width={notFoundDog.width}
        />
      </NotFoundMain>
      <AppFooter />
    </NotFoundPage>
  );
}
