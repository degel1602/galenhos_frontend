/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        navy: {
          900: '#07153a',
          800: '#091a45',
        },
        blue: {
          700: '#263c7a',
          hover: '#22366e',
        },
        sky: {
          400: '#66b6ff',
        },
      },
    },
  },
  plugins: [],
}
