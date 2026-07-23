export const supportedLocales = ["sk", "en"] as const;

export type AppLocale = (typeof supportedLocales)[number];

export const defaultLocale: AppLocale = "sk";
export const defaultNamespace = "translation";
export const appBasePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(
  /\/+$/u,
  "",
);

export const intlLocaleByAppLocale: Record<AppLocale, string> = {
  sk: "sk-SK",
  en: "en-SK",
};

function withoutBasePath(pathname: string, basePath: string): string {
  if (!basePath) {
    return pathname;
  }

  if (pathname === basePath) {
    return "/";
  }

  return pathname.startsWith(`${basePath}/`)
    ? pathname.slice(basePath.length)
    : pathname;
}

export function getLocaleFromPathname(
  pathname: string | null,
  basePath = appBasePath,
): AppLocale {
  const path = withoutBasePath(pathname?.split(/[?#]/, 1)[0] ?? "/", basePath);
  return path === "/en" || path.startsWith("/en/") ? "en" : "sk";
}

export function getUnlocalizedPath(
  pathname: string,
  basePath = appBasePath,
): string {
  const suffixIndex = pathname.search(/[?#]/u);
  const path = withoutBasePath(
    suffixIndex === -1 ? pathname : pathname.slice(0, suffixIndex),
    basePath,
  );
  const suffix = suffixIndex === -1 ? "" : pathname.slice(suffixIndex);
  const withoutLocale = path.replace(/^\/en(?=\/|$)/u, "") || "/";
  const hadTrailingSlash = path.endsWith("/");
  const normalized =
    withoutLocale === "/"
      ? "/"
      : `${withoutLocale.replace(/\/+$/u, "")}${hadTrailingSlash ? "/" : ""}`;
  return `${normalized}${suffix}`;
}

export function getLocalizedPath(
  locale: AppLocale,
  pathname: string,
  basePath = appBasePath,
): string {
  const path = getUnlocalizedPath(pathname, basePath);
  const suffixIndex = path.search(/[?#]/u);
  const barePath = suffixIndex === -1 ? path : path.slice(0, suffixIndex);
  const suffix = suffixIndex === -1 ? "" : path.slice(suffixIndex);

  if (locale === "sk") {
    return `${barePath}${suffix}`;
  }

  return barePath === "/" ? `/en/${suffix}` : `/en${barePath}${suffix}`;
}
