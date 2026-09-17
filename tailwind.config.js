/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        agri: {
          50: '#F4F9F4',
          100: '#E8F5E9',
          200: '#C8E6C9',
          300: '#A5D6A7',
          400: '#81C784',
          500: '#4CAF50',
          600: '#2E7D32', // Earthy Green
          700: '#1B5E20', // Dark Forest Green
          800: '#144617',
          900: '#0A3811',
          gold: '#C9A227', // Harvest Gold
          goldLight: '#FDF7E7',
          brown: '#795548', // Soil Brown
          brownDark: '#4E342E',
          cream: '#FBF9F3', // Cream / Off White
          bg: '#F5F7F4',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Courier New', 'Courier', 'monospace'],
      }
    },
  },
  plugins: [],
}
