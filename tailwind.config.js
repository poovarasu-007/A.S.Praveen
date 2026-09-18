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
          50:  '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
          950: '#052E16',
          gold:      '#F59E0B',
          goldLight: '#FEF3C7',
          brown:     '#92400E',
          brownDark: '#78350F',
          cream:     '#FFFBEB',
          bg:        '#F0FDF4',
        },
        // Green & Gold accent palette
        brand: {
          gold:       '#F59E0B',
          goldDark:   '#D97706',
          goldDeep:   '#B45309',
          green:      '#22C55E',
          greenDark:  '#16A34A',
          greenDeep:  '#14532D',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Courier New', 'Courier', 'monospace'],
      },
      backgroundImage: {
        'gold-green-h':    'linear-gradient(135deg,#F59E0B,#D97706,#16A34A,#14532D)',
        'green-sidebar':   'linear-gradient(180deg,#14532D 0%,#166534 50%,#166534 100%)',
      },
      animation: {
        'shimmer': 'shimmer 2.5s linear infinite',
        'float':   'float 4s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':     { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
