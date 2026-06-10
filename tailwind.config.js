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
          950: '#030303',
          900: '#0A0A0B',
          800: '#111113',
          700: '#1A1A1D',
          600: '#222226',
          500: '#2C2C30',
          400: '#3A3A40',
          border: '#1E1E22',
          'border-light': '#2A2A30'
        },
        brand: {
          DEFAULT: '#06B6D4',
          soft: '#22D3EE',
          dim: '#0891B2',
          pale: '#67E8F9',
          glow: 'rgba(6,182,212,0.15)',
          'glow-intense': 'rgba(6,182,212,0.3)'
        },
        glass: {
          white: 'rgba(255,255,255,0.04)',
          hover: 'rgba(255,255,255,0.08)',
          active: 'rgba(255,255,255,0.1)',
          border: 'rgba(255,255,255,0.06)',
          card: 'rgba(255,255,255,0.03)'
        },
        label: {
          primary: '#F1F1F3',
          secondary: '#94949E',
          tertiary: '#63636E',
          quaternary: '#444450'
        },
        status: {
          pending: '#F59E0B',
          confirmed: '#22C55E',
          cancelled: '#EF4444',
          draft: '#63636E'
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-inter)', 'system-ui', 'sans-serif']
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
        'card-sm': '0 1px 2px rgba(0,0,0,0.3)',
        card: '0 1px 3px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.15)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.2)',
        elevated: '0 8px 24px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2)',
        dialog: '0 20px 60px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.3)',
        glow: '0 0 20px rgba(6,182,212,0.15)',
        'glow-lg': '0 0 40px rgba(6,182,212,0.25)',
        'glow-xl': '0 0 60px rgba(6,182,212,0.3)',
        'inner-sm': 'inset 0 1px 0 rgba(255,255,255,0.04)',
        'inner-md': 'inset 0 1px 0 rgba(255,255,255,0.06)'
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
        'shimmer': 'shimmer 3s linear infinite'
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
          '0%, 100%': { boxShadow: '0 0 20px rgba(6,182,212,0.15)' },
          '50%': { boxShadow: '0 0 40px rgba(6,182,212,0.3)' }
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
        }
      }
    }
  },
  plugins: []
};
