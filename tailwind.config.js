/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'medical-blue': {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BCE3FF',
          300: '#7CC8FF',
          400: '#36ACFF',
          500: '#0891FF',
          600: '#0070E0',
          700: '#0159B3',
          800: '#064C8C',
          900: '#0B406F',
        },
        'navy': '#0F2657',
      },
    },
  },
  plugins: [],
}