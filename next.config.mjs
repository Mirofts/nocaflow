// next.config.mjs

import { i18n } from './next-i18next.config.js';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n,
};

export default nextConfig; // Change module.exports to export default