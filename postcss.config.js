module.exports = {
  plugins: {
    // Le nom du plugin doit être une chaîne de caractères (string) ou une clé d'objet,
    // pas un appel require() qui retourne une fonction.
    // Next.js se chargera de faire le require() interne.
    tailwindcss: {},
    autoprefixer: {},
    // Si vous aviez postcss-nesting et que vous voulez l'activer :
    // 'postcss-nesting': {},
  },
};