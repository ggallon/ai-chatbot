import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    dirs: ["ai", "app", "components", "db", "hook", "lib"],
  },
  experimental: {
    ppr: true,
  },
  logging: {
    fetches: {
      fullUrl: true,
      // fetch requests that are restored from the HMR cache are logged during an HMR refresh request
      hmrRefreshes: true,
    },
  },
  images: {
    remotePatterns: [
      {
        hostname: "avatar.vercel.sh",
      },
    ],
  },
};

export default nextConfig;
