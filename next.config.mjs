// next.config.mjs

import { i18n } from './next-i18next.config'; // Change require to import

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n,
};

export default nextConfig; // Change module.exports to export default