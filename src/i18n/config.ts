export const supportedLocales = ["sk", "en", "cz"] as const;

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
  cz: "cs-CZ",
};

export const htmlLangByAppLocale: Record<AppLocale, string> = {
  sk: "sk",
  en: "en",
  cz: "cs",
};

const pathPrefixByAppLocale: Record<AppLocale, string> = {
  sk: "",
  en: "en",
  cz: "cz",
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
  return (
    supportedLocales.find((locale) => {
      const prefix = pathPrefixByAppLocale[locale];
      return (
        prefix && (path === `/${prefix}` || path.startsWith(`/${prefix}/`))
      );
    }) ?? defaultLocale
  );
}

export function getAppLocale(
  language: string | undefined,
  fallback: AppLocale = defaultLocale,
): AppLocale {
  return supportedLocales.find((locale) => locale === language) ?? fallback;
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
  const withoutLocale = path.replace(/^\/(?:en|cz)(?=\/|$)/u, "") || "/";
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
  const rawBarePath = suffixIndex === -1 ? path : path.slice(0, suffixIndex);
  const suffix = suffixIndex === -1 ? "" : path.slice(suffixIndex);

  // The export is built with trailingSlash: true, so every route URL has to end
  // with a slash. On a known route the router would normalize it, but a
  // statically served 404 has no route to match and would keep a bare path.
  const barePath = rawBarePath.endsWith("/") ? rawBarePath : `${rawBarePath}/`;

  const prefix = pathPrefixByAppLocale[locale];
  return prefix ? `/${prefix}${barePath}${suffix}` : `${barePath}${suffix}`;
}
