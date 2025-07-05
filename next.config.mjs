/** @type {import('next').NextConfig} */
import path from 'path'; // FIX: Changed require to import

const nextConfig = {
  reactStrictMode: true, // Keep your existing settings
  images: {
    domains: [
      'lh3.googleusercontent.com', // Keep this if you use Google avatars
      'firebasestorage.googleapis.com' // Keep this for Firebase Storage images
    ],
  },
  i18n: {
    locales: ['en', 'fr'],
    defaultLocale: 'fr',
    localeDetection: false,
  },
  // If you also have localePath in next-i18next.config.js, ensure it matches.
  // For .mjs, path.resolve might not be needed if localePath handles it.
  // If your next-i18next.config.js imports 'path' with require(), you'll need to change that too
  // or use a helper function that provides path.resolve compatible with ES modules.
  // For direct usage in next.config.mjs, `path.join(process.cwd(), 'public/locales')` is also an option.
  // However, the domain fix is the immediate priority.
};

// For ES modules, you use 'export default' instead of 'module.exports'
export default nextConfig;