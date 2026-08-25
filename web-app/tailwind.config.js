/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0B5ED7',
        primaryDark: '#0A4CB4',
        primaryLight: '#EBF3FE',
        secondary: '#14B8A6',
        secondaryDark: '#0D9488',
        secondaryLight: '#CCFBF1',
        accent: '#22C55E',
        accentLight: '#DCFCE7',
        emergency: '#DC2626',
        emergencyDark: '#B91C1C',
        emergencyLight: '#FEE2E2',
        darkNavy: '#172033',
        slateText: '#475569',
        softBg: '#F4F9FF',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 10px 30px -10px rgba(11, 94, 215, 0.3)',
        card: '0 4px 20px -2px rgba(23, 32, 51, 0.08)',
        cardHover: '0 20px 40px -4px rgba(11, 94, 215, 0.15)',
      },
      animation: {
        pulseSlow: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
};
