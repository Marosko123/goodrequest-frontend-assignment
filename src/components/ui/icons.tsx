import Image from "next/image";
import type { SVGProps } from "react";

import czechFlag from "@/assets/flags/cz.svg";
import slovakFlag from "@/assets/flags/sk.svg";

type IconProps = SVGProps<SVGSVGElement>;

function iconProps(props: IconProps) {
  return { "aria-hidden": true, focusable: false, ...props } as const;
}

export function LoadingSpinnerIcon(props: IconProps) {
  return (
    <svg
      {...iconProps(props)}
      data-icon="loading-spinner"
      fill="none"
      viewBox="377 486 20 20"
    >
      <rect
        fill="currentColor"
        height="4.58333"
        rx="1.14583"
        width="2.29167"
        x="385.854"
        y="486.833"
      />
      <rect
        fill="currentColor"
        height="4.58333"
        opacity="0.16"
        rx="1.14583"
        transform="rotate(45 392.672 488.708)"
        width="2.29167"
        x="392.672"
        y="488.708"
      />
      <rect
        fill="currentColor"
        height="4.58333"
        opacity="0.4"
        rx="1.14583"
        transform="matrix(0.707107 -0.707107 -0.707107 -0.707107 392.672 503.292)"
        width="2.29167"
      />
      <rect
        fill="currentColor"
        height="4.58333"
        opacity="0.28"
        rx="1.14583"
        transform="rotate(90 396.167 494.854)"
        width="2.29167"
        x="396.167"
        y="494.854"
      />
      <rect
        fill="currentColor"
        height="4.58333"
        opacity="0.52"
        rx="1.14583"
        width="2.29167"
        x="385.854"
        y="500.583"
      />
      <rect
        fill="currentColor"
        height="4.58333"
        opacity="0.64"
        rx="1.14583"
        transform="rotate(45 382.949 498.431)"
        width="2.29167"
        x="382.949"
        y="498.431"
      />
      <rect
        fill="currentColor"
        height="4.58333"
        opacity="0.88"
        rx="1.14583"
        transform="matrix(0.707107 -0.707107 -0.707107 -0.707107 382.949 493.569)"
        width="2.29167"
      />
      <rect
        fill="currentColor"
        height="4.58333"
        opacity="0.76"
        rx="1.14583"
        transform="rotate(90 382.417 494.854)"
        width="2.29167"
        x="382.417"
        y="494.854"
      />
    </svg>
  );
}

export function AlertCircleIcon(props: IconProps) {
  return (
    <svg
      {...iconProps(props)}
      data-icon="alert-circle"
      fill="none"
      viewBox="274 262 20 20"
    >
      <path
        d="M284 268.667V272M284 275.333H284.008M292.333 272C292.333 276.602 288.602 280.333 284 280.333C279.398 280.333 275.667 276.602 275.667 272C275.667 267.397 279.398 263.667 284 263.667C288.602 263.667 292.333 267.397 292.333 272Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.66667"
      />
    </svg>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <svg
      {...iconProps(props)}
      data-icon="arrow-left"
      fill="none"
      viewBox="0 0 20 20"
    >
      <path
        d="M18 10H2M8 4L2 10L8 16"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg
      {...iconProps(props)}
      data-icon="arrow-right"
      fill="none"
      viewBox="0 0 20 20"
    >
      <path
        d="M2 10H18M12 16L18 10L12 4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg
      {...iconProps(props)}
      data-icon="chevron-down"
      fill="none"
      viewBox="464 376 16 16"
    >
      <path
        d="M466 381L472 387L478 381"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function SuccessCheckIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)} data-icon="success-check" viewBox="0 0 64 64">
      <circle cx="32" cy="32" fill="currentColor" opacity="0.14" r="32" />
      <path
        d="m18 32 9 9 19-20"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
    </svg>
  );
}

export function PawIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)} data-icon="paw" viewBox="0 0 24 24">
      <path
        d="M12 10.7c-3.6 0-6.5 3.1-6.5 6.1 0 2.3 1.8 3.7 4 3.1.9-.3 1.7-.8 2.5-.8s1.6.5 2.5.8c2.2.6 4-.8 4-3.1 0-3-2.9-6.1-6.5-6.1ZM5.6 9.7c1.3-.4 1.8-2.1 1.2-3.8S4.7 3.2 3.4 3.7 1.6 5.8 2.2 7.5s2.1 2.7 3.4 2.2Zm4.3-1.4c1.4 0 2.5-1.7 2.5-3.8S11.3.7 9.9.7 7.4 2.4 7.4 4.5s1.1 3.8 2.5 3.8Zm8.5 1.4c1.3.5 2.8-.5 3.4-2.2s.1-3.3-1.2-3.8-2.8.5-3.4 2.2-.1 3.4 1.2 3.8Zm-4.3-1.4c1.4 0 2.5-1.7 2.5-3.8S15.5.7 14.1.7s-2.5 1.7-2.5 3.8 1.1 3.8 2.5 3.8Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <svg
      {...iconProps(props)}
      data-icon="mail"
      fill="none"
      viewBox="396 437 24 22"
    >
      <path
        d="M398 443L406.165 448.715C406.826 449.178 407.157 449.41 407.516 449.499C407.834 449.578 408.166 449.578 408.484 449.499C408.843 449.41 409.174 449.178 409.835 448.715L418 443M402.8 456H413.2C414.88 456 415.72 456 416.362 455.673C416.926 455.385 417.385 454.926 417.673 454.362C418 453.72 418 452.88 418 451.2V444.8C418 443.12 418 442.28 417.673 441.638C417.385 441.074 416.926 440.615 416.362 440.327C415.72 440 414.88 440 413.2 440H402.8C401.12 440 400.28 440 399.638 440.327C399.074 440.615 398.615 441.074 398.327 441.638C398 442.28 398 443.12 398 444.8V451.2C398 452.88 398 453.72 398.327 454.362C398.615 454.926 399.074 455.385 399.638 455.673C400.28 456 401.12 456 402.8 456Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function MarkerIcon(props: IconProps) {
  return (
    <svg
      {...iconProps(props)}
      data-icon="marker"
      fill="none"
      viewBox="334 436 20 24"
    >
      <path
        d="M344 449C345.657 449 347 447.657 347 446C347 444.343 345.657 443 344 443C342.343 443 341 444.343 341 446C341 447.657 342.343 449 344 449Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M344 458C348 454 352 450.418 352 446C352 441.582 348.418 438 344 438C339.582 438 336 441.582 336 446C336 450.418 340 454 344 458Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <svg
      {...iconProps(props)}
      data-icon="phone"
      fill="none"
      viewBox="268 436 24 24"
    >
      <path
        d="M276.38 444.853C277.076 446.303 278.025 447.662 279.227 448.863C280.428 450.065 281.787 451.014 283.236 451.71C283.361 451.769 283.424 451.799 283.502 451.822C283.783 451.904 284.127 451.845 284.364 451.675C284.431 451.628 284.488 451.57 284.603 451.456C284.952 451.106 285.127 450.932 285.303 450.817C285.966 450.386 286.82 450.386 287.483 450.817C287.659 450.932 287.834 451.106 288.183 451.456L288.378 451.651C288.91 452.182 289.175 452.448 289.32 452.733C289.607 453.301 289.607 453.971 289.32 454.539C289.175 454.824 288.91 455.09 288.378 455.621L288.221 455.779C287.691 456.309 287.426 456.573 287.066 456.776C286.667 457 286.046 457.162 285.588 457.16C285.175 457.159 284.893 457.079 284.328 456.919C281.295 456.058 278.433 454.433 276.045 452.045C273.657 449.657 272.032 446.795 271.171 443.761C271.011 443.197 270.931 442.915 270.93 442.502C270.928 442.044 271.09 441.423 271.314 441.024C271.516 440.664 271.781 440.399 272.311 439.869L272.468 439.711C273 439.18 273.266 438.914 273.551 438.77C274.119 438.483 274.789 438.483 275.356 438.77C275.642 438.914 275.907 439.18 276.439 439.711L276.634 439.906C276.983 440.256 277.158 440.431 277.272 440.607C277.703 441.269 277.703 442.124 277.272 442.787C277.158 442.963 276.983 443.137 276.634 443.487C276.519 443.601 276.462 443.659 276.414 443.725C276.244 443.963 276.186 444.307 276.267 444.587C276.29 444.666 276.32 444.729 276.38 444.853Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function CountryFlag({ country }: { country: "SK" | "CZ" }) {
  return (
    <Image
      alt=""
      aria-hidden="true"
      data-country={country}
      data-testid="phone-country-flag"
      draggable={false}
      height={16}
      // Next declares `*.svg` imports as `any` on purpose, to stay compatible
      // with @svgr/webpack: next/dist/client/image-types/global.d.ts
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      src={country === "SK" ? slovakFlag : czechFlag}
      width={24}
    />
  );
}
