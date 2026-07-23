"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useRef } from "react";
import type { ComponentPropsWithoutRef } from "react";

import {
  getLocaleFromPathname,
  getLocalizedPath,
  getUnlocalizedPath,
} from "@/i18n/config";

export type DonationRoutePrefetchIntent = Pick<
  ComponentPropsWithoutRef<"button">,
  "onFocus" | "onPointerEnter" | "onTouchStart"
>;

function getNextDonationRoute(pathname: string): string | null {
  const route = getUnlocalizedPath(pathname).replace(/\/+$/, "") || "/";

  switch (route) {
    case "/":
      return "/details/";
    case "/details":
      return "/review/";
    case "/review":
      return "/success/";
    default:
      return null;
  }
}

export function useDonationRoutePrefetch(): DonationRoutePrefetchIntent {
  const pathname = usePathname();
  const router = useRouter();
  const prefetchedPathsRef = useRef(new Set<string>());
  const nextRoute = getNextDonationRoute(pathname);
  const locale = getLocaleFromPathname(pathname);
  const nextPath = nextRoute ? getLocalizedPath(locale, nextRoute) : null;

  const prefetch = useCallback(() => {
    if (!nextPath || prefetchedPathsRef.current.has(nextPath)) {
      return;
    }

    prefetchedPathsRef.current.add(nextPath);
    router.prefetch(nextPath);
  }, [nextPath, router]);

  return {
    onFocus: prefetch,
    onPointerEnter: prefetch,
    onTouchStart: prefetch,
  };
}
