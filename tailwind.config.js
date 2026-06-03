/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fffbea',
          100: '#fff1c5',
          200: '#ffe28a',
          300: '#ffca40',
          400: '#ffb51b',
          500: '#d4af37',
          600: '#b8860b',
          700: '#916408',
          800: '#77500d',
          900: '#664411',
          950: '#3b2405',
        },
      },
    },
  },
  plugins: [],
};
