import { i18n } from './next-i18next.config.mjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n,
  reactStrictMode: true,
  experimental: {
    serverActions: true
  },
  images: {
    domains: ['res.cloudinary.com']
  }
};

export default nextConfig;
