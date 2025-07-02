module.exports = {
  plugins: {
    '@tailwindcss/postcss': {}, // C'est la syntaxe exacte attendue par Next.js/PostCSS pour ce package.
    autoprefixer: {},
    // Si vous utilisez postcss-nesting et que vous voulez l'activer :
    // 'postcss-nesting': {}, // Décommentez cette ligne si nécessaire
  },
};