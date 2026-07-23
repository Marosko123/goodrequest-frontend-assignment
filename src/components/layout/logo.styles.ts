import styled, { keyframes } from "styled-components";

import { theme } from "@/styles/theme";

const dogPlay = keyframes`
  0%, 6%, 33%, 100% { transform: none; }
  9% { transform: translateY(1px) scale(0.98, 0.96); }
  11% { transform: scaleX(-1) rotate(-2deg); }
  14% { transform: translate(3px, -2px) scaleX(-1) rotate(2deg); }
  17% { transform: translateX(6px) scaleX(-1) rotate(-2deg); }
  20% { transform: translate(9px, -2px) scaleX(-1) rotate(2deg); }
  23% { transform: translateX(12px) scaleX(-1); }
  26% { transform: translate(12px, 1px) scale(-1.02, 0.96) rotate(-3deg); }
  28% { transform: translate(9px, -1px) scaleX(-1); }
  30% { transform: translateX(4px) scaleX(-1); }
  31% { transform: scaleX(0.2); }
`;

const ballPlay = keyframes`
  0%, 29%, 100% {
    opacity: 0;
    transform: translate(-10px, 0) rotate(0);
  }
  2% { opacity: 1; transform: translate(-10px, 0) rotate(0); }
  7% { opacity: 1; transform: translate(10px, 0) rotate(180deg); }
  13% { opacity: 1; transform: translate(36px, -1px) rotate(360deg); }
  19% { opacity: 1; transform: translate(60px, 0) rotate(540deg); }
  24% { opacity: 1; transform: translate(74px, 0) rotate(720deg); }
  27% { opacity: 1; transform: translate(74px, -1px) scale(0.78) rotate(760deg); }
  28% { opacity: 0; transform: translate(74px, -1px) scale(0.6) rotate(780deg); }
`;

const wordmarkMakeRoom = keyframes`
  0%, 6%, 33%, 100% { transform: none; }
  10% { transform: translateX(10px); }
  13%, 27% { transform: translateX(18px); }
  30% { transform: translateX(6px); }
`;

export const LogoSvg = styled.svg`
  width: 7.75rem;
  height: 2rem;
  overflow: visible;
`;

export const Wordmark = styled.path`
  fill: #111827;
  transform-box: fill-box;
  transform-origin: center;
  animation: ${wordmarkMakeRoom} 9s ${theme.motion.easeEnter} 3s infinite both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transform: none;
  }
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
