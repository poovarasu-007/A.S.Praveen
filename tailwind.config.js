/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Premium Dark Architectural Palette ──────────────────────────
        navy: {
          950: '#000d1a',
          900: '#011425',  // primary dark bg
          800: '#081e2e',
          700: '#0d2438',
          600: '#122c43',
          500: '#1a3650',
        },
        deep: {
          900: '#0d2233',
          800: '#1a3244',
          700: '#1F4959',  // major bg sections
          600: '#285c6e',
          500: '#316f83',
        },
        slate: {
          arch: '#5C7C89',  // secondary surfaces & highlights
        },
        charcoal: {
          900: '#1a1a1a',
          800: '#242424',   // dark panels/buttons
          700: '#2e2e2e',
          600: '#3a3a3a',
        },
        // Legacy agri palette preserved for any remaining references
        agri: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        brand: {
          purple: '#8B5CF6',
          blue:   '#3B82F6',
          cyan:   '#06B6D4',
          teal:   '#14B8A6',
          orange: '#F97316',
          rose:   '#F43F5E',
          pink:   '#EC4899',
          yellow: '#EAB308',
          lime:   '#84CC16',
          indigo: '#6366F1',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans:    ['Manrope', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono:    ['"Courier New"', 'Courier', 'monospace'],
      },
      backgroundImage: {
        // Arch gradient overlays
        'arch-radial':  'radial-gradient(ellipse 80% 60% at 50% 100%, #1F4959 0%, #011425 60%, #000d1a 100%)',
        'arch-inner':   'radial-gradient(ellipse 60% 80% at 50% 110%, #5C7C89 0%, transparent 70%)',
        'nav-active':   'linear-gradient(90deg, #1F4959 0%, rgba(31,73,89,0.4) 100%)',
        // Legacy
        'rainbow-h':       'linear-gradient(135deg,#F59E0B,#EF4444,#8B5CF6,#3B82F6,#22C55E)',
        'rainbow-sidebar': 'linear-gradient(180deg,#14532D 0%,#166534 30%,#1D4ED8 60%,#7C3AED 100%)',
      },
      boxShadow: {
        'arch-glow':   '0 0 60px rgba(92,124,137,0.15), 0 0 120px rgba(31,73,89,0.1)',
        'card-glass':  '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        'input-focus': '0 0 0 2px rgba(92,124,137,0.4)',
        'btn-hover':   '0 8px 24px rgba(31,73,89,0.4)',
      },
      borderColor: {
        'glass': 'rgba(92,124,137,0.25)',
        'glass-light': 'rgba(92,124,137,0.15)',
      },
      keyframes: {
        'arch-reveal': {
          '0%':   { opacity: '0', transform: 'scaleY(0.8) translateY(30px)' },
          '100%': { opacity: '1', transform: 'scaleY(1) translateY(0)' },
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
        'slide-in-left': {
          '0%':   { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-down': {
          '0%':   { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'spin-slow': {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'arch-reveal':    'arch-reveal 1s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-up':        'fade-up 0.6s ease-out forwards',
        'fade-up-slow':   'fade-up 0.9s ease-out forwards',
        'fade-in':        'fade-in 0.5s ease-out forwards',
        'float':          'float 4s ease-in-out infinite',
        'shimmer':        'shimmer 2.5s linear infinite',
        'pulse-soft':     'pulse-soft 2s ease-in-out infinite',
        'slide-in-left':  'slide-in-left 0.4s ease-out forwards',
        'slide-down':     'slide-down 0.35s ease-out forwards',
        'scale-in':       'scale-in 0.3s ease-out forwards',
        'spin-slow':      'spin-slow 3s linear infinite',
      },
      transitionTimingFunction: {
        'arch': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
