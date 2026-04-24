/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#faf6ec',
          2: '#f2ecdb',
          3: '#e8dfc6',
          4: '#dcd0b1',
        },
        ink: {
          DEFAULT: '#2a2824',
          soft: '#6b6558',
          mute: '#9c9585',
        },
        brand: {
          DEFAULT: '#c64b3e',
          soft: '#e08a7f',
          deep: '#a03a2f',
        },
        wash: {
          green: '#b9d59a',
          'green-deep': '#8bb36a',
          ochre: '#e0c58a',
          purple: '#c7a7d1',
          blue: '#a7c7d6',
          yellow: '#f2dca0',
          pink: '#e8b8b8',
        },
      },
      fontFamily: {
        hand: ['"Caveat"', '"Patrick Hand"', 'cursive'],
        display: ['"Kalam"', '"Patrick Hand"', 'cursive'],
      },
      keyframes: {
        'fade-in-up': { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'float': { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        'glow-pulse': { '0%, 100%': { boxShadow: '0 0 20px rgba(198, 75, 62, 0.3)' }, '50%': { boxShadow: '0 0 32px rgba(198, 75, 62, 0.5)' } },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'float': 'float 4s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
