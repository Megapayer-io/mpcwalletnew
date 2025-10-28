/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        // Megapayer colors
        'megapayer': {
          'bg': 'var(--bg)',
          'panel': 'var(--panel)',
          'panel-soft': 'var(--panel-soft)',
          'text': 'var(--text)',
          'muted': 'var(--muted)',
          'teal': 'var(--teal)',
          'violet': 'var(--violet)',
          'emerald': 'var(--emerald)',
          'accent': 'var(--accent)',
          'border': 'var(--border)',
          'border-soft': 'var(--border-soft)',
        },
      },
      fontFamily: {
        'sans': ['var(--font-inter)', 'Inter', 'system-ui', 'Arial', 'Helvetica', 'sans-serif'],
        'heading': ['var(--font-sora)', 'Sora', 'system-ui', 'Arial', 'Helvetica', 'sans-serif'],
      },
      boxShadow: {
        'megapayer': 'var(--shadow)',
      },
    },
  },
  plugins: [],
}
