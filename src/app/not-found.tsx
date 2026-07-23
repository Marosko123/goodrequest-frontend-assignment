import { NotFoundContent } from "@/features/not-found/not-found-content";
import { supportedLocales } from "@/i18n/config";
import { createTranslator } from "@/i18n/instance";

const localizedContent = supportedLocales.map((locale) => {
  const t = createTranslator(locale);
  return {
    locale,
    navigationHome: t("navigation.home"),
    title: t("notFound.title"),
    description: t("notFound.description"),
    home: t("notFound.home"),
  };
});

export default function NotFound() {
  return <NotFoundContent localizedContent={localizedContent} />;
}
