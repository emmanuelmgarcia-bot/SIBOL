/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        chedBlue: '#1e3a8a', // Deep Navy
        chedGold: '#fbbf24', // Accent Yellow
      }
    },
  },
  plugins: [],
}