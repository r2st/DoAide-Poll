/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: '#F0B429',
        'gold-dark': '#D4991A',
        brand: {
          50: '#FFFDF5',
          100: '#FFF9E6',
          500: '#F0B429',
          600: '#D4991A',
          700: '#B8800F',
        },
      },
    },
  },
  plugins: [],
}
