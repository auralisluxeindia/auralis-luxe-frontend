/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss}"
  ],
  theme: {
    extend: {
      colors: {
        gold: '#d4af37',
        ivory: '#fffaf3',
        champagne: '#f5deb3',
        luxe: {
          light: '#faf9f7',
          dark: '#1b1b1b',
        }
      },
      fontFamily: {
        sans: ['Playfair', 'sans-serif'],
      },
    },
  },
  plugins: [],
}