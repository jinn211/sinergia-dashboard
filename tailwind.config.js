/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono:    ['"DM Mono"', 'monospace'],
      },
      colors: {
        // Warm neutral scale — the entire UI lives here
        warm: {
          950: '#18171A',
          900: '#2A2826',
          800: '#3E3B38',
          700: '#565350',
          600: '#706C65',
          500: '#8C8880',
          400: '#ABA79F',
          300: '#C8C4BB',
          200: '#DED9D0',
          100: '#EDE9E0',
          50:  '#F7F5F0',
        },
        cream: '#F7F5F0',
        // Status — very muted, never loud
        status: {
          processing: '#4A7FA5',
          waiting:    '#9A7535',
          completed:  '#3D7A5A',
          error:      '#9A4A40',
        },
      },
      boxShadow: {
        'sm':    '0 1px 2px rgba(24, 23, 26, 0.05)',
        'card':  '0 1px 3px rgba(24, 23, 26, 0.07), 0 1px 2px rgba(24, 23, 26, 0.04)',
        'hover': '0 4px 16px rgba(24, 23, 26, 0.10), 0 1px 4px rgba(24, 23, 26, 0.05)',
      },
      borderColor: { DEFAULT: '#DED9D0' },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out forwards',
      },
    },
  },
  plugins: [],
}
