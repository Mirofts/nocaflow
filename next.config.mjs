// next.config.mjs
import i18nConfig from './next-i18next.config.js';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...i18nConfig, // <-- Injecte toute la config i18n proprement
};

export default nextConfig;
