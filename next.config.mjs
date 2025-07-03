/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // serverActions n'est plus nécessaire ici ou doit être un objet s'il est utilisé.
    // Supprimé pour éviter l'erreur "Expected object, received boolean"
  },
  i18n: {
    locales: ['en', 'fr'],
    defaultLocale: 'fr',
    localeDetection: true, // ⚠ tu avais "false" (string), ici c’est un boolean
  },
};

export default nextConfig;
