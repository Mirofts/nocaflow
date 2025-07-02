import i18n from './next-i18next.config.js';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: i18n.i18n, // ✅ on garde uniquement i18n ici
};

export default nextConfig;
