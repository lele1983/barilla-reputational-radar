/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        barilla: {
          red: '#c8102e',
          blue: '#002b5c',
          gold: '#d4a843',
          dark: '#0a1628',
          surface: '#111827',
          card: '#1f2937',
          border: '#374151',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    }
  },
  plugins: []
};
