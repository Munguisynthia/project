import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Soft gray / blue system
        canvas: '#F3F5F8',       // page background
        surface: '#FFFFFF',       // card background
        surfacealt: '#F8FAFC',    // subtle alt surface (table stripes, inputs)
        border: '#E3E8EE',
        muted: '#7A8699',         // secondary text
        ink: '#1E2733',           // primary text
        brand: {
          50: '#EEF3FE',
          100: '#DCE8FB',
          200: '#B7CDF5',
          300: '#8FAEED',
          400: '#5F87E0',
          500: '#3D67CC',          // primary blue
          600: '#3052A6',
          700: '#243F80',
        },
        ok: '#2E9E6C',
        okbg: '#E7F6EF',
        warn: '#C98A1E',
        warnbg: '#FBF1DF',
        danger: '#D1495B',
        dangerbg: '#FBE9EC',
      },
      fontFamily: {
        display: ['var(--font-sora)'],
        sans: ['var(--font-inter)'],
      },
      borderRadius: {
        xl: '14px',
        '2xl': '20px',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(30,39,51,0.04), 0 1px 8px 0 rgba(30,39,51,0.04)',
        pop: '0 8px 24px -4px rgba(30,39,51,0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
