import Link from "next/link";
import styled, { keyframes } from "styled-components";

import { theme } from "@/styles/theme";

const pageEnter = keyframes`
  from {
    opacity: 0;
    transform: translateY(0.5rem);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const Shell = styled.div`
  display: grid;
  grid-template-rows: auto 1fr auto;
  width: min(100%, ${theme.layout.pageMax});
  min-height: 100svh;
  padding: ${theme.layout.pagePaddingBlockDesktop}
    ${theme.layout.pageGutterDesktop};
  margin-inline: auto;

  @media (width <= 56rem) {
    padding: ${theme.space[8]} ${theme.space[6]};
  }

  @media (width <= 32rem) {
    padding-inline: ${theme.space[4]};
  }
`;

export const Header = styled.header`
  display: flex;
  gap: ${theme.space[4]};
  align-items: center;
  justify-content: space-between;
`;

export const Main = styled.main`
  width: 100%;
  max-width: ${theme.layout.publicContentMax};
  animation: ${pageEnter} ${theme.motion.base} ${theme.motion.easeEnter} both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 1;
    transform: none;
  }
`;

export const BackLink = styled(Link)`
  display: inline-flex;
  min-height: 2.75rem;
  gap: ${theme.space[2]};
  align-items: center;
  color: ${theme.colors.primary};
  font: ${theme.typography.textMdMedium};
  text-decoration: none;

  svg {
    width: ${theme.sizes.iconSm};
    height: ${theme.sizes.iconSm};
  }

  &:hover {
    color: ${theme.colors.primaryHover};
    text-decoration: underline;
  }
`;
