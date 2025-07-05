import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'lh3.googleusercontent.com',
      'firebasestorage.googleapis.com',
    ],
  },
  i18n: {
    locales: ['en', 'fr'],
    defaultLocale: 'fr',
    localeDetection: false,
  },
};

export default withBundleAnalyzer(nextConfig);
