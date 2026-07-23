import styled, { keyframes } from "styled-components";

import { theme } from "@/styles/theme";

const stepEnter = keyframes`
  from {
    opacity: 0;
    transform: translateY(0.5rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const Transition = styled.div`
  display: grid;
  min-width: 0;
  min-height: 0;
  animation: ${stepEnter} ${theme.motion.base} ${theme.motion.easeEnter} both;

  > section {
    display: flex;
    min-width: 0;
    min-height: 0;
    flex-direction: column;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 1;
    transform: none;
  }
`;
