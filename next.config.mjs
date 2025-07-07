import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true, // Recommandé pour Next.js 12+ pour une meilleure performance
  images: {
    // Remplacer 'domains' par 'remotePatterns' comme recommandé par Next.js
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Pour les avatars Google par exemple
        // pathname: '/a/**', // Ajoutez un chemin si nécessaire pour restreindre
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com', // Pour Firebase Storage
        pathname: '/v0/b/**', // Chemin typique pour Firebase Storage buckets
      },
      // Ajoutez d'autres patterns pour d'autres sources d'images externes si vous en avez
    ],
  },
  i18n: {
    locales: ['en', 'fr'],
    defaultLocale: 'fr',
    localeDetection: false, // Conserver si c'est votre intention de désactiver la détection automatique
  },
};

export default withBundleAnalyzer(nextConfig);