/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sibol-green': '#006400', // Approximate green from screenshots
      }
    },
  },
  plugins: [],
}
