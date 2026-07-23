import styled, { css, keyframes } from "styled-components";

import { PawIcon, SuccessCheckIcon } from "@/components/ui/icons";
import { theme } from "@/styles/theme";

const successMotion = {
  duration: "800ms",
  haloDelay: "140ms",
  iconDelay: "140ms",
  checkDelay: "220ms",
  leftPawDelay: "360ms",
  rightPawDelay: "520ms",
} as const;

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

const pawPop = keyframes`
  from {
    opacity: 0;
    transform: translateY(0.5rem) scale(0.55);
  }

  70% {
    opacity: 0.72;
    transform: translateY(-0.1rem) scale(1.08);
  }

  to {
    opacity: 0.65;
    transform: translateY(0) scale(1);
  }
`;

export const Content = styled.section`
  display: grid;
  grid-template-rows: auto auto minmax(10rem, 1fr) auto;
  align-self: stretch;
  width: 100%;
  min-height: 0;
  max-width: 34rem;

  h1 {
    margin-block-end: 0;
    text-wrap: balance;
  }

  p {
    margin-block: ${theme.space[4]} 0;
    color: ${theme.colors.textSecondary};
    font: ${theme.typography.textMdRegular};
  }

  @media (width <= 56rem) {
    grid-template-rows: auto auto minmax(9rem, 1fr) auto;
  }

  @media (width <= 32rem) {
    grid-template-rows: auto auto minmax(8rem, 1fr) auto;
  }
`;

export const Celebration = styled.div`
  position: relative;
  isolation: isolate;
  place-self: center;
  width: 4rem;
  height: 4rem;
  margin-block: ${theme.space[6]};
  color: ${theme.colors.success};

  &::before {
    position: absolute;
    z-index: 0;
    inset: -0.5rem;
    border-radius: 50%;
    background: ${theme.colors.successSoft};
    content: "";
    animation: ${successHalo} ${successMotion.duration}
      ${theme.motion.easeEnter} both;
    animation-delay: ${successMotion.haloDelay};
  }

  @media (prefers-reduced-motion: reduce) {
    &::before {
      animation: none;
      opacity: 0;
      transform: none;
    }
  }

  @media (width <= 32rem) {
    margin-block: ${theme.space[4]};
  }
`;

export const SuccessIcon = styled(SuccessCheckIcon)`
  position: relative;
  z-index: 1;
  width: 4rem;
  height: 4rem;
  animation: ${successPop} ${successMotion.duration} ${theme.motion.easePlayful}
    both;
  animation-delay: ${successMotion.iconDelay};

  path {
    stroke-dasharray: 48;
    stroke-dashoffset: 48;
    animation: ${successDraw} ${successMotion.duration}
      ${theme.motion.easeEnter} both;
    animation-delay: ${successMotion.checkDelay};
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
  opacity: 0.65;
  animation: ${pawPop} ${successMotion.duration} ${theme.motion.easePlayful}
    both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 0.65;
    transform: none;
  }
`;

export const PawLeft = styled(PawIcon)`
  ${pawStyles}

  top: -0.5rem;
  left: -1.25rem;
  rotate: -20deg;
  animation-delay: ${successMotion.leftPawDelay};

  @media (width <= 40rem) {
    left: -0.75rem;
  }
`;

export const PawRight = styled(PawIcon)`
  ${pawStyles}

  right: -1.25rem;
  bottom: -0.25rem;
  rotate: 18deg;
  animation-delay: ${successMotion.rightPawDelay};

  @media (width <= 40rem) {
    right: -0.75rem;
  }
`;
