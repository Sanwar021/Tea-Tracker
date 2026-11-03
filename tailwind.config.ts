import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'rgb(var(--border) / <alpha-value>)',
        input: 'rgb(var(--input) / <alpha-value>)',
        ring: 'rgb(var(--ring) / <alpha-value>)',
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        card: {
          DEFAULT: 'rgb(var(--card) / <alpha-value>)',
          foreground: 'rgb(var(--card-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
          foreground: 'rgb(var(--muted-foreground) / <alpha-value>)',
        },
        primary: {
          50: '#fdf4ee',
          100: '#fae4d0',
          200: '#f5c8a0',
          300: '#eda66a',
          400: '#e47f3d',
          500: '#8B5E3C',
          600: '#6b3a2a',
          700: '#3d1a08',
          800: '#2a1005',
          900: '#180902',
        },
        accent: {
          50: '#fdf9ec',
          100: '#faf0cc',
          200: '#f5de99',
          300: '#edc75e',
          400: '#D4A847',
          500: '#C49A2A',
          600: '#a07e1e',
          700: '#7a5f16',
          800: '#5c4710',
          900: '#3d2f0a',
        },
        cream: {
          50: '#FEFCF8',
          100: '#FDF6EC',
          200: '#F5ECD7',
          300: '#EDD9B8',
          400: '#E0C494',
          500: '#D0AA70',
        },
        sidebar: {
          DEFAULT: '#1a3a2e',
          dark: '#0d2818',
          light: '#243d30',
          hover: '#2d4f3f',
          active: '#3a6650',
          border: '#2d4f3f',
          text: '#a8c5b5',
          'text-active': '#ffffff',
        },
        espresso: {
          50: '#fdf4ee',
          100: '#fae4d0',
          200: '#f5c8a0',
          300: '#eda66a',
          400: '#e47f3d',
          500: '#8B5E3C',
          600: '#6b3a2a',
          700: '#3d1a08',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Bengali', 'sans-serif'],
        bengali: ['Noto Sans Bengali', 'sans-serif'],
      },
      animation: {
        'steam-rise': 'steamRise 2s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-in': 'bounceIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      keyframes: {
        steamRise: {
          '0%, 100%': { transform: 'translateY(0) scaleX(1)', opacity: '0.6' },
          '50%': { transform: 'translateY(-10px) scaleX(1.2)', opacity: '0.2' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        slideUp: {
          from: { transform: 'translateY(100%)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        scaleIn: {
          from: { transform: 'scale(0.95)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        bounceIn: {
          from: { transform: 'scale(0.3)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'card': '0 2px 8px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.12)',
        'sidebar': '4px 0 24px rgba(0,0,0,0.15)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

export default config
