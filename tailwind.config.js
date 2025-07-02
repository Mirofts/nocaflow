/** @type {import('tailwindcss').Config} */
module.exports = {
  // Assurez-vous que ces chemins sont CORRECTS et couvrent TOUS vos fichiers où vous utilisez des classes Tailwind.
  // Le chemin './src/**/*.{js,ts,jsx,tsx,mdx}' devrait couvrir la plupart des cas
  // si tous vos composants et pages sont sous 'src/'.
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}', // Pour les pages directement à la racine (ex: pages/index.js, pages/dashboard.js)
    './components/**/*.{js,ts,jsx,tsx,mdx}', // Pour les composants directement à la racine (peu probable si tout est sous src/)
    './src/**/*.{js,ts,jsx,tsx,mdx}', // Pour tout ce qui se trouve dans le répertoire 'src'
    // Ajoutez d'autres chemins si vous avez des fichiers avec des classes Tailwind ailleurs
    // par exemple, si vous avez des fichiers HTML statiques ou d'autres répertoires de contenu.
  ],
  theme: {
    extend: {
      // Si vous avez des classes personnalisées qui étendent le thème de Tailwind
      // par exemple, des couleurs, des tailles de police, etc.
      // Par exemple, pour les couleurs des variables CSS :
      colors: {
        'color-bg-primary': 'var(--color-bg-primary)',
        'color-bg-secondary': 'var(--color-bg-secondary)',
        // ... ajoutez toutes vos variables CSS ici si vous voulez les utiliser directement comme classes Tailwind
        // Exemple: <div className="bg-color-bg-primary">
      },
    },
  },
  plugins: [], // Laissez vide si vous n'avez pas de plugins Tailwind spécifiques
};