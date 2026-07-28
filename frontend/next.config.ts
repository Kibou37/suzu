import type { NextConfig } from 'next';
import path from 'path';

const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const basePath = isGitHubPages ? '/suzu' : '';
const apiProxyTarget = resolveApiUrl(
  process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL,
  'http://localhost:4000',
);

function resolveApiUrl(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

if (isGitHubPages) {
  process.env.NEXT_PUBLIC_BASE_PATH = basePath;
}

const nextConfig: NextConfig = {
  ...(isGitHubPages ? { output: 'export' as const } : {}),
  basePath,
  assetPrefix: isGitHubPages ? '/suzu/' : undefined,
  transpilePackages: ['@suzuki/shared'],
  images: {
    unoptimized: isGitHubPages,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'img.perxis.ru',
      },
      {
        protocol: 'https',
        hostname: 'www.globalsuzuki.com',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "script-src 'none'; sandbox;",
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
  turbopack: {
    root: path.join(__dirname, '..'),
  },
  async rewrites() {
    if (isGitHubPages) {
      return [];
    }

    return [
      {
        source: '/api/:path*',
        destination: `${apiProxyTarget.replace(/\/$/, '')}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${apiProxyTarget.replace(/\/$/, '')}/uploads/:path*`,
      },
    ];
  },
  // Static export (GitHub Pages) can't set response headers — the host
  // (e.g. the reverse proxy in front of the real deployment) must add
  // these instead.
  async headers() {
    if (isGitHubPages) {
      return [];
    }

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
