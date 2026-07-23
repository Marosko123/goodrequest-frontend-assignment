import styled from "styled-components";

import { theme } from "@/styles/theme";

// Off-screen via transform rather than `display: none` or a negative `left`:
// the first keeps the link out of the tab order entirely, the second can widen
// the scrollable area on small viewports. A fixed element translated past the
// top edge stays keyboard-reachable and unreachable by pointer.
export const SkipLinkAnchor = styled.a`
  position: fixed;
  z-index: 30;
  top: ${theme.space[4]};
  left: ${theme.space[4]};
  padding: ${theme.space[3]} ${theme.space[5]};
  border-radius: ${theme.radii.sm};
  background: ${theme.colors.primary};
  color: ${theme.colors.onAccent};
  font: ${theme.typography.textMdSemibold};
  text-decoration: none;
  transform: translateY(calc(-100% - ${theme.space[8]}));
  transition: transform ${theme.motion.fast} ${theme.motion.easeStandard};

  &:focus {
    transform: none;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;
