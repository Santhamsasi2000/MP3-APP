/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#e94560',
        dark: '#0f0f1e',
        darker: '#16213e',
        card: '#1a1a2e',
      },
    },
  },
  plugins: [],
}