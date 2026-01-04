/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Status colors with better semantic naming
        status: {
          kept: {
            bg: '#dcfce7',
            text: '#14532d',
            border: '#86efac',
          },
          broken: {
            bg: '#fef2f2',
            text: '#7f1d1d',
            border: '#fca5a5',
          },
          pending: {
            bg: '#fffbeb',
            text: '#78350f',
            border: '#fcd34d',
          },
          progress: {
            bg: '#eff6ff',
            text: '#1e3a8a',
            border: '#93c5fd',
          },
          compromised: {
            bg: '#fff7ed',
            text: '#7c2d12',
            border: '#fdba74',
          },
        },
      },
    },
  },
  plugins: [],
}
