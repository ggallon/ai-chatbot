import bundleAnalyzer from '@next/bundle-analyzer';

import type { NextConfig } from 'next';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  eslint: {
    // By default, Next.js will run ESLint for all files
    // in the pages/, app/, components/, lib/, and src/ directories
    dirs: ['app', 'artifacts', 'components', 'hooks', 'lib', 'types'],
    ignoreDuringBuilds: process.env.ANALYZE === 'true',
  },
  typescript: {
    ignoreBuildErrors: process.env.ANALYZE === 'true',
  },
  experimental: {
    ppr: 'incremental',
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
        hostname: 'avatar.vercel.sh',
      },
    ],
  },
};

export default withBundleAnalyzer(nextConfig);
