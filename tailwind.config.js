// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // Scanne les fichiers dans src/
    "./pages/**/*.{js,ts,jsx,tsx,mdx}", // Scanne les fichiers dans pages/ (si vous en avez en dehors de src/)
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // Scanne les fichiers dans components/ (si vous en avez en dehors de src/)
  ],
  theme: {
    extend: {}, // Laissez vide pour l'instant
  },
  plugins: [], // Laissez vide pour l'instant
};