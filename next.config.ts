import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  staticPageGenerationTimeout: 180,
  experimental: {
    externalDir: true,
  },
  transpilePackages: [
    '@nex125/seatmap-core',
    '@nex125/seatmap-react',
    '@nex125/seatmap-viewer',
  ],
  allowedDevOrigins: [
    '127.0.0.1',
    'localhost',
    '127.0.0.1:3000',
    'localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3000',
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
    ],
  },
};

export default nextConfig;
