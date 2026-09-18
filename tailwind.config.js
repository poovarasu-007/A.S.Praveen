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
        // Vibrant accent palette used across the colourful theme
        brand: {
          purple:  '#8B5CF6',
          blue:    '#3B82F6',
          cyan:    '#06B6D4',
          teal:    '#14B8A6',
          orange:  '#F97316',
          rose:    '#F43F5E',
          pink:    '#EC4899',
          yellow:  '#EAB308',
          lime:    '#84CC16',
          indigo:  '#6366F1',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Courier New', 'Courier', 'monospace'],
      },
      backgroundImage: {
        'rainbow-h': 'linear-gradient(135deg,#F59E0B,#EF4444,#8B5CF6,#3B82F6,#22C55E)',
        'rainbow-sidebar': 'linear-gradient(180deg,#14532D 0%,#166534 30%,#1D4ED8 60%,#7C3AED 100%)',
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
