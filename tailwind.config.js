/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f0f0f',
        foreground: '#f5f5f5',
        primary: '#f97316',
        border: '#2a2a2a',
      },
    },
  },
  plugins: [],
}