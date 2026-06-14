/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        base: {
          950: '#fafaf9',
          900: '#f5f5f4',
          800: '#ffffff',
          700: '#e7e5e4',
          600: '#d6d3d1',
          500: '#a8a29e',
          400: '#78716c',
          border: '#e7e5e4',
          'border-light': '#f5f5f4'
        },
        brand: {
          DEFAULT: '#f94b25',
          soft: '#fa6a4a',
          dim: '#d43a1a',
          pale: '#fed7cc',
          glow: 'rgba(249, 75, 37, 0.12)',
          'glow-intense': 'rgba(249, 75, 37, 0.25)'
        },
        lime: {
          DEFAULT: '#a3e635',
          soft: '#bef264',
          dim: '#84cc16',
          pale: '#d9f99d',
        },
        glass: {
          white: 'rgba(255, 255, 255, 0.7)',
          hover: 'rgba(249, 75, 37, 0.04)',
          active: 'rgba(249, 75, 37, 0.08)',
          border: 'rgba(0, 0, 0, 0.06)',
          card: 'rgba(255, 255, 255, 0.8)'
        },
        label: {
          primary: '#0a0915',
          secondary: '#52525a',
          tertiary: '#71717a',
          quaternary: '#a1a1aa'
        },
        status: {
          pending: '#f59e0b',
          confirmed: '#10b981',
          cancelled: '#ef4444',
          draft: '#78716c'
        }
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-manrope)', 'system-ui', 'sans-serif']
      },
      fontSize: {
        'giant': 'clamp(4rem, 12vw, 10rem)',
        'hero': 'clamp(2.5rem, 6vw, 5rem)',
        'display': 'clamp(1.8rem, 4vw, 3.2rem)',
        'impact': 'clamp(1.2rem, 2.5vw, 1.8rem)'
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px'
      },
      boxShadow: {
        'card-sm': '0 1px 2px rgba(0,0,0,0.05)',
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)',
        elevated: '0 8px 24px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
        dialog: '0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)',
        glow: '0 0 20px rgba(249,75,37,0.15)',
        'glow-lg': '0 0 40px rgba(249,75,37,0.25)',
        'glow-xl': '0 0 60px rgba(249,75,37,0.35)',
        'glow-lime': '0 0 20px rgba(163,230,53,0.2)',
        'inner-sm': 'inset 0 1px 0 rgba(255,255,255,0.6)',
        'inner-md': 'inset 0 1px 0 rgba(255,255,255,0.8)'
      },
      spacing: {
        sidebar: '240px',
        'sidebar-collapsed': '56px'
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'fade-up': 'fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-right': 'slideRight 0.2s ease-out',
        'skeleton': 'skeleton 1.5s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'spin-slow': 'spin 2s linear infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'drift': 'drift 8s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'arc-spin': 'arcSpin 16s linear infinite',
        'orbit-spin': 'orbitSpin 12s linear infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        'progress-fill': 'progressFill 2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'bar-rise': 'barRise 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'ticker-scroll': 'tickerScroll 50s linear infinite',
        'ticker-scroll-reverse': 'tickerScrollReverse 45s linear infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-4px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        skeleton: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' }
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' }
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(249,75,37,0.12)' },
          '50%': { boxShadow: '0 0 40px rgba(249,75,37,0.25)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        drift: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '33%': { transform: 'translate(5px, -5px)' },
          '66%': { transform: 'translate(-3px, 3px)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        arcSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        orbitSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        progressFill: {
          '0%': { width: '0%' },
          '100%': { width: '68%' }
        },
        barRise: {
          '0%': { transform: 'scaleY(0)' },
          '100%': { transform: 'scaleY(1)' }
        },
        tickerScroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        },
        tickerScrollReverse: {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' }
        }
      }
    }
  },
  plugins: []
};
