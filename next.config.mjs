// next.config.mjs
import nextI18NextConfig from './next-i18next.config.js';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: nextI18NextConfig.i18n.locales,
    defaultLocale: nextI18NextConfig.i18n.defaultLocale,
  },
};
export default nextConfig;