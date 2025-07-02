/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './{pages,components,app,src}/**/*.{js,ts,jsx,tsx,mdx}',
    './*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
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
  },
  plugins: [],
};
