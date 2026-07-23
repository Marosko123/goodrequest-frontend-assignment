"use client";

import { useTranslation } from "react-i18next";

import { SkipLinkAnchor } from "./skip-link.styles";

/**
 * Shared by the link and by every `<main>` it can target. The shells each render
 * one `<main>` per route, so the id stays unique within a document.
 */
export const mainContentId = "main-content";

/**
 * WCAG 2.4.1 (Bypass Blocks, level A). Rendered as the first focusable element
 * of the document, ahead of the language switcher and the stepper.
 *
 * A native anchor rather than `next/link`: the target lives in the same
 * document on every route, so the browser's own fragment navigation moves both
 * focus and scroll. The `<main>` elements carry `tabIndex={-1}` because a
 * fragment jump only moves focus to a target that can hold it.
 */
export function SkipLink() {
  const { t } = useTranslation();

  return (
    <SkipLinkAnchor href={`#${mainContentId}`}>
      {t("common.skipToContent")}
    </SkipLinkAnchor>
  );
}
