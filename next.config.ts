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
  images: {
    unoptimized: true,
  },
  poweredByHeader: false,
  experimental: {
    // Turbopack persists its module graph in .next/cache, so a rebuild after an
    // unchanged dependency graph skips compilation entirely (2.6s -> 0.1s). CI
    // already restores .next/cache, which was previously near-empty without this.
    turbopackFileSystemCacheForBuild: true,
  },
};

export default nextConfig;
