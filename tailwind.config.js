/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,css}",
    "./style.css",
  ],
  theme: {
    extend: {
      colors: {
        'locus-blue': {
          50: '#EEF6FF',
          100: '#D8E9FF',
          200: '#B6D5FF',
          300: '#89BAFF',
          400: '#549BFF',
          500: '#1C76E6',
          600: '#165EBF',
          700: '#124B95',
          800: '#103D74',
          900: '#0E315B',
        },
        'medical-blue': {
          50: '#EEF6FF',
          100: '#D8E9FF',
          200: '#B6D5FF',
          300: '#89BAFF',
          400: '#549BFF',
          500: '#1C76E6',
          600: '#165EBF',
          700: '#124B95',
          800: '#103D74',
          900: '#0E315B',
        },
        'locus-gold': '#FFB703',
        'locus-cyan': '#00B4D8',
        'navy': '#0B2A5E',
        'locus-navy': '#0B2A5E',
      },
    },
  },
  plugins: [],
}