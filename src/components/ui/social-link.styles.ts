import styled from "styled-components";

import { pressable } from "@/styles/fragments";
import { theme } from "@/styles/theme";

export const SocialAnchor = styled.a`
  ${pressable}

  display: grid;
  width: ${theme.sizes.iconLg};
  height: ${theme.sizes.iconLg};
  place-items: center;
  text-decoration: none;
  user-select: none;

  &[data-variant="gray"] {
    color: ${theme.colors.textSubtle};
  }

  &[data-variant="gray"] [data-social-layer="monochrome"],
  &[data-variant="gray"] [data-social-layer="brand"] {
    transition: opacity ${theme.motion.fast} ${theme.motion.easeStandard};
  }

  &[data-variant="gray"] [data-social-layer="monochrome"] {
    opacity: 1;
  }

  &[data-variant="gray"] [data-social-layer="brand"] {
    opacity: 0;
  }

  @media (hover: hover) and (pointer: fine) {
    &[data-variant="gray"]:hover [data-social-layer="monochrome"] {
      opacity: 0;
    }

    &[data-variant="gray"]:hover [data-social-layer="brand"] {
      opacity: 1;
    }
  }

  &[data-variant="gray"]:focus-visible [data-social-layer="monochrome"] {
    opacity: 0;
  }

  &[data-variant="gray"]:focus-visible [data-social-layer="brand"] {
    opacity: 1;
  }

  &[data-variant="surface"] {
    color: ${theme.colors.canvas};
  }

  &[data-variant="surface"]:focus-visible {
    color: ${theme.colors.surface};
  }

  @media (hover: hover) and (pointer: fine) {
    &[data-variant="surface"]:hover {
      color: ${theme.colors.surface};
    }
  }

  &[data-variant="brand"][data-platform="facebook"] {
    color: #1877f2;
  }

  &[data-variant="brand"][data-platform="instagram"] {
    color: #000100;
  }

  svg {
    width: ${theme.sizes.iconLg};
    height: ${theme.sizes.iconLg};
  }

  @media (prefers-reduced-motion: reduce) {
    &[data-variant="gray"] [data-social-layer="monochrome"] {
      transition: none;
    }

    &[data-variant="gray"] [data-social-layer="brand"] {
      transition: none;
    }
  }

  @media (pointer: coarse) {
    width: ${theme.sizes.tapTarget};
    height: ${theme.sizes.tapTarget};
  }
`;
