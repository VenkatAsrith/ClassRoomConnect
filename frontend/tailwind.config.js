/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        charcoal: {
          DEFAULT: '#1A1A1A',
          hover: '#2A2A2A',
          muted: '#71717A'
        },
        softgray: {
          DEFAULT: '#F5F5F5',
          dark: '#EBEBEB'
        },
        accentblue: {
          DEFAULT: '#2E4F6B',
          hover: '#233C52'
        },
        goldgreen: {
          DEFAULT: '#10B981',
          light: '#D1FAE5'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
