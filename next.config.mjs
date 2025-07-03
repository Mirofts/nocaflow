// next.config.mjs
import path from 'path'; // <-- Correction ici : utilisez 'import' au lieu de 'require'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Le bloc 'experimental' est correctement géré.
  // Si 'serverActions' n'est pas utilisé ou doit être un objet vide, c'est bon.
  experimental: {}, // Gardez-le vide si pas d'autres options expérimentales

  i18n: {
    locales: ['en', 'fr'],
    defaultLocale: 'fr', // Assurez-vous que c'est votre langue par défaut désirée
  },
};

export default nextConfig;