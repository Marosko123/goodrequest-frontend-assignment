import styled, { keyframes } from "styled-components";

import { theme } from "@/styles/theme";

const dogPlay = keyframes`
  0%, 6%, 33%, 100% { transform: none; }
  9% { transform: translateY(1px) scale(0.98, 0.96); }
  11% { transform: scaleX(-1) rotate(-2deg); }
  14% { transform: translate(2px, -2px) scaleX(-1) rotate(2deg); }
  17% { transform: translateX(4px) scaleX(-1) rotate(-2deg); }
  20% { transform: translate(6px, -2px) scaleX(-1) rotate(2deg); }
  23% { transform: translateX(7px) scaleX(-1); }
  26% { transform: translate(7px, 1px) scale(-1, 0.96) rotate(-1deg); }
  28% { transform: translate(5px, -1px) scaleX(-1); }
  30% { transform: translateX(2px) scaleX(-1); }
  31% { transform: scaleX(0.2); }
`;

const ballPlay = keyframes`
  0%, 29%, 100% {
    opacity: 0;
    transform: translate(-10px, 0) rotate(0);
  }
  2% { opacity: 1; transform: translate(-10px, 0) rotate(0); }
  7% { opacity: 1; transform: translate(8px, 0) rotate(180deg); }
  13% { opacity: 1; transform: translate(28px, -1px) rotate(360deg); }
  19% { opacity: 1; transform: translate(48px, 0) rotate(540deg); }
  24% { opacity: 1; transform: translate(62px, 0) rotate(720deg); }
  27% { opacity: 1; transform: translate(62px, -1px) scale(0.78) rotate(760deg); }
  28% { opacity: 0; transform: translate(62px, -1px) scale(0.6) rotate(780deg); }
`;

const dogGreeting = keyframes`
  0%, 100% { transform: none; }
  18% { transform: translateY(1px) scale(0.98, 0.96); }
  45% { transform: translate(-1px, -3px) rotate(-3deg); }
  68% { transform: translate(-1px, -1px) scale(1.01, 0.99) rotate(3deg); }
  84% { transform: translateY(-1px) rotate(-2deg); }
`;

const ballGreeting = keyframes`
  0%, 100% {
    opacity: 0;
    transform: translate(0, 1px) scale(0.7) rotate(0);
  }
  15% { opacity: 1; transform: translate(0, 0) scale(0.9) rotate(0); }
  45% { opacity: 1; transform: translate(0, -4px) scale(1) rotate(-25deg); }
  72% { opacity: 1; transform: translate(1px, 0) scale(0.94, 1.06) rotate(20deg); }
  86% { opacity: 1; transform: translate(0, -1px) scale(1) rotate(0); }
`;

export const LogoSvg = styled.svg`
  width: 7.75rem;
  height: 2rem;
  overflow: visible;

  @media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
    a:hover & [data-logo-part="dog"] {
      animation: ${dogGreeting} 700ms ${theme.motion.easePlayful} both;
    }

    a:hover & [data-logo-part="ball"] {
      animation: ${ballGreeting} 700ms ${theme.motion.easeEnter} both;
    }
  }

  &[data-motion="static"] [data-logo-part="dog"],
  &[data-motion="static"] [data-logo-part="ball"] {
    animation: none !important;
    transform: none;
  }

  &[data-motion="static"] [data-logo-part="ball"] {
    display: none;
    opacity: 0;
  }
`;

export const Wordmark = styled.path`
  fill: ${theme.colors.text};
`;

export const Dog = styled.g`
  transform-box: fill-box;
  transform-origin: 50% 88%;
  animation: ${dogPlay} 9s ${theme.motion.easePlayful} 3s infinite both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transform: none;
  }
`;

export const Ball = styled.g`
  opacity: 0;
  transform-box: fill-box;
  transform-origin: center;
  animation: ${ballPlay} 9s ${theme.motion.easeEnter} 3s infinite both;

  @media (prefers-reduced-motion: reduce) {
    display: none;
    animation: none;
    opacity: 0;
    transform: none;
  }
`;
