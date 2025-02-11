import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // By default, Next.js will run ESLint for all files
    // in the pages/, app/, components/, lib/, and src/ directories
    dirs: ['app', 'blocks', 'components', 'hooks', 'lib'],
  },
  experimental: {
    newDevOverlay: true,
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
        hostname: 'avatar.vercel.sh',
      },
    ],
  },
};

export default nextConfig;
