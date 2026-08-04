import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath,
  trailingSlash: true,
  compiler: {
    styledComponents: true,
  },
  // Auto-memoizes the client tree: 31 "use client" files driving a three-step
  // react-hook-form flow. Next runs SWC first to select only the JSX/hook files
  // the Babel pass touches, so the styledComponents transform above still runs.
  reactCompiler: true,
  images: {
    unoptimized: true,
  },
  poweredByHeader: false,
};

export default nextConfig;
