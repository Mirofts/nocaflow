// next.config.mjs
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  productionBrowserSourceMaps: false,
  poweredByHeader: false,

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com', pathname: '/v0/b/**' },
    ],
  },

  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },

  i18n: {
    locales: ['en', 'fr'],
    defaultLocale: 'fr',
    localeDetection: false,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  // ⬇️ Fix Webpack for "node:" protocol and fs/path/url on client bundle
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'node:fs': 'fs',
      'node:path': 'path',
      'node:url': 'url',
    };

    // On the client, don't try to polyfill Node core
    if (!isServer) {
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        fs: false,
        path: false,
        url: false,
      };
    }
    return config;
  },
};

export default withBundleAnalyzer(nextConfig);
