/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],

  theme: {
    extend: {
      colors: {
        // ─────────────────────────────────────────────
        // REFERENCE IMAGE — SOFT BOTANICAL GREEN PALETTE
        // ─────────────────────────────────────────────

        mint: {
          50: '#F7FCF5',
          100: '#EAF8E7', // Pale card / light surface
          200: '#E3F5DD', // Main background
          300: '#C1E6BA', // Soft green
          400: '#9ED2A0',
          500: '#70BC88',
          600: '#4EA674', // Main green
          700: '#38895F',
          800: '#1E684E',
          900: '#023337', // Deep teal
          950: '#01282B',
        },

        // Main brand palette
        brand: {
          dark: '#023337',
          green: '#4EA674',
          soft: '#C1E6BA',
          pale: '#EAF8E7',
          background: '#E3F5DD',

          // Additional compatible shades
          greenLight: '#70BC88',
          greenDark: '#38895F',
          teal: '#023337',
        },

        // Background / surface colors
        surface: {
          50: '#F7FCF5',
          100: '#EAF8E7',
          200: '#E3F5DD',
          300: '#C1E6BA',
        },

        // Keep these aliases if existing components use them
        navy: {
          950: '#01282B',
          900: '#023337',
          800: '#0A4545',
          700: '#14594F',
          600: '#28745B',
          500: '#4EA674',
        },

        deep: {
          900: '#023337',
          800: '#14594F',
          700: '#28745B',
          600: '#38895F',
          500: '#4EA674',
        },

        slate: {
          arch: '#70BC88',
        },

        charcoal: {
          900: '#173B36',
          800: '#245044',
          700: '#356653',
          600: '#4A7A65',
        },

        // Legacy agriculture palette updated to match reference
        agri: {
          50: '#F7FCF5',
          100: '#EAF8E7',
          200: '#E3F5DD',
          300: '#C1E6BA',
          400: '#9ED2A0',
          500: '#70BC88',
          600: '#4EA674',
          700: '#38895F',
          800: '#1E684E',
          900: '#023337',
          950: '#01282B',
        },
      },

      // ─────────────────────────────────────────────
      // TYPOGRAPHY
      // ─────────────────────────────────────────────

      fontFamily: {
        display: [
          '"Playfair Display"',
          'Cormorant Garamond',
          'Georgia',
          'serif',
        ],

        sans: [
          'Manrope',
          'Inter',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],

        mono: [
          '"Courier New"',
          'Courier',
          'monospace',
        ],
      },

      // ─────────────────────────────────────────────
      // REFERENCE-STYLE BACKGROUNDS
      // ─────────────────────────────────────────────

      backgroundImage: {
        // Main pale green background
        'botanical-bg':
          'linear-gradient(180deg, #E3F5DD 0%, #EAF8E7 100%)',

        // Soft green gradient
        'green-gradient':
          'linear-gradient(135deg, #023337 0%, #4EA674 100%)',

        // Light green gradient
        'mint-gradient':
          'linear-gradient(135deg, #C1E6BA 0%, #EAF8E7 100%)',

        // Dark-to-green gradient
        'brand-gradient':
          'linear-gradient(135deg, #023337 0%, #4EA674 100%)',

        // Soft radial background
        'arch-radial':
          'radial-gradient(ellipse 80% 60% at 50% 100%, #C1E6BA 0%, #E3F5DD 60%, #EAF8E7 100%)',

        'arch-inner':
          'radial-gradient(ellipse 60% 80% at 50% 110%, #4EA674 0%, transparent 70%)',

        // Navigation active state
        'nav-active':
          'linear-gradient(90deg, #C1E6BA 0%, rgba(78,166,116,0.35) 100%)',
      },

      // ─────────────────────────────────────────────
      // SHADOWS
      // ─────────────────────────────────────────────

      boxShadow: {
        // Soft reference-image shadow
        'soft':
          '0 8px 24px rgba(2, 51, 55, 0.10)',

        'soft-lg':
          '0 12px 35px rgba(2, 51, 55, 0.14)',

        'green':
          '0 8px 24px rgba(78, 166, 116, 0.25)',

        'green-lg':
          '0 12px 40px rgba(78, 166, 116, 0.30)',

        // Updated architectural aliases
        'arch-glow':
          '0 0 60px rgba(78, 166, 116, 0.18), 0 0 120px rgba(193, 230, 186, 0.15)',

        'card-glass':
          '0 4px 24px rgba(2, 51, 55, 0.12), inset 0 1px 0 rgba(255,255,255,0.6)',

        'input-focus':
          '0 0 0 2px rgba(78, 166, 116, 0.35)',

        'btn-hover':
          '0 8px 24px rgba(78, 166, 116, 0.30)',
      },

      // ─────────────────────────────────────────────
      // BORDERS
      // ─────────────────────────────────────────────

      borderColor: {
        glass: 'rgba(78, 166, 116, 0.25)',
        'glass-light': 'rgba(78, 166, 116, 0.15)',
        mint: '#C1E6BA',
        green: '#4EA674',
      },

      // ─────────────────────────────────────────────
      // ANIMATIONS
      // ─────────────────────────────────────────────

      keyframes: {
        'arch-reveal': {
          '0%': {
            opacity: '0',
            transform: 'scaleY(0.8) translateY(30px)',
          },
          '100%': {
            opacity: '1',
            transform: 'scaleY(1) translateY(0)',
          },
        },

        'fade-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },

        'fade-in': {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },

        float: {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-8px)',
          },
        },

        shimmer: {
          '0%': {
            backgroundPosition: '-200% 0',
          },
          '100%': {
            backgroundPosition: '200% 0',
          },
        },

        'pulse-soft': {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '0.6',
          },
        },

        'slide-in-left': {
          '0%': {
            opacity: '0',
            transform: 'translateX(-20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },

        'slide-down': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },

        'scale-in': {
          '0%': {
            opacity: '0',
            transform: 'scale(0.95)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },

        'spin-slow': {
          '0%': {
            transform: 'rotate(0deg)',
          },
          '100%': {
            transform: 'rotate(360deg)',
          },
        },
      },

      animation: {
        'arch-reveal':
          'arch-reveal 1s cubic-bezier(0.16,1,0.3,1) forwards',

        'fade-up':
          'fade-up 0.6s ease-out forwards',

        'fade-up-slow':
          'fade-up 0.9s ease-out forwards',

        'fade-in':
          'fade-in 0.5s ease-out forwards',

        float:
          'float 4s ease-in-out infinite',

        shimmer:
          'shimmer 2.5s linear infinite',

        'pulse-soft':
          'pulse-soft 2s ease-in-out infinite',

        'slide-in-left':
          'slide-in-left 0.4s ease-out forwards',

        'slide-down':
          'slide-down 0.35s ease-out forwards',

        'scale-in':
          'scale-in 0.3s ease-out forwards',

        'spin-slow':
          'spin-slow 3s linear infinite',
      },

      transitionTimingFunction: {
        arch: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },

  plugins: [],
};
