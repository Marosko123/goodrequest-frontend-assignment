import Link from "next/link";
import styled, { css, keyframes } from "styled-components";

import { PawIcon, SuccessCheckIcon } from "@/components/ui/icons";
import { pressable } from "@/styles/fragments";
import { theme } from "@/styles/theme";

const successPop = keyframes`
  from { opacity: 0; transform: scale(0.72); }
  to { opacity: 1; transform: scale(1); }
`;

const successDraw = keyframes`
  to { stroke-dashoffset: 0; }
`;

const successHalo = keyframes`
  from { opacity: 0.7; transform: scale(0.72); }
  to { opacity: 0; transform: scale(1.35); }
`;

export const Content = styled.section`
  display: grid;
  justify-items: start;
  max-width: 34rem;

  p {
    margin-block: ${theme.space[4]} ${theme.space[8]};
    color: ${theme.colors.textSecondary};
    font: ${theme.typography.textMdRegular};
  }
`;

export const Celebration = styled.div`
  position: relative;
  isolation: isolate;
  width: 4rem;
  height: 4rem;
  margin-block-end: ${theme.space[6]};
  color: ${theme.colors.success};

  &::before {
    position: absolute;
    z-index: 0;
    inset: -0.5rem;
    border-radius: 50%;
    background: ${theme.colors.successSoft};
    content: "";
    animation: ${successHalo} ${theme.motion.celebration}
      ${theme.motion.easeEnter} both;
  }

  @media (prefers-reduced-motion: reduce) {
    &::before {
      animation: none;
      opacity: 0;
      transform: none;
    }
  }
`;

export const SuccessIcon = styled(SuccessCheckIcon)`
  position: relative;
  z-index: 1;
  width: 4rem;
  height: 4rem;
  animation: ${successPop} ${theme.motion.celebration}
    ${theme.motion.easePlayful} both;

  path {
    stroke-dasharray: 48;
    stroke-dashoffset: 48;
    animation: ${successDraw} ${theme.motion.celebration}
      ${theme.motion.easeEnter} both;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 1;
    transform: none;

    path {
      animation: none;
      stroke-dashoffset: 0;
    }
  }
`;

const pawStyles = css`
  position: absolute;
  z-index: 2;
  width: ${theme.sizes.iconMd};
  height: ${theme.sizes.iconMd};
  color: ${theme.colors.primary};
  opacity: 0.55;
  animation: ${successPop} ${theme.motion.celebration}
    ${theme.motion.easePlayful} both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 1;
    transform: none;
  }
`;

export const PawLeft = styled(PawIcon)`
  ${pawStyles}

  top: -0.5rem;
  left: -1.5rem;
  rotate: -20deg;
  animation-delay: 80ms;

  @media (width <= 40rem) {
    left: -0.75rem;
  }
`;

export const PawRight = styled(PawIcon)`
  ${pawStyles}

  right: -1.5rem;
  bottom: -0.25rem;
  rotate: 18deg;
  animation-delay: 120ms;
`;

export const AgainLink = styled(Link)`
  ${pressable}

  display: inline-flex;
  min-height: ${theme.sizes.controlHeight};
  align-items: center;
  padding-inline: ${theme.space[6]};
  border-radius: ${theme.radii.md};
  background: ${theme.colors.primary};
  color: #fff;
  font: ${theme.typography.textMdMedium};
  text-decoration: none;

  &:hover {
    background: ${theme.colors.primaryHover};
  }
`;
