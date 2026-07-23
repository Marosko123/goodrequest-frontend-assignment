import { createGlobalStyle } from "styled-components";

import { rawTheme } from "./theme";

// Note on the focus-visible rule below: it is the default indicator for
// controls that do not paint their own ring, so it must clear WCAG 2.4.11
// alone. Hence a solid colour — the translucent --color-focus-ring reaches
// only 1.5:1 and is reserved for the soft halo on filled controls, where the
// border swap carries the contrast.
export const GlobalStyles = createGlobalStyle`
  :root {
    --font-sans: ${rawTheme.typography.fontSans};
    --type-heading-lg-bold: ${rawTheme.typography.headingLgBold};
    --type-heading-lg-bold-compact: ${rawTheme.typography.headingLgBoldCompact};
    --type-heading-xl-regular: ${rawTheme.typography.headingXlRegular};
    --type-heading-xl-semibold: ${rawTheme.typography.headingXlSemibold};
    --type-heading-xl-semibold-compact: ${rawTheme.typography.headingXlSemiboldCompact};
    --type-text-xl-semibold: ${rawTheme.typography.textXlSemibold};
    --type-text-lg-medium: ${rawTheme.typography.textLgMedium};
    --type-text-md-regular: ${rawTheme.typography.textMdRegular};
    --type-text-md-medium: ${rawTheme.typography.textMdMedium};
    --type-text-md-semibold: ${rawTheme.typography.textMdSemibold};
    --type-text-sm-regular: ${rawTheme.typography.textSmRegular};
    --type-text-sm-medium: ${rawTheme.typography.textSmMedium};
    --type-symbol-md-regular: ${rawTheme.typography.symbolMdRegular};
    --line-height-text-md: ${rawTheme.typography.lineHeightTextMd};
    --tracking-heading: ${rawTheme.typography.trackingHeading};

    --color-canvas: ${rawTheme.colors.canvas};
    --color-on-accent: ${rawTheme.colors.onAccent};
    --color-inverse-content-primary: ${rawTheme.colors.inverseContentPrimary};
    --color-surface: ${rawTheme.colors.surface};
    --color-surface-hover: ${rawTheme.colors.surfaceHover};
    --color-surface-pressed: ${rawTheme.colors.surfacePressed};
    --color-text: ${rawTheme.colors.text};
    --color-text-secondary: ${rawTheme.colors.textSecondary};
    --color-text-tertiary: ${rawTheme.colors.textTertiary};
    --color-text-subtle: ${rawTheme.colors.textSubtle};
    --color-text-muted: ${rawTheme.colors.textMuted};
    --color-border: ${rawTheme.colors.border};
    --color-border-subtle: ${rawTheme.colors.borderSubtle};
    --color-primary: ${rawTheme.colors.primary};
    --color-primary-hover: ${rawTheme.colors.primaryHover};
    --color-primary-pressed: ${rawTheme.colors.primaryPressed};
    --color-primary-soft: ${rawTheme.colors.primarySoft};
    --color-primary-disabled: ${rawTheme.colors.primaryDisabled};
    --color-danger: ${rawTheme.colors.danger};
    --color-danger-hover: ${rawTheme.colors.dangerHover};
    --color-danger-pressed: ${rawTheme.colors.dangerPressed};
    --color-danger-soft: ${rawTheme.colors.dangerSoft};
    --color-success: ${rawTheme.colors.success};
    --color-success-soft: ${rawTheme.colors.successSoft};
    --color-warning: ${rawTheme.colors.warning};
    --color-warning-soft: ${rawTheme.colors.warningSoft};
    --color-focus-ring: ${rawTheme.colors.focusRing};
    --color-focus-ring-danger: ${rawTheme.colors.focusRingDanger};
    --color-shadow: ${rawTheme.colors.shadow};

    --space-1: ${rawTheme.space[1]};
    --space-2: ${rawTheme.space[2]};
    --space-3: ${rawTheme.space[3]};
    --space-4: ${rawTheme.space[4]};
    --space-5: ${rawTheme.space[5]};
    --space-6: ${rawTheme.space[6]};
    --space-8: ${rawTheme.space[8]};
    --space-10: ${rawTheme.space[10]};
    --space-12: ${rawTheme.space[12]};
    --space-16: ${rawTheme.space[16]};
    --space-20: ${rawTheme.space[20]};

    --radius-xs: ${rawTheme.radii.xs};
    --radius-sm: ${rawTheme.radii.sm};
    --radius-md: ${rawTheme.radii.md};
    --radius-lg: ${rawTheme.radii.lg};
    --radius-xl: ${rawTheme.radii.xl};
    --shadow-focus: ${rawTheme.shadows.focus};
    --shadow-focus-danger: ${rawTheme.shadows.focusDanger};
    --shadow-card: ${rawTheme.shadows.card};

    --control-sm: ${rawTheme.sizes.controlSm};
    --control-md: ${rawTheme.sizes.controlMd};
    --control-lg: ${rawTheme.sizes.controlLg};
    --control-xl: ${rawTheme.sizes.controlXl};
    --control-height: ${rawTheme.sizes.controlHeight};
    --tap-target: ${rawTheme.sizes.tapTarget};
    --icon-sm: ${rawTheme.sizes.iconSm};
    --icon-md: ${rawTheme.sizes.iconMd};
    --icon-lg: ${rawTheme.sizes.iconLg};

    --page-max: ${rawTheme.layout.pageMax};
    --page-gutter-desktop: ${rawTheme.layout.pageGutterDesktop};
    --page-padding-block-desktop: ${rawTheme.layout.pagePaddingBlockDesktop};
    --content-max: ${rawTheme.layout.contentMax};
    --donation-layout-gap: ${rawTheme.layout.donationLayoutGap};
    --donation-media-width: ${rawTheme.layout.donationMediaWidth};
    --donation-media-inset: ${rawTheme.layout.donationMediaInset};
    --public-content-max: ${rawTheme.layout.publicContentMax};
    --public-image-max: ${rawTheme.layout.publicImageMax};
    --public-image-height: ${rawTheme.layout.publicImageHeight};

    --motion-instant: ${rawTheme.motion.instant};
    --motion-fast: ${rawTheme.motion.fast};
    --motion-base: ${rawTheme.motion.base};
    --motion-celebration: ${rawTheme.motion.celebration};
    --ease-standard: ${rawTheme.motion.easeStandard};
    --ease-enter: ${rawTheme.motion.easeEnter};
    --ease-playful: ${rawTheme.motion.easePlayful};
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html {
    min-height: 100%;
    background: var(--color-canvas);
    scroll-behavior: smooth;
  }

  body {
    min-height: 100%;
    margin: 0;
    background: var(--color-canvas);
    color: var(--color-text);
    font: var(--type-text-md-regular);
    font-synthesis: none;
  }

  button,
  input,
  select,
  textarea {
    color: inherit;
    font: inherit;
  }

  button,
  select,
  nav {
    user-select: none;
  }

  input,
  textarea {
    user-select: text;
  }

  input[type="checkbox"],
  input[type="radio"] {
    user-select: none;
  }

  button:focus-visible,
  a:focus-visible,
  input:focus-visible,
  select:focus-visible,
  textarea:focus-visible {
    border-radius: var(--radius-sm);
    outline: 2px solid var(--color-primary-pressed);
    outline-offset: var(--space-1);
  }

  a {
    color: inherit;
    text-decoration-thickness: 0.08em;
    text-underline-offset: 0.18em;
  }

  img,
  svg {
    display: block;
    max-width: 100%;
  }

  img {
    -webkit-user-drag: none;
    pointer-events: none;
    user-select: none;
  }

  svg[aria-hidden="true"] {
    pointer-events: none;
    user-select: none;
  }

  ::selection {
    background: var(--color-primary-soft);
    color: var(--color-text);
  }

  h1,
  h2,
  h3,
  p {
    margin-block-start: 0;
  }

  h1,
  h2,
  h3 {
    color: var(--color-text);
  }

  h1 {
    font: var(--type-heading-lg-bold);
    letter-spacing: var(--tracking-heading);
  }

  h2 {
    font: var(--type-text-xl-semibold);
  }

  h3 {
    font: var(--type-text-lg-medium);
  }

  p {
    font: var(--type-text-md-regular);
  }

  @media (width <= 48rem) {
    h1 {
      font: var(--type-heading-lg-bold-compact);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      scroll-behavior: auto !important;
      transition-duration: 0ms !important;
      transition-delay: 0ms !important;
      animation-duration: 0ms !important;
      animation-delay: 0ms !important;
      animation-iteration-count: 1 !important;
    }
  }
`;
