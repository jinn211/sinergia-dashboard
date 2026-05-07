/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      colors: {
        // Sinergia brand green
        brand: {
          50:  '#EDFAF4',
          100: '#D2F3E5',
          200: '#A6E7CC',
          300: '#6DD4AA',
          400: '#4DB887',
          500: '#3BA372',
          600: '#2D8A5D',
          700: '#206E49',
          800: '#155437',
          900: '#0A3823',
        },
        // Neutral scale — replaces old warm scale, keeps same class names in components
        warm: {
          950: '#0F1714',
          900: '#1C2B24',
          800: '#374151',
          700: '#4B5563',
          600: '#6B7280',
          500: '#9CA3AF',
          400: '#CBD5E1',
          300: '#E2E8F0',
          200: '#EEF2F6',
          100: '#F4F6F8',
          50:  '#F9FAFB',
        },
        sidebar: '#0F1714',
        cream: '#F2F5F3',
        // Status colors — slightly adjusted to Sinergia green family
        status: {
          processing: '#3B82F6',
          waiting:    '#F59E0B',
          completed:  '#4DB887',
          error:      '#EF4444',
        },
      },
      boxShadow: {
        // Concepto A — cards that feel like physical objects
        'card':       '0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.04)',
        'card-hover': '0 2px 4px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.10), 0 20px 48px rgba(0,0,0,0.06)',
        'sm':         '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
      },
      borderColor: { DEFAULT: '#E2E8F0' },
      borderRadius: {
        'xl':  '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.22s ease-out forwards',
      },
    },
  },
  plugins: [],
}
