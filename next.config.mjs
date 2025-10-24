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
  swcMinify: true, // Optimisation automatique du JS
  compress: true, // Active la compression gzip/brotli sur Vercel
  productionBrowserSourceMaps: false, // Évite d’exposer ton code source
  poweredByHeader: false, // Supprime le header "X-Powered-By: Next.js" (sécurité)
  
  images: {
    formats: ['image/avif', 'image/webp'], // Formats modernes
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Avatars Google
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com', // Images Firebase
        pathname: '/v0/b/**',
      },
    ],
  },

  experimental: {
    optimizeCss: true, // Réduit le poids du CSS
    scrollRestoration: true, // Améliore le retour à la position de scroll
  },

  i18n: {
    locales: ['en', 'fr'],
    defaultLocale: 'fr',
    localeDetection: false,
  },

  eslint: {
    ignoreDuringBuilds: true, // Empêche les erreurs ESLint de bloquer le déploiement
  },
};

export default withBundleAnalyzer(nextConfig);
