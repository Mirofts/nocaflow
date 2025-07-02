module.exports = {
  plugins: [
    require('tailwindcss'), // <-- CORRECTION ICI
    require('autoprefixer'), // <-- CORRECTION ICI
    // Si vous utilisez postcss-nesting, décommentez et ajoutez :
    // require('postcss-nesting'),
  ],
};