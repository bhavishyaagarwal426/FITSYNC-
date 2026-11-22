/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FEFDFB',
          100: '#FAF7F2',
          200: '#F5EFE6',
          300: '#EDE5D8',
          400: '#E0D5C4',
          500: '#D4C6B0',
        },
        burgundy: {
          50: '#FDF2F4',
          100: '#F9E2E7',
          200: '#F4C5D0',
          300: '#EC9BAD',
          400: '#E06B84',
          500: '#D14562',
          600: '#B82D4E',
          700: '#9A2341',
          800: '#64172D',
          900: '#4D1123',
          950: '#2E0914',
        },
        charcoal: {
          50: '#F6F6F6',
          100: '#E7E7E7',
          200: '#D1D1D1',
          300: '#B0B0B0',
          400: '#888888',
          500: '#6D6D6D',
          600: '#5D5D5D',
          700: '#4F4F4F',
          800: '#454545',
          900: '#3D3D3D',
          950: '#242424',
        },
        dark: {
          950: '#0F0F11',
          900: '#141417',
          850: '#1A1A1E',
          800: '#222228',
          700: '#2E2E36',
          600: '#3E3E48',
          muted: '#8E8E98',
          text: '#F5EFEB',
          accent: '#A33B58',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-in-out',
        slideUp: 'slideUp 0.3s ease-out',
        slideIn: 'slideIn 0.3s ease-out',
        'pulse-soft': 'pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
        'modal': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        'dark-card': '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [],
};
