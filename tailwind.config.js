/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // La méthode la plus large pour s'assurer que Tailwind trouve toutes les classes.
    // Cela inclut toutes les pages, composants, et fichiers sous 'src' et à la racine.
    './{pages,components,app,src}/**/*.{js,ts,jsx,tsx,mdx}', // <--- MODIFICATION ICI
    './*.{js,ts,jsx,tsx,mdx}', // Pour les fichiers directement à la racine (comme next.config.mjs si des classes y étaient)
  ],
  theme: {
    extend: {
      // Gardez vos couleurs étendues ici. Elles sont cruciales.
      colors: {
        'color-bg-primary': 'var(--color-bg-primary)',
        'color-bg-secondary': 'var(--color-bg-secondary)',
        'color-bg-tertiary': 'var(--color-bg-tertiary)',
        'color-bg-input': 'var(--color-bg-input)',
        'color-bg-input-field': 'var(--color-bg-input-field)',
        'color-bg-hover': 'var(--color-bg-hover)',

        'color-text-primary': 'var(--color-text-primary)',
        'color-text-secondary': 'var(--color-text-secondary)',
        'color-text-tertiary': 'var(--color-text-tertiary)',
        
        'color-border-primary': 'var(--color-border-primary)',
        'color-border-input': 'var(--color-border-input)',
        'color-border-active': 'var(--color-border-active)',

        'glass-nav-bg': 'var(--glass-nav-bg)',
        'glass-card-bg': 'var(--glass-card-bg)',
        'glass-card-border': 'var(--glass-card-border)',
        
        'color-message-other-bg-light': 'var(--color-message-other-bg-light)',
        'color-message-other-text-light': 'var(--color-message-other-text-light)',

        'shadow-color': 'var(--shadow-color)',
        'color-border-active-shadow': 'var(--color-border-active-shadow)',
      },
            borderRadius: {
        '2xl': '1.25rem', // 👈 Ajout de rounded-2xl ici
    },
  },
  plugins: [],
};