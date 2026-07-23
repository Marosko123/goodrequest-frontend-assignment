import Image from "next/image";
import Link from "next/link";
import styled, { keyframes } from "styled-components";

import { nonSelectableControl } from "@/styles/fragments";
import { theme } from "@/styles/theme";

const contentEnter = keyframes`
  from {
    opacity: 0;
    transform: translateY(0.5rem);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const NotFoundPage = styled.div`
  display: grid;
  width: min(100%, ${theme.layout.pageMax});
  min-height: 100svh;
  grid-template-rows: auto 1fr auto;
  margin-inline: auto;
  padding: ${theme.space[8]} ${theme.layout.pageGutterDesktop} ${theme.space[6]};

  @media (width <= 56rem) {
    padding: ${theme.space[4]} ${theme.space[6]} ${theme.space[6]};
  }

  @media (width <= 32rem) {
    padding-inline: ${theme.space[4]};
  }
`;

export const NotFoundHeader = styled.header`
  display: flex;
  min-width: 0;
  min-height: ${theme.sizes.tapTarget};
  align-items: center;
`;

export const LocalizedBrandLink = styled(Link)`
  ${nonSelectableControl}

  display: none;
  align-items: center;
  color: inherit;
  text-decoration: none;
  transition: opacity ${theme.motion.fast} ${theme.motion.easeStandard};

  html[lang="sk"] &[data-locale="sk"],
  html[lang="en"] &[data-locale="en"],
  html[lang="cs"] &[data-locale="cz"] {
    display: inline-flex;
  }

  [data-logo-part="dog"],
  [data-logo-part="ball"] {
    animation: none !important;
    transform: none;
  }

  [data-logo-part="ball"] {
    display: none;
  }

  &:active {
    opacity: 0.72;
  }

  &:focus-visible {
    outline: 0;
    box-shadow: ${theme.shadows.focus};
  }
`;

export const NotFoundMain = styled.main`
  display: flex;
  min-width: 0;
  width: 100%;
  flex-direction: column;
  align-items: center;
  align-self: stretch;
  justify-content: center;
  padding-block: ${theme.space[8]};
  text-align: center;
  animation: ${contentEnter} ${theme.motion.celebration}
    ${theme.motion.easeEnter} both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }

  @media (width <= 32rem) {
    padding-block: ${theme.space[6]};
  }
`;

export const LocalizedContent = styled.section`
  display: none;
  width: min(100%, 42rem);
  justify-items: center;

  html[lang="sk"] &[data-locale="sk"],
  html[lang="en"] &[data-locale="en"],
  html[lang="cs"] &[data-locale="cz"] {
    display: grid;
  }
`;

export const ErrorCode = styled.p`
  margin: 0 0 ${theme.space[3]};
  color: ${theme.colors.primary};
  font: ${theme.typography.textSmMedium};
  letter-spacing: 0.16em;
`;

export const NotFoundTitle = styled.h1`
  margin: 0;
  color: ${theme.colors.text};
  font: ${theme.typography.headingXlSemibold};
  letter-spacing: -0.035em;

  @media (width <= 40rem) {
    font: ${theme.typography.headingXlSemiboldCompact};
    letter-spacing: -0.025em;
  }
`;

export const NotFoundDescription = styled.p`
  max-width: 36rem;
  margin: ${theme.space[4]} 0 ${theme.space[8]};
  color: ${theme.colors.textSecondary};
  font: ${theme.typography.textMdRegular};
`;

export const NotFoundMascot = styled(Image)`
  width: min(30rem, 48vw);
  height: auto;
  margin-top: ${theme.space[6]};
  object-fit: contain;

  @media (width <= 48rem) {
    width: min(21rem, 86vw);
  }
`;
