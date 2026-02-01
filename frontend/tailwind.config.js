/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        surface2: 'rgb(var(--surface2) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        text: 'rgb(var(--text) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        brand: {
          50: '#eef5ff',
          100: '#d9e8ff',
          200: '#b7d3ff',
          300: '#86b5ff',
          400: '#4c8cff',
          500: '#2f6bff',
          600: '#2563eb',
          700: '#1b3fca',
          800: '#1c359f',
          900: '#1b2f7f',
        },
        ok: '#16a34a',
        warn: '#f59e0b',
        bad: '#ef4444',
      },
      fontFamily: {
        sans: ['Cereal', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

